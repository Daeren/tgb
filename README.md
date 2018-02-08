[![Codacy][cod_b]][cod_l]

```
npm -g install tgb
git clone https://github.com/Daeren/tgb.git
```


```js
await require("tgb")("TK", "sendmessage", [0, "+"])
await require("tgb").sendMessage("TK", {chat_id: 0, text: "+"})
```


[Full Bot API 3.5][3]

* [Proxy](#refProxy): +
* [TgUpload](#refTgUpload): +
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





## License

MIT

----------------------------------
[@ Daeren][1]
[@ Telegram][2]


[1]: http://666.io
[2]: https://telegram.me/io666
[3]: https://core.telegram.org/bots/api

[10]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map

[cod_b]: https://img.shields.io/codacy/c9243ce691144a5380e6afa2361990ae.svg
[cod_l]: https://www.codacy.com/app/daeren/tgb/dashboard
