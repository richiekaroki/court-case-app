import { Request, Response } from "express";
import { Op } from "sequelize";
import sequelize from "../middleware/sequelize.js";
import { Judge, CaseJudge, Case, Court } from "../models/index.js";

/**
 * Get all judges with pagination and search
 */
const getAllJudges = async (req: Request, res: Response): Promise<void> => {
    try {
        const { page = 1, limit = 20, search } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        const where: any = {};

        if (search) {
            where.name = { [Op.iLike]: `%${search}%` };
        }

        const { count, rows } = await Judge.findAndCountAll({
            where,
            limit: Number(limit),
            offset,
            order: [['name', 'ASC']]
        });

        res.json({
            success: true,
            data: rows,
            pagination: {
                total: count,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(count / Number(limit))
            }
        });
    } catch (err: any) {
        console.error('Error in getAllJudges:', err);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch judges',
            message: err.message 
        });
    }
};

/**
 * Get a single judge by ID
 */
const getJudgeById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const judge = await Judge.findByPk(id);

        if (!judge) {
            res.status(404).json({ 
                success: false,
                error: 'Judge not found' 
            });
            return;
        }

        res.json({
            success: true,
            data: judge
        });
    } catch (err: any) {
        console.error('Error in getJudgeById:', err);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch judge',
            message: err.message 
        });
    }
};

/**
 * Get all cases for a specific judge
 */
const getJudgeCases = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        const judge = await Judge.findByPk(id);
        if (!judge) {
            res.status(404).json({ 
                success: false,
                error: 'Judge not found' 
            });
            return;
        }

        const { count, rows } = await Case.findAndCountAll({
            include: [
                {
                    model: CaseJudge,
                    where: { judgeId: id },
                    attributes: []
                },
                {
                    model: Court,
                    as: 'court',
                    attributes: ['id', 'courtName', 'type']
                }
            ],
            limit: Number(limit),
            offset,
            order: [['dateDelivered', 'DESC']],
            distinct: true
        });

        res.json({
            success: true,
            data: {
                judge,
                cases: rows
            },
            pagination: {
                total: count,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(count / Number(limit))
            }
        });
    } catch (err: any) {
        console.error('Error in getJudgeCases:', err);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch judge cases',
            message: err.message 
        });
    }
};

/**
 * Create a new judge
 */
const createJudge = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name } = req.body;

        if (!name) {
            res.status(400).json({ 
                success: false,
                error: 'Judge name is required' 
            });
            return;
        }

        const judge = await Judge.create({
            name,
            dateCreated: new Date(),
            dateModified: new Date()
        });

        res.status(201).json({
            success: true,
            data: judge,
            message: 'Judge created successfully'
        });
    } catch (err: any) {
        console.error('Error in createJudge:', err);
        res.status(500).json({ 
            success: false,
            error: 'Failed to create judge',
            message: err.message 
        });
    }
};

/**
 * Update a judge
 */
const updateJudge = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const [updated] = await Judge.update(
            { 
                name,
                dateModified: new Date()
            },
            { where: { id } }
        );

        if (!updated) {
            res.status(404).json({ 
                success: false,
                error: 'Judge not found' 
            });
            return;
        }

        const updatedJudge = await Judge.findByPk(id);

        res.json({
            success: true,
            data: updatedJudge,
            message: 'Judge updated successfully'
        });
    } catch (err: any) {
        console.error('Error in updateJudge:', err);
        res.status(500).json({ 
            success: false,
            error: 'Failed to update judge',
            message: err.message 
        });
    }
};

/**
 * Delete a judge
 */
const deleteJudge = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const deleted = await Judge.destroy({
            where: { id }
        });

        if (!deleted) {
            res.status(404).json({ 
                success: false,
                error: 'Judge not found' 
            });
            return;
        }

        res.json({
            success: true,
            message: 'Judge deleted successfully'
        });
    } catch (err: any) {
        console.error('Error in deleteJudge:', err);
        res.status(500).json({ 
            success: false,
            error: 'Failed to delete judge',
            message: err.message 
        });
    }
};

/**
 * Get judge case count for analytics
 */
const getJudgeCaseCount = async (req: Request, res: Response): Promise<void> => {
    try {
        const { limit = 10 } = req.query;

        const result = await Judge.findAll({
            attributes: [
                'id',
                'name',
                [sequelize.fn('COUNT', sequelize.col('CaseJudges.Case.id')), 'caseCount']
            ],
            include: [
                {
                    model: CaseJudge,
                    attributes: [],
                    include: [
                        {
                            model: Case,
                            attributes: []
                        }
                    ]
                }
            ],
            group: ['Judge.id'],
            order: [[sequelize.fn('COUNT', sequelize.col('CaseJudges.Case.id')), 'DESC']],
            limit: Number(limit),
            raw: true
        });

        res.json({
            success: true,
            data: result
        });
    } catch (err: any) {
        console.error('Error in getJudgeCaseCount:', err);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch judge case count',
            message: err.message 
        });
    }
};

export default {
    getAllJudges,
    getJudgeById,
    getJudgeCases,
    createJudge,
    updateJudge,
    deleteJudge,
    getJudgeCaseCount
};