class InteractionCreate extends require("../automation/eventClass"){
    constructor() {
        super("interactionCreate",false);
    }
    exec(interaction,bot){
        if(interaction.isCommand()){
            const command = bot.commands.get(interaction.commandName);
            if(command){
                command.exec(interaction,bot);
            }
        }
        if(interaction.isAutocomplete()){
            const command = bot.commands.get(interaction.commandName);
            if(command){
                command.autoComplete(interaction);
            }
        }
    }
}
module.exports = new InteractionCreate();