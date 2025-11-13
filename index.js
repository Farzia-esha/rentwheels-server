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
    const testimonialsCollection = db.collection('testimonials');
    const bannersCollection = db.collection('banners');


//all car
    app.get('/cars',async(req,res)=>{
        const result = await carsCollection.find().toArray()
        // console.log(result)
        res.send(result)
    });
    app.get('/cars/featured', async (req, res) => {
        const result = await carsCollection
          .find()
          .sort({ updatedAt: -1 })
          .limit(6)
          .toArray();
        res.send(result);
    });

    app.get('/cars/provider/:email', async (req, res) => {
        const email = req.params.email;
        const query = { providerEmail: email };
        const result = await carsCollection.find(query).toArray();
        res.send(result);
      });

    app.get('/cars/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await carsCollection.findOne(query);
    res.send(result);
    });

app.post('/cars', async (req, res) => {
    const newCar = req.body;
    newCar.status = 'available';
    newCar.createdAt = new Date().toISOString();
    newCar.updatedAt = new Date().toISOString();
    
    const result = await carsCollection.insertOne(newCar);
    res.send(result);
});

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
      
    app.delete('/cars/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await carsCollection.deleteOne(query);
        res.send(result);
      });

    

      //booking part

    app.get('/bookings/:email', async (req, res) => {
        const email = req.params.email;
        const query = { userEmail: email };
        const result = await bookingsCollection.find(query).toArray();
        res.send(result);
      });

      app.post('/bookings', async (req, res) => {
        const booking = req.body;
        const car = await carsCollection.findOne({ _id: new ObjectId(booking.carId) })

        booking.bookingDate = new Date().toISOString();
        const bookingResult = await bookingsCollection.insertOne(booking);
        await carsCollection.updateOne(
          { _id: new ObjectId(booking.carId) },
          { $set: { 
              status: 'booked',
              updatedAt: new Date().toISOString()
            } 
          }
        );
        res.send(bookingResult);
      });

      app.delete('/bookings/:id', async (req, res) => {
        const id = req.params.id;
        const booking = await bookingsCollection.findOne({ _id: new ObjectId(id) });
        const result = await bookingsCollection.deleteOne({ _id: new ObjectId(id) });
          await carsCollection.updateOne(
          { _id: new ObjectId(booking.carId) },
          {   $set: { 
              status: 'available',
              updatedAt: new Date().toISOString()
            } 
          }
        );
        
        res.send(result);
      });




app.get('/testimonials', async (req, res) => {
  const result = await testimonialsCollection.find().sort({ rating: -1 }).toArray();
  res.send(result);
});

app.post('/testimonials', async (req, res) => {
  const newTestimonial = req.body;
  newTestimonial.createdAt = new Date().toISOString();

  const result = await testimonialsCollection.insertOne(newTestimonial);
  res.send(result);
});

app.delete('/testimonials/:id', async (req, res) => {
  const id = req.params.id;
    const result = await testimonialsCollection.deleteOne({ _id: new ObjectId(id) });
    res.send({ success: true, deletedCount: result.deletedCount });
  } );

  //banner
app.get('/banners', async (req, res) => {
  const result = await bannersCollection.find().toArray();
  res.send(result);
});

app.post('/banners', async (req, res) => {
  const newBanner = req.body;
  const result = await bannersCollection.insertOne(newBanner);
  res.send(result);
});

app.delete('/banners/:id', async (req, res) => {
  const id = req.params.id;
  const result = await bannersCollection.deleteOne({ _id: new ObjectId(id) });
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
