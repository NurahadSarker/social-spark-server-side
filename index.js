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
        const joinEventsCollection = db.collection('join-events')

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

        app.post('/join-events', async (req, res) => {
            try {
                const joinEvent = req.body;
                const query = { eventId: joinEvent.eventId, email: joinEvent.email };

                const existing = await joinEventsCollection.findOne(query);
                if (existing) {
                    return res.status(400).json({ message: 'You already joined this event.' });
                }

                const result = await joinEventsCollection.insertOne(joinEvent);
                res.status(201).json({ message: 'Event joined successfully!', result });
            } catch (error) {
                console.error('Error joining event:', error);
                res.status(500).json({ message: 'Internal Server Error' });
            }
        });

        app.get('/join-events', async (req, res) => {
            try {
                const email = req.query.email;
                let query = {};

                if (email) {
                    query = { email: email };
                }

                const result = await joinEventsCollection.find(query).toArray();
                res.send(result);
            } catch (error) {
                console.error('Error fetching joined events:', error);
                res.status(500).json({ message: 'Internal Server Error' });
            }
        });

        app.get('/join-events/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = { eventId: id };
                const result = await joinEventsCollection.findOne(query);

                if (!result) {
                    return res.status(404).json({ message: 'Joined event not found' });
                }

                res.send(result);
            } catch (error) {
                console.error('Error fetching joined event:', error);
                res.status(500).json({ message: 'Internal Server Error' });
            }
        });

        app.delete('/join-events/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };
                const result = await joinEventsCollection.deleteOne(query);

                if (result.deletedCount === 0) {
                    return res.status(404).json({ message: 'Joined event not found', deletedCount: 0 });
                }

                res.json({ message: 'Joined event deleted successfully!', deletedCount: result.deletedCount });
            } catch (error) {
                console.error('Error deleting joined event:', error);
                res.status(500).json({ message: 'Internal Server Error', deletedCount: 0 });
            }
        });


        app.delete('/join-events/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };
                const result = await joinEventsCollection.deleteOne(query);
                res.send(result);
            } catch (error) {
                console.error(error);
                res.status(500).send({ message: 'Server error' });
            }
        });

        app.patch('/join-events/:id', async (req, res) => {
            const id = req.params.id;
            const updatedEvents = req.body;
            const query = { _id: new ObjectId(id) }
            const update = {
                $set: updatedEvents
            }
            const result = await joinEventsCollection.updateOne(query, update)
            res.send(result)
        });

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