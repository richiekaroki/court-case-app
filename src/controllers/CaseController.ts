import sequelize from "../middleware/sequelize.js";
import { Case } from "../models/index.js";
import { Request, Response } from "express";

const getCaseCountByDate = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await Case.findAll({
            attributes: [
                [sequelize.fn('DATE', sequelize.col('Case.date_delivered')), 'date_delivered'],
                [sequelize.fn('COUNT', sequelize.literal('*')), 'case_count']
            ],
            group: [sequelize.fn('DATE', sequelize.col('date_delivered'))],
            order: [
                [sequelize.fn('DATE', sequelize.col('date_delivered')), 'ASC'

                ]
            ],
            raw: true
        });

        res.json(result);
    } catch (err: any) {
        console.log(err);
        res.status(500).json({ err: err.message });
    }
}

export default {
    getCaseCountByDate,
}