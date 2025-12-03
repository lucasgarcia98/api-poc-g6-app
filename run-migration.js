const { sequelize } = require('./src/config/database');
const path = require('path');
const fs = require('fs');

async function runMigration() {
  try {
    // Read the migration file
    const migration = require('./src/migrations/20251203214100-add-observacao-to-presencas');
    
    // Run the migration
    await migration.up(sequelize.getQueryInterface(), sequelize.Sequelize);
    
    console.log('Migration executed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  }
}

runMigration();
