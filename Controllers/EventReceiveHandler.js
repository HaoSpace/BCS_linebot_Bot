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


function handleBeacon (event) {
    return msgConst.text(`Got beacon: ${event.beacon.hwid}`);
}

function testGoogle () {
    //googleSheet.addSheet('Jason');
    // googleSheet.appendRow({'日期': 123123});
    // var currentDate = new Date(Date.now()).toLocaleDateString();
    // var dateTic = Date.parse(currentDate);
    // var currentDate = new Date(dateTic + ((6) * (24*60*60*1000))).toLocaleDateString();
    // googleSheet.addData(currentDate, {...sheetConst.checkIn(123, 456), ...sheetConst.checkOut(789)});
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

    var urlLink = `${webPath}/link?link_token=${token}`;
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
    var dateTime = getDateTimeData(Date.now());
    var currentTime = `${dateTime.hour}:${dateTime.min}`;
    var currentDate = `${dateTime.year}/${dateTime.month}/${dateTime.date}`;
    var location = `address: ${event.address} \nposition: (${event.latitude},${event.longitude})`;

    var row = await googleSheet.getData(currentDate, username);

    if (row == null || !row.PunchIn || row.PunchIn == '') {
        googleSheet.addData(currentDate, sheetConst.checkIn(currentTime, location), username);
    }

    var returnMsg = `${username} 上班打卡完成` + 
                    `\n${currentDate} ${currentTime}`
    return msgConst.text(returnMsg);
}

function handleSticker () {
    return msgConst.text('你傳貼圖給我幹嘛？');
}

function handleFollow (event, client) {
    db.getData(event.source.userId, (error, rowData) => {
        if (error != null) {
            console.log('init Account link');
            richMenu.setAccountLinkMenu(event.source.userId, client);
        } else {
            richMenu.setMainMenu(event.source.userId, client);
            console.log('init main: ' + rowData.nonce + ', ' + rowData.userId);
        }
    });
}

function handleUnfollow (event, client) {
    
}

function handleJoin (event) {
    return msgConst.text(`Joined ${event.source.type}`);
}

function handleLeave (event) {
    console.log(`Left: ${JSON.stringify(event)}`);
    return null;
}

async function handleAccountLink(event, client) {
    if (event.link.result != 'ok') {
        return msgConst.text('帳號綁定失敗，請向相關人員確認。');
    }

    if (!event.source.userId || !event.link || !event.link.nonce) {
        return msgConst.text('userId or nonce not found');
    }

    db.addData(event.source.userId, event.link.nonce);
    richMenu.setMainMenu(event.source.userId, client);

    var url =`${webPath}/getname?nonce=${event.link.nonce}`
    var username = await getWebData(url);
    await googleSheet.addSheet(username);

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

async function eventCheckOut (username) {
    var dateTime = getDateTimeData(Date.now());
    var currentTime = `${dateTime.hour}:${dateTime.min}`;
    var currentDate = `${dateTime.year}/${dateTime.month}/${dateTime.date}`;

    var currentRow = await googleSheet.getData(currentDate, username);

    if (currentRow == null || !currentRow.PunchIn || currentRow.PunchIn == '') {
        return msgConst.text('你尚未上班打卡');
    }
    googleSheet.addData(currentDate, sheetConst.checkOut(currentTime), username);

    var returnMsg = `${username} 下班打卡完成` + 
                    `\n${currentDate} ${currentTime}`
   
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
    var dateTime = getDateTimeData(postback.params.datetime);
    var type = postback.data.substring(11, postback.data.length);
    var targetTime = `${dateTime.hour}:${dateTime.min}`;
    var targetDate = `${dateTime.year}/${dateTime.month}/${dateTime.date}`;

    googleSheet.addData(targetDate, sheetConst.offWorkStart(type, targetTime), username);
    
    //send end picker
    var action = msgConst.action_pickTime('設定結束時間', `leaveEnd_${type}_${targetDate} ${targetTime}`, 'datetime', `${targetDate}t${targetTime}`);
    var quickEvent = msgConst.quickReply(`請假起始時間: \n${targetDate} ${targetTime}\n假別: ${type}`, action);

    return quickEvent;
}

async function eventLeaveEnd (postback, username) {
    //handle end time
    var dateTime = getDateTimeData(postback.params.datetime);
    var data = postback.data.substring(9, postback.data.length);

    var targetDate = `${dateTime.year}/${dateTime.month}/${dateTime.date}`;
    var targetTime = `${dateTime.hour}:${dateTime.min}`;

    data = data.split('_');
    var type = data[0];
    var startDateTime = getDateTimeData(data[1]);
    var startDate = `${startDateTime.year}/${startDateTime.month}/${startDateTime.date}`;
    var startTime = `${startDateTime.hour}:${startDateTime.min}`;
   
    if (dateTime.origin.getTime() < startDateTime.origin.getTime()) {
        var action = msgConst.action_pickTime('設定結束時間', `leaveEnd_${data.join('_')}`, 'datetime', `${targetDate}t${targetTime}`);
        var quickEvent = msgConst.quickReply('結束時間不可早於起始時間，請重新設定', action);
    
        return quickEvent;
    } else {
        var deviation = (Date.parse(targetDate) - Date.parse(startDate)) / (24*60*60*1000);
        
        if (deviation == 0) {
            googleSheet.addData(targetDate, sheetConst.offWorkEnd(targetTime), username);
        } else {
            var asyncRun = async () => {
                for (var i = 0; i <= deviation; i++) {

                    var dateTic = Date.parse(startDate);
                    var currentRowDateTime = getDateTimeData(dateTic + ((i) * (24*60*60*1000)));
                    var currentRowDate = `${currentRowDateTime.year}/${currentRowDateTime.month}/${currentRowDateTime.date}`

                    if (i == deviation) {
                        await googleSheet.addData(currentRowDate, sheetConst.offWorkEnd(targetTime), username);
                    } else {
                        await googleSheet.addData(currentRowDate, sheetConst.offWorkEnd('18:00'), username);
                    }
                    
                    var type_str = `${type} group(${startDate}-${targetDate})`;
                    if (i != 0) {
                        await googleSheet.addData(currentRowDate, sheetConst.offWorkStart(type_str, '09:00'), username);
                    } else {
                        await googleSheet.addData(currentRowDate, sheetConst.offWorkStart(type_str, startTime), username);
                    }
                }
            }

            asyncRun();
        }

        var notifyMsg = '- 請假申請' +
                        `\n假別：${type}` +
                        `\n開始時間：${startDate} ${startTime}` +
                        `\n結束時間：${targetDate} ${targetTime}` + 
                        `\n人員：${username}\n\n` +
                        `\n查核連結：${sheetPath}`
        getWebData(`${webPath}/sendnotify?msg=${encodeURI(notifyMsg)}`);
        
        var text1 = msgConst.text(`請假結束時間: \n${targetDate} ${targetTime}\n假別: ${type}`);
        var text2 = msgConst.text('已申請請假，待核准');
        return [text1, text2];
    }
}

async function eventOffWorkCancel (username, postback) {
    var dateTime = getDateTimeData(postback.params.date);
    var targetDate = `${dateTime.year}/${dateTime.month}/${dateTime.date}`;
    var targetTime = `${dateTime.hour}:${dateTime.min}`;

    var rowData = await googleSheet.getData(targetDate, username);
    var type_str = rowData.OffWorkType;

    if (rowData != null  && type_str && type_str != '' && !rowData.OffWorkType.includes('已取消')) {
        if (rowData.OffWorkType.includes('group')) {
            type_str = type_str.split(' ');
            var type = type_str[0];
            var dateAry = type_str[1].replace('group(', '').replace(')', '').split('-');
            var deviation = (Date.parse(dateAry[1]) - Date.parse(dateAry[0])) / (24*60*60*1000);

            for (var i = 0; i <= deviation; i++) {
                var dateTic = Date.parse(dateAry[0]);
                var currentRowDateTime = getDateTimeData(dateTic + ((i) * (24*60*60*1000)));
                var currentRowDate = `${currentRowDateTime.year}/${currentRowDateTime.month}/${currentRowDateTime.date}`;
                
                googleSheet.addData(currentRowDate, sheetConst.offWorkStart(`${type}(已取消)`, '09:00'), username);
            }

            var notifyMsg = '- 請假取消' +
            `\n假別：${type}` +
            `\n開始時間：${dateAry[0]}` +
            `\n結束時間：${dateAry[1]}` +
            `\n人員：${username}`;

            getWebData(`${webPath}/sendnotify?msg=${encodeURI(notifyMsg)}`);
            
            return msgConst.text(`${notifyMsg.replace('- ', '')}`);
        } else {
            googleSheet.addData(targetDate, sheetConst.offWorkStart(`${type_str}(已取消)`, rowData.OffWorkStart), username);

            var notifyMsg = '- 請假取消' +
                            `\n假別：${type_str}` +
                            `\n開始時間：\n${rowData.Date} ${rowData.OffWorkStart}` +
                            `\n結束時間：\n${rowData.Date} ${rowData.OffWorkEnd}` +
                            `\n人員：${username}`;
            getWebData(`${webPath}/sendnotify?msg=${encodeURI(notifyMsg)}`);
            return msgConst.text(`${notifyMsg.replace('- ', '')}`);
        }
    }

    return msgConst.text('查無請假資料');
}

function eventActivity () {
    var action1 = msgConst.action_postback('外出', 'activityTime');
    var action2 = msgConst.action_postback('請假', 'leave');
    var action3 = msgConst.action_pickTime('取消請假', 'cancelOffWork', 'date');
    var action4 = msgConst.action_pickTime('取消活動', 'cancelActivity', 'date');

    var quickEvent = msgConst.quickReply('請於下方選擇活動', [action1, action2, action3, action4]);

    return quickEvent;
} 

async function evenActivityTime (username) {
    var sheets = await googleSheet.getAllSheetName(); 
    var members = sheets.join('-');
    var urlLink = `${liffPath}/eventpicker?members=${members}&self=${username}`;
    console.log(`link: ${urlLink}`);
    
    return msgConst.flex_button('建立外出活動', urlLink);
}

async function eventSetActivity (event, client) {
    var data = event.message.text.replace('建立外出活動', '');
    var eventData = JSON.parse(data);
    var dateTime = getDateTimeData(eventData.eventTime);
    var targetDate = `${dateTime.year}/${dateTime.month}/${dateTime.date}`;
    var targetTime = `${dateTime.hour}:${dateTime.min}`;
    var errorMsg = '';

    eventData.members.forEach (async member => {

        var rowData = await googleSheet.getData(targetDate, member);
        if (rowData == null) {
            var result = await googleSheet.addData(targetDate, sheetConst.activity(eventData.eventName.toString(), targetTime, eventData.members.join(',')), member);
            
            if (result == 'out of range') {
                errorMsg += `\n${member} 日期有誤，請確認後重新建立` 
            }
            
        } else {
            var activity = null;
            if (!rowData.ActivityName || eventData.eventName.toString() == rowData.ActivityName) {
                activity = sheetConst.activity;
            } else if (!rowData.ActivityName2 || eventData.eventName.toString() == rowData.ActivityName2) {
                activity = sheetConst.activity2;
            } else if (!rowData.ActivityName3 || eventData.eventName.toString() == rowData.ActivityName3) {
                activity = sheetConst.activity3;
            } else if (!rowData.ActivityName4 || eventData.eventName.toString() == rowData.ActivityName4) {
                activity = sheetConst.activity4;
            } else if (!rowData.ActivityName5 || eventData.eventName.toString() == rowData.ActivityName5) {
                activity = sheetConst.activity5;
            } else if (!rowData.ActivityName6 || eventData.eventName.toString() == rowData.ActivityName6) {
                activity = sheetConst.activity6;
            } else if (!rowData.ActivityName7 || eventData.eventName.toString() == rowData.ActivityName7) {
                activity = sheetConst.activity7;
            } else if (!rowData.ActivityName8 || eventData.eventName.toString() == rowData.ActivityName8) {
                activity = sheetConst.activity8;
            } else if (!rowData.ActivityName9 || eventData.eventName.toString() == rowData.ActivityName9) {
                activity = sheetConst.activity9;
            } else if (!rowData.ActivityName10 || eventData.eventName.toString() == rowData.ActivityName10) {
                activity = sheetConst.activity10;
            }

            if (activity == null) {
                errorMsg += `\n${member} 外出活動建立失敗，已超過當日建立上限，請刪除部分活動或與我們聯繫！`;
            } else {
                googleSheet.addData(targetDate, activity(eventData.eventName.toString(), targetTime, eventData.members.join(',')), member);
            } 
        }  
        if (errorMsg != '') {
            client.replyMessage(event.replyToken, msgConst.text(`外出活動建立失敗 -${errorMsg}`));
        } else {
            client.replyMessage(event.replyToken, msgConst.text('外出活動建立完成'));
        }
    });
    
    var notifyMsg ='- 外出活動' + 
                    `\n活動名稱：${eventData.eventName}` +
                    `\n活動時間：${targetDate} ${targetTime}` +
                    `\n參與人員：${eventData.members.join(', ')}`
    getWebData(`${webPath}/sendnotify?msg=${encodeURI(notifyMsg)}`);
   
}
async function eventActivitySelectToCancel (username, postback) {
    var dateTime = getDateTimeData(postback.params.date);
    var targetDate = `${dateTime.year}/${dateTime.month}/${dateTime.date}`;

    var activityActions = [];
    var rowData = await googleSheet.getData(targetDate, username);

    if (rowData.ActivityName && rowData.ActivityName != '') {
        activityActions.push(msgConst.action_postback(rowData.ActivityName, `cancel_activity_${targetDate}_1`))
    }
    if (rowData.ActivityName2 && rowData.ActivityName2 != '') {
        activityActions.push(msgConst.action_postback(rowData.ActivityName2, `cancel_activity_${targetDate}_2`))
    }
    if (rowData.ActivityName3 && rowData.ActivityName3 != '') {
        activityActions.push(msgConst.action_postback(rowData.ActivityName3, `cancel_activity_${targetDate}_3`))
    }
    if (rowData.ActivityName4 && rowData.ActivityName4 != '') {
        activityActions.push(msgConst.action_postback(rowData.ActivityName4, `cancel_activity_${targetDate}_4`))
    }
    if (rowData.ActivityName5 && rowData.ActivityName5 != '') {
        activityActions.push(msgConst.action_postback(rowData.ActivityName5, `cancel_activity_${targetDate}_5`))
    }
    if (rowData.ActivityName6 && rowData.ActivityName6 != '') {
        activityActions.push(msgConst.action_postback(rowData.ActivityName6, `cancel_activity_${targetDate}_6`))
    }
    if (rowData.ActivityName7 && rowData.ActivityName7 != '') {
        activityActions.push(msgConst.action_postback(rowData.ActivityName7, `cancel_activity_${targetDate}_7`))
    }
    if (rowData.ActivityName8 && rowData.ActivityName8 != '') {
        activityActions.push(msgConst.action_postback(rowData.ActivityName8, `cancel_activity_${targetDate}_8`))
    }
    if (rowData.ActivityName9 && rowData.ActivityName9 != '') {
        activityActions.push(msgConst.action_postback(rowData.ActivityName9, `cancel_activity_${targetDate}_9`))
    }
    if (rowData.ActivityName10 && rowData.ActivityName10 != '') {
        activityActions.push(msgConst.action_postback(rowData.ActivityName10, `cancel_activity_${targetDate}_10`))
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

    var targetDate = dataAry[2];
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
        case '6':
            members = rowData.ActivityMember6.split(',');
            activityName = rowData.ActivityName6;
            time = rowData.ActivityTime6;
            break;
        case '7':
            members = rowData.ActivityMember7.split(',');
            activityName = rowData.ActivityName7;
            time = rowData.ActivityTime7;
            break;
        case '8':
            members = rowData.ActivityMember8.split(',');
            activityName = rowData.ActivityName8;
            time = rowData.ActivityTime8;
            break;
        case '9':
            members = rowData.ActivityMember9.split(',');
            activityName = rowData.ActivityName9;
            time = rowData.ActivityTime9;
            break;
        case '10':
            members = rowData.ActivityMember10.split(',');
            activityName = rowData.ActivityName10;
            time = rowData.ActivityTime10;
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
            case memberRowData.ActivityName6:
                action = sheetConst.activity6;
                break;
            case memberRowData.ActivityName7:
                action = sheetConst.activity7;
                break;
            case memberRowData.ActivityName8:
                action = sheetConst.activity8;
                break;
            case memberRowData.ActivityName9:
                action = sheetConst.activity9;
                break;
            case memberRowData.ActivityName10:
                action = sheetConst.activity10;
                break;
        }

        googleSheet.addData(targetDate, action('','',''), member);
        var notifyMsg = '- 取消外出' + 
                        `\n活動名稱：${activityName}` +
                        `\n活動時間：\n${targetDate} ${time}` +
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

function sheetTimeFormat_24 (date, time , join = ' ') {
    
    var timeAry = [];
    var hour = '';

    if (time.includes('下午 ')) {
        timeAry = time.replace('下午 ', '').split(':');
        hour = parseInt(timeAry[0]) + 12;
    } else {
        timeAry = time.replace('上午 ', '').split(':');
        hour = parseInt(timeAry[0])
        hour = hour.toString().padStart(2, '0');
    }
    
    if (date.includes('/')) {
        date = date.split('/');
    } else if (date.includes('-')) {
        date = date.split('-');
    }

    date[1] = date[1].padStart(2, '0');
    date[2] = date[2].padStart(2, '0');

    return date.join('-') + join + hour + ":" + timeAry[1];
}

//handle with diffenent language
function getDateTimeData (value) {
    var dateTime = new Date(value);
    var yearValue = dateTime.getFullYear();
    var monthValue = dateTime.getMonth() + 1;
    var dateValue = dateTime.getDate();
    var hourValue = dateTime.getHours().toString().padStart(2, '0');
    var minValue = dateTime.getMinutes().toString().padStart(2, '0');
    var secValue = dateTime.getSeconds().toString().padStart(2, '0');

    return {
        origin: dateTime,
        year: yearValue,
        month: monthValue,
        date: dateValue,
        hour: hourValue,
        min: minValue,
        sec: secValue
    }
}

function randomHash(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

   return result;
}

module.exports = {
    onReceiveEvent
};