class GuildCreate extends require("../automation/eventClass"){
    constructor() {
        super("guildCreate",false);
    }
    exec(guild,bot){
        require("../automation/databaseManager").getOrCreate([guild],bot);
    }
}
module.exports = new GuildCreate();