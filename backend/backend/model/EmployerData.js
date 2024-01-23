const mongoose = require('mongoose')


const applicantShema = new mongoose.Schema({
    candidateName: String,
    designation: String
 });


const EmployerjobSchema = new mongoose.Schema({
    email:{type:String,unique:true},
    password:String,
    date: String,
    logoImage: String,
    bannerImage: String,
    jobTitle: String,
    jobDescription: String,
    category: String,
    type: String,
    applicationDeadlineDate: String,
    jobApplyType: String,
    externalURLforApplyJob: String,
    jobApplyEmail: String,
    phoneNumber: Number,
    salaryType: String,
    minSalary: Number,
    maxSalary: Number,
    gender: String,
    tag: String,
    industry: String,
    qualification: String,
    careerLevel: String,
    experience: String,
    friendlyAddress: String,
    location: String,
    Maxsalary:Number,
    totalJobs:Array,
    applicants:Array

})

const EmployerjobModel = mongoose.model('EmployerjobSchema', EmployerjobSchema)

module.exports = EmployerjobModel;