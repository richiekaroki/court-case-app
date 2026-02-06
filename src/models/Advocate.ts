import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../middleware/sequelize.js";

interface AdvocateAttributes {
    id: number;
    name: string;
    type: string;
    dateCreated: Date;
    dateModified: Date;
}

interface AdvocateCreationAttributes extends Optional<AdvocateAttributes, 'id'> { }

class Advocate extends Model<AdvocateAttributes, AdvocateCreationAttributes> implements AdvocateAttributes {
    public id!: number;
    public name!: string;
    public type!: string;
    public dateCreated!: Date;
    public dateModified!: Date;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Advocate.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    type: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'type'
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
    modelName: 'Advocate',
    tableName: 'advocate',
    timestamps: false
});

export default Advocate;