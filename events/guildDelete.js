class GuildDelete extends require("../automation/eventClass"){
    constructor() {
        super("guildDelete",false);
    }
    exec(guild,bot){
        bot.db.delete(guild.id);
        console.log(`Guild ${guild.id} deleted.`);
    }
}

module.exports = new GuildDelete();