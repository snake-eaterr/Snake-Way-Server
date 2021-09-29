import { UserInputError, AuthenticationError } from 'apollo-server-express'
import jwt from 'jsonwebtoken'
import User from '../models/user'
import config from '../utils/config'
import bcrypt from 'bcrypt'


export const typeDef = `
type User {
	username: String!
	id: ID!
}

type Token {
	value: String!
}
extend type Query {
	me: User
}

extend type Mutation {
	createUser(
		username: String!
		password: String!
	): User!
	login(
		username: String!
		password: String!
	): Token!
	updateUsername(
		newUsername: String!
	): User!
	updatePassword(
		oldPassword: String!
		newPassword: String!
	): User!
}
`

export const resolvers = {
	Query: {
		me: (root, args, context) => {
			return context.currentUser
		}
	},
	Mutation: {
		createUser: async (root, args) => {
			if (args.password.length < 8) {
				throw new UserInputError('password must be at least 8 characters', {
					invalidArgs: args.password
				})
			}
			const saltRounds = 10
			const passwordHash = await bcrypt.hash(args.password, saltRounds)
			const user = new User({
				username: args.username,
				passwordHash
			})
			try {
				await user.save()
			} catch (error) {
				throw new UserInputError(error.message, {
					invalidArgs: args
				})
			}
			return user
		},
		login: async (root, args) => {
			const user = await User.findOne({ username: args.username })

			const passwordCorrect = user === null
				? false
				: await bcrypt.compare(args.password, user.passwordHash)

			if (!(user && passwordCorrect)) {
				throw new UserInputError('invalid username or password')
			}

			const userForToken = {
				username: user.username,
				id: user._id
			}
			return { value: jwt.sign(userForToken, config.JWT_SECRET) }
		},
		updateUsername: async (root, args, context) => {
			let currentUser = context.currentUser
			if(!currentUser) {
				throw new AuthenticationError('Not authenticated')
			}
			currentUser.username = args.newUsername
			try {
				await currentUser.save()
			} catch(error) {
				throw new UserInputError(error.message, {
					invalidArgs: args
				})
			}
			return currentUser
		},
		updatePassword: async (root, args, context) => {
			let currentUser = context.currentUser
			if (!currentUser) {
				throw new AuthenticationError('Not authenticated')
			}
			if (args.newPassword.length < 8) {
				throw new UserInputError('password must be at least 8 characters', {
					invalidArgs: args.newPassword
				})
			}
			const saltRounds = 10
			const oldPasswordCorrect = await bcrypt.compare(args.oldPassword, currentUser.passwordHash)
			if (!oldPasswordCorrect) {
				throw new UserInputError('Old password incorrect', {
					invalidArgs: args.oldPassword
				})
			}
			const newPasswordHash = await bcrypt.hash(args.newPassword, saltRounds)
			currentUser.passwordHash = newPasswordHash
			try {
				currentUser.save()
			} catch (error) {
				throw new UserInputError(error.message, {
					invalidArgs: args
				})
			}
			return currentUser
		}
	},
}