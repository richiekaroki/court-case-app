import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../middleware/sequelize.js";

interface CaseAttributes {
  id: number;
  caseNumber: string;
  parties: string;
  title: string;
  citation: string;
  caseAction: string;
  pdfFilePath: string;
  dateDelivered: Date;
  caseClass: string;
  courtId: number;
  courtDivision: string;
  dateCreated: Date;
  dateModified: Date;
}

interface CaseCreationAttributes extends Optional<
  CaseAttributes,
  | "id"
  | "caseAction"
  | "parties"
  | "pdfFilePath"
  | "caseClass"
  | "courtDivision"
> {}

class Case
  extends Model<CaseAttributes, CaseCreationAttributes>
  implements CaseAttributes
{
  public id!: number;
  public caseNumber!: string;
  public parties!: string;
  public title!: string;
  public citation!: string;
  public caseAction!: string;
  public pdfFilePath!: string;
  public dateDelivered!: Date;
  public caseClass!: string;
  public courtId!: number;
  public courtDivision!: string;
  public dateCreated!: Date;
  public dateModified!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Case.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    // 🔥 IMPROVED: STRING(255) instead of TEXT for better index performance
    caseNumber: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "case_number",
      validate: {
        notEmpty: {
          msg: "Case number cannot be empty",
        },
      },
    },
    parties: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // 🔥 IMPROVED: Added notEmpty validation
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Title cannot be empty",
        },
      },
    },
    // 🔥 IMPROVED: Added notEmpty validation
    citation: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Citation cannot be empty",
        },
      },
    },
    caseAction: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "case_action",
    },
    pdfFilePath: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "pdf_file_path",
    },
    dateDelivered: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "date_delivered",
    },
    caseClass: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "case_class",
    },
    courtId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "court_id",
    },
    courtDivision: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "court_division",
    },
    // 🔥 IMPROVED: Added defaultValue
    dateCreated: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "date_created",
      defaultValue: DataTypes.NOW,
    },
    // 🔥 IMPROVED: Added defaultValue and update hook
    dateModified: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "date_modified",
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "Case",
    tableName: "court_case",
    timestamps: false,
    indexes: [
      // 🔥 Unique constraint on case_number (already strong)
      {
        unique: true,
        fields: ["case_number"],
        name: "unique_case_number",
      },
      // 🔥 Single column indexes for basic filters
      {
        fields: ["court_id"],
        name: "idx_case_court_id",
      },
      {
        fields: ["date_delivered"],
        name: "idx_case_date_delivered",
      },
      // 🔥 NEW: Compound index for court + date queries (VERY IMPORTANT)
      {
        fields: ["court_id", "date_delivered"],
        name: "idx_case_court_date",
      },
      // 🔥 NEW: Compound index for date + case number (for sorting)
      {
        fields: ["date_delivered", "case_number"],
        name: "idx_case_date_number",
      },
    ],
    // 🔥 Add hooks to automatically update dateModified
    hooks: {
      beforeUpdate: (case_: Case) => {
        case_.dateModified = new Date();
      },
    },
  },
);

export default Case;
