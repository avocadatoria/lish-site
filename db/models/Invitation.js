import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Invitation = sequelize.define(`Invitation`, {
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
    invitedByUserId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: `User`,
        key: `id`,
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM(`admin`, `member`, `viewer`),
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM(`pending`, `accepted`, `declined`, `expired`),
      allowNull: false,
      defaultValue: `pending`,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    acceptedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    internalNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
  });

  Invitation.associate = (models) => {
    Invitation.belongsTo(models.Organization, { foreignKey: `organizationId` });
    Invitation.belongsTo(models.User, { as: `invitedBy`, foreignKey: `invitedByUserId` });
  };

  return Invitation;
};
