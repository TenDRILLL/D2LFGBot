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
                command.autocomplete(interaction);
            }
        }
        if(interaction.isModalSubmit()){
            const command = bot.commands.get(interaction.customId.split("-")[0]);
            if(command){
                command.modalSubmit(interaction);
            }
        }
        if(interaction.isButton()){
            const command = bot.commands.get(interaction.customId.split("-")[0]);
            if(command){
                command.handleLFG(interaction,bot);
            }
        }
    }
}
module.exports = new InteractionCreate();