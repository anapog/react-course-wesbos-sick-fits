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
    if (permissions.canManageProducts({ session })) {
      return true;
    }

    return { user: { id: session.itemId } };
  },
  canReadProducts({ session }: ListAccessArgs) {
    if (permissions.canManageProducts({ session })) {
      return true;
    }

    return { status: 'AVAILABLE' };
  }
}
