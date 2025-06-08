#!/bin/bash
# Script to update and rebuild the compute cluster on the server

echo "Updating code from git repository..."
# Fetch the latest changes
git fetch

# Reset to the latest commit on the main branch (you can change 'main' to your primary branch name if different)
git reset --hard origin/main

echo "Git update complete."

# Now run the existing rebuild script
echo "Starting rebuild process..."
./rebuild.sh

echo "Server update and rebuild completed successfully!"
