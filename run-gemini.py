#!/usr/bin/env python3
"""Launch the Chimera server with the Gemini LLM route.

Resolves the stored Gemini credential (custom.gemini) to its surrogate
in-process, then spawns node server.js with the env vars the analyzer
reads: LLM_API_KEY, LLM_BASE_URL, LLM_MODEL.

The surrogate is exchanged for the real key only on requests to the
registered host generativelanguage.googleapis.com. Never print it, never
store it in a file.

Usage:
  python3 ~/workspace/kiroween/run-gemini.py [PORT]
  LLM_MODEL=gemini-3.1-pro-preview python3 ~/workspace/kiroween/run-gemini.py
"""
import os
import sys

sys.path.insert(0, "/opt/muse/skills/custom-connector-setup/bin")
from dynamic_credentials import dynamic_credential_entry

MODEL = os.environ.get("LLM_MODEL", "gemini-3-flash-preview")
BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai"

entry = dynamic_credential_entry("custom.gemini")
env = dict(os.environ)
env["LLM_API_KEY"] = entry["surrogate"]
env["LLM_BASE_URL"] = BASE_URL
env["LLM_MODEL"] = MODEL

os.chdir(os.path.expanduser("~/workspace/kiroween/app"))
os.execvpe("node", ["node", "server.js"], env)
