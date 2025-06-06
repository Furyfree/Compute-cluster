#!/bin/bash
# Rebuild the compute cluster

echo "Stopping compute cluster..."
docker-compose down

echo "Removing compute cluster..."
docker-compose rm -f

echo "Building compute cluster..."
docker-compose build

echo "Starting compute cluster..."
docker-compose up -d

echo "Compute cluster rebuilt successfully!"
