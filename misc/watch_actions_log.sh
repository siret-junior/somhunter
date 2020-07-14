#!/bin/sh

DIR="../logs/actions/"
tail -n0 -f $DIR$(ls -t $DIR | head -n1)

read
