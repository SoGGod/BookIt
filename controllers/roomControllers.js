import Room from '../models/room'
import Booking from '../models/booking'

import cloudinary from 'cloudinary'

import ErrorHandler from '../utils/errorHandler';
import catchAsyncErrors from '../middlewares/catchAsyncErrors';
import APIFeatures from '../utils/apiFeatures';

//Get all Rooms 
const allRooms = catchAsyncErrors( async (req,res) =>{

            const resPerPage = 4; //change the value to list how many products you want to show on a single page

            const roomsCount = await Room.countDocuments()

            const apiFeatures = new APIFeatures(Room.find(), req.query)
               .search()
               .filter()

 
            let rooms = await apiFeatures.query;  //because of this we need to add .clone() below
            let filteredRoomsCount = rooms.length;

            apiFeatures.pagination(resPerPage);
            rooms = await apiFeatures.query.clone();  //to call the same query you need to add .clone() otherwise query was already executed error will be seen

            res.status(200).json({
                success:true,
                roomsCount,
                resPerPage,
                filteredRoomsCount,
                rooms
            })
})

// Create new room   =>   /api/rooms
const newRoom = catchAsyncErrors(async (req, res) => {

    const images = req.body.images;

    let imagesLinks = [];

    for (let i = 0; i < images.length; i++) {

        const result = await cloudinary.v2.uploader.upload(images[i], {
            folder: 'bookit/rooms',
        });

        imagesLinks.push({
            public_id: result.public_id,
            url: result.secure_url
        })

    }

    req.body.images = imagesLinks;
    req.body.user = req.user._id

    const room = await Room.create(req.body);

    res.status(200).json({
        success: true,
        room
    })
}) 

//get a single room details  => /api/rooms/:id
const getSingleRoom = catchAsyncErrors( async (req,res,next) =>{
 
         const room = await Room.findById(req.query.id)

         if(!room){
            return next(new ErrorHandler('Room not found with this ID', 404))       
        }

        res.status(200).json({
            success: true, 
            room
           }) 

})

// Update room details   =>   /api/rooms/:id
const updateRoom = catchAsyncErrors(async (req, res) => {

    let room = await Room.findById(req.query.id);

    if (!room) {
        return next(new ErrorHandler('Room not found with this ID', 404))
    }

    if (req.body.images) {

        // Delete images associated with the room

        // for (let i = 0; i < room.images.length; i++) {
        for (let i = 0; i < req.body.images.length; i++) {
            await cloudinary.v2.uploader.destroy(room.images[i].public_id)
        }

        let imagesLinks = []
        const images = req.body.images;

        for (let i = 0; i < images.length; i++) {

            const result = await cloudinary.v2.uploader.upload(images[i], {
                folder: 'bookit/rooms',
            });

            imagesLinks.push({
                public_id: result.public_id,
                url: result.secure_url
            })

        }

        req.body.images = imagesLinks;

    }

    room = await Room.findByIdAndUpdate(req.query.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true,
        room
    })

})


// Delete room   =>   /api/rooms/:id
const deleteRoom = catchAsyncErrors(async (req, res) => {

    const room = await Room.findById(req.query.id);

    if (!room) {
        return next(new ErrorHandler('Room not found with this ID', 404))
    }

    // Delete images associated with the room
    for (let i = 0; i < room.images.length; i++) {
        await cloudinary.v2.uploader.destroy(room.images[i].public_id)
    }

    await room.remove();

    res.status(200).json({
        success: true,
        message: 'Room is deleted.'
    })

})

// Create a new review   =>   /api/reviews
const createRoomReview = catchAsyncErrors(async (req, res) => {

    //get the rating, comment and room id of the user
    const { rating, comment, roomId } = req.body;

    //creating the object that have to be passed and push this array into the review of that particular room
    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating), //rating is wrapped inside a number
        comment
    }

    const room = await Room.findById(roomId);

    //check if the room has been reviewed by the user or not to find true or false
    const isReviewed = room.reviews.find(
        r => r.user.toString() === req.user._id.toString()
    )

    if (isReviewed) {
        //if already reviewed then we have to update
        room.reviews.forEach(review => {
            if (review.user.toString() === req.user._id.toString()) {
                review.comment = comment;
                review.rating = rating;
            }
        })
        //if the review is new then we just have to post it
    } else {
        room.reviews.push(review);
        room.numOfReviews = room.reviews.length
    }

    room.ratings = room.reviews.reduce((acc, item) => item.rating + acc, 0) / room.reviews.length

    await room.save({ validateBeforeSave: false })

    res.status(200).json({
        success: true,
    })

})

//only the user who booked can review  => /api/reviews/check_review_availability
const checkReviewAvailability = catchAsyncErrors(async (req, res) => {

    const { roomId } = req.query;

    const bookings = await Booking.find({ user: req.user._id, room: roomId })

    let isReviewAvailable = false;
    if (bookings.length > 0) isReviewAvailable = true


    res.status(200).json({
        success: true,
        isReviewAvailable
    })

})


// Get all rooms - ADMIN   =>   /api/admin/rooms
const allAdminRooms = catchAsyncErrors(async (req, res) => {

    const rooms = await Room.find();

    res.status(200).json({
        success: true,
        rooms
    })

})

// Get all room reviews - ADMIN   =>   /api/reviews
const getRoomReviews = catchAsyncErrors(async (req, res) => {

    const room = await Room.findById(req.query.id);

    res.status(200).json({
        success: true,
        reviews: room.reviews
    })

})

// Delete room review - ADMIN   =>   /api/reviews
const deleteReview = catchAsyncErrors(async (req, res) => {

    const room = await Room.findById(req.query.roomId);

    const reviews = room.reviews.filter(review => review._id.toString() !== req.query.id.toString())

    const numOfReviews = reviews.length;

    const ratings = room.reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length

    await Room.findByIdAndUpdate(req.query.roomId, {
        reviews,
        ratings,
        numOfReviews
    }, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true
    })

})


export {
    allRooms,
    newRoom,
    getSingleRoom,
    updateRoom,
    deleteRoom,
    createRoomReview,
    checkReviewAvailability,
    allAdminRooms,
    getRoomReviews,
    deleteReview
}