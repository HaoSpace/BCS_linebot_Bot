'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
const receiver = require('./Controllers/EventReceiveHandler');
const googleSheet = require('./Controllers/GoogleSheetHandler');
const settings = require('config');
const axios = require('axios');
const db = require('./userdb');
const msgConst = require('./Controllers/MessageConst');

// const login = require('../Cat_CheckIn_Web/nodelogin/login');
const lineConfig = {
  channelAccessToken: settings.get('Settings.channelAccessToken'),
  channelSecret: settings.get('Settings.channelSecret'),
};

const defaultImg = settings.get('Settings.defaultImg');
const webPath = settings.get('Settings.webPath');


// create LINE SDK client
const client = new line.Client(lineConfig);
// create Express app
const app = express();
// login.initLogin(app);

// register a webhook handler with middleware
app.post('/linewebhook/', line.middleware(lineConfig), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

//init google spreadsheet
googleSheet.initSheet(settings.get('Settings.googleSheetId'));

// event handler
async function handleEvent(event) {
  console.log(`index.js - message received - \n${JSON.stringify(event)}`);
  if ((event.type == 'postback' && event.postback.data == 'link') || 
  (event.type == 'postback' && event.postback.data == 'simpleLink') ||
  (event.type == 'accountLink') || 
  (event.type == 'follow')) {
    
    receiver.onReceiveEvent(event, client)
    .then ((replyMsg) => {
      if (replyMsg == null) {
        return Promise.resolve(null);
      } else {
        return replyText(event.replyToken, replyMsg);
      }
    })
    .catch((error) => {
      console.error(error);
    })
  } else {
    if (event.type == 'unfollow') {
      return Promise.resolve(null);;
    }
    db.getData(event.source.userId, async (error, row) => {
      if (error != null) {
        console.log("1");
        var action = msgConst.action_postback('帳號綁定', 'link');
    
        var replyMsg = msgConst.button(null, '帳號尚未綁定', '帳號尚未綁定', defaultImg, [action]);
        replyText(event.replyToken, replyMsg);
      }
      else { 

        var nonce = row.nonce;
        var url =`${webPath}/getname?nonce=${nonce}`
      
        var userName = await getWebData(url);
        
        receiver.onReceiveEvent(event, client, userName)
        .then ((replyMsg) => {
          if (replyMsg == null) {
            return Promise.resolve(null);
          } else {
            return replyText(event.replyToken, replyMsg);
          }
        })
        .catch((error) => {
          console.error(error);
        })          
      }
    });
  }
}

const replyText = (token, texts) => {
  texts = Array.isArray(texts) ? texts : [texts];
  return client.replyMessage(
    token,
    texts
  );
};

async function getWebData (url) { 
  try {
      const response = await axios.get(url);
      const data = response.data;
      console.log(`data: ${data}`);
      return data;
  } catch (error) {
      console.log(`error: ${error}`)
  }
}

// function sendMessage (userId, megTxt) {
//   var message = {
//     type: 'text',
//     text: `${megTxt}`
//   };

//   var message2 = {
//     type: 'text',
//     text: 'msg2'
//   };

//   client.pushMessage(userId, message);
//   client.multicast(['Uf8074d107f0a145332e8a3aa49ffb36f'], [message1, message2]);
// }


// listen on port
const port = process.env.PORT || 18;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});