#!/bin/sh

# Get absolute path to the directory that script lies in
ABSOLUTE_PATH="$( cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
cd ${ABSOLUTE_PATH}

BUILD_TYPE=RelWithDebInfo
if [ -z ${1} ]; then 
    printf "Usage: install.sh <BUILD_TYPE> \n\t BUILD_TYPE \in { Release, RelWithDebInfo, Debug }\n"
    exit 1
else
    BUILD_TYPE=${1}
    echo "Building with build type: ${BUILD_TYPE}"
fi

echo "--------------------------------"
printf "Installing 'somhunter'...\n"

sh ./somhunter-core/install.sh ${BUILD_TYPE}
sh ./somhunter-data-server/install.sh
sh ./somhunter-ui/install.sh
sh ./ranking-server/install.sh

printf "Done installing 'somhunter'.\n"
echo "--------------------------------"
