import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../middleware/sequelize.js';

interface CaseJudgeAttributes {
    id: number;
    judgeId: number;
    caseId: number;
    dateCreated?: Date;
    dateModified?: Date;
}

interface CaseJudgeCreationAttributes extends Optional<CaseJudgeAttributes, 'id' | 'dateCreated' | 'dateModified'> { }

class CaseJudge extends Model<CaseJudgeAttributes, CaseJudgeCreationAttributes> implements CaseJudgeAttributes {
    public id!: number;
    public judgeId!: number;
    public caseId!: number;
    public dateCreated?: Date;
    public dateModified?: Date;

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
        allowNull: false,
        field: 'judge_id',
        // 🔥 NEW: Foreign key reference for database integrity
        references: {
            model: 'judge',
            key: 'id'
        }
    },
    caseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'case_id',
        // 🔥 NEW: Foreign key reference for database integrity
        references: {
            model: 'court_case',
            key: 'id'
        }
    },
    // 🔥 NEW: Audit timestamps for tracking when judge was linked
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
    modelName: 'CaseJudge',
    tableName: 'case_judge',
    timestamps: false,
    indexes: [
        // 🔥 Composite unique constraint (prevents duplicate judge-case links)
        {
            unique: true,
            fields: ['case_id', 'judge_id'],
            name: 'unique_case_judge'
        },
        // 🔥 NEW: Individual index for case lookups
        // Used for: "Find all judges for a specific case"
        {
            fields: ['case_id'],
            name: 'idx_case_judge_case_id'
        },
        // 🔥 NEW: Individual index for judge lookups
        // Used for: "Find all cases for a specific judge" (Phase 4 judge profile)
        {
            fields: ['judge_id'],
            name: 'idx_case_judge_judge_id'
        },
        // 🔥 NEW: Reverse compound index for judge analytics
        // Used for: "Which judges hear the most cases?" (Phase 4 workload dashboard)
        {
            fields: ['judge_id', 'case_id'],
            name: 'idx_case_judge_reverse'
        }
    ],
    // 🔥 NEW: Auto-update timestamp on changes
    hooks: {
        beforeUpdate: (instance: CaseJudge) => {
            instance.dateModified = new Date();
        }
    }
});

export default CaseJudge;