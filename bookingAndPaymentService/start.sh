#!/bin/sh
echo "Running migrations..."
npx sequelize-cli db:migrate
echo "Starting booking service..."
node src/index.js
