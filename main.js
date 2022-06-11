const {Client,IntentsBitField} = require("discord.js");
const Enmap = require("enmap");
const bot = new Client({intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent
]});
const {token} = require("./config.json");
bot.db = new Enmap({name:"servers"});
require("./automation/loader").createEvents(bot);
bot.login(token).then(()=>console.log("Authentication successful.")).catch((e)=>console.log("Authentication failed; " + e));