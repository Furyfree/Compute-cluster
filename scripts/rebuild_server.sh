#!/bin/bash
# Script to update and rebuild the compute cluster on the server

cd /opt/Compute-cluster || exit 1

echo "Updating code from git repository..."
git fetch

git reset --hard origin/main

echo "Git update complete."

echo "Starting rebuild process..."

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
