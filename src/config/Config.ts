import { Dialect } from "sequelize";
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

interface DatabaseConfig {
    dialect: Dialect;
    username: string;
    host: string;
    database: string;
    password: string;
    port: number;
    logging: boolean | ((sql: string) => void);
}

interface AppUrlLinks {
    baseUrl: string;
}

interface Config {
    port: number;
    database: DatabaseConfig;
    appUrlLinks: AppUrlLinks;
    env: string;
}

const config: Config = {
    // Server port
    port: Number(process.env.PORT) || 3001,
    
    // Environment (development, production, etc.)
    env: process.env.NODE_ENV || 'development',
    
    // Database configuration
    database: {
        dialect: 'postgres',
        database: process.env.DB_NAME || 'court_cases_db',
        username: process.env.DB_USER || 'court_cases_user',
        password: process.env.DB_PASSWORD || '',
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        // Only log SQL queries in development
        logging: process.env.NODE_ENV === 'development' ? console.log : false
    },
    
    // External URLs
    appUrlLinks: {
        baseUrl: 'https://www.kenyalaw.org/caselaw'
    }
};

// Validate required environment variables
const requiredEnvVars = ['DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_HOST'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
    console.error('Please check your .env file');
    process.exit(1);
}

export default config;