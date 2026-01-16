const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

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
    const db =client.db('rentwheels-db')
    const carsCollection =db.collection('cars')
    const bookingsCollection = db.collection('bookings');
    const testimonialsCollection = db.collection('testimonials');
    const bannersCollection = db.collection('banners');
    const benefitsCollection = db.collection('benefits');
    const usersCollection = db.collection('users');


    // Register user
// app.post('/users', async (req, res) => {
//       try {
//         const { name, email, photoURL } = req.body;
//         if (!name || !email) return res.status(400).send({ error: 'Name and Email required' });

//         const existingUser = await usersCollection.findOne({ email });
//         if (existingUser) return res.send({ message: 'User already exists' });

//         const user = { name, email, photoURL, role: 'user', createdAt: new Date().toISOString() };
//         const result = await usersCollection.insertOne(user);
//         res.send(result);
//       } catch (err) {
//         console.error(err);
//         res.status(500).send({ error: 'Failed to register user' });
//       }
//     });

app.post('/users', async (req, res) => {
  const { name, email, photoURL, role = 'user' } = req.body;

  const existingUser = await usersCollection.findOne({ email });
  if (existingUser) {
    return res.send(existingUser); // 🔥 important
  }

  const user = {
    name,
    email,
    photoURL,
    role,
    createdAt: new Date()
  };

  const result = await usersCollection.insertOne(user);
  res.send(user);
});


app.get('/users', async (req, res) => {
  const result = await usersCollection.find().toArray();
  res.send(result);
});

app.get('/users/:email', async (req, res) => {
  const result = await usersCollection.find().toArray();
  res.send(result);
});




// Delete a user by ID
app.delete('/users/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).send({ error: "User not found" });
    }

    res.send({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to delete user" });
  }
});


app.patch('/users/admin/:id', async (req, res) => {
  const id = req.params.id;

  const filter = { _id: new ObjectId(id) };
  const updateDoc = {
    $set: { role: 'admin' }
  };

  const result = await usersCollection.updateOne(filter, updateDoc);
  res.send(result);
});

// // get profile
app.get('/profile/:email', async (req, res) => {
  const email = req.params.email;
  const user = await usersCollection.findOne({ email });
  if(!user) return res.status(404).send({ error: 'User not found' });
  res.send(user);
});

// update profile
app.put('/profile/:email', async (req, res) => {
  const email = req.params.email;
  const updatedData = req.body; // name, photoURL etc.
  const result = await usersCollection.updateOne(
    { email },
    { $set: updatedData }
  );
  res.send(result);
});




//all car
    app.get('/cars',async(req,res)=>{
        const result = await carsCollection.find().toArray()
        res.send(result)
    });
    app.get('/cars/featured', async (req, res) => {
        const result = await carsCollection
          .find({status:'available'})
          .sort({ createdAt: -1 })
          .limit(8)
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

app.get('/cars/search', async (req, res) => {
  try {
    const { q, category, location } = req.query;
    let query = {};
      if (q) {
      query.$or = [
        { carName: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }
    if (category) {
      query.category = category;
    }
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    const result = await carsCollection.find(query).toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: 'Search failed' });
  }
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
          if (!car) {
            return res.status(404).send({ error: 'Car not found' });
          }
          if (car.providerEmail === booking.userEmail) {
            return res.status(403).send({ error: 'You cannot book your own car' });
          }
          if (car.status === 'booked') {
          return res.status(400).send({ error: 'This car is already booked' });
          }
          const existingBooking = await bookingsCollection.findOne({
            carId: booking.carId,
            userEmail: booking.userEmail
          });
  
          if (existingBooking) {
        return res.status(400).send({ error: 'You have already booked this car' });
        }

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

// Get all benefits
app.get('/benefits', async (req, res) => {
    const result = await benefitsCollection.find().toArray();
    res.send(result);
  });
app.post('/benefits', async (req, res) => {
    const newBenefit = req.body;
    const result = await benefitsCollection.insertOne(newBenefit);
    res.send(result);
  });

  // Dashboard statistics
app.get('/dashboard-stats', async (req, res) => {
  try {
    const totalCars = await carsCollection.countDocuments();
    const totalBookings = await bookingsCollection.countDocuments();
    const totalTestimonials = await testimonialsCollection.countDocuments();

    const recentBookings = await bookingsCollection
      .find()
      .sort({ bookingDate: -1 })
      .limit(5)
      .toArray();

    res.send({
      totalCars,
      totalBookings,
      totalTestimonials,
      recentBookings
    });
  } catch (error) {
    res.status(500).send({ error: 'Failed to load dashboard stats' });
  }
});




    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
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
