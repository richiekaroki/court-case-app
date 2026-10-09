import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../middleware/sequelize.js";

interface ReminderAttributes {
  id: number;
  watchlistEntryId: number;
  reminderType: '3-day' | '1-day' | 'hearing-day';
  sent: boolean;
  sentAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ReminderCreationAttributes extends Optional<ReminderAttributes, 'id'> {}

class Reminder
  extends Model<ReminderAttributes, ReminderCreationAttributes>
  implements ReminderAttributes
{
  public id!: number;
  public watchlistEntryId!: number;
  public reminderType!: '3-day' | '1-day' | 'hearing-day';
  public sent!: boolean;
  public sentAt!: Date | null;
  public readonly createdAt!: Date;
}

Reminder.init({
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
  reminderType: {
    type: DataTypes.ENUM('3-day', '1-day', 'hearing-day'),
    allowNull: false,
  },
  sent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  sentAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: "Reminder",
  tableName: "reminders",
  timestamps: false,
});

export default Reminder;