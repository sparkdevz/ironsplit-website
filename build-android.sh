#!/bin/bash
mkdir -p "$HOME/eas-tmp"
mkdir -p "$HOME/.cache/dotslash"

export TMPDIR="$HOME/eas-tmp"
export DOTSLASH_CACHE="$HOME/.cache/dotslash"
export EAS_BUILD_NO_EXPO_GO_WARNING=true
export XDG_CACHE_HOME="$HOME/.cache"

eas build --platform android --profile production
