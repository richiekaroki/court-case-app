import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../middleware/sequelize.js';

interface CountyAttributes {
    id: number;
    county: string;
    dateCreated: Date;
    dateModified: Date;
}

interface CountyCreationAttributes extends Optional<CountyAttributes, 'id'> { }

class County extends Model<CountyAttributes, CountyCreationAttributes> implements CountyAttributes  {
    public id!: number;
    public county!: string;
    public dateCreated!: Date;
    public dateModified!: Date;

     // Timestamps will not be managed by Sequelize
     public readonly createdAt!: Date;
     public readonly updatedAt!: Date;
}

County.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    county: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    dateCreated: {
        field: 'date_created',
        type: DataTypes.DATE,
        allowNull: true
    },
    dateModified: {
        field: 'date_modified',
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'County',
    tableName: 'county',
    timestamps: false
});

export default County;