#!/bin/bash
TOKEN="$1"
if [ -z "$TOKEN" ]; then
  echo "Usage: bash push.sh YOUR_TOKEN"
  exit 1
fi
git remote set-url origin "https://sparkdevz:${TOKEN}@github.com/sparkdevz/ironsplit-website.git"
git -c credential.helper='' push -u origin main
git remote set-url origin "https://github.com/sparkdevz/ironsplit-website.git"
echo "Done! Token cleared from remote URL."
