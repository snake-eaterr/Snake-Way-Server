import mongoose from 'mongoose'
import uniqueValidator from 'mongoose-unique-validator'

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
		unique: true,
		minlength: 3
	},
	passwordHash: {
		type: String,
		required: true,
	}
})

userSchema.plugin(uniqueValidator)

userSchema.post('save', function(error, doc, next) {
	if (error.errors['username'].kind === 'unique') {
		next(new Error('Username already taken'))
	} else if (error.errors['username'].kind === 'minlength') {
		next(new Error('Username must be more than 3 characters long'))
	} else {
		next(error)
	}
})

const User = mongoose.model('User', userSchema)


export default User