import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../middleware/sequelize.js';

interface CourtAttributes {
    id: number;
    courtName: string;
    type: string;
    countyId: number;
    dateCreated: Date;
    dateModified: Date;
}

interface CourtCreationAttributes extends Optional<CourtAttributes, 'id'> { }

class Court extends Model<CourtAttributes, CourtCreationAttributes> implements CourtAttributes {
    public id!: number;
    public courtName!: string;
    public type!: string;
    public countyId!: number;
    public dateCreated!: Date;
    public dateModified!: Date;

    // Timestamps will not be managed by Sequelize
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Court.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    courtName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'name'
    },
    type: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    countyId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'county_id'
    },
    dateCreated: {
        field: 'date_created',
        type: DataTypes.DATE,
        allowNull: false,
    },
    dateModified: {
        field: 'date_modified',
        type: DataTypes.DATE,
        allowNull: false,
    }
}, {
    sequelize,
    modelName: 'Court',
    tableName: 'court',
    timestamps: false,
});

export default Court;
