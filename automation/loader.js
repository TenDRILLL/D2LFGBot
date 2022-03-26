const {readdirSync} = require("fs");

module.exports.createEvents = (bot) => {
    readdirSync("./events/").forEach(file => {
        if(file.endsWith(".js")){
            const eventFile = require(`../events/${file}`);
            if(eventFile instanceof require("./eventClass")){
                eventFile.isRunOnce() ? bot.once(eventFile.getEventName(), (...args) => eventFile.exec(...args, bot)) : bot.on(eventFile.getEventName(), (...args) => eventFile.exec(...args, bot));
            }
        }
    });
}

module.exports.createCommands = (bot) => {
    const commands = [];
    readdirSync("./commands/").forEach(file =>{
        if(file.endsWith(".js")){
            const commandFile = require(`../commands/${file}`);
            if(commandFile instanceof require("./commandClass")){
                const slashCommand = commandFile.get();
                commands.push(slashCommand);
                console.log(`Command ${slashCommand.name} imported.`);
            }
        }
    });
    console.log(`${commands.length} commands imported, creating slashcommands.`);
    bot.application.commands.set(commands).then(()=>{
        console.log("Global slashcommands set.");
    }).catch((err)=>{
        console.error(err);
    });
}