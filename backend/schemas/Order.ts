import { integer, relationship, text, virtual } from "@keystone-next/fields";
import { list } from "@keystone-next/keystone/schema";
import { isSignedin, rules } from "../access";
import formatMoney from "../lib/formatMoney";

export const Order = list({
  access: {
    create: isSignedin,
    read: rules.canOrder,
    update: () => false,
    delete: () => false,
  },
	fields: {
    label: virtual({
      graphQLReturnType: 'String',
      resolver: function(item) {
        return `Custom label: ${formatMoney(item.total)}`;
      }
    }),
    total: integer(),
    items: relationship({ ref: 'OrderItem.order', many: true }),
    user: relationship({ ref: 'User.orders' }),
    charge: text(),
  },
})