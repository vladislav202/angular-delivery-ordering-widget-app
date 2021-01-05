const fs = require('fs');
const path = require('path');
const graphQL = require('graphql');

const distDirectory = path.join(__dirname, '..', '/dist');
let schemaPath = path.join(distDirectory, 'schema.graphql');
let introspectionSchemaPath = path.join(distDirectory, 'schema.json');

const schema = fs.readFileSync(schemaPath, 'utf8');
const introspectionSchema = JSON.parse(fs.readFileSync(introspectionSchemaPath, 'utf8'));

console.log("Trying to build server schema from " + schemaPath);
graphQL.buildSchema(schema);
console.log("Successfully built schema for server!");

console.log("Trying to build client schema from " + introspectionSchemaPath);
graphQL.buildClientSchema(introspectionSchema);
console.log("Successfully built schema for client!");
