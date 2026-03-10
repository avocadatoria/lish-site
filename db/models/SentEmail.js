import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const SentEmail = sequelize.define(`SentEmail`, {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    to: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cc: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    bcc: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    html: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    messageId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    blockedReason: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    internalNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
  }, {
    paranoid: false,
    updatedAt: false,
  });

  return SentEmail;
};
