import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const NoSendEmailAddress = sequelize.define(`NoSendEmailAddress`, {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      set(val) {
        this.setDataValue(`email`, val?.toLowerCase());
      },
    },
    reasonCode: {
      type: DataTypes.STRING(32),
      allowNull: true,
      defaultValue: null,
    },
    internalNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
  });

  return NoSendEmailAddress;
};
