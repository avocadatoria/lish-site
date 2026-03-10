import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const UserAttribute = sequelize.define(`UserAttribute`, {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: `User`,
        key: `id`,
      },
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    intValue: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    booleanValue: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    strValue: {
      type: DataTypes.STRING(256),
      allowNull: true,
    },
    dateValue: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    textValue: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    internalNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
  });

  UserAttribute.associate = (models) => {
    UserAttribute.belongsTo(models.User, { foreignKey: `userId` });
  };

  return UserAttribute;
};
