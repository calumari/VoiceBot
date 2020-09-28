const Discord = require('discord.js');

const db = require('./db');
const config = require('./config');

const client = new Discord.Client();

client.on('voiceStateUpdate', (oldState, newState) => {
	const { channel_id: channelID } = db.selectGuildById.get(newState.guild.id);
	if (channelID === undefined) return;
	// todo: user cooldown

	if (newState.channelID === channelID) {
		const prefs = db.selectUserPreferences(newState.member.id) || {};
		newState.guild.channels
			.create(prefs.name || `${newState.member.displayName}'s channel`, {
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
	const channel = db.selectChannelById.get(updated.id);
	if (channel === undefined) return;

	db.deleteUserPreferences(channel['owner_id']);
	db.insertUserPreference.run(
		channel['owner_id'],
		updated.name,
		updated.userLimit,
		updated.bitrate,
	);
});

client.login(config.token);
