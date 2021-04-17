exports.run = (client, message, label, args) => {
    message.channel.send(`<${client.config.invite}>`);
};

exports.usage = {
    name: 'invite',
};
