#!/bin/bash
# Script to update and rebuild the compute cluster on the server

cd /opt/Compute-cluster || exit 1

echo "Updating code from git repository..."
# Fetch the latest changes
git fetch

# Reset to the latest commit on the main branch (you can change 'main' to your primary branch name if different)
git reset --hard origin/main

echo "Git update complete."

# Now run the existing rebuild script
echo "Starting rebuild process..."
# Rebuild the compute cluster

echo "Stopping compute cluster..."
docker compose down

echo "Removing compute cluster..."
docker compose rm -f

echo "Building compute cluster..."
docker compose build

echo "Starting compute cluster..."
docker compose up -d

echo "Compute cluster rebuilt successfully!"


echo "Server update and rebuild completed successfully!"
