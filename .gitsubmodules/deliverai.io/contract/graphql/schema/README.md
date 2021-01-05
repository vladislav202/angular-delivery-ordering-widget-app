DeliveryAI :: Contract :: GraphQL :: Schema
===

## Introduction

**GraphQL** is a query language for APIs and a runtime for fulfilling those queries with your existing data. 
GraphQL provides a complete and understandable description of the data in your API, gives clients the power 
to ask for exactly what they need and nothing more, makes it easier to evolve APIs over time, and enables powerful 
developer tools. Read more about GraphQL [here](https://graphql.org/).

By using a GraphQL schema, the contract between frontend and backend is elevated to a first class citizen.

## Getting started

These are initial steps you need run to setup project locally:

1) `git clone %{project_path}`
2) `yarn install`

### Schema

- To generate complete GraphQL schema run the following command: 
  ```bash 
  yarn schema:generate
  ```

-  To validate built schema run the following command:
   ```bash
   yarn schema:validate
   ```

### Voyager

To start [Voyager](https://github.com/APIs-guru/graphql-voyager) run the following command: 
```bash 
yarn graphql:voyager
```

## Developer verification

Signing Git commits is important because in this age of malicious code and back doors, 
it helps protect you from an attacker who might otherwise inject malicious code into your codebase.
Why it is important you can continue read [here](https://www.linuxjournal.com/content/signing-git-commits).

We require our developers to use [GPG keys](https://wikipedia.org/wiki/GnuPG) to sign commits.
Please, read and follow instructions listed [here](https://gitlab.com/help/user/project/repository/gpg_signed_commits/index.md).


