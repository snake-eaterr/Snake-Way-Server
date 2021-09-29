import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
	orderedProduct: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Product'
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	quantity: {
		type: Number,
		required: true
	},
	address: {
		type: String,
		required: true
	},
	created: {
		type: Date,
		default: Date.now
	},
	shipped: {
		type: Boolean,
		default: false
	},
	finished: {
		type: Boolean,
		default: false
	}
})

orderSchema.set('toJSON', {
	transform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString()
		delete returnedObject._id
		delete returnedObject.__v

	}
})


const Order = mongoose.model('Order', orderSchema)

export default Order