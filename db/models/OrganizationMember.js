import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const OrganizationMember = sequelize.define(`OrganizationMember`, {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: `Organization`,
        key: `id`,
      },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: `User`,
        key: `id`,
      },
    },
    role: {
      type: DataTypes.ENUM(`owner`, `admin`, `member`, `viewer`),
      allowNull: false,
    },
    joinedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    internalNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
  });

  OrganizationMember.associate = (models) => {
    OrganizationMember.belongsTo(models.Organization, { foreignKey: `organizationId` });
    OrganizationMember.belongsTo(models.User, { foreignKey: `userId` });
  };

  return OrganizationMember;
};
