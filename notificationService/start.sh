#!/bin/sh
echo "Running migrations..."
npx sequelize-cli db:migrate
echo "Starting notification service..."
node src/index.js
