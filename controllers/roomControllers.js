import Room from '../models/room'
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

//Create new room =>  /api/rooms
const newRoom = catchAsyncErrors( async (req,res) =>{

         const room = await Room.create(req.body)

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

//update the room details  => /api/rooms/:id
const updateRoom = catchAsyncErrors( async (req,res) =>{

         let room = await Room.findById(req.query.id)

         if(!room){
            return next(new ErrorHandler('Room not found with this ID', 404)) 
        }

        room= await Room.findByIdAndUpdate(req.query.id, req.body,{
            new: true,
            runValidators: true,
            useFindAndModify: false
        })

        res.status(200).json({
            success: true, 
            room
           }) 
 
})


//delete the room  => /api/rooms/:id
const deleteRoom = catchAsyncErrors( async (req,res) =>{

         const room = await Room.findById(req.query.id)

         if(!room){
            return next(new ErrorHandler('Room not found with this ID', 404)) 
        }

         await room.remove();

        res.status(200).json({
            success: true, 
            message: 'Room is successfully deleted'
           }) 
 
})


export {
    allRooms,
    newRoom,
    getSingleRoom,
    updateRoom,
    deleteRoom 
}