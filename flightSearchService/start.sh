#!/bin/sh
echo "Running migrations..."
npx sequelize-cli db:migrate
echo "Running seeders..."
npx sequelize-cli db:seed:all 2>/dev/null || echo "Seeds already applied or skipped."
echo "Starting flight service..."
node src/index.js
