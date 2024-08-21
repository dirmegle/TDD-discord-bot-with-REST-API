# TDD Discord bot with REST API

## Description

REST API that wraps a database, performs CRUD operations and interacts with a discord server to send automated messages using a discord bot.

## Setup

For the project to work properly on your local machine, these environmental variables must be set up:

- DATABASE_URL - path to your database
- DISCORD_BOT_ID - unique ID for your discord bot
- DISCORD_GUILD_ID - unique ID for your server guild
- WD_CHANNEL_ID - discord channel ID for web development achievements channel
- DA_CHANNEL_ID - discord channel ID for data analytics achievements channel
- DS_CHANNEL_ID - discord channel ID for data science achievements channel
- DE_CHANNEL_ID - discord channel ID for data engineering achievements channel
- GENERAL_CHANNEL_ID - discord channel id for general achievements channel
- GIPHY_API_KEY - unique API key for giphy GIFs

## Supported endpoints and usage

- POST /messages - sends a congratulatory message to a user on Discord. Sprint code and username in the request body required, template id - optional.
- GET /messages - get a list of all congratulatory messages
- GET /messages?username={username} - get a list of all congratulatory messages for a specific user
- GET /messages?sprint={sprintCode} - get a list of all congratulatory messages for a specific sprint
- CRUD /templates - POST/GET/PATCH/DELETE endpoints for managing congratulatory message templates.
- CRUD /sprints - POST/GET/PATCH/DELETE endpoints for managing sprints

## Migrations

Before running the migrations, we need to create a database. We can do this by running the following command:

```bash
npm run migrate:latest
```

## Running the server

In development mode:

```bash
npm run dev
```

In production mode:

```bash
npm run start
```

## Updating types

If you make changes to the database schema, you will need to update the types. You can do this by running the following command:

```bash
npm run gen:types
```

## Creating migration file with timestamp

```bash
npm run create-migration migrationName
```
