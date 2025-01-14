// Import required modules
const express = require("express");
const app = express();
const cors = require('cors'); 

// Enable CORS for cross-origin requests
app.use(cors()); 

// Import MongoDB client and configure connection
const { MongoClient } = require('mongodb');

require('dotenv').config(); // Load environment variables from .env file
const uri = process.env.MONGODB_URI; // Use the environment variable for the URI

const client = new MongoClient(uri);

// Define server port
let port = 3006;

// Middleware to parse JSON request bodies
app.use(express.json());

// Start the server
app.listen(port, () => console.log(`Listening on port ${port}`));

// Route to retrieve all candidates from the database
app.get('/', async (request, response) => {
    try {
        // Connect to MongoDB
        await client.connect();
        // Fetch all candidates, sorted by name
        const candidates = await client.db("voting").collection("candidates")
            .find().sort({ name: 1 })
            .toArray();
        // Send the candidates as a response
        response.send(candidates);
    } catch (error) {
        console.error(error);
        response.status(500).send({ error: 'Failed to get candidates' });
    } finally {
        // Close MongoDB connection
        await client.close();
    }
});

// Route to retrieve candidates along with their vote counts
app.get('/ballots', async (request, response) => {
    try {
        // Connect to MongoDB
        await client.connect();
        // Access the database and collections
        const database = client.db("voting");
        const candidatesCollection = database.collection("candidates");
        const votersCollection = database.collection("voters");

        // Fetch all candidates
        const candidates = await candidatesCollection.find().toArray();

        // Calculate and add vote counts for each candidate
        for (let candidate of candidates) {
            const voteCount = await votersCollection.countDocuments({ "ballot.name": candidate.name });
            candidate.voteCount = voteCount;
        }
        // Send the updated candidate list as a response
        response.send(candidates);
    } catch (error) {
        console.error(error);
        response.status(500).send({ error: 'Failed to get candidates with ballots' });
    } finally {
        // Close MongoDB connection
        await client.close();
    }
});

