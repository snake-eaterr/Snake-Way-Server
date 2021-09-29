import { GraphQLScalarType, Kind } from 'graphql'
import { AuthenticationError, UserInputError } from 'apollo-server-express'
import Product from '../models/product'
import { v4 as uuidv4 } from 'uuid'

export const typeDef = `

scalar Date

type Review {
	text: String!
	created: Date!
	postedBy: User!
	rating: Int!
	id: String!
}

type Product {
	label: String!
	description: String!
	stock: Int!
	price: Int!
	category: String!
	updated: Date
	created: Date!
	rating: Int
	reviews: [Review]!
	id: ID!
}

extend type Query {
	productCount: Int!
	allProducts: [Product!]!
	findProducts(label: String!): [Product]!
	getByCategory(category: String!, limit: YesNo): [Product]!
	getProductById(productId: String!): Product
}

extend type Mutation {
	addReview(body: String!, rating: Int!, productId: String!): Product!
}



`

export const resolvers = {
	Query: {
		productCount: () => Product.collection.countDocuments(),
		allProducts: () => Product.find({}).select('-image.data').populate('reviews.postedBy', '_id username'),
		findProducts: (root, args) => Product.find({ label: { $regex: args.label, $options: 'i' } }).select('-image.data').populate('reviews.postedBy', '_id username'),
		getByCategory: (root, args) => {
			if (!args.limit || args.limit === 'NO') {
				return Product.find({ category: args.category }).select('-image.data').populate('reviews.postedBy', '_id username')
			}


			if (args.limit === 'YES') {
				return Product.find({ category: args.category }).sort({ created: '-1' }).limit(5).select('-image.data').populate('reviews.postedBy', '_id username').exec()
			}
		},
		getProductById: (root, args) => {
			return Product.findById(args.productId).populate('reviews.postedBy', '_id username')
		}
	},

	Mutation: {
		addReview: async (root, args, context) => {
			const currentUser = context.currentUser
			if (!currentUser) {
				throw new AuthenticationError('Not authenticated')
			}
			if (!args.body || !args.rating) {
				throw new UserInputError('Rating or review not found', {
					invalidArgs: args
				})
			}
			let review = {}
			review.text = args.body
			review.postedBy = currentUser._id
			review.id = uuidv4()
			review.rating = args.rating
			let result
			try {
				result = await Product.findByIdAndUpdate(args.productId, {
					$addToSet: { reviews: review }
				},
				{ new: true }
				).populate('reviews.postedBy', '_id username').select('-image.data').exec()
			} catch(error) {
				throw new UserInputError(error.message, {
					invalidArgs: args
				})
			}

			if (!result) {
				throw new UserInputError('product not found', {
					invalidArgs: args.productId
				})
			}

			return result

		}
	},
	Date: new GraphQLScalarType({
		name: 'Date',
		description: 'Date custom scalar type',
		serialize(value) {
			return value.getTime()
		},
		parseValue(value) {
			return Date(value)
		},
		parseLiteral(ast) {
			if (ast.kind === Kind.INT) {
				return new Date(parseInt(ast.value, 10))
			}
			return null
		}
	})
}