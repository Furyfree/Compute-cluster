#!/bin/bash
# Interactive script to rebuild the compute cluster

cd /opt/Compute-cluster || exit 1

echo "Updating code from git repository..."
git fetch
git reset --hard origin/main
echo "Git update complete."

echo ""
echo "Select rebuild profile:"
echo "1) app - Backend + Frontend only (default)"
echo "2) guacamole - Database + Guacamole only"
echo "3) full - All services"
echo ""
read -p "Choose profile [1-3, default: 1]: " choice

# Set default profile
PROFILE="app"
DESCRIPTION="Backend + Frontend"

case $choice in
    2)
        PROFILE="guacamole"
        DESCRIPTION="Database + Guacamole"
        ;;
    3)
        PROFILE="full"
        DESCRIPTION="All services"
        ;;
    *)
        PROFILE="app"
        DESCRIPTION="Backend + Frontend"
        ;;
esac

echo ""
echo "Selected profile: $PROFILE ($DESCRIPTION)"
read -p "Continue? [Y/n]: " confirm

if [[ $confirm =~ ^[Nn]$ ]]; then
    echo "Rebuild cancelled."
    exit 0
fi

echo ""
echo "Starting rebuild process for profile: $PROFILE..."

echo "Stopping $DESCRIPTION..."
docker compose --profile $PROFILE down

echo "Building $DESCRIPTION..."
docker compose --profile $PROFILE build

echo "Starting $DESCRIPTION..."
docker compose --profile $PROFILE up -d

echo ""
echo "$DESCRIPTION rebuilt successfully!"
echo "Server update and rebuild completed successfully!"
