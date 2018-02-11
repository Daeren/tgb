[![Codacy][cod_b]][cod_l]
[![Bot API](https://img.shields.io/badge/Bot%20API-v.3.5-blue.svg)](https://core.telegram.org/bots/api)


```js
npm -g install tgb
git clone https://github.com/Daeren/tgb.git
```


```js
await require("tgb")("T", "sendmessage", [0, "+"], proxy)
await require("tgb").sendMessage("T", {chat_id: 0, text: "+"}, proxy)
```

```js
> tgb-cli --polling TOKEN --echo -j
```


* [WebHook](#refWebHook): +
* [Spy](#refSpy): +
* [Download](#refDownload): +
* [Proxy](#refProxy): +
* [File as Buffer](#refSendFileAsBuffer): +
* [Abort/Pause](#refReqAbort): +
* [TgUpload](#refTgUpload): +
* [Markup](#refMarkup): +
* [Extensibility](#refExtensibility): +
* [CLI](#refCLI): +
* Entities: +
* Redirect: +
* HashTable, Array and [Map][10] as a data source: +
* Without Dependencies: +


```js
const tgb = require("tgb");

const bot = tgb(process.env.TELEGRAM_BOT_TOKEN);
const {polling, entities} = tgb;

//-----------------------------------------------------

polling(
    bot.token,
    function({message}) {
        bot.sendMessage([message.from.id, entities(message)]);
    })
    .catch(function(error) {
        if(error.code === bot.ERR_INVALID_TOKEN) {
            this.stop(); // ~ this.start()
            console.log("There's a problem with the token...");
        }
        else {
            delete error.response;
            console.log(error);
        }
    });

// send: tg @gamebot /start x http://db.gg
// https://core.telegram.org/bots/api#messageentity
```


<a name="refWebHook"></a>
#### WebHook

```js
const tgb = require("tgb");

const bot = tgb(process.env.TELEGRAM_BOT_TOKEN);
const {webhook} = tgb;

//-----------------------------------------------------

void async function NGINX() {
    const wh = await webhook({host: "localhost", port: 1490});
    const url = await wh.bind(bot, "db.gg:88/custom", ({message}) => {});
}();

void async function HTTPS() {
    const wh = (await webhook(8443, {
        "ssl": {
            "key": "./db.gg.key",
            "cert": "./db.gg.crt"
        }
    })).catch(function(error) {});  // srv|cl errors

    const url = await wh.bind(bot, "db.gg", function({message}, bot) {
        this.sendMessage([message.from.id, `Hi: ${message.text}`]);
    });

    // url = https://db.gg:8443/tg_bot_<sha256(token)>
}();


// wh = await webhook(1490); // *:1490
// wh = await webhook({host: "localhost", port: 1490});

// url = await wh.bind(otherBot, "666.io:88", cb); // with api.setWebhook
// wh = wh.set(otherBot2, url, cb);                // without api.setWebhook

// url = await wh.unbind(otherBot);                // with api.deleteWebhook
// wh = wh.delete(otherBot2);                      // without api.deleteWebhook

// await wh.close();


// wh.bind(bot, options[url|objOpt.setWebhook], onMessage)
// wh.unbind(bot)
// wh.set(bot, url, onMessage)
// wh.delete(url)


// https://core.telegram.org/bots/api#setwebhook
```


<a name="refSpy"></a>
#### Spy

```js
const bot = tgb(process.env.TELEGRAM_BOT_TOKEN);
const {webhook, spy, entities} = tgb;

void async function Webhook() {
    const wh = await webhook({host: "localhost", port: 1490});
    const watch = spy();

    const url = await wh.bind(bot, "db.gg:88/custom", watch.update);

    // Sort by depth

    // Second
    watch("message.text", function(val, bot, message) {
        if(val === "die") {
            this.destroy();
        }
    });

    // First
    watch("message", function(val, bot, message) {
        if(val === message) {
            entities(val);
        }
    });

    // Last
    watch("message.from.id", function(val, bot) {});
}();

void async function Polling() {
    const watch = spy();
    polling(bot.token, (data) => watch.update(data, bot));
}();


// EventEmitter => spy

// w = spy();
// w(type, listener(val, bot, message));     // set: listener.destroy()
// w.on(type, listener(val, bot, message));
// w.update(data[, bot]);

// Except "update_id"
// https://core.telegram.org/bots/api#update
```


<a name="refDownload"></a>
#### Download

```js
const tgb = require("tgb");

const bot = tgb(process.env.TELEGRAM_BOT_TOKEN);
const {download} = tgb;

const fileId = "AgADAgAD36gxGwWj2EuIQ9vvX_3kbh-cmg4ABDhqGLqV07c_phkBAAEC";

//-----------------------------------------------------

void async function() {
    await download(bot.token, fileId);
}();

// https://core.telegram.org/bots/api#file
```


<a name="refProxy"></a>
#### Proxy

```js
const bot = tgb(process.env.TELEGRAM_BOT_TOKEN);

void async function() {
    bot.proxy = "127.0.0.1:1337"; // Only HTTPS

    try {
        await bot.getMe();
        await bot.getMe(null, "0.0.0.0:1337");
    } catch(e) {
        console.log(e);
    }
}();
```


<a name="refReqAbort"></a>
#### Abort/Pause/Resume

```js
void async function() {
    const bot = tgb(process.env.TELEGRAM_BOT_TOKEN);
    const params = {"chat_id": "0", "audio": "O://1.mp3"};

    const [res, req] = bot.sendAudio(params);

    setTimeout(() => {
        req.pause();
    }, 500);

    setTimeout(() => {
        req.resume();
    }, 2500);

    setTimeout(() => {
        req.abort();
    }, 4500);

    console.log(await res);
    console.log(req.ended, req.aborted, req.paused);
}();
```


<a name="refTgUpload"></a>
#### Tg Upload

```js
const bot = tgb(process.env.TELEGRAM_BOT_TOKEN);

// You
bot.sendPhoto({
    "chat_id": "0",
    "photo": "https://avatars0.githubusercontent.com/u/5007624"
});

// Tg
bot.sendPhoto({
    "chat_id": "0",
    "photo": "tg+https://avatars0.githubusercontent.com/u/5007624"
});

// https://core.telegram.org/bots/api#sending-files
```


<a name="refMarkup"></a>
#### Markup

```js
const bot = tgb(process.env.TELEGRAM_BOT_TOKEN);
const {markup} = tgb;

// Set
bot.sendMessage(markup({
    "chat_id": "0",
    "text": "Hi"
}).keyboard(`A|B|C\nX|Y\nO`));

// Remove
bot.sendMessage(markup({
    "chat_id": "0",
    "text": "Hi"
}).keyboard()); // .removeKeyboard()

// Reply
bot.sendMessage(markup({
    "chat_id": "0",
    "text": "Hi"
}).reply()); // .forceReply()


// Possible signatures:
// markup(bindMessage).[METHOD]

// markup.keyboard(kb, oneTime[, resize = true, selective = false])
// markup.removeKeyboard([selective = false])
// markup.forceReply([selective = false])

// https://core.telegram.org/bots/api#replykeyboardmarkup
```


<a name="refExtensibility"></a>
#### Extensibility

```js
const tgb = require("tgb");
const {Client} = tgb;

class MyBot extends Client {
    constructor(token, msg) {
        super(token);
        this.msg = msg;
    }

    send(id) {
        return this.sendMessage(id, this.msg);
    }

    sendMessage(cid, text) {
        return super.sendMessage([cid, `watch?${text}`]);
    }
}

const bot = new MyBot(process.env.TELEGRAM_BOT_TOKEN, "v=vc-PJPrueXY");
const [res, req] = bot.send("0");

console.log(await res);
```


<a name="refSendFileAsBuffer"></a>
#### File as Buffer

```js
const fs = require("fs");
const bot = tgb(process.env.TELEGRAM_BOT_TOKEN);

bot.sendMediaGroup({
    "chat_id": "59725308",
    "media": [
        {"type": "photo","media": "O://test.jpg"},
        {"type": "photo","media": fs.createReadStream("O://test.jpg")},
        {"type": "photo","media": ["test.jpg", fs.readFileSync("O://test.jpg")]},
        {"type": "photo","media": "AgADAgAD36gxGwWj2EuIQ9vvX_3kbh-cmg4ABDhqGLqV07c_phkBAAEC"},
        {"type": "photo","media": "tg+https://avatars0.githubusercontent.com/u/5007624"},
        {"type": "photo","media": "https://avatars0.githubusercontent.com/u/5007624"},
    ]
});
```


<a name="refCLI"></a>
#### CLI

```js
> SET TELEGRAM_BOT_TOKEN=1:XXXX

> tgb-cli --method sendPhoto --d.chat_id 0 --d.photo "J://test.jpg"
> tgb-cli --method getMe -j

> tgb-cli --method getMe --token 0:XXXX
> tgb-cli --method getMe --token 0:XXXX --proxy "127.0.0.1:1337"

> tgb-cli --method sendMessage --data "{\"chat_id\":0,\"text\":\"Hi yo\"}"
> tgb-cli --method sendMessage --d.chat_id 0 --data "{\"chat_id\":1,\"text\":\"Hi yo\"}"

> tgb-cli --download TOKEN --name x --id "AgADAgAD36gxGwWj2EuIQ9vvX_3kbh-cmg4ABDhqGLqV07c_phkBAAEC"
> tgb-cli --download --dir "./temp/" --id "AgADAgAD36gxGwWj2EuIQ9vvX_3kbh-cmg4ABDhqGLqV07c_phkBAAEC"
```


#### Misc

```js
/*
 All methods in the Bot API are case-insensitive (.buffer, .json, .require)

 message:                                             buffer, stream,string
 location|venue|contact:                              buffer, stream,string
 photo|audio|voice|video|document|sticker|video_note: buffer, stream, filepath, url, file_id
 certificate:                                         buffer, stream, filepath, url

-

 tgb = require("tgb");

-

 tgb.buffer(proxy, token, method, data, callback(error, buf, res))
 tgb.json(proxy, token, method, data, callback(error, json, res))

-

 tgb.polling(token, onMessage(data));
 tgb.polling(token, options{limit, timeout, interval}, onMessage(data));

 await tgb.download(token, fileId[, dir = "./", filename = ""]);

-

 x = tgb(token);
 x.token;        // Read|Write
 x.proxy;        // Read|Write
 x.url;          // Read (webhook.bind)

 await x.method([data, proxy]);
 await x(method[, data, proxy]);

-

 client = await tgb(token, method[, data, proxy]);

 [client, request] = tgb(token, method[, data, proxy]);
 client.request === request;
 request.pause();
 await client;

 ~~~

 error.response        = response;
 error.data            = data;

 error.code            = data.error_code;
 error.retryAfter      = data.parameters.retry_after;
 error.migrateToChatId = data.parameters.migrate_to_chat_id;

 https://core.telegram.org/bots/api#responseparameters

 ~~~ Sys Code |

  EBADPROXY

  EBADREQUEST
  EBADDATA

  EWCMAXSIZE
  EWCLONGREDIRECT

 ~~~ Tg Code |

  tgb.ERR_INTERNAL_SERVER
  tgb.ERR_NOT_FOUND
  tgb.ERR_FORBIDDEN
  tgb.ERR_MESSAGE_LIMITS
  tgb.ERR_USED_WEBHOOK
  tgb.ERR_INVALID_TOKEN
*/
```


Me? Him? Me? You? Me? ... Him? Me ... `npm -g i tgb` .... Whaat is Love  ♫•*¨*•.¸¸♪


#### Goals:
1. High stability;
2. Low memory usage;
3. Maximum performance;
4. Flexibility.


## License

MIT

----------------------------------
[@ Daeren][1]
[@ Telegram][2]


[1]: http://666.io
[2]: https://telegram.me/io666
[3]: https://core.telegram.org/bots/api

[10]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map

[cod_b]: https://img.shields.io/codacy/75f668078ddc40fca21c21fd06fe9823.svg
[cod_l]: https://www.codacy.com/app/daeren/tgb/dashboard
