const { Log } = require('./Log');
const express = require('express');
require('dotenv').config()

const log = new Log();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/*', (req, _, next) => {
    console.log('Incoming request to:', req.originalUrl);
    next();
});

/**
 * Endpoints for adding new log entry
 * Post request, expects entry data as post request body
 * The log entry is expected to be in JSON format
 * Responds with new merkle tree root upon succesful entry addition (as a JSON string)
 */
app.post('/addEntry', (req, res) => {
    const entry = JSON.stringify(req.body);
    const root = log.addEntry(entry);
    console.log('Entry added successfully:', entry, 'root:', root.toString('hex'));
    return res.status(200).send(
        JSON.stringify({
            root: root.toString('hex')}));
});

/**
 * Endpoints for getting a membership proof for entry at specified index
 * Expects index (integer) as a http query parameter
 * Responds with the index and the generated membership proof (as a JSON string)
 */
app.get('/getProofByIndex', (req, res) => {
    const index = req.query.index;
    const proof = log.getProofByIndex(index);
    console.log(`Proof for entry ${index}: ${proof}`);
    return res.status(200).send(
        JSON.stringify({
            index: index,
            proof: JSON.stringify(proof)
    }));
})

/**
 * Endpoint for getting a membership proof for the specified entry
 * Expects the entry (string) as a http query parameter
 * Responds with the entry itself and the generated membership proof (as a JSON string)
 */
app.get('/getProofByEntry', (req, res) => {
    const entry = req.query.entry;
    const proof = log.getProofByEntry(entry);
    return res.status(200).send(
        JSON.stringify({
            entry: entry,
            proof: JSON.stringify(proof)
    }));
})

/**
 * Endpoint for adding a new entry and requesting a membership proof for it
 * Expects the entry (string) as the body of the POST request
 * The log entry is expected to be in JSON format
 * Responnds with the root of the updated merkle tree and the membership proof (as a JSON string)
 */
app.post('/addEntryAndGetProof', (req, res) => {
    const entry = JSON.stringify(req.body);
    const [root, proof] = log.addEntryAndGetProof(entry);
    console.log('Entry added successfully:', entry, 'root:', root.toString('hex'));
    console.log('Membership proof:', proof);
    return res.status(200).send(
        JSON.stringify({
            root: root.toString('hex'),
            proof: JSON.stringify(proof)
    }));
});

/**
 * Endpoint for retrieving an entry at a specified index
 * Expects the index (integer) as a http query parameter
 * Responds with the index and the entry at that position (as a JSON string)
 */
app.get('/getEntry', (req, res) => {
    const index = req.query.index;
    const entry = log.getEntry(index);
    return res.status(200).send(
        JSON.stringify({
            index: index,
            entry: entry
    }));
});

/**
 * Endpoint for retrieving a a slice of the log entries, from startIndex to endIndex
 * Expects startIndex and endIndex (integer) as http query parameters
 * If endIndex is undefined entries from startIndex to the end of the log will be returned
 * Responds with the specified startIndex, endIndex and the entries (as a JSON string)
 */
app.get('/getEntries', (req, res) => {
    const startIndex = req.query.startIndex;
    const endIndex = req.query.endIndex;
    const entries = log.getEntries(startIndex, endIndex);
    return res.status(200).send(
        JSON.stringify({
            startIndex: startIndex,
            endIndex: endIndex,
            entries: entries
    }));
});

/**
 * Endpoint for retrieving the most recent merkle tree root hash from the log
 * Responds with the root hash (as a JSON string)
 */
app.get('/getRoot', (req, res) => {
    const root = log.getRoot().toString('hex');
    return res.status(200).send(
        JSON.stringify({
            root: root
    }));
})

/**
 * Endpoint for initializing a new FssAgg MAC on the log
 * Responds with the status and the index of the first entry that is verified by the FssAgg MAC
 */
app.post('/initializeFssAggMAC', (req, res) => {
    const key = req.body.key;
    const startIndex = log.initFssAggMAC(key, 'FssAggMAC initialized');
    return res.status(200).send(
        JSON.stringify({
            status: "success",
            startIndex: startIndex
    }));
});

/**
 * Endpoint for retrieving the current FssAgg MAC from the log
 * Responds with the current FssAgg MAC and its number of evolvements (as a JSON string)
 */
app.get('/getFssAggMAC', (req, res) => {
    const [MAC, numEvolvements] = log.getFssAggMAC();
    console.log(MAC, numEvolvements);
    return res.status(200).send(
        JSON.stringify({
            fssAggMAC: MAC,
            numEvolvements: numEvolvements
    }));
});

app.listen(process.env.LOGGER_PORT, () =>
  console.log(`Example app listening on port ${process.env.LOGGER_PORT}!`),
);