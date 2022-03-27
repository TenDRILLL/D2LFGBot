const {readdirSync} = require("fs");

module.exports.createEvents = (bot) => {
    readdirSync("./events/").forEach(file => {
        if(file.endsWith(".js")){
            const eventFile = require(`../events/${file}`);
            if(eventFile instanceof require("./eventClass")){
                bot[eventFile.isRunOnce() ? "once" : "on"](eventFile.getEventName(),(...args) => eventFile.exec(...args, bot));
            }
        }
    });
}

module.exports.createCommands = (bot) => {
    const commands = [];
    bot.commands = new Map();
    readdirSync("./commands/").forEach(file =>{
        if(file.endsWith(".js")){
            const commandFile = require(`../commands/${file}`);
            if(commandFile instanceof require("./commandClass")){
                const slashCommand = commandFile.get();
                commands.push(slashCommand);
                bot.commands.set(slashCommand.name,commandFile);
                console.log(`Command ${slashCommand.name} imported.`);
            }
        }
    });
    //This should be commented after the first run.
    //createSlashies(commands,bot);
}

function createSlashies(commands,bot){
    console.log(`${commands.length} commands imported, creating slashcommands.`);
    bot.application.commands.set(commands).then(()=>{
        console.log("Global slashcommands set.");
    }).catch((err)=>{
        console.error(err);
    });
}