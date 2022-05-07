/**
 * Provides functionality for interacting with the logger
 */

const axios = require('axios');
const { MerkleTree } = require('merkletreejs')
const FssAggMAC = require('./FssAggMAC');
const SHA256 = require('crypto-js/sha256');
require('dotenv').config()

/**
 * Adds an entry to the log
 * @param {string} data 
 * @returns The resulting promise from the API call
 */
async function addEntry(data) {
    const res = await axios.post(`${process.env.LOGGER_URL}/addEntry`, data);
    console.log(res.data);
    return res;
}

/**
 * Get membership proof for entry at position index
 * @param {int} index 
 * @returns The resulting promise from the API call
 */
async function getProofByIndex(index) {
    const res = await axios.get(`${process.env.LOGGER_URL}/getProofByIndex`, {
        params: {
            index: index
        }
    });
    console.log(res.data);
    return res;
}

/**
 * Get membership proof for specified entry
 * @param {string} entry 
 * @returns The resulting promise from the API call
 */
async function getProofByEntry(entry) {
    const res = await axios.get(`${process.env.LOGGER_URL}/getProofByEntry`, {
        params: {
            entry: entry
        }
    });
    console.log(res.data);
    return res;
}

/**
 * Adds an entry to the log and requests a membership proof for that entry
 * @param {string} data 
 * @returns The resulting promise from the API call
 */
async function addEntryAndGetProof(data) {
    const res = await axios.post(`${process.env.LOGGER_URL}/addEntryAndGetProof`, data);
    console.log(res.data);
    return res;
}

/**
 * Requests the log entry at the specified index
 * @param {int} index 
 * @returns The resulting promise from the API call
 */
async function getEntry(index) {
    const res = await axios.get(`${process.env.LOGGER_URL}/getEntry`, {
        params: {
            index: index
        }
    });
    console.log(res.data);
    return res;
}

/**
 * Requests the log entries from startIndex to endIndex,
 * endIndex is optional, if omitted the maximum number of entries are returned
 * @param {int} startIndex 
 * @param {int} endIndex 
 * @returns The resulting promise from the API call
 */
async function getEntries(startIndex, endIndex = undefined) {
    const res = await axios.get(`${process.env.LOGGER_URL}/getEntries`, {
        params: {
            startIndex: startIndex,
            endIndex: endIndex 
        }
    });
    console.log(res.data);
    return res;
}

/**
 * Initializes a new FssAgg MAC on the logger
 * @param {string} secretKey 
 * @returns The resulting promise from the API call
 */
async function initializeFssAggMAC(secretKey) {
    const res = await axios.post(`${process.env.LOGGER_URL}/initializeFssAggMAC`, 
        {key: secretKey}
    );
    console.log(res.data);
    return res;
}

/**
 * Requests the current FssAgg MAC from the logger
 * @returns The resulting promise from the API call
 */
async function getFssAggMAC() {
    const res = await axios.get(`${process.env.LOGGER_URL}/getFssAggMAC`);
    console.log(res.data);
    return res;
}

/**
 * Request the current root hash from the logger
 * @returns The resulting promise from the API call
 */
async function getRoot() {
    const res = await axios.get(`${process.env.LOGGER_URL}/getRoot`);
    console.log(res.data);
    return res;
}

/**
 * Converts a proof JSON string received from the logger
 * to a valid merkletreejs proof
 * @param {string} proofJSONString 
 * @returns a merkle tree proof
 */
function proofJSONtoMerkleProof(proofJSONString) {
    let proof = JSON.parse(proofJSONString);
    proof = proof.map(e => {return { position: e.position, data: Buffer.from(e.data)} });
    return proof;
}

/**
 * Checks a merkle tree membership proof for the specified
 * root, entry and proof string
 * @param {string} root 
 * @param {string} entry 
 * @param {string} proofJSONString 
 * @returns result of proof check (boolean)
 */
function verifyProof(root, entry, proofJSONString) {
    const tree = new MerkleTree([], SHA256);
    const entryHash = SHA256(entry).toString();
    const proof = proofJSONtoMerkleProof(proofJSONString);
    return tree.verify(proof, entryHash, root);
}

/**
 * Check if an FssAgg MAC verifies a list of entries with an initial secret
 * Optionally specify an FssAggMAC to start from
 * @param {string} MAC
 * @param {[string]} entries
 * @param {string} secret
 * @param {string} startingMAC (optional)
 * @returns FssAggMAC valid status (boolean)
 */
function verifyFssAggMAC(MAC, entries, secret, startingMAC = undefined) {
    return FssAggMAC.verifyFssAggMAC(MAC, entries, secret, startingMAC);
}

module.exports = { 
    addEntry, 
    getProofByIndex,
    getProofByEntry,
    addEntryAndGetProof, 
    getEntry,
    getEntries,
    initializeFssAggMAC,
    getFssAggMAC,
    getRoot,
    verifyProof,
    verifyFssAggMAC
 };