const tgb = require("../index");

const bot = tgb(process.env.TELEGRAM_BOT_TOKEN);
const {polling, entities} = tgb;

//bot.proxy = "127.0.0.1:8080"; // Only HTTPS
	
//-----------------------------------------------------

polling(bot, function({message}) {
    bot.sendMessage([message.from.id, entities(message) || "empty"]);
}).catch(function(error) {
    if(error.code === tgb.ERR_INVALID_TOKEN) {
        this.stop();
        console.log("There's a problem with the token...");
    }
    else {
        delete error.response;
        console.log(error);
    }
});
