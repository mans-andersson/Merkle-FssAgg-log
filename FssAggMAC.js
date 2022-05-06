const crypto    = require('crypto');
const SHA256 = require('crypto-js/sha256')

class FssAggMAC {
    constructor(secretKey) {
        this.currentSecret = secretKey;
        this.aggregateMAC = '';
        this.numEvolvements = 0;
    }
    /**
     * Updates the FssAgg MAC based on a new message
     * @param {string} message 
     */
    aSig(message) {
        const individualMAC = crypto.createHmac('sha256', this.currentSecret)
            .update(message)
            .digest('hex');
        this.aggregateMAC = SHA256(individualMAC + this.aggregateMAC).toString();
        // Key update
        this.currentSecret = SHA256(this.currentSecret).toString();
        this.numEvolvements++;
    }

    /**
     * 
     * @returns the FssAgg MAC
     */
    getMAC() {
        return this.aggregateMAC;
    }

    /**
     * 
     * @returns the number of evolvements of the FssAggMAC
     */
    getNumEvolvements() {
        return this.numEvolvements;
    }
}

/**
 * Checks if a FssAgg MAC is valid for a list of messages
 * @param {string} MAC The FssAgg MAC to verify
 * @param {[string]} messages The list of messages that the FssAgg MAC (allegedly) verifies
 * @param {string} initialSecret The initial secret for the FssAgg MAC (sk_0)
 * @param {string} startingMAC (optional) If you want to start from a previously computed FssAgg MAC
 * @returns 
 */
const verifyFssAggMAC = (MAC, messages, initialSecret, startingMAC = undefined) => {
    let currentMAC = startingMAC ? startingMAC : '';
    let secret = initialSecret;
    for (let index = 0; index < messages.length; index++) {
        const msg = messages[index];
        const individualMAC = crypto.createHmac('sha256', secret)
            .update(msg)
            .digest('hex');
        currentMAC = SHA256(individualMAC + currentMAC).toString();
        secret = SHA256(secret).toString();
    }
    if (currentMAC === MAC) {
        return true;
    } else {
        return false;
    }
};

/**
 * Evolves a key a specified number of steps
 * Example: you have secret key sk_0 and want to compute sk_i, run evolveKey(sk_0, i)
 * @param {string} initialSecret 
 * @param {string} numEvolvements 
 * @returns 
 */
const evolveKey = (initialSecret, numEvolvements) => {
    let secret = initialSecret; 
    for (let index = 0; index < numEvolvements; index++) {
        secret = SHA256(secret).toString();
    }
    return secret;
}

module.exports = { FssAggMAC, verifyFssAggMAC, evolveKey };
