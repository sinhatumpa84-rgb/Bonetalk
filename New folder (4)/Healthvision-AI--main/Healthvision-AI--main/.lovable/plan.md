# Phase 3 + 4 — Core Features

Wire the four core feature pages to real AI + database. All AI runs through Lovable AI Gateway (default model `google/gemini-3-flash-preview`, vision uses `google/gemini-2.5-pro`) inside `createServerFn` handlers protected by `requireSupabaseAuth`. Results are persisted to the existing `diagnoses`, `chat_messages`, and `appointments` tables (already have RLS).

## 1. Symptom Checker (`/symptom-checker`)

- Multi-select symptom chips (~30 common symptoms: fever, cough, headache, chest pain, fatigue, etc.) grouped by body system + free-text "other symptoms" textarea.
- Age, sex, duration (days), severity slider (1–10) inputs.
- "Run AI Assessment" → server fn `assessSymptoms` calls Gemini with structured tool-calling output:
  - `risk_level` (low / moderate / high / emergency)
  - `possible_conditions[]` (name, likelihood %, brief description)
  - `recommended_next_steps[]` (e.g. self-care, see GP within 48h, ER now)
  - `red_flags[]`
  - `disclaimer`
- Result card: color-coded risk badge (green/amber/red), conditions list, next-steps checklist, red-flag alerts.
- Save to `diagnoses` (type=`symptom_check`, `result_json`, `confidence`).
- Handle 429 / 402 with toast.

## 2. Medical Image Analysis (`/medical-analysis`)

- Drag-and-drop file uploader: accepts JPG/PNG/WebP (X-ray, MRI, CT slice, skin plate). Max 10 MB.
- Scan type selector (X-ray / CT / MRI / Skin / Other) + optional clinical context textarea.
- Image preview + "Analyze" button → server fn `analyzeMedicalImage`:
  - Uploads file to new Supabase storage bucket `medical-scans` (private, owner-only RLS).
  - Calls Gemini 2.5 Pro vision with image URL + structured prompt.
  - Returns: `findings[]`, `impressions`, `cautions[]`, `confidence`, `disclaimer`.
- Result panel with findings, impressions, color-coded cautions.
- "Download Report" button → client-side jsPDF generates branded PDF (logo, patient note disclaimer, findings, timestamp).
- Save to `diagnoses` (type=`image_analysis`, stores storage path in `result_json`).

## 3. Streaming Chatbot (`/chatbot`)

- Two-pane layout: left sidebar with past conversations (grouped from `chat_messages` by day), main panel chat thread.
- Quick-prompt chips above input: "What causes migraines?", "Is my BP normal?", "Symptoms of dehydration", "When should I see a doctor for fever?".
- Streaming via TanStack server route `src/routes/api/chat-stream.ts` (raw SSE Response, auth-checked from bearer token) — server functions can't stream.
- Client reads SSE token-by-token, renders assistant message progressively with `react-markdown`.
- Persist each user+assistant message pair to `chat_messages` after stream completes.
- System prompt: friendly health assistant, always includes "informational only, not medical advice" disclaimer.
- "New chat" button + delete-conversation action.

## 4. Appointments (`/appointments`)

- Tab layout: Upcoming / Past / Cancelled.
- "Book Appointment" dialog: doctor name, specialty (dropdown: GP, Cardio, Derm, Neuro, Ortho, Other), date+time picker, notes.
- List cards show doctor, specialty, scheduled date/time, status badge, notes.
- Actions per card: Reschedule (re-open dialog) and Cancel (sets status=`cancelled` with confirm dialog).
- Server fns: `listAppointments`, `createAppointment`, `updateAppointment`, `cancelAppointment` — all `requireSupabaseAuth`, RLS already in place.
- Validation with zod (future date, required fields).

## 5. Shared / infra

- New migration: create `medical-scans` storage bucket (private) + RLS so users only read/write under `{user_id}/` prefix.
- New `src/lib/ai.server.ts` helper: thin wrapper around Lovable AI Gateway with tool-calling + vision support, reads `process.env.LOVABLE_API_KEY`.
- Reuse existing brand tokens; risk badges use semantic colors (add `--risk-low/moderate/high/emergency` tokens in `styles.css`).
- Update Dashboard to surface latest 5 diagnoses + upcoming appointment count.
- Add `jspdf` dependency.

## Out of scope this turn
- Bilingual EN/HI toggle, alerts/notifications panel, real wearable vitals, profile editor. Will follow in a polish pass.

## File map

```text
src/lib/
  ai.server.ts                     # Lovable AI gateway wrapper
  symptoms.functions.ts            # assessSymptoms
  medical-analysis.functions.ts    # uploadScanUrl, analyzeMedicalImage
  appointments.functions.ts        # list/create/update/cancel
  chat.functions.ts                # listConversations, saveMessages
  pdf-report.ts                    # jsPDF builder (client)
src/components/
  symptom-checker/SymptomPicker.tsx, AssessmentResult.tsx
  medical/ScanUploader.tsx, AnalysisResult.tsx
  chat/ChatSidebar.tsx, ChatMessage.tsx, QuickPrompts.tsx
  appointments/AppointmentDialog.tsx, AppointmentCard.tsx
  RiskBadge.tsx
src/routes/api/chat-stream.ts      # SSE streaming endpoint
src/routes/_authenticated/
  symptom-checker.tsx              # replace stub
  medical-analysis.tsx             # replace stub
  chatbot.tsx                      # replace stub
  appointments.tsx                 # replace stub
  dashboard.tsx                    # extend with recent diagnoses
supabase/migrations/*              # medical-scans bucket + RLS
```
