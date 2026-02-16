#!/bin/bash
# Simple test script to POST to the verify-genlayer endpoint
URL=http://localhost:3002/api/verify-genlayer
curl -s -X POST "$URL" -H "Content-Type: application/json" -d '{"name":"Alice","role":"molecule"}'
