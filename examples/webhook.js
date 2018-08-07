const tgb = require("../index");


const bot = tgb(process.env.TELEGRAM_BOT_TOKEN);

bot.proxy = "127.0.0.1:8080"; // Only HTTPS
	
//-----------------------------------------------------

void async function() {
	const res = await bot.setWebhook({url: "db.gg"});
	console.log(res);
}();