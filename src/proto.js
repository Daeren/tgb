//-----------------------------------------------------
//
// Author: Daeren
// Site: 666.io
//
//-----------------------------------------------------

const proto = {
    "forwardMessage": [
        ["chat_id", "string", true],
        ["from_chat_id", "string", true],
        ["disable_notification", "boolean", false],
        ["message_id", "string", true]
    ],


    "sendMessage": [
        ["chat_id", "string", true],
        ["text", "message", true],
        ["parse_mode", "string", false],
        ["disable_web_page_preview", "boolean", false],
        ["disable_notification", "boolean", false],
        ["reply_to_message_id", "string", false],
        ["reply_markup", "json", false]
    ],
    "sendPhoto": [
        ["chat_id", "string", true],
        ["photo", "photo", true],
        ["caption", "string", false],
        ["parse_mode", "string", false],
        ["disable_notification", "boolean", false],
        ["reply_to_message_id", "string", false],
        ["reply_markup", "json", false]
    ],
    "sendAudio": [
        ["chat_id", "string", true],
        ["audio", "audio", true],
        ["caption", "string", false],
        ["parse_mode", "string", false],
        ["duration", "string", false],
        ["performer", "string", false],
        ["title", "string", false],
        ["disable_notification", "boolean", false],
        ["reply_to_message_id", "string", false],
        ["reply_markup", "json", false]
    ],
    "sendDocument": [
        ["chat_id", "string", true],
        ["document", "document", true],
        ["caption", "string", false],
        ["parse_mode", "string", false],
        ["disable_notification", "boolean", false],
        ["reply_to_message_id", "string", false],
        ["reply_markup", "json", false]
    ],
    "sendVideo": [
        ["chat_id", "string", true],
        ["video", "video", true],
        ["duration", "string", false],
        ["width", "string", false],
        ["height", "string", false],
        ["caption", "string", false],
        ["parse_mode", "string", false],
        ["supports_streaming", "boolean", false],
        ["disable_notification", "boolean", false],
        ["reply_to_message_id", "string", false],
        ["reply_markup", "json", false]
    ],
    "sendVoice": [
        ["chat_id", "string", true],
        ["voice", "voice", true],
        ["caption", "string", false],
        ["parse_mode", "string", false],
        ["duration", "string", false],
        ["disable_notification", "boolean", false],
        ["reply_to_message_id", "string", false],
        ["reply_markup", "json", false]
    ],
    "sendVideoNote": [
        ["chat_id", "string", true],
        ["video_note", "video_note", true],
        ["duration", "string", false],
        ["length", "string", false],
        ["disable_notification", "boolean", false],
        ["reply_to_message_id", "string", false],
        ["reply_markup", "json", false]
    ],
    "sendMediaGroup": [
        ["chat_id", "string", true],
        ["media", "mediaGroup", true],
        ["disable_notification", "boolean", false],
        ["reply_to_message_id", "string", false]
    ],
    "sendLocation": [
        ["chat_id", "string", true],
        ["latitude", "string", true],
        ["longitude", "string", true],
        ["live_period", "string", false],
        ["disable_notification", "boolean", false],
        ["reply_to_message_id", "string", false],
        ["reply_markup", "json", false]
    ],
    "sendVenue": [
        ["chat_id", "string", true],
        ["latitude", "string", true],
        ["longitude", "string", true],
        ["title", "string", true],
        ["address", "string", true],
        ["foursquare_id", "string", false],
        ["disable_notification", "boolean", false],
        ["reply_to_message_id", "string", false],
        ["reply_markup", "json", false]
    ],
    "sendContact": [
        ["chat_id", "string", true],
        ["phone_number", "string", true],
        ["first_name", "string", true],
        ["last_name", "string", false],
        ["disable_notification", "boolean", false],
        ["reply_to_message_id", "string", false],
        ["reply_markup", "json", false]
    ],
    "sendChatAction": [
        ["chat_id", "string", true],
        ["action", "string", true]
    ],
    "sendSticker": [
        ["chat_id", "string", true],
        ["sticker", "sticker", true],
        ["disable_notification", "boolean", false],
        ["reply_to_message_id", "string", false],
        ["reply_markup", "json", false]
    ],
    "sendInvoice": [
        ["chat_id", "string", true],
        ["title", "string", true],
        ["description", "string", true],
        ["payload", "string", true],
        ["provider_token", "string", true],
        ["start_parameter", "string", true],
        ["currency", "string", true],
        ["prices", "json", true],
        ["provider_data", "string", false],
        ["photo_url", "string", false],
        ["photo_size", "string", false],
        ["photo_width", "string", false],
        ["photo_height", "string", false],
        ["need_name", "boolean", false],
        ["need_phone_number", "boolean", false],
        ["need_email", "boolean", false],
        ["need_shipping_address", "boolean", false],
        ["send_phone_number_to_provider", "boolean", false],
        ["send_email_to_provider", "boolean", false],
        ["is_flexible", "boolean", false],
        ["disable_notification", "boolean", false],
        ["reply_to_message_id", "string", false],
        ["reply_markup", "json", false]
    ],
    "sendGame": [
        ["chat_id", "string", true],
        ["game_short_name", "string", true],
        ["disable_notification", "boolean", false],
        ["reply_to_message_id", "string", false],
        ["reply_markup", "json", false]
    ],


    "getChat": [
        ["chat_id", "string", true]
    ],
    "getChatAdministrators": [
        ["chat_id", "string", true]
    ],
    "getChatMembersCount": [
        ["chat_id", "string", true]
    ],
    "getChatMember": [
        ["chat_id", "string", true],
        ["user_id", "string", true]
    ],

    "getUserProfilePhotos": [
        ["user_id", "string", true],
        ["offset", "string", false],
        ["limit", "string", false]
    ],
    "getUpdates": [
        ["offset", "string", false],
        ["limit", "string", false],
        ["timeout", "string", false],
        ["allowed_updates", "json", false]
    ],
    "getFile": [
        ["file_id", "string", true]
    ],
    "getMe": null,
    "getWebhookInfo": null,
    "getGameHighScores": [
        ["user_id", "string", true],
        ["chat_id", "string", false],
        ["message_id", "string", false],
        ["inline_message_id", "string", false]
    ],
    "getStickerSet": [
        ["name", "string", true]
    ],


    "setWebhook": [
        ["url", "string", true],
        ["certificate", "certificate", false],
        ["max_connections", "string", false],
        ["allowed_updates", "json", false]
    ],
    "setGameScore": [
        ["user_id", "string", true],
        ["score", "string", true],
        ["force", "boolean", false],
        ["disable_edit_message", "boolean", false],
        ["chat_id", "string", false],
        ["message_id", "string", false],
        ["inline_message_id", "string", false]
    ],


    "answerInlineQuery": [
        ["inline_query_id", "string", true],
        ["results", "json", true],
        ["cache_time", "string", false],
        ["is_personal", "boolean", false],
        ["next_offset", "string", false],
        ["switch_pm_text", "string", false],
        ["switch_pm_parameter", "string", false]
    ],
    "answerCallbackQuery": [
        ["callback_query_id", "string", true],
        ["text", "string", false],
        ["show_alert", "boolean", false],
        ["url", "string", false],
        ["cache_time", "string", false]
    ],
    "answerShippingQuery": [
        ["shipping_query_id", "string", true],
        ["ok", "boolean", true],
        ["shipping_options", "json", false],
        ["error_message", "string", false]
    ],
    "answerPreCheckoutQuery": [
        ["pre_checkout_query_id", "string", true],
        ["ok", "boolean", true],
        ["error_message", "string", false]
    ],


    "leaveChat": [
        ["chat_id", "string", true]
    ],

    "kickChatMember": [
        ["chat_id", "string", true],
        ["user_id", "string", true],
        ["until_date", "string", false]
    ],
    "unbanChatMember": [
        ["chat_id", "string", true],
        ["user_id", "string", true]
    ],
    "restrictChatMember": [
        ["chat_id", "string", true],
        ["user_id", "string", true],
        ["until_date", "string", false],
        ["can_send_messages", "boolean", false],
        ["can_send_media_messages", "boolean", false],
        ["can_send_other_messages", "boolean", false],
        ["can_add_web_page_previews", "boolean", false]
    ],
    "promoteChatMember": [
        ["chat_id", "string", true],
        ["user_id", "string", true],
        ["can_change_info", "boolean", false],
        ["can_post_messages", "boolean", false],
        ["can_edit_messages", "boolean", false],
        ["can_delete_messages", "boolean", false],
        ["can_invite_users", "boolean", false],
        ["can_restrict_members", "boolean", false],
        ["can_pin_messages", "boolean", false],
        ["can_promote_members", "boolean", false]
    ],


    "exportChatInviteLink": [
        ["chat_id", "string", true]
    ],


    "uploadStickerFile": [
        ["user_id", "string", true],
        ["png_sticker", "sticker", true]
    ],
    "createNewStickerSet": [
        ["user_id", "string", true],
        ["name", "string", true],
        ["title", "string", true],
        ["png_sticker", "sticker", true],
        ["emojis", "string", true],
        ["contains_masks", "boolean", false],
        ["mask_position", "json", false]
    ],
    "addStickerToSet": [
        ["user_id", "string", true],
        ["name", "string", true],
        ["png_sticker", "sticker", true],
        ["emojis", "string", true],
        ["mask_position", "json", false]
    ],
    "setStickerPositionInSet": [
        ["sticker", "string", true],
        ["position", "string", true]
    ],
    "deleteStickerFromSet": [
        ["sticker", "string", true]
    ],


    "setChatStickerSet": [
        ["chat_id", "string", true],
        ["sticker_set_name", "string", true]
    ],
    "deleteChatStickerSet": [
        ["chat_id", "string", true]
    ],

    "setChatPhoto": [
        ["chat_id", "string", true],
        ["photo", "photo", true]
    ],
    "deleteChatPhoto": [
        ["chat_id", "string", true]
    ],

    "setChatTitle": [
        ["chat_id", "string", true],
        ["title", "string", true]
    ],
    "setChatDescription": [
        ["chat_id", "string", true],
        ["description", "string", false]
    ],

    "pinChatMessage": [
        ["chat_id", "string", true],
        ["message_id", "string", true],
        ["disable_notification", "boolean", false]
    ],
    "unpinChatMessage": [
        ["chat_id", "string", true]
    ],


    "editMessageText": [
        ["chat_id", "string", false],
        ["message_id", "string", false],
        ["inline_message_id", "string", false],
        ["text", "string", true],
        ["parse_mode", "string", false],
        ["disable_web_page_preview", "boolean", false],
        ["reply_markup", "json", false]
    ],
    "editMessageCaption": [
        ["chat_id", "string", false],
        ["message_id", "string", false],
        ["inline_message_id", "string", false],
        ["caption", "string", false],
        ["parse_mode", "string", false],
        ["reply_markup", "json", false]
    ],
    "editMessageReplyMarkup": [
        ["chat_id", "string", false],
        ["message_id", "string", false],
        ["inline_message_id", "string", false],
        ["reply_markup", "json", false]
    ],


    "editMessageLiveLocation": [
        ["chat_id", "string", false],
        ["message_id", "string", false],
        ["inline_message_id", "string", false],
        ["latitude", "string", true],
        ["longitude", "string", true],
        ["reply_markup", "json", false]
    ],
    "stopMessageLiveLocation": [
        ["chat_id", "string", false],
        ["message_id", "string", false],
        ["inline_message_id", "string", false],
        ["reply_markup", "json", false]
    ],


    "deleteMessage": [
        ["chat_id", "string", true],
        ["message_id", "string", true]
    ],
    "deleteWebhook": null
};

//-----------------------------------------------------

module.exports = proto;
