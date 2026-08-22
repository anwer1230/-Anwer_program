#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
TDLib (Telegram Database Library) Python Bridge
Implements official td_json_client bindings for Python (python-telegram / tdlib)
"""

import os
import sys
import json
import time
import ctypes
import threading
from typing import Dict, Any, Callable, Optional

# TDLib JSON Client CTypes Interface
class TDLibJSONClient:
    def __init__(self, lib_path: Optional[str] = None):
        self._lib = None
        self._client = None
        self._handlers = []
        self._is_running = False
        
        # Try loading native TDLib binary if present in environment
        possible_paths = [
            lib_path,
            '/usr/local/lib/libtdjson.so',
            '/usr/lib/libtdjson.so',
            './libtdjson.so',
            './tdjson.dll'
        ]
        
        for path in filter(None, possible_paths):
            if os.path.exists(path):
                try:
                    self._lib = ctypes.CDLL(path)
                    break
                except Exception as e:
                    print(f"[TDLib Python] Warning loading {path}: {e}")
                    
        if self._lib:
            self._setup_c_functions()
            self._client = self._lib.td_json_client_create()
            print("[TDLib Python] Native TDLib (libtdjson) loaded successfully.")
        else:
            print("[TDLib Python] Running in pure Python JSON-RPC Emulation Mode.")

    def _setup_c_functions(self):
        self._lib.td_json_client_create.restype = ctypes.c_void_p
        self._lib.td_json_client_create.argtypes = []

        self._lib.td_json_client_send.restype = None
        self._lib.td_json_client_send.argtypes = [ctypes.c_void_p, ctypes.c_char_p]

        self._lib.td_json_client_receive.restype = ctypes.c_char_p
        self._lib.td_json_client_receive.argtypes = [ctypes.c_void_p, ctypes.c_double]

        self._lib.td_json_client_execute.restype = ctypes.c_char_p
        self._lib.td_json_client_execute.argtypes = [ctypes.c_void_p, ctypes.c_char_p]

        self._lib.td_json_client_destroy.restype = None
        self._lib.td_json_client_destroy.argtypes = [ctypes.c_void_p]

    def send(self, query: Dict[str, Any]):
        """Send asynchronous TDLib request (td_send)"""
        data = json.dumps(query).encode('utf-8')
        if self._lib and self._client:
            self._lib.td_json_client_send(self._client, data)
        else:
            self._mock_process_send(query)

    def execute(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Synchronously execute TDLib request (td_execute)"""
        data = json.dumps(query).encode('utf-8')
        if self._lib and self._client:
            res = self._lib.td_json_client_execute(self._client, data)
            if res:
                return json.loads(res.decode('utf-8'))
            return None
        return {"@type": "ok"}

    def receive(self, timeout: float = 1.0) -> Optional[Dict[str, Any]]:
        """Receive updates from TDLib (td_receive)"""
        if self._lib and self._client:
            res = self._lib.td_json_client_receive(self._client, timeout)
            if res:
                return json.loads(res.decode('utf-8'))
            return None
        time.sleep(timeout)
        return None

    def add_update_handler(self, handler: Callable[[Dict[str, Any]], None]):
        self._handlers.append(handler)

    def _mock_process_send(self, query: Dict[str, Any]):
        req_type = query.get('@type')
        extra = query.get('@extra')
        
        # Emulate standard TDLib responses
        if req_type == 'setTdlibParameters':
            response = {"@type": "ok", "@extra": extra}
        elif req_type == 'getChats':
            response = {
                "@type": "chats",
                "chat_ids": [1001, 1002, 1003],
                "total_count": 3,
                "@extra": extra
            }
        elif req_type == 'sendMessage':
            response = {
                "@type": "message",
                "id": int(time.time()),
                "chat_id": query.get('chat_id'),
                "is_outgoing": True,
                "date": int(time.time()),
                "@extra": extra
            }
        else:
            response = {"@type": "ok", "@extra": extra}
            
        for handler in self._handlers:
            handler(response)

    def start_worker(self):
        self._is_running = True
        thread = threading.Thread(target=self._worker_loop, daemon=True)
        thread.start()

    def _worker_loop(self):
        while self._is_running:
            update = self.receive(0.5)
            if update:
                for handler in self._handlers:
                    try:
                        handler(update)
                    except Exception as e:
                        print(f"[TDLib Python Handler Error]: {e}")

# Global instance for easy import
tdlib = TDLibJSONClient()

if __name__ == '__main__':
    print("Testing TDLib Python Client...")
    tdlib.send({
        "@type": "setTdlibParameters",
        "api_id": 22043994,
        "api_hash": "56f64582b363d367280db96586b97801",
        "database_directory": "tdlib_data",
        "files_directory": "tdlib_files",
        "use_message_database": True
    })
    print("TDLib Python Initialized.")
