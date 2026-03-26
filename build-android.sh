#!/bin/bash
mkdir -p "$HOME/eas-tmp"
export TMPDIR="$HOME/eas-tmp"
export EAS_BUILD_NO_EXPO_GO_WARNING=true

# Background watcher: dotslash makes its cache dirs read-only (dr-x------)
# and also leaves dirs in /tmp/runner that need rwx to be deleted.
# We own them, so chmod succeeds.
(
  while true; do
    chmod -R u+rwx "$HOME/eas-tmp" 2>/dev/null
    chmod -R u+rwx /tmp/runner 2>/dev/null
    sleep 0.1
  done
) &
WATCHER_PID=$!

eas build --platform android --profile production --non-interactive --no-wait
STATUS=$?

kill "$WATCHER_PID" 2>/dev/null
exit $STATUS
