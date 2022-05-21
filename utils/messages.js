const moment = require('moment');

function formatMessage(username, text) {
  return {
    username,
    time: moment().format('h:mm a'),
    text,
  };
}

module.exports = formatMessage;
