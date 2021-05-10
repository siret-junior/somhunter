#!/bin/sh
ABSOLUTE_PATH="$( cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"

echo "--------------------------------"
printf "Installing 'somhunter'...\n"

sh ./somhunter-core/install.sh
sh ./somhunter-data-server/install.sh
sh ./somhunter-ui/install.sh

printf "Done installing 'somhunter'.\n"
echo "--------------------------------"
