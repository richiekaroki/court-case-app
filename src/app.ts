import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Worker } from 'node:worker_threads';
import sequelize from './middleware/sequelize.js';
import advocateRouter from './routes/AdvocateRoutes.js';
import caseRouter from './routes/CaseRoutes.js';
import { setupAssociations } from './setupAssociations.js';

const app: Application = express();

app.use(bodyParser.json());
app.use(cors());

app.use('/api/advocate', advocateRouter);
app.use('/api/case', caseRouter);

app.get('/', (req: Request, resp: Response) => {
    resp.json({ statusMessage: "Hello World!" });
});

setupAssociations();

const dbConnect = async (): Promise<boolean> => {
    try {
        await sequelize.authenticate();

        // await sequelize.sync();

        console.log('Database connection established successfully');
        return true;
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        return false;
    }
};

const isConnectedToDb = await dbConnect();

if (isConnectedToDb) {
    console.log(`Connected to DB`);
    // const scraperWorker = new Worker('./dist/scraper/index.js');

    // scraperWorker.on('message', (message) => {
    //     if (message === 'scraping-completed') {
    //         console.log('Scraping service completed its task.');
    //     }
    // });

    // scraperWorker.postMessage('start-scraping');
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Application server is now running on port ${PORT}`);
});

export default app;