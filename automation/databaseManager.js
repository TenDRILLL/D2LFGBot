module.exports.getOrCreate = (guilds, bot) => {
    guilds.forEach(guild => {
        if(bot.db.has(guild.id)){
            console.log(`Guild ${guild.id} found from database.`);
        } else {
            const settings = {
                id: guild.id,
                posts: new Map()
            }
            bot.db.set(guild.id,settings);
            console.log(`Guild ${guild.id} created.`);
        }
    });
}

module.exports.removeDeletedGuilds = (bot) => {
    bot.guilds.fetch().then(()=>{
        bot.db.forEach(guild => {
            if(!bot.guilds.cache.get(guild.id)){
                bot.db.delete(guild.id);
            }
        });
    });
}

module.exports.deleteOldPosts = (bot) => {
    bot.db.forEach(guild => {
        guild.posts.forEach(async post => {
            const message = await bot.channels.cache.get(post.channelID).messages.fetch(post.messageID).catch(e => console.log(e));
            if(message){
                if(post.timestamp - new Date().getTime() <= 1000*60*15){
                    guild.posts.delete(post.messageID);
                    message.delete().catch(e => {console.log(e)});
                    bot.db.set(guild.id,guild);
                }
            } else {
                guild.posts.delete(post.messageID);
                bot.db.set(guild.id,guild);
            }
        });
    });
}