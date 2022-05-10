const { MerkleTree } = require('merkletreejs')
const SHA256 = require('crypto-js/sha256')
const crypto = require('crypto');
const fssagg = require('./FssAggMAC');

class Log {
    constructor(privateKey = undefined) {
        this.tree = new MerkleTree([], SHA256);
        this.dataStorage = [];
        this.numEntries = 0;
        if (privateKey) {
            this.signingEnabled = true;
            this.privateKey = privateKey;
        }
    }

    /**
     * Creates a new FssAggMAC on the log
     * @param {string} initialSecret the initial secret key sk_0
     * @param {string} initialMessage an init message, should contain info about the MAC being initialized
     * @returns index of the first entry that is validated by the new FssAggMAC
     */
    initFssAggMAC(initialSecret, initialMessage) {
        this.fssAggMAC = new fssagg.FssAggMAC(initialSecret);
        const index = this.numEntries;
        this.addEntry(initialMessage);
        return index;
    }

    /**
     * 
     * @returns the current FssAgg MAC and the number of evolvements
     */
    getFssAggMAC() {
        return this.fssAggMAC.getMACAndNumEvolvements();
    }

    /**
     * Adds a new log entry in the data storage and the merkle tree
     * @param {string} entry 
     * @returns The new tree root
     */
    addEntry(entry) {
        this.tree.addLeaf(SHA256(entry));
        if (this.fssAggMAC) {
            this.fssAggMAC.aSig(entry);
        }
        this.dataStorage.push(entry);
        this.numEntries++;
        this.computeCommitment();
        return this.currentCommitment;
    }

    /**
     * Computes and updates this.commitment based on the private key,
     * the current root and number of entries added to the log
     * @returns the updated commitment
     */
    computeCommitment() {
        let root = this.tree.getRoot().toString('hex');
        let index = this.numEntries;
        let commitment = {root: root, index: index};
        if (this.signingEnabled) {
            const sign = crypto.createSign('SHA256');
            sign.write(root + index);
            sign.end();
            const signature = sign.sign(this.privateKey, 'hex');
            commitment['signature'] = signature;
        }
        this.currentCommitment = commitment;
        return commitment;
    }

    /**
     * @returns the current commitment (if signing is enabled, otherwise undefined)
     */
    getCommitment() {
        return this.currentCommitment;
    }

    /**
     * Get a membership proof for an entry
     * @param {string} entry 
     * @returns A membership proof for the specified entry and the latest root hash, [proof, root]
     */
    getProofByEntry(entry) {
        const leaf = SHA256(entry);
        return this.tree.getProof(leaf);
    }

    /**
     * Get a membership proof for the entry at the specified index
     * @param {int} index 
     * @returns A membership proof for the entry at the specified index and the latest root hash, [proof, root]
     */
    getProofByIndex(index) {
        const leaf = this.tree.getLeaf(index);
        return this.tree.getProof(leaf, index);
    }

    /**
     * Get the entry at the specified index
     * @param {int} index 
     * @returns Log entry from index
     */
    getEntry(index) {
        return this.dataStorage[index];
    }

    /**
     * Get a range of log entries from startIndex (inclusive) to endIndex (exclusive)
     * If endIndex is not defined all elements from startIndex to the end of the log are returned
     * @param {int} startIndex 
     * @param {int} (optional) endIndex 
     * @returns An array of log entries
     */
    getEntries(startIndex, endIndex = undefined) {
        if (endIndex) {
            return this.dataStorage.slice(startIndex, endIndex);
        } else {
            return this.dataStorage.slice(startIndex);
        }
    }

    /**
     * Get the leaf at the specified index in the merkle tree
     * @param {int} index 
     * @returns A leaf of the merkle tree
     */
    getLeaf(index) {
        return this.tree.getLeaf(index);
    }

    /**
     * Get the current root hash
     * @returns Root hash
     */
    getRoot() {
        return this.tree.getRoot();
    }

    /**
     * Add a new entry and get a membership proof for the just added entry,
     * also returns the newly generated commitment
     * @param {string} entry 
     * @returns [commitment, proof]
     */
    addEntryAndGetProof(entry) {
        const commitment = this.addEntry(entry);
        const proof = this.getProofByEntry(entry);
        return [commitment, proof];
    }
}

module.exports = { Log };