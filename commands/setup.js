exports.run = (client, message, args) => {
    // todo: does this guild have a managed channel AND does it exist?
    message.guild.channels
        .create('Join to Create', {
            type: 'voice',
        })
        .then(channel => {
            client.db.updateGuildChannel.run(channel.id, message.guild.id);
        })
        .catch(err => {
            // todo: send permission message!
        });
};

exports.usage = {
    name: 'setup',
};
