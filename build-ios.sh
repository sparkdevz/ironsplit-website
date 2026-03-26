#!/bin/bash
# iOS Production Build for IronSplit
# Requirements: Apple Developer account authenticated via `eas login`
# EAS will guide you through Apple credentials on first run.

mkdir -p "$HOME/eas-tmp"
export TMPDIR="$HOME/eas-tmp"
export EAS_BUILD_NO_EXPO_GO_WARNING=true

(
  while true; do
    chmod -R u+rwx "$HOME/eas-tmp" 2>/dev/null
    chmod -R u+rwx /tmp/runner 2>/dev/null
    sleep 0.1
  done
) &
WATCHER_PID=$!

eas build --platform ios --profile production --non-interactive --no-wait
STATUS=$?

kill "$WATCHER_PID" 2>/dev/null
exit $STATUS
