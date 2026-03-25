#!/bin/bash
mkdir -p "$HOME/eas-tmp"
export TMPDIR="$HOME/eas-tmp"
export EAS_BUILD_NO_EXPO_GO_WARNING=true

# Background watcher: dotslash makes its cache dirs read-only (dr-x------).
# We own them, so chmod succeeds — this runs every 0.3s so EAS can delete
# them during cleanup after the upload finishes.
(
  while true; do
    find "$HOME/eas-tmp" -type d -name ".cache" 2>/dev/null | while read cdir; do
      chmod -R u+rwx "$cdir" 2>/dev/null
    done
    sleep 0.3
  done
) &
WATCHER_PID=$!

eas build --platform android --profile production
STATUS=$?

kill "$WATCHER_PID" 2>/dev/null
exit $STATUS
