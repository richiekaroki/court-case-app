import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../middleware/sequelize.js';

interface CaseJudgeAttributes {
    id: number;
    judgeId: number;
    caseId: number;
}

interface CaseJudgeCreationAttributes extends Optional<CaseJudgeAttributes, 'id'> { }

class CaseJudge extends Model<CaseJudgeAttributes, CaseJudgeCreationAttributes> implements CaseJudgeAttributes {
    public id!: number;
    public judgeId!: number;
    public caseId!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

CaseJudge.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    judgeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'judge_id'
    },
    caseId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'case_id'
    }
}, {
    sequelize,
    modelName: 'CaseJudge',
    tableName: 'case_judge',
    timestamps: false
});

export default CaseJudge;