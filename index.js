const Discord = require('discord.js');
const db = require('./db');
const config = require('./config');

const client = new Discord.Client();

client.on('voiceStateUpdate', (oldState, newState) => {
	const { channel_id: id } = db.selectGuildById.get(newState.guild.id);
	if (id === undefined) return;
	// todo: user cooldown

	if (newState.channelID === id) {
		const name = `${newState.member.displayName}'s channel`; // todo: db
		newState.guild.channels
			.create(name, {
				type: 'voice',
				parent: newState.channel.parentID,
				permissionOverwrites: [
					{
						id: newState.member.id,
						allow: ['CONNECT', 'VIEW_CHANNEL'],
					},
				],
			})
			.then(channel => {
				newState.member.voice.setChannel(channel);
				db.insertChannel.run(channel.id, newState.member.id);
			})
			.catch(error => {
				// todo: send user a message?
			});
	}

	if (db.selectChannelById.get(oldState.channelID) !== undefined) {
		const channel = oldState.guild.channels.resolve(oldState.channelID);
		if (channel.members.size > 0) return;
		channel
			.delete()
			.catch(error => {
				// todo: send message why this failed
			})
			.finally(() => {
				db.deleteChannel.run(oldState.channelID);
			});
	}
});

client.on('channelUpdate', (old, updated) => {
	if (db.selectChannelById.get(oldState.channelID) !== undefined) return;
	// todo: save channel settings in db
});

client.login(config.token);
