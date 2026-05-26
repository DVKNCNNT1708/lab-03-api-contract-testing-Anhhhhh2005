#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-vision}"

case "${MODE}" in
  vision)
    npx prism mock contracts/ai-vision.openapi.yaml -p 4010 --host 0.0.0.0
    ;;
  camera)
    npx prism mock contracts/camera-stream.openapi.yaml -p 4011 --host 0.0.0.0
    ;;
  all)
    npm run mock:vision &
    VISION_PID=$!
    npm run mock:camera &
    CAMERA_PID=$!
    trap 'kill ${VISION_PID} ${CAMERA_PID} 2>/dev/null || true' EXIT
    wait
    ;;
  *)
    echo "Usage: scripts/start-prism-mock.sh [vision|camera|all]"
    exit 1
    ;;
esac
