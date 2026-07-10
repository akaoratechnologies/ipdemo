#!/bin/bash
cd "$(dirname "$0")"
echo "Starting I.P. College Campus-2 website on http://localhost:5500/"
python3 -m http.server 5500
