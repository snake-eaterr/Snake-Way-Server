import { ApolloServer } from 'apollo-server-express'
import { ApolloServerPluginLandingPageGraphQLPlayground,
	ApolloServerPluginLandingPageDisabled } from 'apollo-server-core'
import express from 'express'
import {
	typeDef as product,
	resolvers as productResolvers,
} from './schemas/product'
import {
	typeDef as user,
	resolvers as userResolvers
} from './schemas/user'
import {
	typeDef as order,
	resolvers as orderResolvers
} from './schemas/orders'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import config from './utils/config'
import { makeExecutableSchema } from 'graphql-tools'
import { merge } from 'lodash'
import User from './models/user'
import productRouter from './controllers/productRouter'
import middleware from './utils/middleware'
import cors from 'cors'


// modules for server side rendering
/*
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import MainRouter from './client/src/MainRouter'
import { ServerStyleSheets, ThemeProvider } from '@material-ui/core'
import theme from './client/src/MainRouter'
import fs from 'fs'
import path from 'path'
*/





mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
	.then(() => console.log('connected to mongodb'))
	.catch(error => {
		console.log(config.MONGODB_URI)
		console.log(`error connecting to mongodb. error: ${error.message}`)
	})




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
			if (!decodedToken) {
				return
			}
			const currentUser = await User.findById(decodedToken.id)
			return { currentUser }
		}
	},
	plugins: [
		process.env.NODE_ENV === 'production'
			? ApolloServerPluginLandingPageDisabled()
			: ApolloServerPluginLandingPageGraphQLPlayground()
	]
})

const app = express()

server.applyMiddleware({ app })
app.use(cors())


app.use(express.static('build'))
app.use('/api', productRouter)

//server side rendering. Disabled till migation to mui v5 since Alert, Autocomplete and Rating material-ui components don't support ssr
/*
app.get('*', (req, res) => {
	const sheets = new ServerStyleSheets()
	const context = {}
	const markup = ReactDOMServer.renderToString(
		sheets.collect(
			<StaticRouter location={req.url} context={context}>
				<ThemeProvider theme={theme}>
					<MainRouter />
				</ThemeProvider>
			</StaticRouter>
		)
	)

	if (context.url) {
		return res.redirect(303, context.url)
	}

	const css = sheets.toString()
	let indexHTML = fs.readFileSync(path.resolve(__dirname, '../build/index.html'), {
		encoding: 'utf-8'
	})

	indexHTML = indexHTML.replace(`<div id=root></div>`, `<div id="root>${markup}</div>`)
	indexHTML = indexHTML.replace(`<style id="jss-server-side"></style>`, `<style id="jss-server-side">${css}</style>`)

	res.send(indexHTML)
})
*/



app.use(middleware.unkownEndpoint)
app.use(middleware.errorHandler)
const PORT = process.env.PORT || 4000

app.listen({ port: PORT }, () => {
	console.log(`Server running at ${server.graphqlPath}`)
})