const { Log } = require('./Log');
const { performance } = require('perf_hooks');
const fs = require('fs');
const crypto = require('crypto');
const repetitions = 1000000;

const privateKey = crypto.createPrivateKey(fs.readFileSync('priv.pem'));
const log = new Log(privateKey);
// log.initFssAggMAC('pw', 'initMsg');

let totalTime = 0;
let startTime = 0;
let endTime = 0;
for (let index = 0; index < repetitions; index++) {
    if (index % 10000 === 0) {
        console.log(index);
    }
    startTime = performance.now();
    log.addEntry(JSON.stringify(index));
    endTime = performance.now();
    totalTime += (endTime - startTime);
}

console.log(`Time: ${totalTime / repetitions}`);
console.log(log.getEntries(0));