import mongoose from "mongoose";
import validator from 'validator';
import bcrypt from 'bcryptjs';
import crypto from 'crypto'   //this is the inbuilt package of nodejs so don't need to install it

const userSchema = new mongoose.Schema({

        name:{
            type:String,
            required: [true, 'Please Enter your Name'],
            maxlength:[50, 'The User Name cannot exceed 50 characters']
        },
        email:{
            type:String,
            required: [true, 'Please Enter your Email'],
            unique: true,
            validate:[validator.isEmail, 'Please Enter a Valid Email Address']
        },
        password:{
            type:String,
            required: [true, 'Please Enter your Password'],
            minlength:[6,'The Password must be longer than 6 characters'],
            select:false
        },
        avatar:{
            public_id:{
                type:String,
                required:true
            },
            url:{
                type:String,
                required:true
            }
        },
        role:{
            type:String,
            default:'user'
        },
        createAt:{
            type:Date,
            default:Date.now()
        },
        resetPasswordToken:{
            type:String
        },
        resetPasswordExpire:{
            type:Date
        },

})

//Encrypting Password before Saving the user
userSchema.pre('save', async function (next){
    if(!this.isModified('password')) {
        next()
    }

    this.password = await bcrypt.hash(this.password, 10)  //here 10 is the strength (salt value) of encrypting the password, the larger the number the stronger the password
})

//compare User Password
userSchema.methods.comparePassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password)
}

//generate Password reset Token
userSchema.methods.getResetPasswordToken = function (){

    //generate token for reset  //here 20 buffer value of random bytes will be generated which will be converted to strings in hex
    const resetToken = crypto.randomBytes(20).toString('hex')

    //encrypt or hashing the password and set to passwordResetToken field
     this.resetPasswordToken = crypto.hash('sha256').update(resetToken)
    digest('hex');
 
    //set password reset token expire time
    this.resetPasswordExpire = Date.now() + 30 * 60 * 100  //30 min from when generated //min*sec*millisecond

    return resetToken;
}

export default mongoose.models.User || mongoose.model('User',userSchema)