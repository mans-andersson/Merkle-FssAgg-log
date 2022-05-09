# README
This repository contains a proof of concept implementation of the audit log system I propose in my Master thesis project. 
The design of the log is based on the [merkle tree log design](https://www.usenix.org/legacy/event/sec09/tech/full_papers/crosby.pdf) proposed by Crosby and Wallach in 2009.

This design also enables usage of FssAgg MACs as which is an aggregate MAC scheme that can be used to make truncation attacks detectable. The FssAgg MAC scheme was proposed in a [research paper](https://ieeexplore.ieee.org/abstract/document/4223216?casa_token=VHioHCEgJFsAAAAA:svs6xky26Yo3bZP9iFtZuiEzc-bZ2KK36D5LATgyT-7iaIEh6rMoscEFtMJamGrkobNaRw8O) by Ma and Tsudik.

## Logger
The logger functionality is defined in `Log.js`. To initialize a new log and start the http log server, run `node index.js`. The PORT for the server is defined in `.env`.

The server exposes the following API.
- `/addEntry`
- `/getProofByIndex`
- `/getProofByEntry`
- `/addEntryAndGetProof`
- `/getEntry`
- `/getEntries`
- `/getRoot`
- `/initializeFssAggMAC`
- `/getFssAggMAC`

## Interacting with the log
In `Client.js` functions are defined that a client or auditor can use to interact with the log. Since the log is available via http endpoints one could easily define similar functions in other languages as well. Below is an example of how one may interact with the logger.
The URL of the log server should be specified in `.env` using LOGGER_URL.

```javascript
const Client = require('./Client');
const FssAggMAC = require('./FssAggMAC');
await Client.addEntry({a: 1});
await Client.addEntry({b: 2});
await Client.addEntry({c: 3});
let res = await Client.getEntries(1);
// Should print [{b: 2}, {c: 3}]
console.log(res.data.entries);
res = await Client.addEntryAndGetProof({d: 4});
let root = res.data.root;
let proof = res.data.proof;
// Should print true
console.log(Client.verifyProof(root, JSON.stringify({d: 4}), proof));
// Should print false (wrong entry)
console.log(Client.verifyProof(root, JSON.stringify({bla: 4}), proof));
res = await Client.initializeFssAggMAC('secret_password1');
let macStartIndex = res.data.startIndex;
await Client.addEntry({e: 5});
await Client.addEntry({f: 6});
await Client.addEntry({g: 7});
res = await Client.getFssAggMAC();
let currentMAC = res.data.fssAggMAC;
let numEvolvements = res.data.numEvolvements;
res = await Client.getEntries(macStartIndex);
let entries = res.data.entries;
// Should print true
console.log(Client.verifyFssAggMAC(currentMAC, entries, 'secret_password1'));
// Should print false
console.log(Client.verifyFssAggMAC(currentMAC, entries, 'blabla'));
// Example of verifying new FssAgg MAC based on a previously verified FssAgg MAC
await Client.addEntry({h: 8});
await Client.addEntry({i: 9});
await Client.addEntry({j: 10});
let prevMAC = currentMAC;
let prevNumEvolvements = numEvolvements;
res = await Client.getFssAggMAC();
currentMAC = res.data.fssAggMAC;
numEvolvements = res.data.numEvolvements;
// Retrieve the entries that has been added since the last FssAgg MAC verification
res = await Client.getEntries(macStartIndex + prevNumEvolvements);
entries = res.data.entries;
// Should print true
console.log(
    Client.verifyFssAggMAC(currentMAC,
        entries,
        FssAggMAC.evolveKey('secret_password1', prevNumEvolvements),
        prevMAC));
```
