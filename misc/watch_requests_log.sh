#!/bin/sh

DIR="../logs/requests/"

tail -n0 -f $DIR$(ls -t $DIR | head -n1)

read
