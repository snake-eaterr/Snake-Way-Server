import { ApolloServer } from 'apollo-server-express'
import {
	typeDef as product,
	resolvers as productResolvers
} from '../schemas/product'
import {
	typeDef as user,
	resolvers as userResolvers
} from '../schemas/user'
import {
	typeDef as order,
	resolvers as orderResolvers
} from '../schemas/orders'
import jwt from 'jsonwebtoken'
import config from '../utils/config'
import { makeExecutableSchema } from 'graphql-tools'
import { merge } from 'lodash'
import User from '../models/user'
import Product from '../models/product'

const createApolloServer = () => {

	const Query = `
	type Query {
	_empty: String
}
`
	const Mutation = `
	type Mutation {
	_empty: String
	}
`
	const resolvers = {}


	const schema = makeExecutableSchema({
		typeDefs: [ Query, Mutation, product, user, order ],
		resolvers: merge(resolvers, productResolvers, userResolvers, orderResolvers)
	})

	const server = new ApolloServer({
		schema,
		context: async ({ req }) => {
			const auth = req ? req.headers.authorization : null
			if (auth && auth.toLocaleLowerCase().startsWith('bearer ')) {
				const decodedToken = jwt.verify(auth.substring(7), config.JWT_SECRET)
				const currentUser = await User.findById(decodedToken.id)
				return { currentUser }
			}
		}
	})
	return server
}

const initialProducts = [
	{
		label: 'atari',
		description: 'the good old atari console',
		price: 5,
		stock: 50,
		category: 'electronics',
	},
	{
		label: 'How Linux Works',
		description: 'what every superuser should know',
		price: 29,
		stock: 100,
		category: 'books'
	},
	{
		label: 'PlayStation 5',
		description: 'The all new PS5',
		price: 500,
		stock: 600,
		category: 'electronics'
	},
	{
		label: 'Mastering Bitcoin',
		description: 'The bitcoin bible for developers',
		price: 23,
		stock: 1000,
		category: 'books'
	},
	{
		label: 'Dragon Ball Goku Gi',
		description: 'The familiar Gi worn by the sayian earthling, fine clothe',
		price: 99,
		stock: 19,
		category: 'clothing'
	},
	{
		label: 'atari',
		description: 'the good old atari console',
		price: 5,
		stock: 50,
		category: 'electronics',
	},
	{
		label: 'How Linux Works',
		description: 'what every superuser should know',
		price: 29,
		stock: 100,
		category: 'books'
	},
	{
		label: 'PlayStation 5',
		description: 'The all new PS5',
		price: 500,
		stock: 600,
		category: 'electronics'
	},
	{
		label: 'Mastering Bitcoin',
		description: 'The bitcoin bible for developers',
		price: 23,
		stock: 1000,
		category: 'books'
	},
	{
		label: 'Dragon Ball Goku Gi',
		description: 'The familiar Gi worn by the sayian earthling, fine clothe',
		price: 99,
		stock: 19,
		category: 'clothing'
	},
	{
		label: 'atari',
		description: 'the good old atari console',
		price: 5,
		stock: 50,
		category: 'electronics',
	},
	{
		label: 'How Linux Works',
		description: 'what every superuser should know',
		price: 29,
		stock: 100,
		category: 'books'
	},
	{
		label: 'PlayStation 5',
		description: 'The all new PS5',
		price: 500,
		stock: 600,
		category: 'electronics'
	},
	{
		label: 'Mastering Bitcoin',
		description: 'The bitcoin bible for developers',
		price: 23,
		stock: 1000,
		category: 'books'
	},
	{
		label: 'Dragon Ball Goku Gi',
		description: 'The familiar Gi worn by the sayian earthling, fine clothe',
		price: 99,
		stock: 19,
		category: 'clothing'
	},
	{
		label: 'atari',
		description: 'the good old atari console',
		price: 5,
		stock: 50,
		category: 'electronics',
	},
	{
		label: 'How Linux Works',
		description: 'what every superuser should know',
		price: 29,
		stock: 100,
		category: 'books'
	},
	{
		label: 'PlayStation 5',
		description: 'The all new PS5',
		price: 500,
		stock: 600,
		category: 'electronics'
	},
	{
		label: 'Mastering Bitcoin',
		description: 'The bitcoin bible for developers',
		price: 23,
		stock: 1000,
		category: 'books'
	},
	{
		label: 'Dragon Ball Goku Gi',
		description: 'The familiar Gi worn by the sayian earthling, fine clothe',
		price: 99,
		stock: 19,
		category: 'clothing'
	},
	{
		label: 'atari',
		description: 'the good old atari console',
		price: 5,
		stock: 50,
		category: 'electronics',
	},
	{
		label: 'How Linux Works',
		description: 'what every superuser should know',
		price: 29,
		stock: 100,
		category: 'books'
	},
	{
		label: 'PlayStation 5',
		description: 'The all new PS5',
		price: 500,
		stock: 600,
		category: 'electronics'
	},
	{
		label: 'Mastering Bitcoin',
		description: 'The bitcoin bible for developers',
		price: 23,
		stock: 1000,
		category: 'books'
	},
	{
		label: 'Dragon Ball Goku Gi',
		description: 'The familiar Gi worn by the sayian earthling, fine clothe',
		price: 99,
		stock: 19,
		category: 'clothing'
	},
	{
		label: 'atari',
		description: 'the good old atari console',
		price: 5,
		stock: 50,
		category: 'electronics',
	},
	{
		label: 'How Linux Works',
		description: 'what every superuser should know',
		price: 29,
		stock: 100,
		category: 'books'
	},
	{
		label: 'PlayStation 5',
		description: 'The all new PS5',
		price: 500,
		stock: 600,
		category: 'electronics'
	},
	{
		label: 'Mastering Bitcoin',
		description: 'The bitcoin bible for developers',
		price: 23,
		stock: 1000,
		category: 'books'
	},
	{
		label: 'Dragon Ball Goku Gi',
		description: 'The familiar Gi worn by the sayian earthling, fine clothe',
		price: 99,
		stock: 19,
		category: 'clothing'
	},
	{
		label: 'atari',
		description: 'the good old atari console',
		price: 5,
		stock: 50,
		category: 'electronics',
	},
	{
		label: 'How Linux Works',
		description: 'what every superuser should know',
		price: 29,
		stock: 100,
		category: 'books'
	},
	{
		label: 'PlayStation 5',
		description: 'The all new PS5',
		price: 500,
		stock: 600,
		category: 'electronics'
	},
	{
		label: 'Mastering Bitcoin',
		description: 'The bitcoin bible for developers',
		price: 23,
		stock: 1000,
		category: 'books'
	},
	{
		label: 'Dragon Ball Goku Gi',
		description: 'The familiar Gi worn by the sayian earthling, fine clothe',
		price: 99,
		stock: 19,
		category: 'clothing'
	},
	{
		label: 'atari',
		description: 'the good old atari console',
		price: 5,
		stock: 50,
		category: 'electronics',
	},
	{
		label: 'How Linux Works',
		description: 'what every superuser should know',
		price: 29,
		stock: 100,
		category: 'books'
	},
	{
		label: 'PlayStation 5',
		description: 'The all new PS5',
		price: 500,
		stock: 600,
		category: 'electronics'
	},
	{
		label: 'Mastering Bitcoin',
		description: 'The bitcoin bible for developers',
		price: 23,
		stock: 1000,
		category: 'books'
	},
	{
		label: 'Dragon Ball Goku Gi',
		description: 'The familiar Gi worn by the sayian earthling, fine clothe',
		price: 99,
		stock: 19,
		category: 'clothing'
	},
	{
		label: 'atari',
		description: 'the good old atari console',
		price: 5,
		stock: 50,
		category: 'electronics',
	},
	{
		label: 'How Linux Works',
		description: 'what every superuser should know',
		price: 29,
		stock: 100,
		category: 'books'
	},
	{
		label: 'PlayStation 5',
		description: 'The all new PS5',
		price: 500,
		stock: 600,
		category: 'electronics'
	},
	{
		label: 'Mastering Bitcoin',
		description: 'The bitcoin bible for developers',
		price: 23,
		stock: 1000,
		category: 'books'
	},
	{
		label: 'Dragon Ball Goku Gi',
		description: 'The familiar Gi worn by the sayian earthling, fine clothe',
		price: 99,
		stock: 19,
		category: 'clothing'
	},
	{
		label: 'atari',
		description: 'the good old atari console',
		price: 5,
		stock: 50,
		category: 'electronics',
	},
	{
		label: 'How Linux Works',
		description: 'what every superuser should know',
		price: 29,
		stock: 100,
		category: 'books'
	},
	{
		label: 'PlayStation 5',
		description: 'The all new PS5',
		price: 500,
		stock: 600,
		category: 'electronics'
	},
	{
		label: 'Mastering Bitcoin',
		description: 'The bitcoin bible for developers',
		price: 23,
		stock: 1000,
		category: 'books'
	},
	{
		label: 'Dragon Ball Goku Gi',
		description: 'The familiar Gi worn by the sayian earthling, fine clothe',
		price: 99,
		stock: 19,
		category: 'clothing'
	}
]

const usersInDb = async () => {
	const users = await User.find({})
	return users.map(u => u.toJSON())
}



const testHelper = { createApolloServer, initialProducts, usersInDb }

export default testHelper