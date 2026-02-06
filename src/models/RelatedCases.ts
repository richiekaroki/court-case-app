import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../middleware/sequelize.js";

interface RelatedCasesAttributes {
    id: number;
    parentCaseId: number;
    childCaseId: number;
}

interface RelatedCasesCreationAttributes extends Optional<RelatedCasesAttributes, 'id'> { }

class RelatedCases extends Model<RelatedCasesAttributes, RelatedCasesCreationAttributes> implements RelatedCasesAttributes {
    public id!: number;
    public parentCaseId!: number;
    public childCaseId!: number;
}

RelatedCases.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    parentCaseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'parent_case_id'
    },
    childCaseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'child_case_id'
    }
}, {
    sequelize,
    modelName: 'RelatedCases',
    tableName: 'related_cases',
    timestamps: false
});

export default RelatedCases;