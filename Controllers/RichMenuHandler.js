const settings = require('config');


const richmenu_accountLink ='richmenu-795141e0041ef401f6ed9db338155845';
const richmenu_main ='richmenu-81b25b8b516d359a8596183730249656';


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