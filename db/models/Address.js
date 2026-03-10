import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Address = sequelize.define(`Address`, {
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
    type: {
      type: DataTypes.ENUM(`home`, `work`, `billing`, `shipping`, `other`),
      allowNull: false,
    },
    street: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    postalCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    internalNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
  });

  Address.associate = (models) => {
    Address.belongsTo(models.User, { foreignKey: `userId` });
  };

  return Address;
};
