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
echo "4) clean-full - DELETE ALL DATA and rebuild everything"
echo "5) cancel rebuild"
echo ""
read -p "Choose profile [1-5, default: 1]: " choice

# Set default profile
PROFILE="app"
DESCRIPTION="Backend + Frontend"
CLEAN_REBUILD=false

case $choice in
    2)
        PROFILE="guacamole"
        DESCRIPTION="Database + Guacamole"
        ;;
    3)
        PROFILE="full"
        DESCRIPTION="All services"
        ;;
    4)
        PROFILE="full"
        DESCRIPTION="All services (CLEAN REBUILD)"
        CLEAN_REBUILD=true
        echo ""
        echo "WARNING: This will DELETE ALL DATA including:"
        echo " - PostgreSQL database (all Guacamole connections, users)"
        echo " - Docker volumes"
        echo " - All containers"
        echo ""
        read -p "Are you absolutely sure? Type 'YES' to confirm: " confirm
        if [ "$confirm" != "YES" ]; then
            echo "Clean rebuild cancelled."
            exit 0
        fi
        ;;
    5)
        echo "Rebuild cancelled."
        exit 0
        ;;
    *)
        PROFILE="app"
        DESCRIPTION="Backend + Frontend"
        ;;
esac

if [ "$CLEAN_REBUILD" = true ]; then
    echo "CLEAN REBUILD: Stopping all services..."
    docker compose down --remove-orphans

    echo "CLEAN REBUILD: Removing all containers..."
    docker compose rm -f

    echo "CLEAN REBUILD: Removing all volumes..."
    docker compose down -v

    echo "CLEAN REBUILD: Removing all images..."
    docker compose down --rmi all

    echo "CLEAN REBUILD: Building everything from scratch..."
    docker compose --profile $PROFILE build --no-cache
else
    echo "Stopping $DESCRIPTION..."
    docker compose --profile $PROFILE down

    echo "Building $DESCRIPTION..."
    docker compose --profile $PROFILE build
fi

echo "Starting $DESCRIPTION..."
docker compose --profile $PROFILE up -d

echo ""
if [ "$CLEAN_REBUILD" = true ]; then
    echo "Clean rebuild completed! Everything has been reset to factory defaults."
    echo "Remember to reconfigure Guacamole connections if needed."
else
    echo "$DESCRIPTION rebuilt successfully!"
fi
echo "Server update and rebuild completed successfully!"
