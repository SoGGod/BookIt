import User from '../models/user'
import catchAsyncErrors from '../middlewares/catchAsyncErrors';
import cloudinary from 'cloudinary'
import ErrorHandler from '../utils/errorHandler';
import absoluteUrl from 'next-absolute-url'
import sendEmail from '../utils/sendEmail'

import crypto from 'crypto'


//setting up cloudinary configuration
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    })



//Register Users : /api/auth/register
const registerUser = catchAsyncErrors( async (req,res) =>{

    const result = await cloudinary.v2.uploader.upload(req.body.avatar,{
        folder:'bookit/avatars',
        width:'150',
        crop: 'scale'
    })

         
    const {name, email, password} = req.body;
    const user = await User.create({
        name,
        email,
        password,
        avatar:{
            public_id: result.public_id,
            url: result.secure_url   //secure_url has protocol of https but url has only http
        }
    })

    res.status(200).json({
        success: true,
        message: 'Account Registered Successfully'
    })
})

//Current User Profile : /api/me
const currentUserProfile = catchAsyncErrors( async (req,res) =>{

    const user = await User.findById(req.user._id)

    res.status(200).json({
        success: true,
        user
    })
})

//update User Profile : /api/me/update
const updateProfile = catchAsyncErrors( async (req,res) =>{

    const user = await User.findById(req.user._id)

    if(user){
        user.name = req.body.name;
        user.email = req.body.email;
        
        if(req.body.password) user.password = req.body.password
    }
    //update avatar
    if(req.body.avatar !== ''){

        const image_id = user.avatar.public_id

        //delete user previous image/avatar

        await cloudinary.v2.uploader.destroy(image_id)
        const result = await cloudinary.v2.uploader.upload(req.body.avatar,{
            folder:'bookit/avatars',
            width:'150',
            crop: 'scale'
        })
        
        user.avatar = {
            public_id: result.public_id,
            url: result.secure_url
        }

    }
    //saves the updated info into our database
    await user.save();

    res.status(200).json({
        success: true,
    })
})





// Forgot password   =>   /api/password/forgot
const forgotPassword = catchAsyncErrors(async (req, res, next) => {

    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorHandler('User not found with this email', 404))
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false })

    // Get origin
    const { origin } = absoluteUrl(req)

    // Create reset password url
    const resetUrl = `${origin}/password/reset/${resetToken}`

    const message = `Your password reset url is as follow: \n\n ${resetUrl}
                     \n\n\ If you have not requested this email, then ignore it.`

    try {
        await sendEmail({
            email: user.email,
            subject: 'BookIT Password Recovery',
            message
        })

        res.status(200).json({
            success: true,
            message: `Email sent to: ${user.email}`
        })


    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false })

        return next(new ErrorHandler(error.message, 500))
    }

})


// reset password   =>   /api/password/reset/:token
const resetPassword = catchAsyncErrors(async (req, res, next) => {

    //hash url token
    const resetPasswordToken = crypto.createHash('sha256').update(req.query.token).digest('hex')

    const user = await User.findOne({ 
        resetPasswordToken,
        resetPasswordExpire: {$gt: Date.now()}
    });

    if (!user) {
        return next(new ErrorHandler('Password reset token is invalid or has been expired', 400))
    }

    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler('Password does not match', 400))
    }

    //setup the new password
    user.password = req.body.password

    user.resetPasswordToken= undefined
    user.resetPasswordExpire= undefined

    await user.save()
    res.status(200).json({
        success:true,
        message:'Password Updated Successfully'
    })

})


//get all the users by admin =>  /api/admin/users
const allAdminUsers = catchAsyncErrors( async (req,res) =>{

    const users = await User.find();

    res.status(200).json({
        success: true,
        users
    })
})

//get user details => /api/admin/users/:id
const getUserDetails = catchAsyncErrors( async (req,res) =>{

    const user = await User.findById(req.query. id);

    if (!user) {
        return next(new ErrorHandler('User Not Found With This ID.', 400))
    }

    res.status(200).json({
        success: true,
        user
    })
})

// Update user details  =>   /api/admin/users/:id
const updateUser = catchAsyncErrors(async (req, res) => {

    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
    }

    const user = await User.findByIdAndUpdate(req.query.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        success: true
    })

})

// Delete user    =>   /api/admin/users/:id
const deleteUser = catchAsyncErrors(async (req, res) => {

    const user = await User.findById(req.query.id);

    if (!user) {
        return next(new ErrorHandler('User not found with this ID.', 400))
    }

    // Remove avatar 
    const image_id = user.avatar.public_id;
    await cloudinary.v2.uploader.destroy(image_id)


    await user.remove();

    res.status(200).json({
        success: true,
        user
    })

})


export{
    registerUser,
    currentUserProfile,
    updateProfile,
    forgotPassword,
    resetPassword,
    allAdminUsers,
    getUserDetails,
    updateUser,
    deleteUser
}