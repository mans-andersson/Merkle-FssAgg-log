const { MerkleTree } = require('merkletreejs')
const SHA256 = require('crypto-js/sha256')

class Log {
    constructor() {
        this.tree = new MerkleTree([], SHA256);
        this.dataStorage = [];
    }

    /**
     * Adds a new log entry in the data storage and the merkle tree
     * @param {string} entry 
     * @returns The new tree root
     */
    addEntry(entry) {
        this.tree.addLeaf(SHA256(entry));
        this.dataStorage.push(entry);
        return this.tree.getRoot();
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
     * @param {int} startIndex 
     * @param {int} endIndex 
     * @returns An array of log entries
     */
    getEntries(startIndex, endIndex) {
        return this.dataStorage.slice(startIndex, endIndex);
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
     * Add a new entry and get a membership proof for the just added entry, also returns the root hash
     * @param {string} entry 
     * @returns [root, proof]
     */
    addEntryAndGetProof(entry) {
        const root = this.addEntry(entry);
        const proof = this.getProofByEntry(entry);
        return [root, proof];
    }
}

module.exports = { Log };