#!/bin/sh

ABSOLUTE_PATH="$( cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
cd $ABSOLUTE_PATH # CD to script dir

# Use this if you want instant restarts
#supervise ./somhunter-core/

# Normal run
bash ./somhunter-core/run.sh

