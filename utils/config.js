import dotenv from 'dotenv'
dotenv.config()

const MONGODB_URI = process.env.NODE_ENV === 'test'
	? process.env.MONGODB_URI_TEST
	: process.env.MONGODB_URI

const JWT_SECRET = process.env.JWT_SECRET

export default { MONGODB_URI, JWT_SECRET }