import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../middleware/sequelize.js';

interface CaseHistoryAttributes {
    id: number;
    historyDocketNo: string;
    historyJudgeId: number;
    historyCountyId: number;
    caseId: number;
    dateCreated: Date;
    dateModified: Date;
}

interface CaseHistoryCreationAttributes extends Optional<CaseHistoryAttributes, 'id' | 'historyJudgeId' | 'historyCountyId'> { }

class CaseHistory extends Model<CaseHistoryAttributes, CaseHistoryCreationAttributes> implements CaseHistoryAttributes {
    public id!: number;
    public historyDocketNo!: string;
    public historyCountyId!: number;
    public historyJudgeId!: number;
    public caseId!: number;
    public dateCreated!: Date;
    public dateModified!: Date;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

CaseHistory.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    historyDocketNo: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'history_docket_no'
    },
    historyCountyId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'history_county_id'
    },
    historyJudgeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'history_judge_id'
    },
    caseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'case_id'
    },
    dateCreated: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'date_created'
    },
    dateModified: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'date_modified'
    }
}, {
    sequelize,
    modelName: 'CaseHistory',
    tableName: 'case_history',
    timestamps: false
});

export default CaseHistory;