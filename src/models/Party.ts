import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../middleware/sequelize.js";

interface PartyAttributes {
  id: number;
  name: string;
  type: string;
  caseId: number;
  dateCreated: Date;
  dateModified: Date;
}

// ADD THIS - makes 'id' optional during creation
interface PartyCreationAttributes extends Optional<PartyAttributes, "id"> {}

class Party
  extends Model<PartyAttributes, PartyCreationAttributes>
  implements PartyAttributes
{
  public id!: number;
  public name!: string;
  public type!: string;
  public caseId!: number;
  public dateCreated!: Date;
  public dateModified!: Date;
}

Party.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    caseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "case_id",
    },
    dateCreated: {
      field: "date_created",
      type: DataTypes.DATE,
      allowNull: true,
    },
    dateModified: {
      field: "date_modified",
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Party",
    tableName: "party",
    timestamps: false,
  },
);

export default Party;
