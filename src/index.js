//-----------------------------------------------------
//
// Author: Daeren
// Site: 666.io
//
//-----------------------------------------------------

const client = require("./client");

const polling = require("./polling");
const download = require("./download");

//-----------------------------------------------------

client.polling = polling;
client.download = download;

//-----------------------------------------------------

module.exports = client;