const express = require('express')
const MongoDbConnect = require('./mongodbConn')
const cors = require('cors')
const multer = require('multer');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb')
const {EmployerModel,EmployerJobModel} = require('./model/EmployerData')
const candidateModel = require('./model/CandidateData')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const app = express()
const cloudinary = require('cloudinary').v2;
const nodemailer = require('nodemailer')
require('dotenv').config()

app.use(cors())
app.use(express.json())

MongoDbConnect()


app.get('/api/employeer/', async(req,res)=>{

    try{
    const getEmployeerData = await employerModel.find({})
    res.json({employeerData:getEmployeerData})
    }

    catch(err){
        console.log("Server cannot respond")
       res.status(404).json({message:"Server cannot respond"})  
    }
  
})

// Candidate Apply Job
app.put('/api/candidate/applyJob', async(req,res)=>{
    const {candidateData,employeerId,getSingleJObId} = req.body
    // console.log(req.body.candidateData)
try{
    const getJob = await EmployerModel.findById(employeerId).
    select('-password').populate(
        {path:'postedJob',match:{_id:getSingleJObId}}
        )

        if(!getJob){
            return res.json({message:"Cannot found employer"})
        }

let candidateId = candidateData.map(data=>data._id)[0]

    const findCandidate = await candidateModel.updateOne(
        {_id:candidateId},
        {$push : {recentlyApplied:getJob.postedJob}}
    )
    if(!findCandidate){
        return res.json({message:"Cannot found Candidate"})
    }
    const findEmployer = await EmployerModel.updateOne(
        {_id:employeerId},
        { $push: { applicants: candidateData }}
        )  

        if(!findEmployer){
            return res.json({message:"Cannot found Employer"})
        }

        // find candidate to get email
        const findCandidateEmail = await candidateModel.findById({_id:candidateId})
console.log(findCandidateEmail)
emailsend(findCandidateEmail.fullName,findCandidateEmail.email)
        res.json({message:"Success"}) 
}
catch(err){
            console.log("Server cannot respond")
       res.json({message:"Server cannot respond"})  
}

})


cloudinary.config({
    cloud_name: 'ds8i8guuh',
    api_key: '376944176752133',
    api_secret: '0dBjGIiqRFgwI5VLP6VGN6g2YxI',
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


// Candidate Sign Up
app.post('/api/candidate/SignUp',upload.single('pdf'),async(req,res)=>{
    const { name, email, password, designation, skills, phoneNumber, experience, biography, previuosCompany   } = req.body
    console.log(JSON.parse(skills))
    console.log(req.body)
    let candidatePdfUrl = ''    
    let successPdfUpload = false

    try {

        const findUser = await candidateModel.findOne({ email: email })

            if (findUser) {
                return res.json({message:"user already exists"})
            }
    
            const hashpassword = await bcrypt.hash(password, 10)

            // cloudinary file upload

            try{
                const result = cloudinary.uploader.upload_stream(
                    { resource_type: 'auto' },
                    async (error, result) => {
                        if (error) {
                            return res.status(500).json({message:"Error while uploading file"});
                        }

                        const imageUrl = result.secure_url;
    
                            const createUser = await new candidateModel({
                                fullName: name,
                                email: email,
                                password: hashpassword,
                                designation:designation,
                               skills:[JSON.parse(skills)],
                                experience:experience,
                                biography:biography,
                                phoneNumber:phoneNumber,
                                previuosCompany:previuosCompany,
                                resume:imageUrl,
                    
                            })
                            console.log(skills)
                            await createUser.save()
                    
                            res.json({message:"user created successfully!!!"})
                        }
                    
                ).end(req.file.buffer);
            }
            catch(err){
                console.log('Error while uploading file to cloudinary')
            }
           
      
        // ---------------End------------------

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Server error' });
        }

})

// Candidate Log In
app.post('/api/candidate/login',async(req,res)=>{
    let { email, password } = req.body
console.log(req.body)   
    let findEmail = await candidateModel.findOne({ email: email })

    if (!findEmail) {
        return res.json({message:"The provided login credentials are incorrect. Please use your email and password to log in"})
    }

    let matchPassword = await bcrypt.compare(password, findEmail.password)

    if (!matchPassword) {
        return res.json({message:"The provided login credentials are incorrect. Please use your email and password to log in"})
    }

    let token = jwt.sign({id:findEmail._id}, 'secretkey')

    res.status(200).json({ token: token,message:"Login Successfull"})
})

app.get('/candidate/dashboard',CandidateAuthentication,async(req,res)=>{
    // console.log("this is token",req)
    let id = req.id
    let findCandidate = await candidateModel.find({_id: id}).select('-password') 
    console.log("this is candidate",findCandidate)
    if(findCandidate.length===0){
        return res.json({message:"invalid user"})
    }
    res.json({
        message: 'Successful log in',
        authenticated:true,
        findCandidate:findCandidate,

    });
    console.log('SUCCESS: Connected to protected route');
})

// Employeer Middleware
async function CandidateAuthentication(req, res, next) {
    let header = req.headers['authorization']
        // return res.status(404).json({ message: "header is not present" })
    if(typeof header !== 'undefined') {
        const bearer = header.split(' ');
        const token = bearer[1];
        jwt.verify(token, 'secretkey',async (err, data) => {
       
            if(err){
                return res.json({message:"Invalid token"});
            } else {
                console.log("this is id",data)
                req.id = data.id
                next();
            }
        })

        
    } else {

        res.sendStatus(403)
    }


    // if (!header) {
    //     console.log("header is not present")
    //     return res.status(404).json({ message: "header is not present" })
    // }

    // let bearer = header.split(' ')
    // if (!bearer) {
    //     console.log("bearer is not present")
    //     return res.status(404).json({ message: "bearer is not present" })
    // }

    // let token = bearer[1]
    // if (!token) {
    //     console.log("token is not present")
    //     return res.status(404).json({ message: "token is not present" })
    // }

    
    // let verify = jwt.verify(token, 'secretkey', (err, data) => {
    //     if (err) {
    //         res.status(404).json('Invalid Token')
    //     }
    //     else {
    //         req.userData = data.findEmail
    //     }
    // })
}

// Filter Jobs
app.post('/job/filter',async(req,res)=>{

    let {jobTitle,listLocation,category,jobTypes,minSalaray,maxSalaray,
        industry,careerLevel,experience} = req.body
console.log(jobTitle)
    let obj = {

        // jobTitle:{ $regex: `^${jobTitle}`},
        jobTitle:{ $regex: jobTitle},
        location:listLocation,
        category:category,
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
    console.log("this is object",obj)
    const employers = await EmployerJobModel.find(obj);
    console.log("This is employers",employers)
    res.json({FindData:employers})

})

// Get Single Jobs
app.get('/job/:employeerId/:singleJobId', async (req, res) => {
console.log(req.params.employeerId)
console.log(req.params.singleJobId)

let employeerId = req.params.employeerId
let singleJobId = req.params.singleJobId
try{
    const getJob = await EmployerModel.findById(employeerId).
    select('-password').populate(
        {path:'postedJob',match:{_id:singleJobId}}
        )
        
    if(!getJob){
        return res.status(404).json({message:"Can't found Data"})
    }
    res.status(200).json({getJob})
}

catch(err){
    res.status(404).json({message:"Error in Single Data Api"})
}
})


app.get('/getAllData', async (req, res) => {

    try{
        const employers = await EmployerJobModel.find()
        console.log(employers)
    
        const totalCategory = []
        const countCategory = {};

        const totalTitle = []
        const countTitle = {};

        const totalLocation = []
        const countLocation = {};
    
        employers.forEach(element => {
            countTitle[element.jobTitle] = (countTitle[element.jobTitle] || 0) + 1;
            countCategory[element.category] = (countCategory[element.category] || 0) + 1;
            countLocation[element.city] = (countLocation[element.city] || 0) + 1;

        });

        const specificCountryCounts = {
            Istanbaul: countLocation['Istanbaul'] || 0,
            Karachi: countLocation['Karachi'] || 0,
            Riyadh: countLocation['Ryadh'] || 0,
            Cairo: countLocation['Cairo'] || 0,
            Bangladesh: countLocation['Bangladesh'] || 0,
            Egypt: countLocation['Egypt'] || 0,
            Malaysia: countLocation['Malaysia'] || 0,
        }
    
        totalCategory.push(countCategory)
        totalTitle.push(countTitle)
        totalLocation.push(specificCountryCounts)
    
        // console.log(totalCategory)
        console.log(totalLocation)
    
    res.json({allJobs:employers,categories:totalCategory,title:totalTitle,jobByLocation:specificCountryCounts})
    }
    catch(err){
        res.json({message:"server not respond"})
    }

   


})


// app.get('/', async (req, res) => {
//     const getJob = await employerModel.find({})
// res.send(getJob)
       
// })


// Employeer Login
app.post('/api/employeer/login',async(req,res)=>{
    let { email, password } = req.body

    let findEmail = await EmployerModel.findOne({ email: email })
    // console.log(findEmail)

    if (!findEmail) {
        return res.json({message:"The provided login credentials are incorrect. Please use your email and password to log in"})
    }

    let matchPassword = await bcrypt.compare(password, findEmail.password)

    if (!matchPassword) {
        return res.json({message:"The provided login credentials are incorrect. Please use your email and password to log in"})
    }

    let token = jwt.sign({id:findEmail._id}, 'secretkey')

    res.status(200).json({ token: token,message:"Login Successfull"})
})
// Send Email 

let emailsend = async (name,email) => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: "465",
      secure: true,
      // service: "gmail",
      auth: {
        user: process.env.user,
        pass: process.env.pass
      },
      tls: {
        rejectUnauthorized: false
      }
    })
  
    const mailoption = {
      from: "sohaibsobbi.444@gmail.com",
      to: email,
      subject: "Successfull apply",
      text: `${name} your email is successfully sent.`
    }
  
    transporter.sendMail(mailoption, function (err, info) {
      if (err) {
        console.log(err)
      } else {
        console.log('email sent ', info.response)
      }
    })
  }

// Employeer Sign Up
app.post('/api/employeer/SignUp',upload.single('companyLogo'),async(req,res)=>{

    const { email, password, companyName, LinkedInUrl} = req.body
    console.log(req.body)
    const employeerId = 0
    try {
        const findUser = await EmployerModel.findOne({ email: email })

        if (findUser) {
            return res.json({message:"user already exists"})
        }

        const hashpassword = await bcrypt.hash(password, 10)

        try{
            const result = cloudinary.uploader.upload_stream(
                { resource_type: 'auto' },
                async (error, result) => {
                    if (error) {
                        return res.status(500).json({message:"Error while uploading file"});
                    }

                    const imageUrl = result.secure_url;

                        const createUser = await new EmployerModel({
   
                            companyLogo:imageUrl,
                            companyName:companyName,
                            email: email,
                            LinkedInUrl:LinkedInUrl,
                            password: hashpassword,
                
                        })
                        
                        await createUser.save()
                
                        res.json({message:"user created successfully!!!"})
                    }
                
            ).end(req.file.buffer);
        }
        catch(err){
            console.log('Error while uploading file to cloudinary')
        }

    } catch (err) {
        console.log(err)
        res.json({message:"Something went wrong"})
    }
})

// Employeer Authentication
app.get('/employeer/dashboard',EmployeerAuthentication,async(req,res)=>{
    let id = req.id
    let findEmployeer = await EmployerModel.find({_id: id}) 
    if(findEmployeer.length===0){
        return res.json({message:"invalid user"})
    }
    res.json({
        message: 'Successful log in',
        authenticated:true,
        employeerData:findEmployeer,

    });
    console.log('SUCCESS: Connected to protected route');

    // let userData = req.userData
    // console.log(userData)
    // res.status(200).json({authenticated:true,employeerData:[userData]})
})

// Employeer Middleware
async function EmployeerAuthentication(req, res, next) {

    let header = req.headers['authorization']
if(typeof header !== 'undefined') {
    const bearer = header.split(' ');
    const token = bearer[1];
    jwt.verify(token, 'secretkey',async (err, data) => {
        if(err){
           return res.json({message:"Invalid token"});
        } else {
            console.log("this is employeer id",data)
            req.id = data.id
            next();
        }
    })

    
} else {

    res.send('forbidden')
}

    // let header = req.header('authorization')

    // if (!header) {
    //     return res.status(404).json({ message: "header is not present" })
    // }

    // let bearer = header.split(' ')
    // let token = bearer[1]
    
    // let verify = jwt.verify(token, 'secretkey', (err, data) => {
    //     if (err) {
    //         res.status(404).json('Invalid Token')
    //     }
    //     else {
    //         req.userData = data.findEmail
    //     }
    // })
    // next()
}

// Employeer Post A Job
app.post('/employerAddJob',EmployeerAuthentication, upload.single('image'),async(req, res) => {
    let id = req.id
    try{
            
        let {jobTitle,category,location,jobType,minSalary,
            maxSalary,date,JobApplyType,SalaryType,Experience,
            jobDescription,applicationDeadlineDate,
            externalURLforApplyJob,jobApplyEmail,
            gender,tag,industry,qualification,careerLevel,
            friendlyAddress,city} = req.body

            const currentDate = new Date();
            const options = { month: 'short', day: 'numeric', year: 'numeric' };
            const formattedDate = currentDate.toLocaleDateString('en-US', options);

            const findEmployer = await EmployerModel.findOne({_id:id})
            console.log(findEmployer.companyLogo)

            const addjob = new EmployerJobModel(
                {
                    companyName:findEmployer.companyName,
                employerId:id ,
                jobTitle:jobTitle,
                category:category,
                location:location,
                jobType:jobType,
                minSalary:minSalary,
                maxSalary:maxSalary,
                date:formattedDate,
                JobApplyType:JobApplyType,
                SalaryType:SalaryType,
                Experience:Experience,
                jobDescription:jobDescription,
                applicationDeadlineDate:applicationDeadlineDate,
                externalURLforApplyJob:externalURLforApplyJob,
                jobApplyEmail:jobApplyEmail,
                gender:gender,
                tag:tag,
                industry:industry,
                qualification:qualification,
                careerLevel:careerLevel,
                friendlyAddress:friendlyAddress,
                companyLogo:findEmployer?.companyLogo,
                city:city,
                }
               )
                const getJob =  await addjob.save()
                let getJobId = getJob._id

    
                let updateEmployerJob = await EmployerModel.updateOne({_id:id},{
                    $push:{postedJob:getJobId}
                })
    
            res.json({message:"Job Posted Successfully"})

    }
    catch(err){
        console.log(err)
        res.json({message:"Internal Server Error"})
    }

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