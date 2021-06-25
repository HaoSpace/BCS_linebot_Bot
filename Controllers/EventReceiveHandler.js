const msgConst = require('./MessageConst');
const sheetConst = require('./SheetConst');
const googleSheet = require('./GoogleSheetHandler');
const richMenu = require('./RichMenuHandler');
const axios = require('axios');
const db = require('../userdb');
const settings = require('config');


const defaultImg = settings.get('Settings.defaultImg');
const webPath = settings.get('Settings.webPath');
const liffPath = settings.get('Settings.liffPath');
const sheetPath = settings.get('Settings.googleSheetPath');

async function onReceiveEvent (event, client, username = '') {
    console.log(`Event Type: ${event.type}`);

    switch (event.type) {
    case 'message':
        return handleMessage(event, client, username);
    case 'follow':
        return handleFollow(event, client);
    case 'unfollow':
        return handleUnfollow(event, client);
    case 'join':
        return handleJoin(event);
    case 'leave':
        return handleLeave(event);
    case 'postback':
        return await handlePostback(event, client, username);
    case 'beacon':
        return handleBeacon(event);
    case 'accountLink':
        return handleAccountLink(event, client);
    default:
      throw new Error(`Unknown event: ${JSON.stringify(event)}`);
  }

}

function handleMessage (event, client, username) {
    var currentTime = new Date(Date.now()).toLocaleTimeString();
    console.log(`Msg Recived: ${event.message.text}, UserID: ${event.source.userId}, Time: ${currentTime}`);

    const message = event.message;
    switch (message.type) {
        case 'text':
            return handleText(event, client, username);
        case 'image':
            return handleImage();
        case 'video':
            return handleVideo();
        case 'audio':
            return handleAudio();
        case 'location':
            return handleLocation(event.message, username);
        case 'sticker':
            return handleSticker();
        default:
        throw new Error(`Unknown message: ${JSON.stringify(message)}`);
    }
}

function handleText (event, client, username) {
    switch (event.message.text) {
        case '-h':
        case 'help':
        case 'Help':
        case '幫助':
        case '協助':
        case '幫忙':
            return eventHelp();
        case 'google':
            return testGoogle();
        case 'db':
            return testDB();
        case 'hi':
            return msgConst.text(`Welcome back! ${username}!!`);
        case '解除綁定':
            return eventUnlink(event, client);
        case 'notify':
            return eventLineNotify();
        case '':
            break;
    }

    if (event.message.text.includes('建立外出活動')) {
        return eventSetActivity(event, client);
    }

    return msgConst.text(`你說的是: ${event.message.text}？`);
}

function testGoogle () {
    //googleSheet.addSheet('Jason');
    // googleSheet.appendRow({'日期': 123123});
    var currentDate = new Date(Date.now()).toLocaleDateString();
    var dateTic = Date.parse(currentDate);
    var currentDate = new Date(dateTic + ((6) * (24*60*60*1000))).toLocaleDateString();
    googleSheet.addData(currentDate, {...sheetConst.checkIn(123, 456), ...sheetConst.checkOut(789)});

    return msgConst.text('google');
}

function testDB () {
    // console.log(db.addData('test1', 'ffgffffg'));
    // console.log(db.updateData('test1', 'eeeeeee'));
    // console.log(db.getUserName('eeeeeee', function (name) {
    //     console.log(`name: ${name}`);
    // }));
    // console.log(db.getUserToken('test1', function(token) {
    //     console.log(`token: ${token}`);
    // }));
    // console.log(db.removeData('test1'));

    return msgConst.text('db');
}

async function linkAccount (event, client) {

    var token = await client.getLinkToken(event.source.userId);

    var urlLink = `${liffPath}/link?link_token=${token}`;
    console.log(`link: ${urlLink}`);
    
    return msgConst.flex_button('點此綁定帳號', urlLink);
}

function simpleLinkAccount (event, client) {
    var urlLink = `${liffPath}/simplelink`;
    console.log(`link: ${urlLink}`);

    db.addData(event.source.userId, event.source.userId);
    richMenu.setMainMenu(event.source.userId, client);
    
    return msgConst.flex_button('簡易綁定', urlLink);
}

async function eventUnlink (event, client) {

    var userId = event.source.userId;
    db.getData(userId, async (error, row) => {
        if (error != null) {
            var action = msgConst.action_postback('帳號綁定', 'link');
        
            var replyMsg = msgConst.button(null, '帳號尚未綁定', '帳號尚未綁定', defaultImg, [action]);
            replyText(event.replyToken, replyMsg);
          }
          else { 
            var nonce = row.nonce;
            var urlUnlink = `${webPath}/unlink?nonce=${nonce}`;
            var replynonce = await getWebData(urlUnlink);

            if (nonce == replynonce) {
                db.removeData(userId);
                console.log(`Unlink Success! -${userId}`);
                client.replyMessage(event.replyToken, msgConst.text('解除綁定成功'));
                richMenu.setAccountLinkMenu(userId, client);
            }
        }
    }); 
}

function eventLineNotify () {
    var url = `${liffPath}/linenotifyconnection`;
    return msgConst.flex_button('設定自動通知', url);
}

function handleImage () {
    return msgConst.text('你傳照片給我幹嘛？');
}

function handleVideo () {
    return msgConst.text('你傳影片給我幹嘛？');
}

function handleAudio () {
    return msgConst.text('你傳聲音給我幹嘛？');
}

async function handleLocation (event, username) {
    var date = new Date(Date.now());
    var currentTime = date.toLocaleTimeString();
    var currentDate = date.toLocaleDateString();
    var location = `address: ${event.address} \nposition: (${event.latitude},${event.longitude})`;

    var row = await googleSheet.getData(currentDate, username);
    if (row == null || row.PunchIn == '') {
        googleSheet.addData(currentDate, sheetConst.checkIn(currentTime, location), username);
    }

    var returnMsg = `${username} 上班打卡完成` + 
                    `\n${date.toLocaleString()}`
    return msgConst.text(returnMsg);
}

function handleSticker () {
    return msgConst.text('Got sticker');
}

function handleFollow (event, client) {
    db.getData(event.source.userId, (error, rowData) => {
        if (error) {
            richMenu.setAccountLinkMenu(event.source.userId, client);
        } else {
            richMenu.setMainMenu(event.source.userId, client);
        }
    });
}

function handleUnfollow (event, client) {
    richMenu.setAccountLinkMenu(event.source.userId, client);
    return null;
}

function handleJoin (event) {
    return msgConst.text(`Joined ${event.source.type}`);
}

function handleLeave (event) {
    console.log(`Left: ${JSON.stringify(event)}`);
    return null;
}

async function handlePostback (event, client, username) {
    let data = event.postback.data;
    switch (data) {
        case 'checkIn':
            return eventCheckIn();
        case 'checkOut':
            return eventCheckOut(username);
        case 'leave':
            return eventLeave();
        case 'activity':
            return eventActivity();
        case 'activityTime':
            return evenActivityTime(username);
        case 'cancelOffWork':
            return await eventOffWorkCancel (username, event.postback);
        case 'cancelActivity':
            return await eventActivitySelectToCancel(username, event.postback);
        case 'link':
            return await linkAccount(event, client);
        case 'simpleLink':
            return simpleLinkAccount(event, client);
    }

    if (data.includes('leaveStart')) {
        return eventLeaveStart(event.postback, username);
    }

    if (data.includes('leaveEnd')) {
        return eventLeaveEnd(event.postback, username);
    }

    if (data.includes('cancel_activity')){ 
        return await eventActivityCancel(username, data);
    }

    if (data === 'DATE' || data === 'TIME' || data === 'DATETIME') {
        data += `(${JSON.stringify(event.postback.params)})`;
    }

    return msgConst.text(`Got postback: ${data}`)
}

function handleBeacon (event) {
    return msgConst.text(`Got beacon: ${event.beacon.hwid}`);
}

function handleAccountLink(event, client) {
    if (event.link.result != 'ok') {
        return msgConst.text('帳號綁定失敗，請向相關人員確認。');
    }

    if (!event.source.userId || !event.link || !event.link.nonce) {
        return msgConst.text('userId or nonce not found');
    }

    db.addData(event.source.userId, event.link.nonce);
    richMenu.setMainMenu(event.source.userId, client);
    return msgConst.text(`帳號綁定完成`);
}

//===============Custom Events===================

function eventHelp () {
    var action1 = msgConst.action_postback('出勤', 'checkIn');
    var action2 = msgConst.action_postback('活動', 'activity');

    return msgConst.button(null, 'Help', 'Help Message', defaultImg, [action1, action2]);
}

function eventCheckIn () {
    var action1 = msgConst.action_location('打卡上班');
    var action2 = msgConst.action_postback('打卡下班', 'checkOut');
    // var action3 = msgConst.action_pickTime('請假', 'leaveStart', 'datetime');
    var quickCheckIn = msgConst.quickReply('請於下方選擇出勤事件', [action1, action2]);

    return quickCheckIn;
}

function eventCheckOut (username) {
    var date = new Date(Date.now());
    var currentTime = date.toLocaleTimeString();
    var currentDate = date.toLocaleDateString();
    googleSheet.addData(currentDate, sheetConst.checkOut(currentTime), username);

    var returnMsg = `${username} 下班打卡完成` + 
                    `\n${date.toLocaleString()}`
   
    return msgConst.text(returnMsg); 
}

function eventLeave () {
    var action1 = msgConst.action_pickTime('事假', 'leaveStart_事假', 'datetime');
    var action2 = msgConst.action_pickTime('公假', 'leaveStart_公假', 'datetime');
    var action3 = msgConst.action_pickTime('病假', 'leaveStart_病假', 'datetime');
    var action4 = msgConst.action_pickTime('喪假', 'leaveStart_喪假', 'datetime');
    var action5 = msgConst.action_pickTime('婚假', 'leaveStart_婚假', 'datetime');
    var action6 = msgConst.action_pickTime('特休', 'leaveStart_特休', 'datetime');

    var quickEvent = msgConst.quickReply('請於下方選擇假別', [action1, action2, action3, action4, action5, action6]);

    return quickEvent;
}

function eventLeaveStart (postback, username) {
    //handle start time
    var time = postback.params.datetime;
    var type = postback.data.substring(11, postback.data.length);

    var targetTime = new Date(time).toLocaleTimeString();
    var targetDate = new Date(time).toLocaleDateString();

    googleSheet.addData(targetDate, sheetConst.offWorkStart(type, targetTime), username);

    //send end picker
    var action = msgConst.action_pickTime('設定結束時間', `leaveEnd_${type}`, 'datetime', time);
    var quickEvent = msgConst.quickReply(`請假起始時間: \n${time.replace('T', ' ')}\n假別: ${type}`, action);

    return quickEvent;
}

async function eventLeaveEnd (postback, username) {
    //handle end time
    var time = postback.params.datetime;
    var type = postback.data.substring(9, postback.data.length);
    var targetTime = new Date(time).toLocaleTimeString();
    var targetDate = new Date(time).toLocaleDateString();

    var row = await googleSheet.getData(targetDate, username);
    var startTimeAry = [];
    var hour = '';
    
    if (row.OffWorkStart && row.OffWorkStart != '') {
        
        if (row.OffWorkStart.includes('下午 ')) {
            startTimeAry = row.OffWorkStart.replace('下午 ', '').split(':');
            hour = parseInt(startTimeAry[0]) + 12;
        } else {
            startTimeAry = row.OffWorkStart.replace('上午 ', '').split(':');
            hour = parseInt(startTimeAry[0])
            hour = hour.toString().padStart(2, '0');
        }

        var date = row.Date.split('/');
        date[1] = date[1].padStart(2, '0');
        date[2] = date[2].padStart(2, '0');
    
        var startTime_Str = date.join('-') + "T" + hour + ":" + startTimeAry[1];
        var startTime = new Date(startTime_Str);
    }
   
   
    if (row == null || 
        row.Date == '' || 
        !row.OffWorkStart ||
        row.OffWorkStart == '' ||
        new Date(time).getTime() < startTime.getTime()) {
        var action = msgConst.action_pickTime('設定結束時間', `leaveEnd_${type}`, 'datetime');
        var quickEvent = msgConst.quickReply('時間不合法請重新設定', action);
    
        return quickEvent;
    } else {
        googleSheet.addData(targetDate, sheetConst.offWorkEnd(targetTime), username);

        var notifyMsg = '- 請假申請' +
                        `\n假別：${type}` +
                        `\n開始時間：${startTime_Str.replace('T', ' ')}` +
                        `\n結束時間：${time.replace('T', ' ')}` + 
                        `\n人員：${username}\n\n` +
                        `\n查核連結：${sheetPath}`
        getWebData(`${webPath}/sendnotify?msg=${encodeURI(notifyMsg)}`);
        
        var text1 = msgConst.text(`請假結束時間: \n${time.replace('T', ' ')}\n假別: ${type}`);
        var text2 = msgConst.text('已申請請假，待核准');
        return [text1, text2];
    }
}

function eventActivity () {
    var action1 = msgConst.action_postback('外出', 'activityTime');
    var action2 = msgConst.action_postback('請假', 'leave');
    var action3 = msgConst.action_pickTime('取消請假', 'cancelOffWork', 'date');
    var action4 = msgConst.action_pickTime('取消活動', 'cancelActivity', 'date');

    var quickEvent = msgConst.quickReply('請於下方選擇活動', [action1, action2, action3, action4]);

    return quickEvent;
} 

async function eventOffWorkCancel (username, postback) {
    var date = postback.params.date;
    var targetDate = new Date(date).toLocaleDateString();
    var rowData = await googleSheet.getData(targetDate, username);

    if (rowData != null) {
        var offWorkType = rowData.OffWorkType;
        if (offWorkType && offWorkType != '') {
            googleSheet.addData(targetDate, sheetConst.offWorkStart('',''), username);
            googleSheet.addData(targetDate, sheetConst.offWorkEnd(''), username);

            var notifyMsg = '- 請假取消' +
                            `\n假別：${rowData.OffWorkType}` +
                            `\n開始時間：${rowData.Date} ${rowData.OffWorkStart}` +
                            `\n結束時間：${rowData.Date} ${rowData.OffWorkStart}` +
                            `\n人員：${username}`;
            
            getWebData(`${webPath}/sendnotify?msg=${encodeURI(notifyMsg)}`);
            return msgConst.text(`請假已取消 - ${targetDate}`);
        }
    }

    return msgConst.text('查無請假資料');
}

function evenActivityTime (username) {
    var sheets = googleSheet.getAllSheetName(); 
    var members = sheets.join('-');
    var urlLink = `${liffPath}/eventpicker?members=${members}&self=${username}`;
    console.log(`link: ${urlLink}`);
    
    return msgConst.flex_button('建立外出活動', urlLink);
}

async function eventSetActivity (event, client) {
    var data = event.message.text.replace('建立外出活動', '');
    var eventData = JSON.parse(data);
    var targetTime = new Date(eventData.eventTime).toLocaleTimeString();
    var targetDate = new Date(eventData.eventTime).toLocaleDateString();
    var errorMsg = '';

    eventData.members.forEach (async member => {

        var rowData = await googleSheet.getData(targetDate, member);
        if (rowData == null) {
            googleSheet.addData(targetDate, sheetConst.activity(eventData.eventName.toString(), targetTime, eventData.members.join(',')), member);
        } else {
            var activity = null;
            if (!rowData.ActivityName) {
                activity = sheetConst.activity;
            } else if (!rowData.ActivityName2) {
                activity = sheetConst.activity2;
            } else if (!rowData.ActivityName3) {
                activity = sheetConst.activity3;
            } else if (!rowData.ActivityName4) {
                activity = sheetConst.activity4;
            } else if (!rowData.ActivityName5) {
                activity = sheetConst.activity5;
            }

            if (activity == null) {
                errorMsg += `\n${member} 該日活動已滿，請刪除部分活動!`;
            } else {
                googleSheet.addData(targetDate, activity(eventData.eventName.toString(), targetTime, eventData.members.join(',')), member);
            } 

            client.replyMessage(event.replyToken, msgConst.text(`外出活動建立完成 ${errorMsg}`));
        }  
    });
    
    var notifyMsg ='- 外出活動' + 
                    `\n活動名稱：${eventData.eventName}` +
                    `\n活動時間：${eventData.eventTime.replace('T', ' ')}` +
                    `\n參與人員：${eventData.members.join(', ')}`
    getWebData(`${webPath}/sendnotify?msg=${encodeURI(notifyMsg)}`);
   
}
async function eventActivitySelectToCancel (username, postback) {
    var date = postback.params.date;
    // var type = postback.data.substring(9, postback.data.length);
    // var targetTime = new Date(time).toLocaleTimeString();
    var targetDate = new Date(date).toLocaleDateString();

    var activityActions = [];
    var rowData = await googleSheet.getData(targetDate, username);

    if (rowData.ActivityName && rowData.ActivityName != '') {
        activityActions.push(msgConst.action_postback(rowData.ActivityName, `cancel_activity_${date}_1`))
    }
    if (rowData.ActivityName2 && rowData.ActivityName2 != '') {
        activityActions.push(msgConst.action_postback(rowData.ActivityName2, `cancel_activity_${date}_2`))
    }
    if (rowData.ActivityName3 && rowData.ActivityName3 != '') {
        activityActions.push(msgConst.action_postback(rowData.ActivityName3, `cancel_activity_${date}_3`))
    }
    if (rowData.ActivityName4 && rowData.ActivityName4 != '') {
        activityActions.push(msgConst.action_postback(rowData.ActivityName4, `cancel_activity_${date}_4`))
    }
    if (rowData.ActivityName5 && rowData.ActivityName5 != '') {
        activityActions.push(msgConst.action_postback(rowData.ActivityName5, `cancel_activity_${date}_5`))
    }
    
    if (activityActions.length == 0) {
        return msgConst.text('無活動');
    } else if (activityActions.length > 1) {
        return  msgConst.quickReply('請選擇要取消的活動', activityActions);
    } else {
        return eventActivityCancel(username, activityActions[0].data);
    }
}

async function eventActivityCancel (username, data) {
    var dataAry = data.split('_');

    var date = dataAry[2];
    var targetDate = new Date(date).toLocaleDateString();
    var rowData = await googleSheet.getData(targetDate, username);
    var time = '';
    var activityName = '';
    var members = [];
    
    switch (dataAry[3]) {
        case '1':
            members = rowData.ActivityMember.split(',');
            activityName = rowData.ActivityName;
            time = rowData.ActivityTime;
            break;
        case '2':
            members = rowData.ActivityMember2.split(',');
            activityName = rowData.ActivityName2;
            time = rowData.ActivityTime2;
            break;
        case '3':
            members = rowData.ActivityMember3.split(',');
            activityName = rowData.ActivityName3;
            time = rowData.ActivityTime3;
            break;
        case '4':
            members = rowData.ActivityMember4.split(',');
            activityName = rowData.ActivityName4;
            time = rowData.ActivityTime4;
            break;
        case '5':
            members = rowData.ActivityMember5.split(',');
            activityName = rowData.ActivityName5;
            time = rowData.ActivityTime5;
            break;
    }
    
    members.forEach(async member => {
        var memberRowData = await googleSheet.getData(targetDate, member);
        var action = null;
        
        switch (activityName) {
            case memberRowData.ActivityName:
                action = sheetConst.activity;
                break;
            case memberRowData.ActivityName2:
                action = sheetConst.activity2;
                break;
            case memberRowData.ActivityName3:
                action = sheetConst.activity3;
                break;
            case memberRowData.ActivityName4:
                action = sheetConst.activity4;
                break;
            case memberRowData.ActivityName5:
                action = sheetConst.activity5;
                break;
        }

        googleSheet.addData(targetDate, action('','',''), member);
        var notifyMsg = '- 取消外出活動' + 
                        `\n活動名稱：${activityName}` +
                        `\n活動時間：${date} ${time}` +
                        `\n參與人員：${members.join(',')}`;
                        
        getWebData(`${webPath}/sendnotify?msg=${encodeURI(notifyMsg)}`);
    });

    return msgConst.text(`活動已取消 - ${activityName}`);
}

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

module.exports = {
    onReceiveEvent
};