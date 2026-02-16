#!/bin/bash
cd /mnt/c/workspace/frontend
nohup npm run dev > dev.log 2>&1 &
echo $! > /tmp/frontend.pid
sleep 3
tail -n 200 dev.log
curl -s -D - -X POST -H "Content-Type: application/json" -d '{"name":"Alice","role":"molecule"}' http://localhost:3002/api/verify-genlayer || true
