import { AuthenticationError, UserInputError } from 'apollo-server-express'
import Order from '../models/orders'
import Product from '../models/product'
export const typeDef = `
type Order {
	orderedProduct: Product!
	quantity: Int!
	address: String!
	created: Date!
	id: ID!
	user: User!
	finished: Boolean!
	shipped: Boolean!
}

extend type Mutation {
	placeOrder(
		orderedProductId: String!
		quantity: Int!
		address: String!
	): Order!
}

extend type Mutation {
	markAsReceived(
		orderId: String!
	): Order!
}

enum YesNo {
	YES
	NO
}

extend type Query {
	getOrdersByUser: [Order]!
}
`

export const resolvers = {
	Mutation: {
		markAsReceived: async (root, args, context) => {
			// check for logged in user
			const currentUser = context.currentUser
			if (!currentUser) {
				throw new AuthenticationError('Not authenticated')
			}
			const order = await Order.findById(args.orderId)
			if (order.shipped === false) {
				throw new UserInputError('product not shipped yet', {
					invalidArgs: args.orderId
				})
			}
			order.finished = true
			await order.save()
			await order.populate('user')
			return order.populate({
				path: 'orderedProduct',
				select: '-data.image',
				populate: { path: 'reviews.postedBy' }
			}).execPopulate()
		},
		placeOrder: async (root, args, context) => {
			// check for logged in user
			const currentUser = context.currentUser
			if (!currentUser) {
				throw new AuthenticationError('Not authenticated')
			}

			const productToOrder = await Product.findById(args.orderedProductId)
			if (!productToOrder) {
				throw new UserInputError('product not found', {
					invalidArgs: args.orderedProductId
				})
			}
			//must not let users order beyond stock
			if (productToOrder.stock < args.quantity) {
				throw new UserInputError('order quantity cannot exceed stock', {
					invalidArgs: args.quantity
				})
			}

			const order = new Order({ ...args, orderedProduct: args.orderedProductId, user: currentUser._id })
			try {
				await order.save()
			} catch (error) {
				throw new UserInputError(error.message, {
					invalidArgs: args
				})
			}
			// substrct successfully ordered quantity from product stock
			productToOrder.stock = productToOrder.stock - order.quantity
			await productToOrder.save()

			await order.populate('user')
			return order.populate({
				path: 'orderedProduct',
				select: '-data.image',
				populate: { path: 'reviews.postedBy' }
			}).execPopulate()
		}
	},
	Query: {
		getOrdersByUser: async (root, args, context) => {
			// check for logged in user
			const currentUser = context.currentUser
			if (!currentUser) {
				throw new AuthenticationError('Not authenticated')
			}

			return Order.find({ user: currentUser._id }).populate('user').populate({
				path: 'orderedProduct',
				select: '-image.data',
				populate: { path: 'reviews.postedBy' }
			})
		}
	}
}