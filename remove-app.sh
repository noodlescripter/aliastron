#!/bin/bash

if [ $# -eq 0 ]; then
    echo "Usage: $0 <alias_name>"
    exit 1
fi

# Remove from .bashrc
sed -i "/alias $1=/d" ~/.bashrc

# Unalias from current session
unalias $1 2>/dev/null

# Reload bashrc
source ~/.bashrc

echo "Alias '$1' removed successfully!"
