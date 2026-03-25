#!/bin/bash
mkdir -p "$HOME/workspace/.eas-tmp"
export TMPDIR="$HOME/workspace/.eas-tmp"
export EAS_BUILD_NO_EXPO_GO_WARNING=true
eas build --platform android --profile production
