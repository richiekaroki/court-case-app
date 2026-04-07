import express, { Application, Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Worker } from 'node:worker_threads';
import sequelize, { testConnection } from './middleware/sequelize.js';
import config from './config/Config.js';
import advocateRouter from './routes/AdvocateRoutes.js';
import caseRouter from './routes/CaseRoutes.js';
import { setupAssociations } from './setupAssociations.js';
import routes from './routes/index.js';

// Initialize Express app
const app: Application = express();

// ============================================
// MIDDLEWARE
// ============================================
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Request logging middleware (development only)
if (config.env === 'development') {
    app.use((req: Request, res: Response, next: NextFunction) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
    });
}

// ============================================
// ROUTES
// ============================================
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.json({ 
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: config.env
    });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
    res.json({ 
        statusMessage: "Kenya Court Cases API",
        version: "1.0.0",
        endpoints: {
            cases: "/api/cases",
            advocates: "/api/advocates",
            judges: "/api/judges",
            counties: "/api/counties",
            health: "/health"
        }
    });
});

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({ 
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`
    });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({ 
        error: 'Internal Server Error',
        message: config.env === 'development' ? err.message : 'Something went wrong'
    });
});

// ============================================
// DATABASE CONNECTION & SERVER STARTUP
// ============================================

/**
 * Initialize the application
 */
const initializeApp = async () => {
    try {
        // 1. Test database connection
        console.log('🔌 Testing database connection...');
        const isConnected = await testConnection();
        
        if (!isConnected) {
            console.error('❌ Failed to connect to database. Exiting...');
            process.exit(1);
        }

        // 2. Setup model associations
        console.log('🔗 Setting up model associations...');
        setupAssociations();

        // 3. Optional: Sync database (be careful with this in production)
        // await sequelize.sync({ alter: true }); // Use with caution!

        // 4. Start the server
        const PORT = config.port;
        app.listen(PORT, () => {
            console.log('✅ Application initialized successfully');
            console.log(`🚀 Server is running on port ${PORT}: http://localhost:${PORT}`);
            console.log(`🌍 Environment: ${config.env}`);
            console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
        });

        // 5. Optional: Start scraper worker (commented out for now)
        // startScraperWorker();

    } catch (error) {
        console.error('❌ Failed to initialize application:', error);
        process.exit(1);
    }
};

/**
 * Start the scraper worker (optional)
 */
const startScraperWorker = () => {
    const scraperWorker = new Worker('./dist/scraper/index.js');

    scraperWorker.on('message', (message) => {
        if (message === 'scraping-completed') {
            console.log('✅ Scraping service completed its task');
        }
    });

    scraperWorker.on('error', (error) => {
        console.error('❌ Scraper worker error:', error);
    });

    scraperWorker.on('exit', (code) => {
        if (code !== 0) {
            console.error(`❌ Scraper worker stopped with exit code ${code}`);
        }
    });

    scraperWorker.postMessage('start-scraping');
};

// ============================================
// GRACEFUL SHUTDOWN
// ============================================
process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Closing server gracefully...');
    await sequelize.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received. Closing server gracefully...');
    await sequelize.close();
    process.exit(0);
});

// Start the application
initializeApp();

export default app;