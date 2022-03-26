module.exports.exec = (guilds, bot) => {
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