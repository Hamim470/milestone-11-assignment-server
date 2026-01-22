const express = require('express');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 3001;

const app = express();

const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174', 'https://solosphere-3e6ab.web.app'],
  credentials: true,
  optionSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

app.use(cookieParser());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.53svpmg.mongodb.net/assignment-11?retryWrites=true&w=majority`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const assignmentCollection = client.db('assignment-11').collection("assignments");
    const submittedCollection = client.db('assignment-11').collection("submittedAssignments");




    // save a assignment data in 
    app.post('/assignment', async (req, res) => {
      const assignmentData = req.body;

      const result = await assignmentCollection.insertOne(assignmentData);
      res.send(result);
    });

    // get all assignment data
    app.get('/assignments',async (req,res)=>{
      const result=await assignmentCollection.find().toArray();
      res.send(result);
    })
    // get data by id
    app.get('/assignment/:id',async(req,res)=>{
      const id=req.params.id;
      const query={_id:new ObjectId(id)};
      const result= await assignmentCollection.findOne(query);
      res.send(result); 
    })

    // delete data from assignments
    app.delete('/assignment/:id',async(req,res)=>{
      const id=req.params.id;
      const query={_id:new ObjectId(id)};
      const result=assignmentCollection.deleteOne(query);
      res.send(result);
    })

    // update data of the assignment
    app.patch('/update/:id',async(req,res)=>{
      const id=req.params.id;
      const updatedData=req.body;
      const filter={_id:new ObjectId(id)};
      const updatedDocument={
        $set:{
          title:updatedData.title,
          description:updatedData.description,
          marks:updatedData.marks,
          thumbnail:updatedData.thumbnail,
          difficulty:updatedData.difficulty,
          dueDate:updatedData.dueDate
        }
      }
      const result=await assignmentCollection.updateOne(filter,updatedDocument);
      res.send(result)
    })



    // Submitted Assignment
    app.post('/submitted-assignment',async(req,res)=>{
      const submittedAssignment=req.body;
      const result=await submittedCollection.insertOne(submittedAssignment);
      res.send(result);
    })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
