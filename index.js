const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 3000;
console.log(process.env)

app.use(cors());
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zeenoci.mongodb.net/?appName=Cluster0`;

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
    await client.connect();

    const db =client.db('rentwheels-db')
    const carsCollection =db.collection('cars')
    const bookingsCollection = db.collection('bookings');

//all car
    app.get('/cars',async(req,res)=>{
        const result = await carsCollection.find().toArray()
        // console.log(result)
        res.send(result)
    });
//feature car
    app.get('/cars/featured', async (req, res) => {
        const result = await carsCollection
          .find()
          .sort({ updatedAt: -1 })
          .limit(6)
          .toArray();
        res.send(result);
    });
//single car by id
    app.get('/cars/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await carsCollection.findOne(query);
    res.send(result);
    });

    // Add new car
app.post('/cars', async (req, res) => {
    const newCar = req.body;
    newCar.status = 'available';
    newCar.createdAt = new Date().toISOString();
    newCar.updatedAt = new Date().toISOString();
    
    const result = await carsCollection.insertOne(newCar);
    res.send(result);
});

 // Update car
    app.put('/cars/:id', async (req, res) => {
        const id = req.params.id;
        const updatedCar = req.body;
        updatedCar.updatedAt = new Date().toISOString();
        
        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: updatedCar
        };
        
        const result = await carsCollection.updateOne(filter, updateDoc);
        res.send(result);
      });


    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
  res.send('server is running')
})

app.get('/hello',(req,res)=>{
    res.send('how are you')
})

app.listen(port, () => {
  console.log(`server is listening on port ${port}`)
})
