import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../middleware/sequelize.js";

interface WatchlistEntryAttributes {
  id: number;
  userId: number;
  caseId: number;
  court: string;
  caseNumber: string;
  caseType: string;
  nextHearingDate: Date;
  outcome?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface WatchlistEntryCreationAttributes extends Optional<WatchlistEntryAttributes, 'id'> {}

class WatchlistEntry
  extends Model<WatchlistEntryAttributes, WatchlistEntryCreationAttributes>
  implements WatchlistEntryAttributes
{
  public id!: number;
  public userId!: number;
  public caseId!: number;
  public court!: string;
  public caseNumber!: string;
  public caseType!: string;
  public nextHearingDate!: Date;
  public readonly outcome?: string;
  public readonly createdAt!: Date;
}

WatchlistEntry.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "User",
      key: "id",
    },
  },
  caseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Case",
      key: "id",
    },
  },
  court: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  caseNumber: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  caseType: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  nextHearingDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  outcome: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
}, {
  sequelize,
  modelName: "WatchlistEntry",
  tableName: "watchlist_entries",
  timestamps: false,
});

export default WatchlistEntry;