const mongoose = require('mongoose'); 
const bcrypt = require('bcryptjs'); // for password hashing
const { ObjectId } = mongoose.Types; // Import ObjectId from mongoose.Types
// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
    firstname:{
        type:String,
        required:true,
    },
    lastname:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    mobile:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        default: "user"
    },
    cart:{
        type: Array,
        default: []
    },
    wishlist: [{type: mongoose.Schema.Types.ObjectId, ref: "Product"}],
    address:[{type: mongoose.Schema.Types.ObjectId, ref: "Address"}],
},
{
    timestamps: true,
});

//password is encrypted before sending to the database
userSchema.pre('save', async function(next){
    const salt = bcrypt.genSaltSync(10);
    this.password = await bcrypt.hash(this.password, salt);
    // Store hash in your password DB.
})

userSchema.methods.isPasswordMatched = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
};
//Export the model
module.exports = mongoose.model('Users', userSchema);