const mongoose = require("mongoose");

const dbConnect = () =>{
        if(mongoose.connection.readyState >= 1){
            return
        }

        mongoose.connect(process.env.DB_LOCAL_URI,{
            // useNewUrlParser : true,
            // useUnifiedTopTopology: true,
            // useFindAndModify: false,
            // useCreateIndex: true
        }).then(con => console.log('Connected to MongoDb'))


}

module.exports = dbConnect