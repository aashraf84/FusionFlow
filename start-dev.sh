#!/bin/bash
# Persistent dev server launcher for Crave ERP
cd /home/z/my-project
pkill -f "next dev" 2>/dev/null
sleep 2
export NODE_OPTIONS="--max-old-space-size=3072"
exec /home/z/my-project/node_modules/.bin/next dev -p 3000
