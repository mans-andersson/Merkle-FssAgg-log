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
    return res.status(200).send('Entry added successfully: ' + log.getRoot().toString('hex'))
});

app.post('/addEntryAndGetProof', (req, res) => {
    const entry = JSON.stringify(req.body);
    const [root, proof] = log.addEntryAndGetProof(entry);
    console.log('Entry added successfully:', entry, 'root:', root.toString('hex'));
    console.log('Membership proof:', proof);
    return res.status(200).send(
        `Entry added successfully\n
        root: ${root.toString('hex')}\n
        proof: ${JSON.stringify(proof)}\n`
    )
});

app.get('/getEntry', (req, res) => {
    const index = req.query.index;
    const entry = log.getEntry(index);
    res.status(200).send(
        `Entry at index ${index}: ${JSON.stringify(entry)}`);
});

app.get('/getEntries', (req, res) => {
    const startIndex = req.query.startIndex;
    const endIndex = req.query.endIndex;
    const entries = log.getEntries(endIndex);
    res.status(200).send(
        `Entries at indices [${startIndex}, ${endIndex}): ${JSON.stringify(entries)}`);
});

app.listen(process.env.PORT, () =>
  console.log(`Example app listening on port ${process.env.PORT}!`),
);