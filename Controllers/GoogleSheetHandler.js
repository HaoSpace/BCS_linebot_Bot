const { GoogleSpreadsheet } = require('google-spreadsheet');
const sheetConst = require('./SheetConst');
 

class GoogleSheetHandler {
    constructor () {
        this.doc = null;
        this.creds = null;
    }

    async linkSheet (docID,  credentialsPath = './credentials.json') {
        this.doc = new GoogleSpreadsheet(docID);
        this.creds = require(credentialsPath);
        await this.doc.useServiceAccountAuth(this.creds);
        //load document property and worksheets
        await this.doc.loadInfo(); 

        console.log('googlesheet linked success with title - ' + this.doc.title);
    }

    async addSheet (sheetTitle, header) {
        const sheet = await this.doc.addSheet( {  title: sheetTitle, headerValues: header});
        return sheet;
    }

    async removeSheet (sheet) {
        await sheet.delete();
    }

    getSheetByIndex (index) {
        return this.doc.sheetsByIndex[index];
    }

    getSheetByTitle (title) {
        return this.doc.sheetsByTitle[title];
    }

    getSheetById (id) {
        return this.doc.sheetsById[id];
    }

    async getSheetList () {
        await this.doc.resetLocalCache();
        await this.doc.loadInfo(); 
        var count = this.doc.sheetCount;
        var sheets = [];
        for (var i = 0; i < count; i++) {
            var title = this.doc.sheetsByIndex[i].title;
            if (!title.includes('@')) {
                sheets.push(this.doc.sheetsByIndex[i].title);
            }
        }
        return sheets;
    }

    async appendRow (sheet, rowValue) {
        const row = await sheet.addRow(rowValue);
        return row;
    }

    async appendRows (sheet, rowAry) {
        const rows = await sheet.addRows(rowAry);
        return rows;
    }

    async getRows (sheet) {
        return await sheet.getRows();
    }

    async getCells (sheet, pos) {
        return await sheet.loadCells(pos);
    }
    getCell (sheet, posX, posY) {
        return sheet.getCell(posX, posY);
    }

    async save(sheet) {
        await sheet.saveUpdatedCells();
    }
}

const sheetApi = new GoogleSheetHandler();

function initSheet (docID) {
    console.log('start linking googlesheet');
    sheetApi.linkSheet(docID);
}

async function addSheet (title) {
    var header = ['Date', 'PunchIn', 'PunchOut', 'Location', 'OffWorkType', 'OffWorkStart', 'OffWorkEnd', 'OffWorkConfirm', 'ActivityName', 'ActivityTime', 'ActivityMember', 'ActivityName2', 'ActivityTime2', 'ActivityMember2', 'ActivityName3', 'ActivityTime3', 'ActivityMember3', 'ActivityName4', 'ActivityTime4', 'ActivityMember4', 'ActivityName5', 'ActivityTime5', 'ActivityMember5', 'ActivityName6', 'ActivityTime6', 'ActivityMember6', 'ActivityName7', 'ActivityTime7', 'ActivityMember7', 'ActivityName8', 'ActivityTime8', 'ActivityMember8', 'ActivityName9', 'ActivityTime9', 'ActivityMember9', 'ActivityName10', 'ActivityTime10', 'ActivityMember10'];
    
    var sheet = sheetApi.getSheetByTitle(title);
    if (!sheet) {
        sheet = await sheetApi.addSheet(title, ['Date']);
    }
   
    await sheet.resize({ rowCount: 1000, columnCount: 38 });
    await sheet.setHeaderRow(header);

    return sheet;
}

async function appendRow (properties, username) {
    
    if (!username) {
        return;
    }
    var sheet = sheetApi.getSheetByTitle(username);

    if (!sheet) {
        sheet = await addSheet(username);
    }
    console.log(`title: ${sheet.title}`);
    return sheetApi.appendRow(sheet, properties);
}

async function addData (date, properties, username) {
    
    if (!username) {
        return;
    }

    var sheet = sheetApi.getSheetByTitle(username);

    if (!sheet) {
        sheet = await addSheet(username);
    }
    console.log(`title: ${sheet.title}`);
    var rows = await sheetApi.getRows(sheet);
    
    if (rows.length > 0) {
        var lastDate = Date.parse(rows[rows.length - 1].Date);
        var firstDate = Date.parse(rows[0].Date);
        var currentDate = Date.parse(date);

       
        if (lastDate >= currentDate && firstDate <= currentDate) {
            var deviation = (currentDate - firstDate) / (24*60*60*1000);
            
            rows[deviation].PunchIn = properties.PunchIn;
            rows[deviation].PunchOut = properties.PunchOut;
            rows[deviation].Location = properties.Location;
            rows[deviation].OffWorkType = properties.OffWorkType;
            rows[deviation].OffWorkStart = properties.OffWorkStart;
            rows[deviation].OffWorkEnd = properties.OffWorkEnd;
            rows[deviation].ActivityName = properties.ActivityName;
            rows[deviation].ActivityTime = properties.ActivityTime;
            rows[deviation].ActivityMember = properties.ActivityMember;
            rows[deviation].ActivityName2 = properties.ActivityName2;
            rows[deviation].ActivityTime2 = properties.ActivityTime2;
            rows[deviation].ActivityMember2 = properties.ActivityMember2;
            rows[deviation].ActivityName3 = properties.ActivityName3;
            rows[deviation].ActivityTime3 = properties.ActivityTime3;
            rows[deviation].ActivityMember3 = properties.ActivityMember3;
            rows[deviation].ActivityName4 = properties.ActivityName4;
            rows[deviation].ActivityTime4 = properties.ActivityTime4;
            rows[deviation].ActivityMember4 = properties.ActivityMember4;
            rows[deviation].ActivityName5 = properties.ActivityName5;
            rows[deviation].ActivityTime5 = properties.ActivityTime5;
            rows[deviation].ActivityMember5 = properties.ActivityMember5;
            rows[deviation].ActivityName6 = properties.ActivityName6;
            rows[deviation].ActivityTime6 = properties.ActivityTime6;
            rows[deviation].ActivityMember6 = properties.ActivityMember6;
            rows[deviation].ActivityName7 = properties.ActivityName7;
            rows[deviation].ActivityTime7 = properties.ActivityTime7;
            rows[deviation].ActivityMember7 = properties.ActivityMember7;
            rows[deviation].ActivityName8 = properties.ActivityName8;
            rows[deviation].ActivityTime8 = properties.ActivityTime8;
            rows[deviation].ActivityMember8 = properties.ActivityMember8;
            rows[deviation].ActivityName9 = properties.ActivityName9;
            rows[deviation].ActivityTime9 = properties.ActivityTime9;
            rows[deviation].ActivityMember9 = properties.ActivityMember9;
            rows[deviation].ActivityName10 = properties.ActivityName10;
            rows[deviation].ActivityTime10 = properties.ActivityTime10;
            rows[deviation].ActivityMember10 = properties.ActivityMember10;

            rows[deviation].save();
        } 
        else if (currentDate > lastDate) {
            var deviation = (currentDate - lastDate) / (24*60*60*1000);
            var propertyAry = new Array(deviation).fill(0);

            propertyAry = propertyAry.map(function(value, index, array) {
                var dateTime = getDateTimeData(lastDate + ((index + 1) * (24*60*60*1000)));
                var targetDate = `${dateTime.year}/${dateTime.month}/${dateTime.date}`;
                return sheetConst.date(targetDate);
            });

            await sheetApi.appendRows(sheet, propertyAry);

            rows = await sheetApi.getRows(sheet);
            rows[rows.length - 1].PunchIn = properties.PunchIn;
            rows[rows.length - 1].PunchOut = properties.PunchOut;
            rows[rows.length - 1].Location = properties.Location;
            rows[rows.length - 1].OffWorkType = properties.OffWorkType;
            rows[rows.length - 1].OffWorkStart = properties.OffWorkStart;
            rows[rows.length - 1].OffWorkEnd = properties.OffWorkEnd;
            rows[rows.length - 1].ActivityName = properties.ActivityName;
            rows[rows.length - 1].ActivityTime = properties.ActivityTime;
            rows[rows.length - 1].ActivityMember = properties.ActivityMember;
            rows[rows.length - 1].ActivityName2 = properties.ActivityName2;
            rows[rows.length - 1].ActivityTime2 = properties.ActivityTime2;
            rows[rows.length - 1].ActivityMember2 = properties.ActivityMember2;
            rows[rows.length - 1].ActivityName3 = properties.ActivityName3;
            rows[rows.length - 1].ActivityTime3 = properties.ActivityTime3;
            rows[rows.length - 1].ActivityMember3 = properties.ActivityMember3;
            rows[rows.length - 1].ActivityName4 = properties.ActivityName4;
            rows[rows.length - 1].ActivityTime4 = properties.ActivityTime4;
            rows[rows.length - 1].ActivityMember4 = properties.ActivityMember4;
            rows[rows.length - 1].ActivityName5 = properties.ActivityName5;
            rows[rows.length - 1].ActivityTime5 = properties.ActivityTime5;
            rows[rows.length - 1].ActivityMember5 = properties.ActivityMember5;
            rows[rows.length - 1].ActivityName6 = properties.ActivityName6;
            rows[rows.length - 1].ActivityTime6 = properties.ActivityTime6;
            rows[rows.length - 1].ActivityMember6 = properties.ActivityMember6;
            rows[rows.length - 1].ActivityName7 = properties.ActivityName7;
            rows[rows.length - 1].ActivityTime7 = properties.ActivityTime7;
            rows[rows.length - 1].ActivityMember7 = properties.ActivityMember7;
            rows[rows.length - 1].ActivityName8 = properties.ActivityName8;
            rows[rows.length - 1].ActivityTime8 = properties.ActivityTime8;
            rows[rows.length - 1].ActivityMember8 = properties.ActivityMember8;
            rows[rows.length - 1].ActivityName9 = properties.ActivityName9;
            rows[rows.length - 1].ActivityTime9 = properties.ActivityTime9;
            rows[rows.length - 1].ActivityMember9 = properties.ActivityMember9;
            rows[rows.length - 1].ActivityName10 = properties.ActivityName10;
            rows[rows.length - 1].ActivityTime10 = properties.ActivityTime10;
            rows[rows.length - 1].ActivityMember10 = properties.ActivityMember10;

            rows[rows.length - 1].save();
        } else {
            return 'out of range';
        }
    } 
    else {
        sheetApi.appendRow(sheet, {...sheetConst.date(date), ...properties});
    }
}

// function appendRowWith

async function getAllSheetName () {
    return await sheetApi.getSheetList();
}

async function getData (date, username) {
    if (!username) {
        return null;
    }

    var sheet = sheetApi.getSheetByTitle(username);

    if (!sheet) {
        sheet = addSheet(username);
        return null;
    }

    console.log(`title: ${sheet.title}`);
    var rows = await sheetApi.getRows(sheet);

    if (rows.length > 0) {
        var lastDate = Date.parse(rows[rows.length - 1].Date);
        var firstDate = Date.parse(rows[0].Date);
        var currentDate = Date.parse(date);

        if (lastDate >= currentDate && firstDate <= currentDate) { 
            var deviation = (currentDate - firstDate) / (24*60*60*1000);
            return rows[deviation];
        }
    }

    return null;
}

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


module.exports = {
    initSheet,
    addSheet,
    appendRow,
    addData,
    getData,
    getAllSheetName
};