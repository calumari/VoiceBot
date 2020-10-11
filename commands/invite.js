exports.run = (client, message, args) => {
    message.channel.send(`<${client.config.invite}>`);
};

exports.usage = {
    name: 'invite',
};
