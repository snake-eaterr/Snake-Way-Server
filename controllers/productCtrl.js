import 'express-async-errors'
import Product from '../models/product'


export const image = async (req, res) => {
	res.set('Content-Type', req.product.image.contentType)
	return res.send(req.product.image.data)
}


export const productById = async (req, res, next, id) => {
	const product = await Product.findById(id)
	if (!product) return res.status(400).json({ error: 'Product not found' })
	req.product = product
	next()
}

