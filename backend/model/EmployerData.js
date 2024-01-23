const mongoose = require('mongoose')
const { Schema } = mongoose;

const employerJobsShema = new mongoose.Schema({
    employerId: { type: Schema.Types.ObjectId, ref: 'EmployerSchema' },
    companyName:String,
    jobTitle: String,
    jobDescription: String,
    category: String,
    jobType: String,
    // type: String,
    applicationDeadlineDate: String,
    JobApplyType: String,
    externalURLforApplyJob: String,
    jobApplyEmail: String,
    // phoneNumber: Number,
    SalaryType: String,
    minSalary: Number,
    maxSalary: Number,
    date: String,
    gender: String,
    tag: String,
    industry: String,
    qualification: String,
    careerLevel: String,
    Experience: String,
    friendlyAddress: String,
    location: String,
    companyLogo:String,
    city:String

    // Maxsalary:Number,
})

const EmployerSchema = new mongoose.Schema({
    // employeerId:{type:Number,unique:true},
    companyLogo:String,
    companyName:String,
    LinkedInUrl:String,
    email: { type: String },
    password: String,
    jobs: employerJobsShema,
    password: String,
    postedJob:[{ type: Schema.Types.ObjectId, ref: 'EmployerJobSchema' }],
    // date: String,
    // employeerJobs:Array,
    // totalJobs:Array,
    applicants:Array,

})





const EmployerJobModel = mongoose.model('EmployerJobSchema', employerJobsShema)
const EmployerModel = mongoose.model('EmployerSchema', EmployerSchema)



module.exports = { EmployerModel, EmployerJobModel };