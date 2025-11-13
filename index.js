const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;

//middleware
app.use(cors())
app.use(express.json())

//SocialSparkDbUser
//MwQ0f0QNg1RYgTSf

const uri = "mongodb+srv://SocialSparkDbUser:MwQ0f0QNg1RYgTSf@nurahad.0txpfm4.mongodb.net/?appName=Nurahad";

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.get('/', (req, res) => {
    res.send('SocialSpark web server is running')
})

async function run() {
    try {
        await client.connect();

        const db = client.db('socialSpark_db')
        const eventsCollection = db.collection('events')
        const usersCollection = db.collection('users')

        app.post('/users', async (req, res) => {
            const newUser = req.body;
            const email = req.body.email;
            const query = { email: email }
            const existingUser = await usersCollection.findOne(query)
            if (existingUser) {
                res.send({ message: 'user already existing' })
            }
            else {
                const result = await usersCollection.insertOne(newUser)
                res.send(result)
            }
        })

        app.get('/events', async (req, res) => {
            const email = req.query.email;
            const query = {}
            if (email) {
                query.email = email
            }

            const cursor = eventsCollection.find(query).sort({ date: 1 })
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get('/events/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await eventsCollection.findOne(query)
            res.send(result)
        })

        app.post('/events', async (req, res) => {
            const newEvent = req.body
            const result = await eventsCollection.insertOne(newEvent)
            res.send(result)
        })

        app.patch('/events/:id', async (req, res) => {
            const id = req.params.id;
            const updatedEvents = req.body;
            const query = { _id: new ObjectId(id) }
            const update = {
                $set: updatedEvents
            }
            const result = await eventsCollection.updateOne(query, update)
            res.send(result)
        })

        app.delete('/events/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await eventsCollection.deleteOne(query)
            res.send(result)
        })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    }
    finally {

    }
}

run().catch(console.dir)

app.listen(port, () => {
    console.log(`SocialSpark web server is running port on: ${port}`)
})