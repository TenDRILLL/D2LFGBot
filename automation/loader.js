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