"""
BoneTalk — Calibration SQLite Database Engine

Implements the persistence layer for:
- Calibration Sessions
- Individual Trials & Quality Scores
- High-Speed Muscle Telemetry (Timestamp, M1, M2, M3)
- Feature Vectors (Extracted & Normalized)
- Model Metadata & Normalization Parameters
- Model Evaluations (Accuracy, Precision, Recall, F1, Confusion Matrix, Latency)
"""

import json
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple


DB_DEFAULT_PATH = Path(__file__).resolve().parent / "bonetalk_calibration.db"


class CalibrationDatabase:
    """
    SQLite database managing calibration sessions, trials, signals, features, models, and evaluations.
    """

    def __init__(self, db_path: Optional[Path | str] = None):
        self.db_path = Path(db_path) if db_path else DB_DEFAULT_PATH
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    from contextlib import contextmanager

    @contextmanager
    def _connection(self):
        conn = sqlite3.connect(str(self.db_path), timeout=10.0)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
        finally:
            conn.close()

    def _init_db(self) -> None:
        with self._connection() as conn:
            cur = conn.cursor()

            # 1. Calibration Session
            cur.execute("""
            CREATE TABLE IF NOT EXISTS calibration_sessions (
                session_id TEXT PRIMARY KEY,
                gesture TEXT NOT NULL,
                created_at TEXT NOT NULL,
                model_version TEXT NOT NULL,
                feature_version TEXT NOT NULL,
                preprocessing_version TEXT NOT NULL,
                notes TEXT
            );
            """)

            # 2. Trial
            cur.execute("""
            CREATE TABLE IF NOT EXISTS trials (
                trial_id TEXT PRIMARY KEY,
                session_id TEXT NOT NULL,
                trial_number INTEGER NOT NULL,
                duration REAL NOT NULL,
                sample_count INTEGER NOT NULL,
                quality_score REAL NOT NULL,
                status TEXT NOT NULL,
                FOREIGN KEY (session_id) REFERENCES calibration_sessions(session_id) ON DELETE CASCADE
            );
            """)

            # 3. Muscle Data
            cur.execute("""
            CREATE TABLE IF NOT EXISTS muscle_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                trial_id TEXT NOT NULL,
                timestamp REAL NOT NULL,
                m1 REAL NOT NULL,
                m2 REAL NOT NULL,
                m3 REAL NOT NULL,
                FOREIGN KEY (trial_id) REFERENCES trials(trial_id) ON DELETE CASCADE
            );
            """)
            cur.execute("CREATE INDEX IF NOT EXISTS idx_muscle_trial ON muscle_data(trial_id);")

            # 4. Feature Data
            cur.execute("""
            CREATE TABLE IF NOT EXISTS feature_data (
                trial_id TEXT PRIMARY KEY,
                extracted_features TEXT NOT NULL,
                normalized_features TEXT NOT NULL,
                FOREIGN KEY (trial_id) REFERENCES trials(trial_id) ON DELETE CASCADE
            );
            """)

            # 5. Model
            cur.execute("""
            CREATE TABLE IF NOT EXISTS models (
                model_id TEXT PRIMARY KEY,
                model_version TEXT NOT NULL UNIQUE,
                created_at TEXT NOT NULL,
                training_metadata TEXT NOT NULL,
                normalization_parameters TEXT NOT NULL,
                feature_configuration TEXT NOT NULL,
                is_active INTEGER DEFAULT 0
            );
            """)

            # 6. Evaluation
            cur.execute("""
            CREATE TABLE IF NOT EXISTS evaluations (
                eval_id TEXT PRIMARY KEY,
                model_id TEXT NOT NULL,
                accuracy REAL NOT NULL,
                precision REAL NOT NULL,
                recall REAL NOT NULL,
                f1 REAL NOT NULL,
                confusion_matrix TEXT NOT NULL,
                false_positive_rate REAL NOT NULL,
                false_negative_rate REAL NOT NULL,
                latency REAL NOT NULL,
                created_at TEXT NOT NULL,
                report_json TEXT,
                FOREIGN KEY (model_id) REFERENCES models(model_id) ON DELETE CASCADE
            );
            """)
            conn.commit()

    # ── Session & Trial Management ──────────────────────────────────────────

    def save_session(
        self,
        session_id: str,
        gesture: str,
        model_version: str = "v1.0.0",
        feature_version: str = "v1.0.0",
        preprocessing_version: str = "v1.0.0",
        notes: str = "",
    ) -> None:
        with self._connection() as conn:
            conn.execute(
                """
                INSERT OR REPLACE INTO calibration_sessions 
                (session_id, gesture, created_at, model_version, feature_version, preprocessing_version, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    session_id,
                    gesture.upper(),
                    datetime.now().isoformat(),
                    model_version,
                    feature_version,
                    preprocessing_version,
                    notes,
                ),
            )
            conn.commit()

    def save_trial(
        self,
        trial_id: str,
        session_id: str,
        trial_number: int,
        duration: float,
        sample_count: int,
        quality_score: float,
        status: str,
        muscle_samples: Optional[List[Dict[str, float]]] = None,
        extracted_features: Optional[List[float]] = None,
        normalized_features: Optional[List[float]] = None,
    ) -> None:
        with self._connection() as conn:
            conn.execute(
                """
                INSERT OR REPLACE INTO trials 
                (trial_id, session_id, trial_number, duration, sample_count, quality_score, status)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (trial_id, session_id, trial_number, duration, sample_count, quality_score, status),
            )

            # Store high-speed muscle samples if provided
            if muscle_samples:
                rows = [
                    (trial_id, float(s.get("timestampMs") or s.get("timestamp") or 0.0),
                     float(s.get("m1", 0.0)), float(s.get("m2", 0.0)), float(s.get("m3", 0.0)))
                    for s in muscle_samples
                ]
                conn.executemany(
                    "INSERT INTO muscle_data (trial_id, timestamp, m1, m2, m3) VALUES (?, ?, ?, ?, ?)",
                    rows,
                )

            # Store feature vector
            if extracted_features is not None:
                extracted_json = json.dumps(extracted_features)
                normalized_json = json.dumps(normalized_features if normalized_features is not None else extracted_features)
                conn.execute(
                    """
                    INSERT OR REPLACE INTO feature_data (trial_id, extracted_features, normalized_features)
                    VALUES (?, ?, ?)
                    """,
                    (trial_id, extracted_json, normalized_json),
                )
            conn.commit()

    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        with self._connection() as conn:
            cur = conn.cursor()
            cur.execute("SELECT * FROM calibration_sessions WHERE session_id = ?", (session_id,))
            s = cur.fetchone()
            if not s:
                return None
            session_dict = dict(s)

            cur.execute("SELECT * FROM trials WHERE session_id = ? ORDER BY trial_number ASC", (session_id,))
            session_dict["trials"] = [dict(t) for t in cur.fetchall()]
            return session_dict

    def get_trial_muscle_data(self, trial_id: str) -> List[Dict[str, float]]:
        with self._connection() as conn:
            cur = conn.cursor()
            cur.execute(
                "SELECT timestamp, m1, m2, m3 FROM muscle_data WHERE trial_id = ? ORDER BY timestamp ASC",
                (trial_id,),
            )
            return [dict(r) for r in cur.fetchall()]

    # ── Model & Evaluation Management ───────────────────────────────────────

    def save_model(
        self,
        model_id: str,
        model_version: str,
        training_metadata: Dict[str, Any],
        normalization_parameters: Dict[str, Any],
        feature_configuration: Dict[str, Any],
        is_active: bool = False,
    ) -> None:
        with self._connection() as conn:
            if is_active:
                conn.execute("UPDATE models SET is_active = 0")

            conn.execute(
                """
                INSERT OR REPLACE INTO models 
                (model_id, model_version, created_at, training_metadata, normalization_parameters, feature_configuration, is_active)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    model_id,
                    model_version,
                    datetime.now().isoformat(),
                    json.dumps(training_metadata),
                    json.dumps(normalization_parameters),
                    json.dumps(feature_configuration),
                    1 if is_active else 0,
                ),
            )
            conn.commit()

    def save_evaluation(
        self,
        eval_id: str,
        model_id: str,
        accuracy: float,
        precision: float,
        recall: float,
        f1: float,
        confusion_matrix: List[List[int]],
        false_positive_rate: float,
        false_negative_rate: float,
        latency: float,
        report_json: Optional[Dict[str, Any]] = None,
    ) -> None:
        with self._connection() as conn:
            conn.execute(
                """
                INSERT OR REPLACE INTO evaluations
                (eval_id, model_id, accuracy, precision, recall, f1, confusion_matrix, false_positive_rate, false_negative_rate, latency, created_at, report_json)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    eval_id,
                    model_id,
                    accuracy,
                    precision,
                    recall,
                    f1,
                    json.dumps(confusion_matrix),
                    false_positive_rate,
                    false_negative_rate,
                    latency,
                    datetime.now().isoformat(),
                    json.dumps(report_json or {}),
                ),
            )
            conn.commit()

    def get_active_model(self) -> Optional[Dict[str, Any]]:
        with self._connection() as conn:
            cur = conn.cursor()
            cur.execute("SELECT * FROM models WHERE is_active = 1 LIMIT 1")
            row = cur.fetchone()
            if not row:
                # Fallback to latest model
                cur.execute("SELECT * FROM models ORDER BY created_at DESC LIMIT 1")
                row = cur.fetchone()
            if not row:
                return None
            m = dict(row)
            m["training_metadata"] = json.loads(m["training_metadata"])
            m["normalization_parameters"] = json.loads(m["normalization_parameters"])
            m["feature_configuration"] = json.loads(m["feature_configuration"])
            return m

    def get_latest_evaluation(self, model_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        with self._connection() as conn:
            cur = conn.cursor()
            if model_id:
                cur.execute("SELECT * FROM evaluations WHERE model_id = ? ORDER BY created_at DESC LIMIT 1", (model_id,))
            else:
                cur.execute("SELECT * FROM evaluations ORDER BY created_at DESC LIMIT 1")
            row = cur.fetchone()
            if not row:
                return None
            ev = dict(row)
            ev["confusion_matrix"] = json.loads(ev["confusion_matrix"])
            if ev.get("report_json"):
                ev["report_json"] = json.loads(ev["report_json"])
            return ev

    def list_models(self) -> List[Dict[str, Any]]:
        with self._connection() as conn:
            cur = conn.cursor()
            cur.execute("SELECT model_id, model_version, created_at, is_active FROM models ORDER BY created_at DESC")
            return [dict(r) for r in cur.fetchall()]


calibration_db = CalibrationDatabase()
