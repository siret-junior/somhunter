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
printf "Installing 'somhunter' with Docker...\n"


#
# Core
#
# printf "\tBuilding the image for 'somhunter-core'...\n"
# cd somhunter-core
# docker build -t somhunter-core .
# cd ..
# printf "\tDone.\n"

# cd somhunter-core
# docker run -ti --rm -v ${PWD}:/somhunter-core somhunter-core:latest sh install.sh ${BUILD_TYPE}
# cd ..


#
# UI
#
# printf "\tBuilding the image for 'somhunter-ui'...\n"
# cd somhunter-ui
# docker build -t somhunter-ui .
# cd ..
# printf "\tDone.\n"

# cd somhunter-ui
# docker run -ti --rm -v $(dirname $PWD):/somhunter somhunter-ui:latest sh install.sh
# cd ..

#
# Data server
#
printf "\tBuilding the image for 'somhunter-data-server'...\n"
cd somhunter-data-server
docker build -t somhunter-data-server .
cd ..
printf "\tDone.\n"

cd somhunter-data-server
docker run -ti --rm -v $(dirname $PWD):/somhunter somhunter-data-server:latest sh install.sh
cd ..


#
# Ranking server
#
printf "\tBuilding the image for 'ranking-server'...\n"
cd ranking-server
docker build -t ranking-server .
cd ..
printf "\tDone.\n"

cd ranking-server
docker run -ti --rm -v ${PWD}:/ranking-server ranking-server:latest sh install.sh
cd ..


printf "Done installing 'somhunter' with Docker.\n"
echo "--------------------------------"
