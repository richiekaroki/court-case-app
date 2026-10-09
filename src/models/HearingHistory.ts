import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../middleware/sequelize.js";

interface HearingHistoryAttributes {
  id: number;
  watchlistEntryId: number;
  oldHearingDate?: Date;
  newHearingDate: Date;
  changedAt: Date;
  outcome?: string; // e.g., "Adjourned", "Heard", "Dismissed", etc.
  notes?: string;
}

interface HearingHistoryCreationAttributes extends Optional<HearingHistoryAttributes, 'id'> {}

class HearingHistory
  extends Model<HearingHistoryAttributes, HearingHistoryCreationAttributes>
  implements HearingHistoryAttributes
{
  public id!: number;
  public watchlistEntryId!: number;
  public oldHearingDate!: Date;
  public newHearingDate!: Date;
  public readonly changedAt!: Date;
  public outcome?: string;
  public notes?: string;
}

HearingHistory.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  watchlistEntryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "WatchlistEntry",
      key: "id",
    },
  },
  oldHearingDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  newHearingDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  changedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  outcome: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: "HearingHistory",
  tableName: "hearing_history",
  timestamps: false,
});

export default HearingHistory;