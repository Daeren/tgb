[![Codacy][cod_b]][cod_l]

```
npm -g install tgb
git clone https://github.com/Daeren/tgb.git
```


```js
await require("tgb")("T", "sendmessage", [0, "+"], proxy)
await require("tgb").sendMessage("T", {chat_id: 0, text: "+"}, proxy)
```

```
> tgb-cli --polling TOKEN --echo -j
```


[Full Bot API 3.5][3]

* [WebHook](#refWebHook): +
* [Download](#refDownload): +
* [Proxy](#refProxy): +
* [File as Buffer](#refSendFileAsBuffer): +
* [Abort/Pause](#refReqAbort): +
* [TgUpload](#refTgUpload): +
* [Markup](#refMarkup): +
* [CLI](#refCLI): +
* Entities: +
* Redirect: +
* HashTable, Array and [Map][10] as a data source: +
* Without Dependencies: +


```
- All methods in the Bot API are case-insensitive (.buffer, .json, .require)

- message:                                             buffer, stream, string
- location|venue|contact:                              buffer, stream, string
- photo|audio|voice|video|document|sticker|video_note: buffer, stream, path, url, file_id
- certificate:                                         buffer, stream, path, url
```


#### Goals:
1. High stability;
2. Low memory usage;
3. Maximum performance;
4. Flexibility.


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
    })).catch(function(error) { // srv|cl errors
    });

    const url = await wh.bind(bot, "db.gg", function({message}, bot) {
        this.sendMessage([message.from.id, `Hi: ${message.text}`]);
    });
}();


// wh = await webhook(1490); // *:1490
// wh = await webhook({host: "localhost", port: 1490});

// url = await wh.bind(otherBot, "666.io:88", cb); // with api.setWebhook
// wh = wh.set(otherBot2, "666.io:88", cb);        // without api.setWebhook

// url = await wh.unbind(otherBot);                // with api.deleteWebhook
// wh = wh.delete(otherBot2);                      // without api.deleteWebhook


// wh.bind(bot, options[url|objOpt.setWebhook], onMessage)
// wh.unbind(bot)
// wh.set(bot, url, onMessage)
// wh.delete(url)


// https://core.telegram.org/bots/api#setwebhook
```


<a name="refDownload"></a>
#### Download

```js
const tgb = require("tgb");

const bot = tgb(process.env.TELEGRAM_BOT_TOKEN);
const {download} = tgb;

const fileId = "AgADAgAD36gxGwWj2EuIQ9vvX_3kbh-cmg4ABDhqGLqV07c_phkBAAEC";

//-----------------------------------------------------

void async function () {
    await download(bot.token, fileId);
}();
```


<a name="refProxy"></a>
#### Proxy

```js
const bot = tgb(process.env.TELEGRAM_BOT_TOKEN);

void async function () {
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
void async function () {
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

/*
Added the option to specify an HTTP URL for a file in all methods where InputFile or file_id can be used (except voice messages).
Telegram will get the file from the specified URL and send it to the user.
Files must be smaller than 5 MB for photos and smaller than 20 MB for all other types of content.
*/
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
}).keyboard(`A a|  B b  |C c\n X `));

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


<a name="refCLI"></a>
#### CLI

```js
> SET TELEGRAM_BOT_TOKEN=1:XXXX

> tgb-cli -j --method sendPhoto --d.chat_id 0 --d.photo "J://test.jpg"
> tgb-cli --method getMe

> tgb-cli --method getMe --token 0:XXXX
> tgb-cli --method getMe --token 0:XXXX --proxy "127.0.0.1:1337"

> tgb-cli --method sendMessage --data "{\"chat_id\":0,\"text\":\"Hi yo\"}"
> tgb-cli --method sendMessage --d.chat_id 1 --data "{\"chat_id\":0,\"text\":\"Hi yo\"}"

> tgb-cli --download TOKEN --name x --id "AgADAgAD36gxGwWj2EuIQ9vvX_3kbh-cmg4ABDhqGLqV07c_phkBAAEC"
> tgb-cli --download --dir "./temp/" --id "AgADAgAD36gxGwWj2EuIQ9vvX_3kbh-cmg4ABDhqGLqV07c_phkBAAEC"
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

#### Misc

```
/*
 tgb = require("tgb");

-

 tgb.buffer(proxy, token, method, data, callback(error, buf, res))
 tgb.json(proxy, token, method, data, callback(error, buf, res))

-

 tgb.polling(token, onMessage(data));
 tgb.polling(token, options{limit, timeout, interval}, onMessage(data));

 await tgb.download(token, fileId[, dir = "./", filename = ""]);

-

 x = tgb(token);
 x.token;        // Read|Write
 x.proxy;        // Read|Write

 await x.method([data, proxy]);
 await x(method[, data, proxy]);

-

 await tgb(token, method[, data, proxy]);

 client = await tgb(token, method[, data, proxy]);
 [client, request] = await tgb(token, method[, data, proxy]);
 client.request === request;

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
