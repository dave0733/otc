const ROLES = require('../constants/roles');
const GROUP_PERMISSION = require('../constants/group-permission');

function isAdmin(user) {
  return user && user.role === ROLES.ADMIN;
}

function hasAccess(user, group, permission) {
  if (!user) {
    return false;
  }

  const perm = user.groups.find(g =>
    g.group.equals
      ? g.group.equals(group._id)
      : g.group === group._id.toString()
  );

  if (
    perm &&
    (perm.permission === permission ||
      perm.permission === GROUP_PERMISSION.ADMIN)
  ) {
    return true;
  }

  return false;
}

function isGroupAdmin(user, group) {
  return hasAccess(user, group, GROUP_PERMISSION.ADMIN);
}

function isGroupMember(user, group) {
  return hasAccess(user, group, GROUP_PERMISSION.MEMBER);
}

function isBanned(user, group) {
  return hasAccess(user, group, GROUP_PERMISSION.BANNED);
}

module.exports = {
  hasAccess,
  isAdmin,
  isGroupAdmin,
  isGroupMember,
  isBanned
};
