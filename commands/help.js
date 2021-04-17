const pjson = require('../package.json');

exports.run = (client, message, label, args) => {
    if (typeof client.config.helpCommand === 'function') {
        return message.channel.send(client.config.helpCommand(pjson));
    }
    message.channel.send(client.config.helpCommand);
};

exports.usage = {
    name: 'help',
};
