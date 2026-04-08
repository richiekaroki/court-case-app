import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../middleware/sequelize.js';

interface CaseAdvocateAttributes {
    id: number;
    advocateId: number;
    caseId: number;
    dateCreated?: Date;
    dateModified?: Date;
}

interface CaseAdvocateCreationAttributes extends Optional<CaseAdvocateAttributes, 'id' | 'dateCreated' | 'dateModified'> { }

class CaseAdvocate extends Model<CaseAdvocateAttributes, CaseAdvocateCreationAttributes> implements CaseAdvocateAttributes {
    public id!: number;
    public advocateId!: number;
    public caseId!: number;
    public dateCreated?: Date;
    public dateModified?: Date;

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
        allowNull: false,
        field: 'advocate_id',
        // 🔥 NEW: Foreign key reference
        references: {
            model: 'advocate',
            key: 'id'
        }
    },
    caseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'case_id',
        // 🔥 NEW: Foreign key reference
        references: {
            model: 'court_case',
            key: 'id'
        }
    },
    // 🔥 NEW: Optional timestamps for audit trail
    dateCreated: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'date_created',
        defaultValue: DataTypes.NOW
    },
    dateModified: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'date_modified',
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    modelName: 'CaseAdvocate',
    tableName: 'case_advocate',
    timestamps: false,
    indexes: [
        // 🔥 Composite unique constraint (already strong)
        {
            unique: true,
            fields: ['case_id', 'advocate_id'],
            name: 'unique_case_advocate'
        },
        // 🔥 NEW: Individual index for case lookups
        {
            fields: ['case_id'],
            name: 'idx_case_advocate_case_id'
        },
        // 🔥 NEW: Individual index for advocate lookups
        {
            fields: ['advocate_id'],
            name: 'idx_case_advocate_advocate_id'
        },
        // 🔥 NEW: Compound index for reverse lookups
        {
            fields: ['advocate_id', 'case_id'],
            name: 'idx_case_advocate_reverse'
        }
    ],
    // 🔥 NEW: Auto-update dateModified on changes
    hooks: {
        beforeUpdate: (instance: CaseAdvocate) => {
            instance.dateModified = new Date();
        }
    }
});

export default CaseAdvocate;