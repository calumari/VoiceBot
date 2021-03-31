exports.run = (client, message, args) => {
    message.channel.send(client.config.helpCommand)
};

exports.usage = {
    name: 'help',
};
