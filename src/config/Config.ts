import { Dialect } from "sequelize";
import dotenv from 'dotenv';

interface DatabaseConfig {
    dialect: Dialect;
    username?: string;
    host?: string;
    database?: string;
    password?: string;
    port?: number;
    logging?: any;
}

interface AppUrlLinks {
    baseUrl: string;
}

interface Config {
    port: number;
    database: DatabaseConfig;
    appUrlLinks: AppUrlLinks;
}

dotenv.config();

const config: Config = {
    port: Number(process.env.PORT) || 3000,
    database: {
        dialect: 'postgres',
        database: process.env.DB_NAME,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        logging: console.log
    },
    appUrlLinks: {
        baseUrl: 'https://www.kenyalaw.org/caselaw'
    }
};

export default config;
