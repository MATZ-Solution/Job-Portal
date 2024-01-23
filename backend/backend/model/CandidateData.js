const mongoose = require('mongoose')


const CandidateSchema = new mongoose.Schema({
    email:String,
    password:String,
    fullName:String,
    phoneNumber:Number,
    designation:String,
    skills:String,
    experience:String,
    biography:String,
    previuosCompany:String,
    recentlyApplied:Array,
    
    // dateOfBirth:String,
    // gender:String,
    // age:String,
    // salary:Number,
    // salaryType:String,
    // qualification:String,
    // experienceTime:String,
    // categories:[String],
    // languages:[String],
    // tags:String,
    // showMyProfile:String,
    // profileUrl:String,
    // aboutMe:String,
    // friendlyAddress:String,
    // Location:String,
    // mapsLocation:String,
    // introductionVideoURL:String,
})

const CandidateModel = mongoose.model('CandidateSchema',CandidateSchema)

module.exports = CandidateModel;