import { Request, Response } from "express";
import { Op } from "sequelize";
import sequelize from "../middleware/sequelize.js";
import { Case, Court, Judge, Advocate, Party, CaseJudge, CaseAdvocate, County } from "../models/index.js";

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
    deleteCase
};