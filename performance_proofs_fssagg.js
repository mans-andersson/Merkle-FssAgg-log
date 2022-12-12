const { Log } = require('./Log');
const Client = require('./Client');
const { performance } = require('perf_hooks');
const math = require('mathjs');
const repetitions = 31;
const ignoredReps = 1;

const log = new Log();
log.initFssAggMAC('pw', 'initMsg');
let numElements = 4000000;

for (let index = 0; index < numElements; index++) {
    log.addEntry(JSON.stringify({a: index}));
}

console.log('Log complete');
let results = [];
let startTime = 0;
let endTime = 0;
let entries = log.getEntries(0);
const [mac, _] = log.getFssAggMAC();
for (let index = 0; index < repetitions; index++) {
    startTime = performance.now();
    Client.verifyFssAggMAC(mac, entries, 'pw');
    endTime = performance.now();
    if (index > ignoredReps) {
        results.push(endTime - startTime);
    }
    console.log(index);
}

console.log(`Times: ${results}`);
const timeSum = results.reduce((a, b) => a + b, 0);
console.log(`Time: ${timeSum/ repetitions}`);
console.log(`Standard deviation: ${math.std(results)}`)
console.log(log.getEntries(0));