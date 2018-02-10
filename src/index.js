//-----------------------------------------------------
//
// Author: Daeren
// Site: 666.io
//
//-----------------------------------------------------

const client = require("./client");

const polling = require("./polling");
const download = require("./download");
const entities = require("./entities");
const markup = require("./markup");

//-----------------------------------------------------

client.polling = polling;
client.download = download;
client.entities = entities;
client.markup = markup;

//-----------------------------------------------------

module.exports = client;