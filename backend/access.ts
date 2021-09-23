import { ListAccessArgs } from "./types";
import { permissionsList } from "./schemas/fields";

export function isSignedin({ session }: ListAccessArgs) {
  return !!session;
}

const generatedPermissions = Object.fromEntries(
  permissionsList.map((permission) => [
    permission,
    function ({ session }: ListAccessArgs) {
      return !!session?.data.role?.[permission];
    },
  ]));

// Checks if user meets criteria for some permission (boolean)
export const permissions = {
  ...generatedPermissions
}

// Rule based functions (boolean or filter the products that can be CRUD)
export const rules = {
  canManageProducts({ session }: ListAccessArgs) {
    if (!isSignedin({ session })) {
      return false;
    }

    if (permissions.canManageProducts({ session })) {
      return true;
    }

    return { user: { id: session.itemId } };
  },
  canReadProducts({ session }: ListAccessArgs) {
    if (!isSignedin({ session })) {
      return false;
    }

    if (permissions.canManageProducts({ session })) {
      return true;
    }

    return { status: 'AVAILABLE' };
  },
  canOrder({ session }: ListAccessArgs) {
    if (!isSignedin({ session })) {
      return false;
    }

    if (permissions.canManageCart({ session })) {
      return true;
    }

    return { user: { id: session.itemId } };
  },
  canManageOrderItems({ session }: ListAccessArgs) {
    if (!isSignedin({ session })) {
      return false;
    }

    if (permissions.canManageCart({ session })) {
      return true;
    }

    return { order: { user: { id: session.itemId } } };
  },
  canManageUsers({ session }: ListAccessArgs) {
    if (!isSignedin({ session })) {
      return false;
    }

    if (permissions.canManageUsers({ session })) {
      return true;
    }

    return { id: session.itemId };
  },
}
