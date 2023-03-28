# Avascan coding challenge

<p align="center">
  <a href="https://avascan.info/" target="blank"><img src="https://avascan.info/cdn/avascan-summary.png" width="120" alt="Nest Logo" /></a>
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Context

This project consists of two parts, an Indexer and an API. The Indexer is a process written in TypeScript that keeps an appropriate database updated with transactions from the last 10,000 c-chain blocks. The API is also an application written in TypeScript and NestJS that provides several endpoints for querying the transactions stored in the database.

## Objective

The goal is to demonstrate real-time transactions indexing for the Avalanche C-Chain blockchain and develop a performant API that can handle requests for transaction data. The indexer is able to retrieve transactions from the last 10,000 c-chain blocks and store them in an appropriate database. The API provides endpoints that allow users to query transactions made or received by a specific address, the number of transactions made or received by a specific address, a list of transactions sorted by value, and a list of 100 addresses with the largest balance that made or received a transaction.

## Problems

- Ensuring that the indexer process is robust enough to handle network disruptions and API rate limits, which can lead to missed transactions and inconsistencies in the database.
- Implementing the sorting and filtering logic for the API endpoints efficiently, considering the potentially large number of transactions that may need to be processed.
- Ensuring that the API endpoints can handle a high volume of requests and are scalable for future growth.
- Replicating the database and the API on multiple servers without retrieving duplicate data, while maintaining data consistency and minimizing synchronization issues.

## Solutions

For the Indexer part of the technical test, I created a Node.js script using TypeScript to fetch the latest 10,000 c-chain blocks from the Avalanche blockchain using the Infura API. I then stored the transactions in a PostgreSQL database using MikroORM. To avoid retrieving duplicate blocks, I kept track of the blocks stored in the database by implementing a caching system with Redis.

For the API part of the technical test, I created a NestJS project using TypeScript and connected it to the PostgreSQL database using MikroORM. I implemented the required API endpoints using NestJS controllers and services. To retrieve transactions made or received from a certain address, I queried the database for transactions where the given address was either the sender or the receiver, and sorted them by blockNumber and transactionIndex. To retrieve the number of transactions made or received from a certain address, I counted the number of transactions where the given address was either the sender or the receiver. To retrieve the list of transactions sorted by value, I queried the database for transactions and sorted them by the amount of $AVAX moved. To retrieve the list of 100 addresses with the largest balance, I queried the database for unique addresses and sorted them by their balance. I used pagination to limit the number of results returned by the API.

To deploy the Indexer and API on a local Docker environment, I used Docker Compose to orchestrate the containers. The Docker Compose file included the necessary environment variables for connecting to the PostgreSQL database and the Infura API. I also created a script to run the Indexer and API simultaneously using Docker Compose.

## Tech stack

- NestJS, NodeJS, Typescript
- PostgreSQL, MikroORM, pgAdmin
- EthersJS - Alchemy
- CacheManager, Redis
- Docker, Docker Compose
- WebSocket
- Jest

I chose NestJS for this technical test because of its robustness, scalability, and its use of TypeScript, which provides improved type safety, code consistency, and code readability. It also offers a powerful dependency injection system and a modular architecture, making it easier to test and maintain the codebase.

I chose PostgreSQL and SQL for this test because of their proven reliability, transactional support, and strong consistency guarantees. Additionally, PostgreSQL offers features such as data replication, support for JSON data types, and robust indexing, which make it an ideal choice for storing large amounts of transactional data.

I chose to use Infura for this test because it provides a reliable and scalable infrastructure for accessing blockchain data via their JSON-RPC APIs, without the need to run a local node. Additionally, Infura does not have rate limits, making it easier to handle high volumes of data and ensuring reliable data retrieval for the application.

## Endpoints

### `GET http://localhost:3000/transactions?address={address}`

**Response:**

```ts
[
    {
        "id": 41,
        "blockNumber": 27974743,
        "index": 4,
        "hash": "0x0da6e2af2b8298c4e46a41e31cc34b473a1f10ff4df68c85ca4b79ef829d2afa",
        "type": 0,
        "to": "0xE3Ffc583dC176575eEA7FD9dF2A7c65F7E23f4C3",
        "from": "0xD0dB1f4BD228f09A5E0dBf72e90967ab25cF651b",
        "nonce": 8691,
        "gasLimit": "182651",
        "gasPrice": "28750000000",
        "data": "0x6d0ff4950000000000000000000000000000000000000000000000...",
        "value": "0",
        "chainId": "43114",
        "blockHash": "0x639c633618ac723a690f8fdc89c64719e5a2f08c50fd867a89a24cc5a6ad2dbf"
    }, ...
]
```

### `GET http://localhost:3000/transactions/count?address={address}`

**Response:**

```ts
{
    "sent": 0,
    "received": 49
}
```

### `http://localhost:3000/transactions/sorted?order={asc | desc}&page={page}&limit={limit}`

**Response:**

```ts
[
    {
        "id": 41,
        "blockNumber": 27974743,
        "index": 4,
        "hash": "0x0da6e2af2b8298c4e46a41e31cc34b473a1f10ff4df68c85ca4b79ef829d2afa",
        "type": 0,
        "to": "0xE3Ffc583dC176575eEA7FD9dF2A7c65F7E23f4C3",
        "from": "0xD0dB1f4BD228f09A5E0dBf72e90967ab25cF651b",
        "nonce": 8691,
        "gasLimit": "182651",
        "gasPrice": "28750000000",
        "data": "0x6d0ff4950000000000000000000000000000000000000000000000...",
        "value": "0",
        "chainId": "43114",
        "blockHash": "0x639c633618ac723a690f8fdc89c64719e5a2f08c50fd867a89a24cc5a6ad2dbf"
    }, ...
]
```

### `http://localhost:3000/transactions/top`

**Response:**

```ts
[
    {
        "address": "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
        "balance": "7248883382257743759916483"
    }, ...
]
```

## Configuration

- Clone the project

```bash
$ git clone https://github.com/fbenfraj/starton-challenge.git
```

- Create a `.env` at the root of the folder and enter the following variables:

```bash
INFURA_API_KEY=YOUR_INFURA_API_KEY
DB_LOGS_ON=1
POSTGRES_USER=myuser
POSTGRES_PASSWORD=mypassword
POSTGRES_DB=mydb
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
PGADMIN_DEFAULT_EMAIL=admin@example.com
PGADMIN_DEFAULT_PASSWORD=root
```

You can switch `DB_LOGS_ON` to disable database related logs (stored blocks and transactions events).

## Prerequisites

- Git
- NodeJS
- Docker

## Installation

```bash
$ npm install
```

## Running the app

```bash
$ docker-compose up -d
```

## Viewing data on pgAdmin

- Make sure the Docker container is running (see Running the app above)
- Go to `http://localhost:5050/`
- Log in with the credentials you setup in the `.env` file (`PGADMIN_DEFAULT_EMAIL` and `PGADMIN_DEFAULT_PASSWORD`)
- Once on the dashboard, click on "Add New Server"

  - Name: my-postgres
  - Connection tab > Host name: my-postgres
  - Username: $POSTGRES_USER
  - Password: $POSTGRES_PASSWORD

- Click on Save
- On the left pannel, navigate to my-postgres > mydb > Schemas > public > Tables
- Right click on the "block" table > View/Edit Data > All rows

## Test

```bash
# e2e tests
$ npm run test:e2e

# unit tests
$ npm run test
```

## Possible improvements

- Adding support for multiple blockchains and not only Avalanche can expand the application's user base and increase its adoption. This can involve designing a generic indexing engine that can work with any blockchain that provides a JSON-RPC API.
- Implementing authentication and authorization mechanisms can protect user data and prevent unauthorized access to sensitive information. This can involve using JWT tokens, OAuth2, or OpenID Connect to authenticate users and protect API endpoints.

## Stay in touch

- Author - [Ben Fraj Farouk](https://www.linkedin.com/in/farouk-benfraj/)
