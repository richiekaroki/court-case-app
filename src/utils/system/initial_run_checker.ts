import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from "../../middleware/sequelize.js"
import logger from "../../utils/logger.js"

// ============================================
// ScraperState Model
// ============================================

interface ScraperStateAttributes {
    id: number;
    lastPage: number;
    lastCaseNumber: string | null;
    lastScrapedDate: Date | null;
    totalCasesScraped: number;
    status: 'idle' | 'running' | 'paused' | 'failed' | 'completed';
    lastError: string | null;
    updatedAt: Date;
}

// Make updatedAt optional during creation (auto-set by DB/default)
interface ScraperStateCreationAttributes extends Optional<ScraperStateAttributes, 'id' | 'lastCaseNumber' | 'lastScrapedDate' | 'lastError' | 'updatedAt'> {}

class ScraperState extends Model<ScraperStateAttributes, ScraperStateCreationAttributes> implements ScraperStateAttributes {
    public id!: number;
    public lastPage!: number;
    public lastCaseNumber!: string | null;
    public lastScrapedDate!: Date | null;
    public totalCasesScraped!: number;
    public status!: 'idle' | 'running' | 'paused' | 'failed' | 'completed';
    public lastError!: string | null;
    public updatedAt!: Date;
}

ScraperState.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        defaultValue: 1,
        validate: {
            isOne(value: number) {
                if (value !== 1) throw new Error('ScraperState must be a singleton (id=1)');
            }
        }
    },
    lastPage: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        field: 'last_page'
    },
    lastCaseNumber: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'last_case_number'
    },
    lastScrapedDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'last_scraped_date'
    },
    totalCasesScraped: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'total_cases_scraped'
    },
    status: {
        type: DataTypes.ENUM('idle', 'running', 'paused', 'failed', 'completed'),
        allowNull: false,
        defaultValue: 'idle'
    },
    lastError: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'last_error'
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'updated_at'
    }
}, {
    sequelize,
    modelName: 'ScraperState',
    tableName: 'scraper_state',
    timestamps: false,
    hooks: {
        beforeUpdate: (instance: ScraperState) => {
            instance.updatedAt = new Date();
        }
    }
});

export default ScraperState;

// ============================================
// Scraper State Manager Service
// ============================================

export interface ScraperProgress {
    currentPage: number;
    lastCaseNumber?: string;
    casesProcessed: number;
    status?: 'idle' | 'running' | 'paused' | 'failed' | 'completed';
}

export interface ScraperStateResponse {
    isFirstRun: boolean;
    lastPage: number;
    lastCaseNumber: string | null;
    lastScrapedDate: Date | null;
    totalCasesScraped: number;
    status: string;
    canResume: boolean;
}

/**
 * Get current scraper state (resumable)
 * 🔥 Based on guide: "Make ingestion resumable"
 */
export const getScraperState = async (): Promise<ScraperStateResponse> => {
    try {
        // Get or create state (singleton)
        let state = await ScraperState.findByPk(1);
        
        if (!state) {
            state = await ScraperState.create({
                id: 1,
                lastPage: 1,
                lastCaseNumber: null,
                lastScrapedDate: null,
                totalCasesScraped: 0,
                status: 'idle',
                lastError: null
                // updatedAt will be set by defaultValue
            });
            logger.info('Created new scraper state');
            return {
                isFirstRun: true,
                lastPage: 1,
                lastCaseNumber: null,
                lastScrapedDate: null,
                totalCasesScraped: 0,
                status: 'idle',
                canResume: false
            };
        }

        // Check if we can resume from previous run
        const canResume = state.status === 'paused' || state.status === 'failed';
        
        if (canResume) {
            logger.info(`Resuming from page ${state.lastPage}, case ${state.lastCaseNumber}`);
        }

        const isFirstRun = state.totalCasesScraped === 0;

        return {
            isFirstRun,
            lastPage: state.lastPage,
            lastCaseNumber: state.lastCaseNumber,
            lastScrapedDate: state.lastScrapedDate,
            totalCasesScraped: state.totalCasesScraped,
            status: state.status,
            canResume
        };
        
    } catch (error: any) {
        logger.error('Error getting scraper state:', error);
        throw error;
    }
};

/**
 * Save scraper progress (for resumable scraping)
 * 🔥 Based on guide: "Make ingestion resumable"
 */
export const saveScraperProgress = async (
    currentPage: number,
    casesProcessed: number,
    lastCaseNumber?: string
): Promise<void> => {
    try {
        const transaction = await sequelize.transaction();
        
        try {
            let state = await ScraperState.findByPk(1, { transaction });
            
            if (!state) {
                state = await ScraperState.create({
                    id: 1,
                    lastPage: currentPage,
                    lastCaseNumber: lastCaseNumber || null,
                    totalCasesScraped: casesProcessed,
                    status: 'running',
                    lastScrapedDate: new Date(),
                    lastError: null
                    // updatedAt will be set by defaultValue
                }, { transaction });
            } else {
                await state.update({
                    lastPage: currentPage,
                    lastCaseNumber: lastCaseNumber || state.lastCaseNumber,
                    totalCasesScraped: casesProcessed,
                    status: 'running',
                    lastScrapedDate: new Date(),
                    updatedAt: new Date()
                }, { transaction });
            }
            
            await transaction.commit();
            logger.debug(`Progress saved: Page ${currentPage}, Cases: ${casesProcessed}`);
            
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    } catch (error: any) {
        logger.error('Error saving scraper progress:', error);
        // Don't throw - scraping should continue even if progress save fails
    }
};

/**
 * Update scraper status
 */
export const updateScraperStatus = async (
    status: 'idle' | 'running' | 'paused' | 'failed' | 'completed',
    error?: string
): Promise<void> => {
    try {
        let state = await ScraperState.findByPk(1);
        
        if (!state) {
            state = await ScraperState.create({
                id: 1,
                lastPage: 1,
                totalCasesScraped: 0,
                status: status,
                lastError: error || null,
                lastCaseNumber: null,
                lastScrapedDate: null
                // updatedAt will be set by defaultValue
            });
        } else {
            await state.update({
                status: status,
                lastError: error || null,
                updatedAt: new Date()
            });
        }
        
        logger.info(`Scraper status updated to: ${status}`);
        
    } catch (error: any) {
        logger.error('Error updating scraper status:', error);
    }
};

/**
 * Mark first run as complete
 */
export const updateInitialRunValue = async (): Promise<boolean> => {
    try {
        await updateScraperStatus('completed');
        logger.info('Initial scraper run marked as complete');
        return true;
    } catch (error: any) {
        logger.error('Error updating initial run value:', error);
        return false;
    }
};

/**
 * Reset scraper to run from beginning
 */
export const resetScraper = async (): Promise<void> => {
    try {
        const transaction = await sequelize.transaction();
        
        try {
            let state = await ScraperState.findByPk(1, { transaction });
            
            if (state) {
                await state.update({
                    lastPage: 1,
                    lastCaseNumber: null,
                    lastScrapedDate: null,
                    totalCasesScraped: 0,
                    status: 'idle',
                    lastError: null,
                    updatedAt: new Date()
                }, { transaction });
            } else {
                await ScraperState.create({
                    id: 1,
                    lastPage: 1,
                    totalCasesScraped: 0,
                    status: 'idle',
                    lastCaseNumber: null,
                    lastScrapedDate: null,
                    lastError: null
                    // updatedAt will be set by defaultValue
                }, { transaction });
            }
            
            await transaction.commit();
            logger.info('Scraper reset to initial state');
            
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    } catch (error: any) {
        logger.error('Error resetting scraper:', error);
        throw error;
    }
};

/**
 * Check if this is the first run (convenience wrapper)
 */
export const initialRunChecker = async (): Promise<boolean> => {
    const state = await getScraperState();
    return state.isFirstRun;
};

/**
 * Get resume point for paginated scraping
 */
export const getResumePoint = async (): Promise<{ page: number; caseNumber?: string }> => {
    const state = await getScraperState();
    return {
        page: state.lastPage,
        caseNumber: state.lastCaseNumber || undefined
    };
};