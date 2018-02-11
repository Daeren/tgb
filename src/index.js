//-----------------------------------------------------
//
// Author: Daeren
// Site: 666.io
//
//-----------------------------------------------------

const client = require("./client");

const webhook = require("./webhook");
const polling = require("./polling");
const spy = require("./spy");

const download = require("./download");

const entities = require("./entities");
const markup = require("./markup");

//-----------------------------------------------------

client.webhook = webhook;
client.polling = polling;
client.spy = spy;

client.download = download;

client.entities = entities;
client.markup = markup;

//-----------------------------------------------------

module.exports = client;