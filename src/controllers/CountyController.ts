import { Request, Response } from "express";
import { Op } from "sequelize";
import sequelize from "../middleware/sequelize.js";
import { Case, County, Court } from "../models/index.js";

/**
 * Get all counties with pagination and search
 */
const getAllCounties = async (req: Request, res: Response): Promise<void> => {
    try {
        const { page = 1, limit = 50, search } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        const where: any = {};

        if (search) {
            where.county = { [Op.iLike]: `%${search}%` };
        }

        const { count, rows } = await County.findAndCountAll({
            where,
            limit: Number(limit),
            offset,
            order: [['county', 'ASC']]
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
        console.error('Error in getAllCounties:', err);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch counties',
            message: err.message 
        });
    }
};

/**
 * Get a single county by ID
 */
const getCountyById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const county = await County.findByPk(id, {
            include: [
                {
                    model: Court,
                    as: 'courts'
                }
            ]
        });

        if (!county) {
            res.status(404).json({ 
                success: false,
                error: 'County not found' 
            });
            return;
        }

        res.json({
            success: true,
            data: county
        });
    } catch (err: any) {
        console.error('Error in getCountyById:', err);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch county',
            message: err.message 
        });
    }
};

/**
 * Get all cases for a specific county
 */
const getCountyCases = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        const county = await County.findByPk(id);
        if (!county) {
            res.status(404).json({ 
                success: false,
                error: 'County not found' 
            });
            return;
        }

        const { count, rows } = await Case.findAndCountAll({
            include: [
                {
                    model: Court,
                    as: 'court',
                    where: { countyId: id },
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
                county,
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
        console.error('Error in getCountyCases:', err);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch county cases',
            message: err.message 
        });
    }
};

/**
 * Create a new county
 */
const createCounty = async (req: Request, res: Response): Promise<void> => {
    try {
        const { county } = req.body;

        if (!county) {
            res.status(400).json({ 
                success: false,
                error: 'County name is required' 
            });
            return;
        }

        const newCounty = await County.create({
            county,
            dateCreated: new Date(),
            dateModified: new Date()
        });

        res.status(201).json({
            success: true,
            data: newCounty,
            message: 'County created successfully'
        });
    } catch (err: any) {
        console.error('Error in createCounty:', err);
        res.status(500).json({ 
            success: false,
            error: 'Failed to create county',
            message: err.message 
        });
    }
};

/**
 * Update a county
 */
const updateCounty = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { county } = req.body;

        const [updated] = await County.update(
            { 
                county,
                dateModified: new Date()
            },
            { where: { id } }
        );

        if (!updated) {
            res.status(404).json({ 
                success: false,
                error: 'County not found' 
            });
            return;
        }

        const updatedCounty = await County.findByPk(id);

        res.json({
            success: true,
            data: updatedCounty,
            message: 'County updated successfully'
        });
    } catch (err: any) {
        console.error('Error in updateCounty:', err);
        res.status(500).json({ 
            success: false,
            error: 'Failed to update county',
            message: err.message 
        });
    }
};

/**
 * Delete a county
 */
const deleteCounty = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const deleted = await County.destroy({
            where: { id }
        });

        if (!deleted) {
            res.status(404).json({ 
                success: false,
                error: 'County not found' 
            });
            return;
        }

        res.json({
            success: true,
            message: 'County deleted successfully'
        });
    } catch (err: any) {
        console.error('Error in deleteCounty:', err);
        res.status(500).json({ 
            success: false,
            error: 'Failed to delete county',
            message: err.message 
        });
    }
};

/**
 * Get county case count for analytics
 */
const getCountyCaseCount = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await County.findAll({
            attributes: [
                'id',
                'county',
                [sequelize.fn('COUNT', sequelize.col('courts.Cases.id')), 'caseCount']
            ],
            include: [
                {
                    model: Court,
                    as: 'courts',
                    attributes: [],
                    include: [
                        {
                            model: Case,
                            as: 'Cases',
                            attributes: []
                        }
                    ]
                }
            ],
            group: ['County.id'],
            order: [[sequelize.fn('COUNT', sequelize.col('courts.Cases.id')), 'DESC']],
            raw: true
        });

        res.json({
            success: true,
            data: result
        });
    } catch (err: any) {
        console.error('Error in getCountyCaseCount:', err);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch county case count',
            message: err.message 
        });
    }
};

export default {
    getAllCounties,
    getCountyById,
    getCountyCases,
    createCounty,
    updateCounty,
    deleteCounty,
    getCountyCaseCount
};