const { Log } = require('./Log');
const Client = require('./Client');
const { performance } = require('perf_hooks');
const { default: MerkleTree } = require('merkletreejs');
const SHA256 = require('crypto-js/sha256');
const { start } = require('repl');
const math = require('mathjs');
const repetitions = 150;
const skippedEarlyReps = 50;
let numElements = 100000;

%NeverOptimizeFunction(main);

function main() {
    const log = new Log();
    for (let index = 0; index < numElements; index++) {
        log.addEntry(JSON.stringify({a: index}));
    }
    const root = log.getRoot().toString('hex');

    let results = [];
    let startTime = 0;
    let endTime = 0;
    for (let index = 0; index < repetitions; index++) {
        let randomIndex = 1;
        startTime = performance.now();
        let proof = log.getProofByIndex(randomIndex);
        endTime = performance.now();
        // let leaf = SHA256(log.getEntry(randomIndex));
        // MerkleTree.verify(proof, leaf, root);
        if (index >= skippedEarlyReps) {
            results.push(endTime - startTime);
        }
    }
    console.log(`Times: ${results}`);
    console.log(`Results size ${results.length}`)
    const timeSum = results.reduce((a, b) => a + b, 0);
    console.log(`Time: ${timeSum/ (repetitions - skippedEarlyReps)}`);
    console.log(`Standard deviation: ${math.std(results)}`)
}

main();