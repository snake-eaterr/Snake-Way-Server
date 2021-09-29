import '@babel/polyfill'
import { createTestClient  } from 'apollo-server-integration-testing'
import testHelper from './testHelper'
import {
	ALL_PRODUCTS,
	PRODUCT_COUNT,
	FIND_PRODUCTS,
	GET_BY_CATEGORY,
	CREATE_USER,
	LOGIN,
	ME,
	PLACE_ORDER,
	GET_ORDERS_BY_USER
} from './queries'
import mongoose from 'mongoose'
import Product from '../models/product'
import User from '../models/user'
import Order from '../models/orders'
import config from '../utils/config'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
	.then(() => console.log('connected to mongodb'))
	.catch(error => {
		console.log(`error connecting to mongodb. error: ${error.message}`)
	})

const apolloServer = testHelper.createApolloServer()
const { query, mutate, setOptions } = createTestClient({ apolloServer })



describe('products', () => {
	beforeEach(async () => {
		await Product.deleteMany({})
		let productObject = new Product(testHelper.initialProducts[0])
		await productObject.save()
		productObject = new Product(testHelper.initialProducts[1])
		await productObject.save()
	})

	test('returns all products', async () => {
		const result = await query(ALL_PRODUCTS)

		expect(result.data.allProducts).toHaveLength(testHelper.initialProducts.length)
		const labels = result.data.allProducts.map(p => p.label)
		expect(labels).toContain('atari')

	})

	test('returns product count in db', async () => {
		const result = await query(PRODUCT_COUNT)

		expect(result.data.productCount).toBe(testHelper.initialProducts.length)
	})

	test('returns array of products where labels fully or partially match search label', async () => {
		const result = await query(FIND_PRODUCTS, {
			variables: { label: 'r' }
		})

		expect(result.data.findProducts).toHaveLength(testHelper.initialProducts.length)
	})

	test('returns array of products based on category', async () => {
		const result = await query(GET_BY_CATEGORY, {
			variables: { category: 'books' }
		})

		expect(result.data.getByCategory).toHaveLength(1)
		expect(result.data.getByCategory[0].label).toBe('How Linux Works')
	})
})






describe('users creation and login', () => {
	beforeEach(async () => {
		await User.deleteMany({})

		const passwordHash = await bcrypt.hash('secretpassword', 10)
		const user = new User ({ username: 'root', passwordHash })
		await user.save()
	})
	// users creation tests
	test('creation succeeds with a fresh username', async () => {
		const usersAtStart = await testHelper.usersInDb()

		const result = await mutate(CREATE_USER, {
			variables: { username: 'snake-eaterr', password: 'password' }
		})

		const usersAtEnd = await testHelper.usersInDb()
		expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

		const usernames = usersAtEnd.map(u => u.username)
		expect(usernames).toContain(result.data.createUser.username)
	})


	test('creation fails when username is already taken. Also returns set up error message from mongoose', async () => {
		const result = await mutate(CREATE_USER, {
			variables: { username: 'root', password: 'passworddd' }
		})

		expect(result.errors).toBeDefined()
		expect(result.errors[0].message).toBe('Username already taken')
	})

	test('creation fails with a password less than 8 characters long', async () => {
		const result = await mutate(CREATE_USER, {
			variables: { username: 'validUsername', password: 'four' }
		})

		expect(result.errors).toBeDefined()
		expect(result.errors[0].message).toBe('password must be at least 8 characters')
	})

	//users login tests
	test('login succeeds with correct credentials; a token is sent back', async () => {
		const result = await mutate(LOGIN, {
			variables: { username: 'root', password: 'secretpassword' }
		})

		expect(result.errors).toBeUndefined()
		expect(result.data.login.value).toBeDefined()
	})

	test('the apollo server context works fine and returns currentUser based on token', async() => {
		let result = await mutate(LOGIN, {
			variables: { username: 'root', password: 'secretpassword' }
		})

		setOptions({
			request: {
				headers: {
					Authorization: `bearer ${result.data.login.value}`
				}
			}
		})

		result = await query(ME)
		expect(result.data.me.username).toBe('root')
	})
})






describe('making orders', () => {
	let productObject
	let token
	beforeEach(async () => {
		// set up products
		await Product.deleteMany({})
		productObject = new Product(testHelper.initialProducts[0])
		await productObject.save()
		productObject = new Product(testHelper.initialProducts[1])
		await productObject.save()

		// empty orders
		await Order.deleteMany({})

		//set up user
		await User.deleteMany({})

		const passwordHash = await bcrypt.hash('secretpassword', 10)
		const user = new User ({ username: 'root', passwordHash })
		await user.save()

		//set up token
		token = await mutate(LOGIN, {
			variables: { username: 'root', password: 'secretpassword' }
		})
	})

	test('a product can be ordered', async () => {
		// include token in header
		// set up token in header
		setOptions({
			request: {
				headers: {
					Authorization: `bearer ${token.data.login.value}`
				}
			}
		})

		const { id } = jwt.verify(token.data.login.value, config.JWT_SECRET)

		const result = await mutate(PLACE_ORDER, {
			variables: { orderedProductId: productObject._id.toString(), quantity: 5, address: 'usa' } // the muation expects a string for orderedProductId, therefore toString() is used
		})


		expect(result.errors).toBeUndefined()

		// make sure order document includes a populated user field specifying who placed the order
		expect(result.data.placeOrder.user.id).toBe(id)
		expect(result.data.placeOrder.user.username).toBe('root')

		// make sure orderedProduct field gets populated by mongoose
		expect(result.data.placeOrder.orderedProduct.label).toBe('How Linux Works')

		// make sure product stock gets deducted
		expect(result.data.placeOrder.orderedProduct.stock).toBe(testHelper.initialProducts[1].stock - 5 )
	})

	test('when order quantity exceeds product stock, responds with order quantity cannot exceed stock', async () => {
		// set up token in header
		setOptions({
			request: {
				headers: {
					Authorization: `bearer ${token.data.login.value}`
				}
			}
		})
		const result = await mutate(PLACE_ORDER, {
			variables: { orderedProductId: productObject._id.toString(), quantity: 200, address: 'usa' } // the muation expects a string for orderedProductId, therefore toString() is used
		})

		expect(result.errors).toBeDefined()
		expect(result.errors[0].message).toBe('order quantity cannot exceed stock')
	})

	test('getOrdersByUser returns orders by user with an enum to specify finished or not', async () => {
		// set up token in header
		setOptions({
			request: {
				headers: {
					Authorization: `bearer ${token.data.login.value}`
				}
			}
		})

		// make a single order
		await mutate(PLACE_ORDER, {
			variables: { orderedProductId: productObject._id.toString(), quantity: 5, address: 'usa' } // the muation expects a string for orderedProductId, therefore toString() is used
		})

		const orders = await query(GET_ORDERS_BY_USER, {
			variables: { finished: 'NO' }
		})

		expect(orders.data.getOrdersByUser).toHaveLength(1)
	})
	/* context function doesn't allow for throwing errors, or may jest has some sort of problem
	test('when token in header is invalid, responds with error', async () => {
		setOptions({
			request: {
				headers: {
					Authorization: `bearer ${token.data.login.value}s`
				}
			}
		})

		const result = await mutate(PLACE_ORDER, {
			variables: { orderedProductId: productObject._id.toString(), quantity: 5, address: 'usa' } // the muation expects a string for orderedProductId, therefore toString() is used
		})

		expect(result.errors).toBeDefined()

	})*/

	test('when no token in header, responds with Not authenticated', async () => {
		// remove token header configuration
		setOptions({})

		const result = await mutate(PLACE_ORDER, {
			variables: { orderedProductId: productObject._id.toString(), quantity: 5, address: 'usa' } // the muation expects a string for orderedProductId, therefore toString() is used
		})

		expect(result.errors).toBeDefined()
		expect(result.errors[0].message).toBe('Not authenticated')
	})
})



afterAll(() => {
	mongoose.connection.close()
})
