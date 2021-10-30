const Room = require("../models/room");
const mongoose = require ('mongoose')

const rooms = require('../data/rooms.json');

mongoose.connect('mongodb+srv://BookIt:BookIt@cluster0.elhov.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',{
}) 

const seedRooms = async () =>{ 

    try{
        await Room.deleteMany();
        console.log('Rooms are deleted');

        await Room.insertMany(rooms);
        console.log('All Rooms are added')
        process.exit()

    } catch (error){
        console.log(error.message);
        process.exit()
    }
}

seedRooms()