# README

## API
- addEntry
- getMembershipProof
- addEntryAndGetMembershipProof
- getEntry
- getEntries
- getFssAggMAC

## Example
To add an entry: 
`curl -X POST -H "Content-Type:application/json" http://localhost:8080/addEntry -d '{"status":"SUCCES", "event":"Certificate issued"}'`