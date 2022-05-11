const { Log } = require('./Log');
const { performance } = require('perf_hooks');
const repetitions = 10000;

const log = new Log();
log.initFssAggMAC('pw', 'initMsg');

let totalTime = 0;
let startTime = 0;
let endTime = 0;
for (let index = 0; index < repetitions; index++) {
    startTime = performance.now();
    log.addEntry(JSON.stringify({a: index}));
    endTime = performance.now();
    totalTime += (endTime - startTime);
}

console.log(`Time: ${totalTime / repetitions}`);
console.log(log.getEntries(0));