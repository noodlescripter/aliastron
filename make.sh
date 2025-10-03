#!/bin/bash

# Check if arguments are provided
if [ $# -lt 2 ]; then
    echo "Error: Need at least 2 arguments"
    echo "Usage: $0 <alias_name> <url>"
    exit 1
fi

# Append alias to .bashrc with proper quoting
echo "alias $1=\"/usr/lib/electron37/electron $2 > /dev/null 2>&1 &\"" >> ~/.bashrc

# Source bashrc
source ~/.bashrc

echo "Alias '$1' created successfully!"
