const express = require("express");
const app = express();
const cors = require('cors'); 
app.use(cors()); 

const { MongoClient } = require('mongodb');

require('dotenv').config(); // Load environment variables from .env file
const uri = process.env.MONGODB_URI; // Use the environment variable for the URI

const client = new MongoClient(uri);
let port = 3002;

app.use(express.json());

// Function to connect to MongoDB and start the server
async function main() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        app.listen(port, () => console.log(`Listening on port ${port}`));
    } catch (e) {
        console.error('Error connecting to MongoDB', e);
        process.exit(1);
    }
}

// Initialize the application
main().catch(console.error);

// Add a new voter
app.post('/', async (request, response) => {
    const submittedVoter = request.body.name;
    const voterData = { name: submittedVoter, ballot: null };

    try {
        const result = await client.db("voting").collection("voters").insertOne(voterData);
        response.send({ message: 'Voter added successfully.', result });
    } catch (error) {
        if (error.code === 11000) {
            response.status(400).send({ error: 'A voter with this name already exists.' });
        } else {
            console.error(error);
            response.status(500).send({ error: 'Failed to add voter.' });
        }
    }
});

// Retrieve all voters
app.get('/', async (request, response) => {
    try {
        const results = await client.db("voting").collection("voters")
            .find().sort({ name: 1 })
            .toArray();
        response.send(results);
    } catch (error) {
        console.error(error);
        response.status(500).send({ error: 'Failed to get voters' });
    }
});

// Record a vote for a voter
app.put('/', async (request, response) => {
    const submission = request.body.candidate;
    const voterFilter = { "name": request.body.name };
    const updateDocument = { $set: { "ballot": { "name": submission } } };

    try {
        const result = await client.db("voting").collection("voters")
            .updateOne(voterFilter, updateDocument);
        response.send({ message: 'Vote recorded successfully.', result });
    } catch (error) {
        console.error(error);
        response.status(500).send({ error: 'Failed to update voter' });
    }
});

// Remove a voter
app.delete('/', async (request, response) => {
    const voterFilter = { "name": request.body.name };

    try {
        const result = await client.db("voting").collection('voters')
            .deleteOne(voterFilter);
        response.send({ message: 'Voter deleted successfully.', result });
    } catch (error) {
        console.error(error);
        response.status(500).send({ error: 'Failed to delete voter' });
    }
});

