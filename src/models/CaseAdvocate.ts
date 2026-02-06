import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../middleware/sequelize.js';

interface CaseAdvocateAttributes {
    id: number;
    advocateId: number;
    caseId: number;
}

interface CaseAdvocateCreationAttributes extends Optional<CaseAdvocateAttributes, 'id'> { }

class CaseAdvocate extends Model<CaseAdvocateAttributes, CaseAdvocateCreationAttributes> implements CaseAdvocateAttributes {
    public id!: number;
    public advocateId!: number;
    public caseId!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

CaseAdvocate.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    advocateId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'advocate_id'
    },
    caseId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'case_id'
    }
}, {
    sequelize,
    modelName: 'CaseAdvocate',
    tableName: 'case_advocate',
    timestamps: false
});

export default CaseAdvocate;