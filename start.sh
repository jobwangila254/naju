#!/bin/bash
kill $(lsof -ti :3000) 2>/dev/null
sleep 1
python3 /home/r34p3r/Projects/naju/server.py 3000 &
sleep 2
echo "Naju server running at http://localhost:3000"
xdg-open http://localhost:3000 &>/dev/null &
