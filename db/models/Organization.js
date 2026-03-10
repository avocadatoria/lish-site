import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Organization = sequelize.define(`Organization`, {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: `User`,
        key: `id`,
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    internalNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
  });

  Organization.associate = (models) => {
    Organization.belongsTo(models.User, { as: `owner`, foreignKey: `ownerId` });
    Organization.hasMany(models.OrganizationMember, { as: `members`, foreignKey: `organizationId` });
    Organization.hasMany(models.Invitation, { as: `invitations`, foreignKey: `organizationId` });
  };

  return Organization;
};
