import { Sequelize } from 'sequelize';
import config from '../config/Config.js';

// Create Sequelize instance with explicit configuration
const sequelize = new Sequelize({
    dialect: config.database.dialect,
    host: config.database.host,
    port: config.database.port,
    username: config.database.username,
    password: config.database.password,
    database: config.database.database,
    logging: config.database.logging,
    
    // Connection pool configuration (important for production)
    pool: {
        max: 5,           // Maximum number of connections in pool
        min: 0,           // Minimum number of connections in pool
        acquire: 30000,   // Maximum time (ms) to try to get connection before throwing error
        idle: 10000       // Maximum time (ms) a connection can be idle before being released
    },
    
    // Define timezone
    timezone: '+03:00', // East Africa Time (Kenya)
    
    // Disable auto-pluralization of table names
    define: {
        freezeTableName: true,
        timestamps: false
    }
});

/**
 * Test database connection
 * @returns Promise<boolean> - true if connected, false otherwise
 */
export const testConnection = async (): Promise<boolean> => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully');
        console.log(`📊 Connected to: ${config.database.database} at ${config.database.host}:${config.database.port}`);
        return true;
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
        return false;
    }
};

/**
 * Sync all models with database
 * WARNING: Use with caution in production!
 */
export const syncDatabase = async (force: boolean = false): Promise<void> => {
    try {
        await sequelize.sync({ force });
        console.log('✅ Database synchronized');
    } catch (error) {
        console.error('❌ Database synchronization failed:', error);
        throw error;
    }
};

export default sequelize;