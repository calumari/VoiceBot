const Discord = require('discord.js');
const { readdirSync } = require('fs');

const config = require('./config');
const client = new Discord.Client();

readdirSync('./events')
    .filter(f => f.endsWith('.js'))
    .forEach(f => {
        const name = f.substring(0, f.indexOf('.'));
        console.log(`Loading event: ${name}`);
        client.on(name, require(`./events/${f}`).bind(null, client));
        delete require.cache[require.resolve(`./events/${f}`)];
    });

client.login(config.token);
