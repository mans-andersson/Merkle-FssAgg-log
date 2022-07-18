"use strict";

const { Log } = require('./Log');
const { performance } = require('perf_hooks');
const fs = require('fs');
const crypto = require('crypto');
const numEntires = 4000000;
const repetitions = 1;


let results = []
let totalTime = 0;
let startTime = 0;
let endTime = 0;
const privateKey = crypto.createPrivateKey(fs.readFileSync('priv_ecc_233.pem'));
console.log(JSON.stringify(privateKey));

for (let reps = 0; reps < repetitions; reps++) {
    // global.gc();
    let log = new Log(privateKey);
    // const log = new Log();
    // log.initFssAggMAC('pw', 'initMsg');
    totalTime = 0;
    for (let index = 0; index < numEntires; index++) {
        if (index % 10000 === 0) {
            console.log(index);
        }
        startTime = performance.now();
        log.addEntry(JSON.stringify({a: index}));
        endTime = performance.now();
        totalTime += (endTime - startTime);
    }
    results.push(totalTime / numEntires);
}
console.log(`Times: ${results}`);
const timeSum = results.reduce((a, b) => a + b, 0);
console.log(`Time: ${timeSum/ repetitions}`);

// console.log(log.getEntries(0));