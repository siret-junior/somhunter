#!/bin/sh

printf "=============================================\n"
printf "Running all the parts in parallel...\n"
printf "=============================================\n"

ABSOLUTE_PATH="$( cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
cd $ABSOLUTE_PATH # CD to script dir
    
parallel -u ::: bash ./run-core.sh bash ./run-data-server.sh bash ./run-ui.sh