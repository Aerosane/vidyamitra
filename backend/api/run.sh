#!/bin/bash
# VidyaMitra API - Optimized for 1GB RAM VPS

# Memory-conscious settings
export MALLOC_ARENA_MAX=2
export PYTHONUNBUFFERED=1

# Run with single worker, limited connections
exec uvicorn main:app \
    --host 0.0.0.0 \
    --port ${PORT:-8000} \
    --workers 1 \
    --loop uvloop \
    --http httptools \
    --limit-concurrency 20 \
    --limit-max-requests 1000 \
    --timeout-keep-alive 5 \
    --access-log \
    --no-use-colors
