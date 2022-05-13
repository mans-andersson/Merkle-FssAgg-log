const { Log } = require('./Log');
const Client = require('./Client');
const { performance } = require('perf_hooks');
const repetitions = 100;

const log = new Log();
log.initFssAggMAC('pw', 'initMsg');
let numElements = 10000;

for (let index = 0; index < numElements; index++) {
    log.addEntry(JSON.stringify({a: index}));
}

console.log('Log complete');
let totalTime = 0;
let startTime = 0;
let endTime = 0;
let entries = log.getEntries(0);
const [mac, _] = log.getFssAggMAC();
for (let index = 0; index < repetitions; index++) {
    startTime = performance.now();
    Client.verifyFssAggMAC(mac, entries, 'pw');
    endTime = performance.now();
    totalTime += (endTime - startTime);
}

console.log(`Time: ${totalTime / repetitions}`);
console.log(log.getEntries(0));