import { Request, Response } from "express";
import { Op } from "sequelize";
import sequelize from "../middleware/sequelize.js";
import { Case, Court, County, CaseJudge, Judge, CaseAdvocate, Advocate, Party } from "../models/index.js";
import { parseCaseNumber, isValidCaseNumber } from "../utils/caseParser.js";

/**
 * Get recent cases (for homepage)
 */
const getRecentCases = async (req: Request, res: Response): Promise<void> => {
    try {
        const limit = parseInt(req.query.limit as string) || 10;

        const cases = await Case.findAll({
            limit,
            order: [['dateDelivered', 'DESC']],
            include: [
                {
                    model: Court,
                    attributes: ['id', 'courtName', 'type']
                }
            ]
        });

        res.json(cases);
    } catch (err: any) {
        console.error('Error in getRecentCases:', err);
        res.status(500).json({ error: 'Failed to fetch recent cases', message: err.message });
    }
};

/**
 * Look up a case by case number, party name, or court station
 * Query params: caseNumber, partyName, court
 */
const lookupCase = async (req: Request, res: Response): Promise<void> => {
    try {
        const caseNumber = req.query.caseNumber as string;
        const partyName = req.query.partyName as string;
        const court = req.query.court as string;

        const where: any = {};
        let parsed;

        // Build search conditions for caseNumber
        if (caseNumber) {
            parsed = parseCaseNumber(caseNumber);

            if (parsed) {
                // Case number was successfully parsed - search using parsed components
                where[Op.or] = [
                    { caseNumber: { [Op.iLike]: `%${parsed.original}%` } },
                    { title: { [Op.iLike]: `%${parsed.caseType}%` } },
                ];

                if (parsed.court) {
                    where[Op.or].push({
                        courtName: { [Op.iLike]: `%${parsed.court}%` }
                    });
                }
            } else {
                // Case number couldn't be parsed - do general text search
                where[Op.or] = [
                    { caseNumber: { [Op.iLike]: `%${caseNumber}%` } },
                    { title: { [Op.iLike]: `%${caseNumber}%` } },
                    { parties: { [Op.iLike]: `%${caseNumber}%` } }
                ];
            }
        }

        // Add party name search if provided
        if (partyName) {
            if (where[Op.or]) {
                // Already have OR conditions, add party as another OR option
                where[Op.or].push({ parties: { [Op.iLike]: `%${partyName}%` } });
            } else {
                // Start a new OR condition
                where[Op.or] = [{ parties: { [Op.iLike]: `%${partyName}%` } }];
            }
        }

        // Add court station search if provided
        if (court) {
            if (where[Op.or]) {
                where[Op.or].push({ courtName: { [Op.iLike]: `%${court}%` } });
            } else {
                where[Op.or] = [{ courtName: { [Op.iLike]: `%${court}%` } }];
            }
        }

        const { count, rows } = await Case.findAndCountAll({
            where,
            limit: 20,
            offset: 0,
            order: [['dateDelivered', 'DESC']],
            include: [
                {
                    model: Court,
                    attributes: ['id', 'courtName', 'type']
                }
            ]
        });

        // If we had a valid parsed case number but found no results,
        // show a clear message
        let notFoundMessage = null;
        if (caseNumber && !parsed) {
            notFoundMessage = `Case number "${caseNumber}" could not be parsed. Please check the format (e.g., "Civil Appeal No. E123 of 2024").`;
        }

        res.json({
            cases: rows,
            pagination: {
                total: count,
                page: 1,
                limit: 20,
                totalPages: Math.ceil(count / 20)
            },
            parsed: caseNumber ? { original: caseNumber, valid: !!parsed } : null,
            notFoundMessage
        });
    } catch (err: any) {
        console.error('Error in lookupCase:', err);
        res.status(500).json({ error: 'Failed to lookup case', message: err.message });
    }
};

/**
 * Get all cases with pagination and filtering
 * Query params: page, limit, search, courtId, dateFrom, dateTo
 */
const getAllCases = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = (page - 1) * limit;
        const search = req.query.search as string;
        const courtId = req.query.courtId as string;
        const dateFrom = req.query.dateFrom as string;
        const dateTo = req.query.dateTo as string;

        // Build where clause for filtering
        const where: any = {};
        
        if (search) {
            where[Op.or] = [
                { title: { [Op.iLike]: `%${search}%` } },
                { caseNumber: { [Op.iLike]: `%${search}%` } },
                { parties: { [Op.iLike]: `%${search}%` } }
            ];
        }

        if (courtId) {
            where.courtId = parseInt(courtId);
        }

        if (dateFrom && dateTo) {
            where.dateDelivered = {
                [Op.between]: [new Date(dateFrom), new Date(dateTo)]
            };
        } else if (dateFrom) {
            where.dateDelivered = { [Op.gte]: new Date(dateFrom) };
        } else if (dateTo) {
            where.dateDelivered = { [Op.lte]: new Date(dateTo) };
        }

        const { count, rows } = await Case.findAndCountAll({
            where,
            limit,
            offset,
            order: [['dateDelivered', 'DESC']],
            include: [
                {
                    model: Court,
                    attributes: ['id', 'courtName', 'type']
                }
            ]
        });

        res.json({
            cases: rows,
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (err: any) {
        console.error('Error in getAllCases:', err);
        res.status(500).json({ error: 'Failed to fetch cases', message: err.message });
    }
};

/**
 * Get a single case by ID with all relationships
 */
const getCaseById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const caseData = await Case.findByPk(id, {
            include: [
                {
                    model: Court,
                    attributes: ['id', 'courtName', 'type'],
                    include: [{
                        model: County,
                        attributes: ['id', 'county']
                    }]
                },
                {
                    model: CaseJudge,
                    include: [{
                        model: Judge,
                        attributes: ['id', 'name']
                    }]
                },
                {
                    model: CaseAdvocate,
                    include: [{
                        model: Advocate,
                        attributes: ['id', 'name', 'type']
                    }]
                },
                {
                    model: Party,
                    attributes: ['id', 'name', 'type']
                }
            ]
        });

        if (!caseData) {
            res.status(404).json({ error: 'Case not found' });
            return;
        }

        res.json(caseData);
    } catch (err: any) {
        console.error('Error in getCaseById:', err);
        res.status(500).json({ error: 'Failed to fetch case', message: err.message });
    }
};

/**
 * Get case count grouped by date (for analytics)
 */
const getCaseCountByDate = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await Case.findAll({
            attributes: [
                [sequelize.fn('DATE', sequelize.col('date_delivered')), 'date'],
                [sequelize.fn('COUNT', sequelize.literal('*')), 'count']
            ],
            group: [sequelize.fn('DATE', sequelize.col('date_delivered'))],
            order: [[sequelize.fn('DATE', sequelize.col('date_delivered')), 'ASC']],
            raw: true
        });

        res.json(result);
    } catch (err: any) {
        console.error('Error in getCaseCountByDate:', err);
        res.status(500).json({ error: 'Failed to fetch case count by date', message: err.message });
    }
};

/**
 * Get case count grouped by year (for analytics)
 */
const getCaseCountByYear = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await Case.findAll({
            attributes: [
                [sequelize.fn('EXTRACT', sequelize.literal("YEAR FROM date_delivered")), 'year'],
                [sequelize.fn('COUNT', sequelize.literal('*')), 'count']
            ],
            group: [sequelize.fn('EXTRACT', sequelize.literal("YEAR FROM date_delivered"))],
            order: [[sequelize.fn('EXTRACT', sequelize.literal("YEAR FROM date_delivered")), 'ASC']],
            raw: true
        });

        res.json(result);
    } catch (err: any) {
        console.error('Error in getCaseCountByYear:', err);
        res.status(500).json({ error: 'Failed to fetch case count by year', message: err.message });
    }
};

/**
 * Get case count grouped by court (for analytics)
 */
const getCaseCountByCourt = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await Court.findAll({
            attributes: [
                ['id', 'courtId'],
                ['name', 'courtName'],
                [sequelize.fn('COUNT', sequelize.col('Cases.id')), 'caseCount']
            ],
            include: [
                {
                    model: Case,
                    attributes: [],
                    as: 'Cases'
                }
            ],
            group: ['Court.id'],
            order: [[sequelize.fn('COUNT', sequelize.col('Cases.id')), 'DESC']],
            raw: true
        });

        res.json(result);
    } catch (err: any) {
        console.error('Error in getCaseCountByCourt:', err);
        res.status(500).json({ error: 'Failed to fetch case count by court', message: err.message });
    }
};

/**
 * Create a new case
 */
const createCase = async (req: Request, res: Response): Promise<void> => {
    try {
        const newCase = await Case.create(req.body);
        res.status(201).json(newCase);
    } catch (err: any) {
        console.error('Error in createCase:', err);
        res.status(400).json({ error: 'Failed to create case', message: err.message });
    }
};

/**
 * Update a case
 */
const updateCase = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const [updated] = await Case.update(req.body, {
            where: { id }
        });

        if (updated === 0) {
            res.status(404).json({ error: 'Case not found' });
            return;
        }

        const updatedCase = await Case.findByPk(id);
        res.json(updatedCase);
    } catch (err: any) {
        console.error('Error in updateCase:', err);
        res.status(400).json({ error: 'Failed to update case', message: err.message });
    }
};

/**
 * Delete a case
 */
const deleteCase = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const deleted = await Case.destroy({
            where: { id }
        });

        if (deleted === 0) {
            res.status(404).json({ error: 'Case not found' });
            return;
        }

        res.status(204).send();
    } catch (err: any) {
        console.error('Error in deleteCase:', err);
        res.status(500).json({ error: 'Failed to delete case', message: err.message });
    }
};

export default {
    getAllCases,
    getCaseById,
    getRecentCases,
    getCaseCountByDate,
    getCaseCountByYear,
    getCaseCountByCourt,
    createCase,
    updateCase,
    deleteCase,
    lookupCase
};