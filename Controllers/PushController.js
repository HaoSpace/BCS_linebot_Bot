module.exports = {
    onSendMessage, onReplyMessage
}

const settings = require('config');
const line = require('@line/bot-sdk');
const lineConfig = {
    channelAccessToken: settings.get('Settings.channelAccessToken'),
    channelSecret: settings.get('Settings.channelSecret'),
  };
  
// create LINE SDK client
const client = new line.Client(lineConfig);

const replyText = (token, texts) => {
    texts = Array.isArray(texts) ? texts : [texts];
    return client.replyMessage(
        token,
        texts.map((text) =>  ({ type: 'text', text }))
    );
};

function onReplyMessage (token, texts) {
    switch(texts) {
        case 'button':
            return client.replyMessage(
                replyToken,
                {
                  type: 'template',
                  altText: 'Buttons alt text',
                  template: {
                    type: 'buttons',
                    thumbnailImageUrl: buttonsImageURL,
                    title: 'My button sample',
                    text: 'Hello, my button',
                    actions: [
                      { label: 'Go to line.me', type: 'uri', uri: 'https://line.me' },
                      { label: 'Say hello1', type: 'postback', data: 'hello こんにちは' },
                      { label: '言 hello2', type: 'postback', data: 'hello こんにちは', text: 'hello こんにちは' },
                      { label: 'Say message', type: 'message', text: 'Rice=米' },
                    ],
                  },
                }
              );
        default:
            return replyText(token, texts);
    }
}

function onSendMessage (userIds, msg) {
    // console.log(`userId: ${userIds}, msg: ${msg}`)
    userIds = Array.isArray(userIds) ? userIds : [userIds];
    msg = Array.isArray(msg) ? msg : [msg];
    userIds.map((user) => (console.log(`userId: ${user}, msg: ${msg}`)));
    // if (Array.isArray(userIds)) {
    //     userIds.forEach(element => console.log(`userId: ${element}, msg: ${msg}`));

    // } else {
    //     console.log(`userId: ${userIds}, msg: ${msg}`)
    // }
}


