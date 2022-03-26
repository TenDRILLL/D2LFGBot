class Ready extends require("../automation/eventClass"){
    constructor() {
        super("ready",true);
    }
    exec(bot){
        console.log(`Ready, using account ${bot.user.tag}`);
        //TODO: Load commands here.
        bot.db.defer.then(()=>{
            console.log(`Database loaded, containing ${bot.db.size} guilds.`);
        });
        bot.guilds.fetch();
        console.log(`Currently on ${bot.guilds.cache.size} guilds.`);
        require("../automation/checkDB").exec(bot.guilds.cache,bot);
        bot.user.setPresence({activities: [{name: `DROWN DROWN DROWN`}], status: `online`});
        setInterval(()=>{
            bot.user.setPresence({activities: [{name: `DROWN DROWN DROWN`}], status: `online`});
        },1000*60*30);
    }
}
module.exports = new Ready();