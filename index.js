const express= require('express');
const cors= require('cors');
const app= express();
require('dotenv').config();

// middlewares
app.use(cors());
app.use(express.json());

// connection to mongodb
const MongoClient = require('mongodb').MongoClient;
const ObjectID= require('mongodb').ObjectID;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4cfgh.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    err?console.log(err):console.log('db connected');
  const courseCollection = client.db("blackboard").collection("courses");
  const reviewCollection = client.db('blackboard').collection('reviews');
  const adminCollection = client.db('blackboard').collection('admin');
  const enrollCollection = client.db('blackboard').collection('enrollments');
  // perform actions on the collection object
app.post('/addCourse', (req, res)=> {
      const data= req.body;
      courseCollection.insertOne(data)
      .then(data=> res.send(data.insertedCount>0))
      .catch(err=> console.log(err))
  })
app.get('/allCourses', (req, res)=>{
      courseCollection.find({}).sort({_id: -1}).toArray((err, docs)=> {
          if(err){
              console.log(err);
              return res.status('500').send("Sorry, something is wrong.")
          }else {
              res.send(docs);
          }
      })
})
app.get('/myCourses', (req,res)=> {
    const email= req.query.email;
    console.log(email);
    enrollCollection.find({userEmail:email}).toArray((err,docs)=>{
        if(err){
            console.log(err);
            res.send('problem')
        }else{
            res.send(docs)
        }
    })
})
app.get('/singleCourse', (req, res)=> {
    const _id= req.query._id;
    courseCollection.findOne({_id: ObjectID(_id)})
    .then(data=> res.send(data))
    .catch(err=> console.log(err))
})
app.delete('/deleteCourse', (req, res)=> {
    const _id= req.query._id;
    courseCollection.deleteOne({_id: ObjectID(_id)})
    .then(data=> res.send(data.deletedCount>0))
    .catch(err=> console.log(err)) 
})
app.post('/addReview', (req, res)=> {
    const data= req.body;
    reviewCollection.insertOne(data)
    .then(data=> res.send(data.insertedCount>0))
    .catch(err=> console.log(err))
})
app.get('/allReviews', (req, res)=>{
    reviewCollection.find({}).sort({_id: -1}).toArray((err, docs)=> {
        if(err){
            console.log(err);
            return res.status('500').send("Sorry, something is wrong.")
        }else {
            res.send(docs);
        }
    })
})
app.post('/addAdmin', (req, res)=> {
    const data= req.body;
    adminCollection.insertOne(data)
    .then(data=> res.send(data.insertedCount>0))
    .catch(err=> console.log(err))
})
app.get('/checkAdmin', (req, res)=> {
    const email= req.query.email;
    adminCollection.find({email: email}).toArray((err, docs)=>{
        if(err){
            console.log(err);
            return res.status(500).send('Something inner went wrong.')
        }else {
            res.send(docs.length>0);
        }
    })
})
app.post('/enroll', (req,res)=> {
    const data= req.body;
    enrollCollection.insertOne(data)
    .then(result=> res.send(result.insertedCount>0))
    .catch(err=> console.log(err))
})
app.get('/allEnrollments', (req, res)=> {
    enrollCollection.find({}).toArray((err, docs)=>{
        if(err){
            res.status(500).send('Something Wrong')
        }else {
            res.send(docs);
        }
    })
})
app.post('/updateStatus', (req, res)=> {
    const {status, _id}= req.body;
    enrollCollection.findOneAndUpdate({_id: ObjectID(_id)},{$set:{status: status}})
    .then(suc=> res.send(true))
    .catch(err=> console.log(err))
})

});

app.get('/', (req, res)=> {
    res.send('salam');
})
app.listen(process.env.PORT || 3001);