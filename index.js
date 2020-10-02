const Discord = require('discord.js');
const { readdirSync } = require('fs');

require('./extensions/ExtendedGuild');
require('./extensions/ExtendedVoiceChannel');

const client = new Discord.Client(); // todo: move to own class

client.config = require('./config');
client.db = require('./utils/db');

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();

readdirSync('./commands')
    .filter(f => f.endsWith('.js'))
    .forEach(f => {
        const command = require(`./commands/${f}`);
        client.commands.set(command.usage.name, command);
        if (command.usage.aliases) {
            for (const alias of command.usage.aliases) {
                client.aliases.set(alias, command);
            }
        }
        delete require.cache[require.resolve(`./commands/${f}`)];
    });

readdirSync('./events')
    .filter(f => f.endsWith('.js'))
    .forEach(f => {
        const name = f.substring(0, f.indexOf('.'));
        console.log(`Loading event: ${name}`);
        client.on(name, require(`./events/${f}`).bind(null, client));
        delete require.cache[require.resolve(`./events/${f}`)];
    });

client.login(client.config.token);
