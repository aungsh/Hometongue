@echo off
rem Hometongue launcher. Double-click for a menu, or run: orch start / orch stop / orch status
setlocal
pushd "%~dp0"
if "%~1"=="" title Hometongue

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo  Hometongue needs Node.js, which isn't installed on this computer.
  echo  Install the LTS version from https://nodejs.org, then run orch again.
  echo.
  pause
  popd
  exit /b 1
)

node scripts\orchestrator.mjs %*
set "code=%errorlevel%"
popd
exit /b %code%
