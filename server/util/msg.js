var moment = require('moment');

var generateMessage = (from, text) => {
    return {
        from: from,
        text: text,
        createdAt: moment().valueOf()
    }
}
var generateLocMsg = (from, latitude, longitude) => {
    return {
        from: from,
        url: `https://www.google.co.in/maps?q=${latitude},${longitude}`,
        createdAt: moment().valueOf()
    }
}

module.exports = {
    generateMessage: generateMessage,
    generateLocMsg: generateLocMsg
}