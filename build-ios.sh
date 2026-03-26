#!/bin/bash
# iOS Production Build for IronSplit
# Bundle ID: com.alexrp8.ironsplit
# Requires: EXPO_TOKEN set + AuthKey_T22YY53MC6.p8 present

mkdir -p "$HOME/eas-tmp"
export TMPDIR="$HOME/eas-tmp"
export EAS_BUILD_NO_EXPO_GO_WARNING=1
export EXPO_ASC_API_KEY_PATH="$(pwd)/AuthKey_T22YY53MC6.p8"
export EXPO_ASC_KEY_ID="T22YY53MC6"
export EXPO_ASC_ISSUER_ID="566779a6-b0ed-4f32-999f-4bd7e7368714"
export EXPO_APPLE_TEAM_ID="T22YY53MC6"
export EXPO_APPLE_TEAM_TYPE="INDIVIDUAL"

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
