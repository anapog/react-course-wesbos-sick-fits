import { KeystoneContext } from "@keystone-next/types";
import { CartItemCreateInput, OrderCreateInput } from '../.keystone/schema-types';
import stripeConfig from "../lib/stripe";

const graphql = String.raw;

interface Arguments {
  token: string
}

export default async function checkout(
  root: any,
  { token }: Arguments,
  context: KeystoneContext
): Promise<OrderCreateInput> {
  const userId = context.session.itemId;
  if(!userId) {
    throw new Error('You must be signed in to create an order!');
  }

  const user = await context.lists.User.findOne({
    where: { id: userId },
    resolveFields: graphql`
      id
      name
      email
      cart {
        id
        quantity
        product {
          name
          price
          description
          id
          photo {
            id
            image {
              id
              publicUrlTransformed
            }
          }
        }
      }
    `,
  });

  // Calculate total price of the order
  const cartItems = user.cart.filter(cartItem => cartItem.product);
  const amount = cartItems.reduce((tally: number, cartItem: CartItemCreateInput) =>
    tally + cartItem.quantity * cartItem.product.price,
    0
  );

  // Create the charge with stripe
  const charge = await stripeConfig.paymentIntents.create({
    amount,
    currency: 'EUR',
    confirm: true,
    payment_method: token,
  }).catch(err => {
    console.error(err);
    throw new Error(err.message);
  });

  // Convert cart items to order items
  const orderItems = cartItems.map(cartItem => {
    return {
      name: cartItem.product.name,
      description: cartItem.product.description,
      price: cartItem.product.price,
      quantity: cartItem.product.quantity,
      photo: { connect: { id: cartItem.product.photo.id } },
    };
  });

  // Create the order
  const order = await context.lists.Order.createOne({
    data: {
      total: charge.amount,
      charge: charge.id,
      items: { create: orderItems },
      user: { connect: { id: userId }},
    }
  });

  // Clean cart items
  const cartItemsIds = user.cart.map(cartItem => cartItem.id);
  await context.lists.CartItem.deleteMany({ ids: cartItemsIds });

  return order;
}
