const mongoose = require('mongoose')


const CandidateSchema = new mongoose.Schema({
    email:String,
    password:String,
    fullName:String,
    phoneNumber:Number,
    designation:String,
    skills:Array,
    experience:String,
    biography:String,
    appliedCompany:String,
    previuosCompany:String,
    recentlyApplied:Array,
    resume:String

    
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