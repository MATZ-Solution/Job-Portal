const express = require('express')
const MongoDbConnect = require('./mongodbConn')
const cors = require('cors')
const multer = require('multer');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb')
const employerModel = require('./model/EmployerData')
const candidateModel = require('./model/CandidateData')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const app = express()

app.use(cors())
app.use(express.json())

MongoDbConnect()


app.get('/api/employeer/', async(req,res)=>{
    const getEmployeerData = await employerModel.find({})
    res.json({employeerData:getEmployeerData})
})

// Candidate Api's
app.put('/api/candidate/applyJob', async(req,res)=>{
    const {candidateName,designation,employerId} = req.body

    const candidateObj = {candidateName:candidateName,designation:designation}

    const findEmployer = await employerModel.updateOne(
        {_id:employerId},
        { $push: { applicants: candidateObj }}
        )

        let finddata = await employerModel.find({})
        res.send(finddata)


    // console.log(pushData)
    // console.log(pushData)
    // res.send(findEmployer)
    // console.log(jobId)
})

// Sign Up
app.post('/api/candidate/SignUp',async(req,res)=>{

    const { name, email, password, designation, skills, phoneNumber, experience, biography, previuosCompany   } = req.body
    console.log(req.body)
    
    try {
        const findUser = await candidateModel.findOne({ email: email })

        if (findUser) {
            return res.json({message:"user already exists"})
        }

        const hashpassword = await bcrypt.hash(password, 10)

        const createUser = await new candidateModel({
            fullName: name,
            email: email,
            password: hashpassword,
            designation:designation,
            skills:skills,
            experience:experience,
            biography:biography,
            phoneNumber:phoneNumber,
            previuosCompany:previuosCompany

        })
        await createUser.save()

        res.json({message:"user created successfully!!!"})

    } catch (err) {
        res.send("Something went wrong")
    }
})

// Log In
app.post('/api/candidate/login',async(req,res)=>{
    let { email, password } = req.body

   try{
    let findEmail = await candidateModel.findOne({ email: email })

    if (!findEmail) {
        return res.json({message:"Invalid email or password"})
    }

    let matchPassword = await bcrypt.compare(password, findEmail.password)

    if (!matchPassword) {
        return res.json({message:"Invalid email or password"})
    }

    let token = jwt.sign({ findEmail }, 'secretkey')

    res.status(200).json({ token: token,findEmail:findEmail, message:"Login Successfull"})
   }    
   catch(err){
    res.json({message:"Server cannot Respond"})
   }
})


// Filter Jobs
app.post('/job/filter',async(req,res)=>{

    let {jobTitle,listLocation,category,jobTypes,minSalaray,maxSalaray,
        industry,careerLevel,experience} = req.body

    let obj = {jobTitle:jobTitle,location:listLocation,category:category,
        type:jobTypes,industry: industry, 
        careerLevel:careerLevel,
        experience:experience, 
        minSalary:{$gte:parseInt(minSalaray)},
        maxSalary:{$lte:parseInt(maxSalaray)}, 
    }

    for (let i in obj){
        if(obj[i]===""){
            delete obj[i]
        }
    }
    let FindData = await employerModel.find(obj)
    if(FindData.length === 0){

        return res.status(400).json({message:'No Jobs Found'})
    }
    console.log(FindData)
    res.send(FindData)

})

// Get Single Jobs
app.get('/job/:singleJobId', async (req, res) => {

try{
    const getJob = await employerModel.find({_id: req.params.singleJobId})
    if(!getJob){
        return res.status(404).json({message:"Can't found Data"})
    }

    res.status(200).json({ jobs: getJob})
}

catch(err){
    res.status(404).json({message:"Error in Single Data Api"})
}
})

// app.get('/getData', async (req, res) => {
//     const getJob = await employerModel.find({})

//     const totalJob = []
//     const count = {};

//     getJob.forEach(element => {
//         count[element.location] = (count[element.location] || 0) + 1;
//     });

//     totalJob.push(count)
    
//     res.status(200).json({ featuredJob: getJob, jobForEachCountry: totalJob })

// })

app.get('/getAllData', async (req, res) => {
    const getJob = await employerModel.find({})
    // console.log(getJob.featuredJob.minSalary)
    
    res.status(200).json({ jobsData: getJob })

})

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Set the upload directory
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

app.get('/', async (req, res) => {
    const getJob = await employerModel.find({})
res.send(getJob)
       
})

app.post('/employerAddJob', async(req, res) => {

    console.log(req.body)

    let {jobTitle,category,location,jobType,minSalary,
        maxSalary,date,JobApplyType,SalaryType,Experience,
        jobDescription,applicationDeadlineDate,
        externalURLforApplyJob,jobApplyEmail,
        gender,tag,industry,qualification,careerLevel,
        friendlyAddress,} = req.body

const EmployerData = new employerModel({
    date:date,
    // logoImage:String,
    // bannerImage:String,
    jobTitle:jobTitle,
    jobDescription:jobDescription,
    category:category,
    type:jobType,
    applicationDeadlineDate:applicationDeadlineDate,
    jobApplyType:JobApplyType,
    externalURLforApplyJob:externalURLforApplyJob,
    jobApplyEmail:jobApplyEmail,
    // phoneNumber:Number,
    salaryType:SalaryType,
    minSalary:minSalary,
    maxSalary:maxSalary,
    gender:gender,
    tag:tag,
    industry:industry,
    qualification:qualification,
    careerLevel:careerLevel,
    experience:Experience,
    friendlyAddress:friendlyAddress,
    location:location,
    Maxsalary:300
}) 

EmployerData.save()
res.send(EmployerData)

})

app.listen(4500, () => {
    console.log("Server is running!!!")
})

// app.get('/getData', async (req, res) => {
//     const getJob = await jobModel.find({})

//     const totalJob = []
//     const count = {};

//     getJob.forEach(element => {
//         count[element.location] = (count[element.location] || 0) + 1;
//     });

//     totalJob.push(count)
    
//     res.json({ featuredJob: getJob, jobForEachCountry: totalJob })

// }) a