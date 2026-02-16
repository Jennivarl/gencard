# Added by Copilot to guard go invocation
# If Go is not installed, define a harmless noop 'go' function to avoid startup errors
if ! command -v go >/dev/null 2>&1; then
  go() { :; }
fi
