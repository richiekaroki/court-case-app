import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../middleware/sequelize.js";

interface InitialRunAttributes {
    id: number;
    initialRun: number
}

interface initialRunCreationAttributes extends Optional<InitialRunAttributes, 'id'> { }

class InitialRun extends Model<InitialRunAttributes, initialRunCreationAttributes> implements InitialRunAttributes {
    public id!: number;
    public initialRun!: number;

    // public readonly createdAt!: Date;
    // public readonly updatedAt!: Date;
}

InitialRun.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    initialRun: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'initial_run'
    }
}, {
    sequelize,
    modelName: 'InitialRun',
    tableName: 'initial_run',
    timestamps: false
});

export default InitialRun;