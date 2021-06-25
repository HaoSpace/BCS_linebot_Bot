const text = (text) => {
    return {
        type: 'text',
        text: text
    }
}

/**
 * 
 * @param {string} text 
 * @param {*} actions 
 * @returns 
 */
const quickReply = (text, actions) => {
    actions = Array.isArray(actions) ? actions : [actions];
    return {
        type: 'text',
        text: text,
        quickReply: {
            items: actions.map((action) => 
            ({ 
                type: 'action', 
                action: {
                    type: action.type,
                    label: action.label,
                    data: action.data,
                    text: action.text,
                    displayText: action.displayText,
                    mode: action.mode
                }
            }))
        }
    }
}

const confirm = (title, yesLabel, noLabel, yesText, NoText) => {
    return {
        type: 'template',
        altText: 'Confirm alt text',
        template: {
            type: 'confirm',
            text: title,
            actions: [
                { label: yesLabel, type: 'message', text: yesText },
                { label: noLabel, type: 'message', text: NoText },
            ],
        },
    };
};

const button = (title, desc, buttonAlText, imageUrl, actions) => {
    return {
        type: 'template',
        altText: buttonAlText,
        template: {
            type: 'buttons',
            thumbnailImageUrl: imageUrl,
            imageSize: 'contain',
            title: title,
            text: desc,
            actions: actions,
        }
    };
};

const flex_button = (title, uri) => {
    return{
        "type": "flex",
        "altText": title,
        "contents": {
            "type": "bubble",
            "body": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                {
                    "type": "button",
                    "action": {
                        "type": "uri",
                        "label": title,
                        "uri": uri
                    },
                    "style": "primary"
                }]
            }
        }
    }
}

const carousel = (carouselItems) => {
    return {
        type: 'template',
        altText: 'Carousel alt text',
        template: {
            type: 'carousel',
            columns: carouselItems
        }
    };
};

const carouselItem = (title, desc, imageUrl, actions) => {
    return {
        thumbnailImageUrl: imageUrl,
        title: title,
        text: desc,
        actions: actions,
    }
};

const imageCarousel = () => {
    return {
        type: 'template',
        altText: 'Image carousel alt text',
        template: {
            type: 'image_carousel',
            columns: [
                {
                    imageUrl: 'https://i.pinimg.com/474x/02/6a/cc/026acca08fb7beea6bd4ecd430e312bd.jpg',
                    action: { label: 'Go to LINE', type: 'uri', uri: 'https://line.me' },
                },
                {
                    imageUrl: 'https://i.pinimg.com/474x/02/6a/cc/026acca08fb7beea6bd4ecd430e312bd.jpg',
                    action: { label: 'Say hello1', type: 'postback', data: 'hello こんにちは' },
                },
                {
                    imageUrl: 'https://i.pinimg.com/474x/02/6a/cc/026acca08fb7beea6bd4ecd430e312bd.jpg',
                    action: { label: 'Say message', type: 'message', text: 'Rice=米' },
                },
                {
                    imageUrl: 'https://i.pinimg.com/474x/02/6a/cc/026acca08fb7beea6bd4ecd430e312bd.jpg',
                    action: {
                        label: 'datetime',
                        type: 'datetimepicker',
                        data: 'DATETIME',
                        mode: 'datetime',
                    },
                },
            ]
        },
    }
}

const action_uri = (title, uri) => {
    return { 
        label: title, 
        type: 'uri', 
        uri: uri,
    };
};

const action_postback = (title, data, text) => {
    if (text != null) {
        return {
            label: title,
            type: 'postback', 
            data: data,
            displayText: text
        };
    } else {
        return {
            label: title,
            type: 'postback', 
            data: data
        };
    }
};

const action_text = (title, text) => {
    return  { 
        label: title, 
        type: 'message', 
        text: text 
    };
};

const action_location = (title) => {
    return {
        type: 'location',
        label: title
    };
};

const action_camera = (title) => { 
    return {
        type: 'camera',
        label: title
    };
};

const action_cameraRoll = (title) => {
    return {
        type: 'cameraRoll',
        label: title
    };
};

const action_pickTime = (title, data, mode, min = '', max = '') => {
    return {
        label: title,
        type: 'datetimepicker',
        data: data,
        mode: mode,
        max: '2017-06-18T09:15',
        min: '2017-06-18T02:15'
    }
}

const sticker = () => {
    return {
        type: 'sticker',
        packageId: '456',
        stickerId: '1988'
    }
}

module.exports = {
    sticker,
    text,
    confirm, 
    button, 
    carousel, 
    carouselItem,
    imageCarousel,
    quickReply,
    action_uri,
    action_postback,
    action_text,
    action_location,
    action_camera,
    action_cameraRoll,
    action_pickTime,
    flex_button,
};