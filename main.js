const {Client} = require("discord.js");
const Enmap = require("enmap");
const bot = new Client({intents: ["GUILDS"]});
const {token} = require("./config.json");
bot.db = new Enmap({name:"servers"});
require("./automation/loader").createEvents(bot);
bot.login(token).then(()=>console.log("Authentication successful.")).catch((e)=>console.log("Authentication failed; " + e));