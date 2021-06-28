const settings = require('config');


const richmenu_accountLink = settings.get('Settings.richmenu_accountLink'),;
const richmenu_main = settings.get('Settings.richmenu_main');


const setAccountLinkMenu = async (userId, client) => {
    await client.unlinkRichMenuFromUser(userId, richmenu_main);
    client.linkRichMenuToUser(userId, richmenu_accountLink);
}

const setMainMenu = async (userId, client) => {
    await client.unlinkRichMenuFromUser(userId, richmenu_accountLink);
    client.linkRichMenuToUser(userId, richmenu_main);
}

module.exports = {
    setMainMenu,
    setAccountLinkMenu
}