import express from 'express'
import { image, productById } from './productCtrl'

const productRouter = express.Router()

productRouter.route('/image/:productId')
	.get(image)

productRouter.param('productId', productById)


export default productRouter