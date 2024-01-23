const mongoose = require('mongoose')

async function MongoDbConnect(){
    try{
    //    await mongoose.connect('mongodb+srv://sohaibnayyar721:I6lm3MRu0iERRjsd@cluster0.sdxf3ne.mongodb.net/?retryWrites=true&w=majority')
    await mongoose.connect('mongodb://0.0.0.0:27017')   
    console.log('Mongodb is Connected')
    }
    catch(err){
        console.log('Mongodb Connection Failed')
    }
}

module.exports = MongoDbConnect