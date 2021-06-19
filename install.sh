#!/bin/bash
ABSOLUTE_PATH="$( cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
cd ${ABSOLUTE_PATH}


BUILD_TYPE=RelWithDebInfo

echo "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"
if [ -z ${1} ]; then 
    echo "Build type not specified, using default '${BUILD_TYPE}'..."
else
    BUILD_TYPE=${1}
    echo "Build type is specified to '${BUILD_TYPE}'..."
fi
echo "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"

echo "--------------------------------"
printf "Installing 'somhunter'...\n"

sh ./somhunter-core/install.sh ${BUILD_TYPE}
sh ./somhunter-data-server/install.sh
sh ./somhunter-ui/install.sh

printf "Done installing 'somhunter'.\n"
echo "--------------------------------"
