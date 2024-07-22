#!/bin/bash
echo "$1"
echo -e "\x1B]21337;web-terminal;write-src?height=300;$1\x1B\\"
# BUG: text renders under iframe without sleep
sleep 0.2
echo "YAET!"

