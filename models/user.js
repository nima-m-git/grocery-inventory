const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema(
    {
        email: { 
            type: String, 
            required: [true, 'Email required'],
            maxlength: 50,
            trim: true, 
        },
        password: {
            type: String,
            minlength: 5,
            required: true,
        },
        admin: {
            type: Boolean,
            default: false,
        },
        firstName: {
            type: String,
            required: true,
            maxlength: 50,
            trim: true,
        },
        lastName: {
            type: String,
            required: true,
            maxlength: 50,
            trim: true,
        }
    }
)

// Virtual for user url
UserSchema
.virtual('url')
.get(() => '/user/' + this._id);


module.exports = mongoose.model('User', UserSchema);
