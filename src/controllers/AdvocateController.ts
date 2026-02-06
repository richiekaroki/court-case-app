import sequelize from "../middleware/sequelize.js";
import { Advocate, CaseAdvocate, Case } from "../models/index.js";
import { Request, Response } from "express";

const getAllAdvocates = async (req: Request, res: Response): Promise<void> => {
    try {
        const advocates = await Advocate.findAll();
        res.json(advocates);
    } catch (err: any) {
        console.log(err);
        res.status(500).json({ err: err.message });
    }
}

const getAdvocateCaseCount = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await Advocate.findAll({
            attributes: [
                ['id', 'advocateId'],
                ['name', 'advocateName'],
                [sequelize.fn('COUNT', sequelize.col('CaseAdvocates.Case.id')), 'casesCount']
            ],
            include: [
                {
                    model: CaseAdvocate,
                    attributes: [],
                    include: [
                        {
                            model: Case,
                            attributes: []
                        }
                    ]
                }
            ],
            group: ['Advocate.id'],
            raw: true
        });
        res.json(result);
    } catch (err: any) {
        console.log(err);
        res.status(500).json({ err: err.message });
    }
}

export default {
    getAllAdvocates,
    getAdvocateCaseCount
}