import mongoose from 'mongoose'
import uniqueValidator from 'mongoose-unique-validator'

const productSchema = new mongoose.Schema({
	label: {
		type: String,
		trim: true,
		required: 'Label is required'
	},
	image: {
		data: Buffer,
		contentType: String
	},
	rating: {
		type: Number
	},
	description: {
		type: String,
		trim: true,
		required: 'Description is required'
	},
	category: String,
	stock: {
		type: Number,
		required: 'Quantity is required'
	},
	price: {
		type: Number,
		required: 'Price is required'
	},
	updated: Date,
	created: {
		type: Date,
		default: Date.now
	},
	reviews: [
		{
			text: String,
			created: { type: Date, default: Date.now },
			postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
			rating: Number,
			id: String
		}
	]
})

productSchema.plugin(uniqueValidator)

productSchema.set('toJSON', {
	transform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString()
		delete returnedObject._id
		delete returnedObject.__v

	}
})
const Product = mongoose.model('Product', productSchema)
export default Product
