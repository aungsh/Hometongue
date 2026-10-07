#!/bin/sh
# Hometongue launcher for Mac and Linux. Run with no arguments for a menu,
# or: sh orch.sh start / stop / status
cd "$(dirname "$0")" || exit 1

if ! command -v node >/dev/null 2>&1; then
  echo "Hometongue needs Node.js, which isn't installed on this computer."
  echo "Install the LTS version from https://nodejs.org, then run orch again."
  exit 1
fi

exec node scripts/orchestrator.mjs "$@"
