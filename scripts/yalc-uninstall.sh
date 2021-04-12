SCRIPT_PATH="$( cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"

cd "$SCRIPT_PATH/../client";
yalc remove --all;

cd "$SCRIPT_PATH/../frontend";
yalc remove --all;
