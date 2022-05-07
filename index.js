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

app.post('/addEntry', (req, res) => {
    const entry = JSON.stringify(req.body);
    const root = log.addEntry(entry);
    console.log('Entry added successfully:', entry, 'root:', root.toString('hex'));
    return res.status(200).send(
        JSON.stringify({
            root: root.toString('hex')}));
});

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

app.get('/getProofByEntry', (req, res) => {
    const entry = req.query.entry;
    const proof = log.getProofByEntry(entry);
    return res.status(200).send(
        JSON.stringify({
            entry: entry,
            proof: JSON.stringify(proof)
    }));
})

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

app.get('/getEntry', (req, res) => {
    const index = req.query.index;
    const entry = log.getEntry(index);
    return res.status(200).send(
        JSON.stringify({
            index: index,
            entry: entry
    }));
});

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

app.get('/getRoot', (req, res) => {
    const root = log.getRoot().toString('hex');
    return res.status(200).send(
        JSON.stringify({
            root: root
    }));
})

app.post('/initializeFssAggMAC', (req, res) => {
    const key = req.body.key;
    const startIndex = log.initFssAggMAC(key, 'FssAggMAC initialized');
    return res.status(200).send(
        JSON.stringify({
            status: "success",
            startIndex: startIndex
    }));
});

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