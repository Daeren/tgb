[![Codacy][cod_b]][cod_l]

```
npm -g install tgb
git clone https://github.com/Daeren/tgb.git
```


```js
await require("tgb")("TK", "sendmessage", [0, "+"], proxy)
await require("tgb").sendMessage("TK", {chat_id: 0, text: "+"}, proxy)
```


[Full Bot API 3.5][3]

* [Proxy](#refProxy): +
* [File as Buffer](#refSendFileAsBuffer)
* [ReqAbort](#refReqAbort): +
* [TgUpload](#refTgUpload): +
* Redirect: +
* HashTable, Array and [Map][10] as a data source: +


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

const {polling} = tgb;
const bot = tgb(process.env.TELEGRAM_BOT_TOKEN);

//-----------------------------------------------------

polling(
    bot.token,
    function({message}) {
        bot.sendMessage([message.from.id, `Hi: ${message.text}`]);
    })
    .catch(function(error) {
        if(error.code === bot.ERR_INVALID_TOKEN) {
            this.stop();
            console.log("There's a problem with the token...");
        }
        else {
            delete error.response;
            console.log(error);
        }
    });
```


<a name="refProxy"></a>
```js
const bot = tgb(process.env.TELEGRAM_BOT_TOKEN);
const proxy = "127.0.0.1:1337"; // Only HTTPS

bot.proxy = proxy;

void async function () {
    try {
        console.log(await bot.getMe());
        console.log(await bot.getMe(null, "0.0.0.0:1337"));
    } catch(e) {
        console.log(e);
    }
}();
```


<a name="refReqAbort"></a>
```js
const bot = tgb(process.env.TELEGRAM_BOT_TOKEN);

void async function () {
    const [res, req] = bot.sendAudio({"chat_id": "0", "audio": "O://1.mp3"});

    setTimeout(function() {
        req.abort();
        console.log(req.aborted);
    }, 500);

    console.log(await res);
    console.log(req.ended, req.aborted);
}();
```


<a name="refTgUpload"></a>
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


<a name="refSendFileAsBuffer"></a>
```js
const fs = require("fs");
const bot = tgb(process.env.TELEGRAM_BOT_TOKEN);

bot.sendMediaGroup({
    "chat_id": "59725308",
    "media": [
        {"type": "photo","media": "AgADAgAD36gxGwWj2EuIQ9vvX_3kbh-cmg4ABDhqGLqV07c_phkBAAEC"},
        {"type": "photo","media": "tg+https://avatars0.githubusercontent.com/u/5007624"},
        {"type": "photo","media": "O://test.jpg"},
        {"type": "photo","media": fs.createReadStream("O://test.jpg")},
        {"type": "photo","media": ["test.jpg", fs.readFileSync("O://test.jpg")]},
        {"type": "photo","media": "https://avatars0.githubusercontent.com/u/5007624"},
    ]
});
```


/*
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
