import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../middleware/sequelize.js';

interface JudgeAttributes {
    id: number;
    name: string;
    dateCreated: Date;
    dateModified: Date;
}

interface JudgeCreationAttributes extends Optional<JudgeAttributes, 'id'> { }

class Judge extends Model<JudgeAttributes, JudgeCreationAttributes> implements JudgeAttributes {
    public id!: number;
    public name!: string;
    public dateCreated!: Date;
    public dateModified!: Date;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Judge.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
    },
    dateCreated: {
        field: 'date_created',
        type: DataTypes.DATE,
        allowNull: true,
    },
    dateModified: {
        field: 'date_modified',
        type: DataTypes.DATE,
        allowNull: true,
    }
}, {
    sequelize,
    modelName: 'Judge',
    tableName: 'judge',
    timestamps: false
})

export default Judge;