import json
import time
import threading
import numpy as np
from typing import Callable, Optional

class MockESP32:
    """Mock interface for simulating ESP32-S3 data generation."""
    def __init__(self, channels: int, sampling_rate: int):
        self.channels = channels
        self.sampling_rate = sampling_rate
        self.is_connected = False
        self._streaming = False
        
    def connect(self):
        self.is_connected = True
        
    def disconnect(self):
        self.is_connected = False
        self.stop_stream()
        
    def read_sample(self) -> np.ndarray:
        return np.random.randn(self.channels)
        
    def stream(self, callback: Callable[[np.ndarray], None]):
        self._streaming = True
        self._thread = threading.Thread(target=self._stream_loop, args=(callback,))
        self._thread.start()
        
    def stop_stream(self):
        self._streaming = False
        if hasattr(self, '_thread'):
            self._thread.join()
            
    def _stream_loop(self, callback: Callable[[np.ndarray], None]):
        sleep_time = 1.0 / self.sampling_rate
        while self._streaming:
            callback(self.read_sample())
            time.sleep(sleep_time)

class ESP32Interface:
    def __init__(self, config_path: str):
        with open(config_path, 'r') as f:
            self.config = json.load(f)
            
        self.connection_type = self.config.get("connection_type", "serial")
        self.channels = self.config["device"]["num_channels"]
        self.sampling_rate = self.config["device"]["sampling_rate"]
        
        self.is_simulation = False
        self._connected = False
        self._mock = MockESP32(self.channels, self.sampling_rate)
        
    def connect(self):
        if self.is_simulation:
            self._mock.connect()
            self._connected = True
            return
            
        if self.connection_type == "serial":
            try:
                import serial
                self.ser = serial.Serial(
                    self.config["serial"]["port"],
                    self.config["serial"]["baud_rate"],
                    timeout=self.config["serial"]["timeout"]
                )
                self._connected = True
            except ImportError:
                raise ImportError("pyserial is required for serial connection.")
            except Exception as e:
                raise RuntimeError(f"ESP32-S3 not connected. Check connection and config. Error: {e}")
        else:
            raise NotImplementedError(f"Connection type {self.connection_type} not yet fully implemented.")
            
    def read_sample(self) -> np.ndarray:
        if not self.is_connected:
            raise RuntimeError("ESP32-S3 not connected. Check connection and config.")
            
        if self.is_simulation:
            return self._mock.read_sample()
            
        if self.connection_type == "serial":
            # Dummy read for structure
            line = self.ser.readline()
            return np.zeros(self.channels)
        return np.zeros(self.channels)

    def read_window(self, duration_ms: int) -> np.ndarray:
        samples_to_read = int((duration_ms / 1000) * self.sampling_rate)
        data = []
        for _ in range(samples_to_read):
            data.append(self.read_sample())
            time.sleep(1.0 / self.sampling_rate)
        return np.array(data)
        
    def stream(self, callback: Callable[[np.ndarray], None]):
        if not self.is_connected:
            raise RuntimeError("ESP32-S3 not connected. Check connection and config.")
            
        if self.is_simulation:
            self._mock.stream(callback)
            return
            
        self._streaming = True
        self._thread = threading.Thread(target=self._stream_loop, args=(callback,))
        self._thread.start()
        
    def stop_stream(self):
        if self.is_simulation:
            self._mock.stop_stream()
            return
            
        self._streaming = False
        if hasattr(self, '_thread'):
            self._thread.join()
            
    def _stream_loop(self, callback: Callable[[np.ndarray], None]):
        while self._streaming:
            callback(self.read_sample())
            time.sleep(1.0 / self.sampling_rate)

    def disconnect(self):
        self.stop_stream()
        if self.is_simulation:
            self._mock.disconnect()
        elif self.connection_type == "serial" and hasattr(self, 'ser'):
            self.ser.close()
        self._connected = False
            
    @property
    def is_connected(self) -> bool:
        return self._connected
