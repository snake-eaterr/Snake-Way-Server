import { gql } from 'apollo-server-express'

const PRODUCT_DETAILS = gql`
fragment ProductDetails on Product {
	label
	price
	stock
	description
	id
	category
}
`

export const ALL_PRODUCTS = gql`
query {
	allProducts {
		...ProductDetails
	}
}
${PRODUCT_DETAILS}
`

export const PRODUCT_COUNT = gql`
query {
	productCount
}
`

export const FIND_PRODUCTS = gql`
	query FindProducts($label: String!) {
		findProducts(label: $label) {
			...ProductDetails
		}
	}
	${PRODUCT_DETAILS}
`
export const GET_BY_CATEGORY = gql`
	query GetByCategory($category: String!) {
		getByCategory(category: $category) {
			...ProductDetails
		}
	}
	${PRODUCT_DETAILS}
`

export const CREATE_USER = gql`
	mutation CreateUser($username: String!, $password: String!) {
		createUser(username: $username, password: $password) {
			username
			id
		}
	}
`

export const LOGIN = gql`
	mutation Login($username: String!, $password: String!) {
		login(username: $username, password: $password) {
			value
		}
	}
`

export const ME = gql`
query {
	me {
		username
		id
	}
}
`

const ORDER_DETAILS = gql`
	fragment OrderDetails on Order {
		orderedProduct {
			...ProductDetails
		}
		quantity
		created
		address
		id
		finished
		shipped
		user {
			username
			id
		}
	}
	${PRODUCT_DETAILS}
`

export const PLACE_ORDER = gql`
	mutation PlaceOrder($orderedProductId: String!, $quantity: Int!, $address: String!) {
		placeOrder(orderedProductId: $orderedProductId, quantity: $quantity, address: $address) {
			...OrderDetails
		}
	}
	${ORDER_DETAILS}
`
export const GET_ORDERS_BY_USER = gql`
query GetOrdersByUser($finished: YesNo!) {
	getOrdersByUser(finished: $finished) {
		...OrderDetails
	}
}
${ORDER_DETAILS}
`