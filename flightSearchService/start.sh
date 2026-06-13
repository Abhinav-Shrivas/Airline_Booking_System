#!/bin/sh
echo "Undoing flight-related migrations to recreate dropped table..."
npx sequelize-cli db:migrate:undo --name 20260307212558-add-unique-flight-departure-constraint.js 2>/dev/null || true
npx sequelize-cli db:migrate:undo --name 20260221201348-add-indexes-to-tables.js 2>/dev/null || true
npx sequelize-cli db:migrate:undo --name 20260218074152-add-fk-constraints-to-flights.js 2>/dev/null || true
npx sequelize-cli db:migrate:undo --name 20260212201946-create-flight.js 2>/dev/null || true

echo "Running migrations..."
npx sequelize-cli db:migrate
echo "Running seeders..."
npx sequelize-cli db:seed:all 2>/dev/null || echo "Seeds already applied or skipped."
echo "Starting flight service..."
node src/index.js
