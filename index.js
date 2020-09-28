const Discord = require('discord.js');
const config = require('./config');

const client = new Discord.Client();

const managed = {}; // todo: move to db

client.on('voiceStateUpdate', (oldState, newState) => {
	const triggerID = '760151198354898955'; // todo: load from db
	// todo: user cooldown

	if (newState.channel.id === triggerID) {
		const name = `${newState.member.displayName}'s channel`; // todo: db
		newState.guild.channels
			.create(name, {
				type: 'voice',
				parent: newState.channel.parentID,
				permissionOverwrites: [
					{
						id: newState.member.id,
						allow: ['CONNECT'],
					},
				],
			})
			.then(channel => {
				newState.member.voice.setChannel(channel);
				managed[channel.id] = {
					owner: newState.member.id,
				};
			})
			.catch(error => {
				// todo: send user a message?
			});
	} else if (oldState.channelID in managed) {
		const channel = oldState.guild.channels.resolve(oldState.channelID);
		if (channel.members.size > 0) return;
		channel
			.delete()
			.catch(error => {
				// todo: send message why this failed
			})
			.finally(() => {
				delete managed[oldState.channelID];
			});
	}
});

client.on('channelUpdate', (old, updated) => {
	if (!(updated.id in managed)) return;
	// todo: save channel settings in db
});

client.login(config.token);
