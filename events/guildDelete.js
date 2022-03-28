class GuildDelete extends require("../automation/eventClass"){
    constructor() {
        super("guildDelete",false);
    }
    exec(guild,bot){
        if(!bot.db.has(guild.id)) return;
        bot.db.delete(guild.id);
        console.log(`Guild ${guild.id} deleted.`);
    }
}
module.exports = new GuildDelete();