SCRIPT_PATH="$( cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"

cd "$SCRIPT_PATH/../client";
yalc link rrweb

cd "$SCRIPT_PATH/../client";
yalc link highlight.run
yalc link rrweb
