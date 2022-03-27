module.exports.getOrCreate = (guilds, bot) => {
    guilds.forEach(guild => {
        if(bot.db.has(guild.id)){
            console.log(`Guild ${guild.id} found from database.`);
        } else {
            const settings = {
                id: guild.id,
                posts: new Set()
            }
            bot.db.set(guild.id,settings);
            console.log(`Guild ${guild.id} created.`);
        }
    });
}

module.exports.removeDeletedGuilds = (bot) => {
    bot.db.forEach(guild => {
        if(!bot.guilds.cache.get(guild.id)){
            bot.db.delete(guild.id);
        }
    });
}