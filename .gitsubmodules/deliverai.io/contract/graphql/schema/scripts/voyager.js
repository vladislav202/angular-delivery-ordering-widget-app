const fs = require('fs');
const path = require('path');

const express = require('express');
const graphQL = require('graphql');

const graphQLMiddleware = require('express-graphql');
const voyagerMiddleware = require('graphql-voyager/middleware');

const distDirectory = path.join(__dirname, '..', '/dist');
let schemaPath = path.join(distDirectory, 'schema.graphql');

const app = express();

const graphQLEndpoint = '/graphql';
app.use(
  graphQLEndpoint,
  graphQLMiddleware({
    schema: graphQL.buildSchema(fs.readFileSync(schemaPath, 'utf8')),
    graphiql: true,
    pretty: true
  }),
);

const voyagerMiddlewareInstance = voyagerMiddleware.express({endpointUrl: graphQLEndpoint});
const voyagerEndpoint = '/voyager';
app.use('/', voyagerMiddlewareInstance);
app.use(voyagerEndpoint, voyagerMiddlewareInstance);

let port = 4000;
app.listen(port);
console.log(`Voyager is started! Open http://localhost:${port} or http://localhost:${port}${voyagerEndpoint}`);
console.log(`GraphiQL is available at http://localhost:${port}${graphQLEndpoint}`);
