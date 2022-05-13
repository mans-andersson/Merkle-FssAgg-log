const { Log } = require('./Log');
const Client = require('./Client');
const { performance } = require('perf_hooks');
const { default: MerkleTree } = require('merkletreejs');
const SHA256 = require('crypto-js/sha256');
const repetitions = 100;

const log = new Log();
let numElements = 1000000;

let entryList = [];
for (let index = 0; index < numElements; index++) {
    entryList.push(JSON.stringify({a: index}));
}
log.tree = new MerkleTree(entryList.map(x => SHA256(x)), SHA256);
log.dataStorage = entryList;
log.numEntries = entryList.length;
log.computeCommitment();
console.log('Log ready');

const root = log.getRoot().toString('hex');
let totalTime = 0;
let startTime = 0;
let endTime = 0;
for (let index = 0; index < repetitions; index++) {
    let randomIndex = Math.floor(Math.random() * numElements);
    let proof = log.getProofByIndex(randomIndex);
    let leaf = SHA256(log.getEntry(randomIndex));
    startTime = performance.now();
    MerkleTree.verify(proof, leaf, root);
    endTime = performance.now();
    totalTime += (endTime - startTime);
}

console.log(`Time: ${totalTime / repetitions}`);
console.log(log.getEntries(0));