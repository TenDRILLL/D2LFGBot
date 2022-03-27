const lfgOptions = require("../lfg-options.json");
const {ApplicationCommandOptionType,ModalBuilder,TextInputBuilder,ActionRowBuilder,TextInputStyle} = require("discord.js");
class CreateLFG extends require("../automation/commandClass"){
    constructor() {
        super({
            name: "createlfg",
            description: "Create an LFG",
            options: [
                {name:"type", description: "Type of an activity to create an LFG for.", type: ApplicationCommandOptionType.String, autocomplete: true, required: true},
                {name:"activity", description: "The activity to create an LFG for.", type: ApplicationCommandOptionType.String, autocomplete: true, required: true},
            ]
        });
    }
    exec(interaction,bot){
        const type = interaction.options.get("type").value;
        const activity = interaction.options.get("activity").value;
        if(!lfgOptions["activity"].includes(type)) return interaction.reply({content: `${type} is not a valid ActivityType.`});
        if(!lfgOptions[type].includes(activity)) return interaction.reply({content: `${activity} is not a valid \`${type}\`.`});
        const modal = new ModalBuilder()
            .setTitle("LFG Creation")
            .setCustomId("lfg-create")
            .addComponents(
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("lfg-time").setLabel("Time [Format: HH:MM (TZ) DD/MM]").setStyle(TextInputStyle.Short)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("lfg-desc").setLabel("Description").setStyle(TextInputStyle.Paragraph))
            );
        interaction.showModal(modal);
    }
    autoComplete(interaction){
        const focusedValue = interaction.options.getFocused(true);
        let filteredValues;
        if(focusedValue.name === "type"){
            filteredValues = lfgOptions["activity"].filter(choice => choice.toLowerCase().startsWith(focusedValue.value.toLowerCase()));
        } else if(focusedValue.name === "activity"){
            const type = interaction.options.get("type").value;
            filteredValues = lfgOptions[type] ? lfgOptions[type].filter(choice => choice.toLowerCase().startsWith(focusedValue.value.toLowerCase())) : [];
        }
        interaction.respond(filteredValues.map(choice => ({name: choice, value: choice})));
    }
    modalSubmit(interaction){
        interaction.reply({content: "Yes."});
    }
}
module.exports = new CreateLFG();