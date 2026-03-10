import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const User = sequelize.define(`User`, {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      // Uniqueness enforced by partial index in DB (excludes soft-deleted rows)
    },
    externalAuthId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    externalAuthProvider: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    authType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    profileImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    stripeCustomerId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    deletionStatus: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    internalNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
  });

  User.associate = (models) => {
    User.hasMany(models.Address, { as: `addresses`, foreignKey: `userId` });
    User.hasMany(models.UserAttribute, { as: `attributes`, foreignKey: `userId` });
    User.hasMany(models.Organization, { as: `ownedOrganizations`, foreignKey: `ownerId` });
    User.hasMany(models.OrganizationMember, { as: `memberships`, foreignKey: `userId` });
    User.hasMany(models.Notification, { as: `notifications`, foreignKey: `userId` });
    User.hasMany(models.AuditLog, { as: `auditLogs`, foreignKey: `userId` });
  };

  return User;
};
