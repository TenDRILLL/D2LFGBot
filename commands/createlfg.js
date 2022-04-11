const lfgOptions = require("../lfg-options.json");
const {
    ApplicationCommandOptionType,
    ModalBuilder,
    TextInputBuilder,
    ActionRowBuilder,
    TextInputStyle,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");
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
            .setCustomId(`createlfg-${lfgOptions["activity"].indexOf(type)}-${lfgOptions[type].indexOf(activity)}`)
            .addComponents(
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("lfg-time").setLabel("Time [Format: HH:MM (TZ) DD/MM]").setStyle(TextInputStyle.Short)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("lfg-desc").setLabel("Description").setStyle(TextInputStyle.Paragraph))
            );
        interaction.showModal(modal);
    }
    autocomplete(interaction){
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
        const indexes = interaction.customId.split("-");
        const activity = lfgOptions[lfgOptions["activity"][indexes[1]]][indexes[2]];
        const embed = new EmbedBuilder().addFields(
            {name: "**Activity:**", value: activity, inline: true},
            {name: "**Start Time:**", value: interaction.fields.getTextInputValue("lfg-time"), inline: true},
            {name: "**Description:**", value: interaction.fields.getTextInputValue("lfg-desc")},
            {name: "**Guardians Joined: 1/6**", value: interaction.user.tag, inline: true},
            {name: "**Alternatives:**", value: "None.", inline: true}
        ).setFooter({text: `Creator | ${interaction.member.displayName}`});
        interaction.reply({embeds: [embed]}).then(async () => {
            const reply = await interaction.fetchReply();
            const joinButton = new ButtonBuilder()
                .setLabel("Join")
                .setStyle(ButtonStyle.Success)
                .setCustomId(`createlfg-join-${reply.id}`);
            const leaveButton = new ButtonBuilder()
                .setLabel("Leave")
                .setStyle(ButtonStyle.Danger)
                .setCustomId(`createlfg-leave-${reply.id}`);
            const row = new ActionRowBuilder().setComponents(joinButton,leaveButton);
            interaction.editReply({embeds: reply.embeds, components: [row]});
        });
    }

    handleLFG(ic, bot){
        const action = ic.customId.split("-")[1];
        if(action === "join"){
            ic.channel.messages.fetch(ic.customId.split("-")[2]).then(m => {
                const lfgEmbed = m.embeds[0];
                const alternatives = lfgEmbed.fields.pop().value.split(", ");
                const guardians = lfgEmbed.fields.pop().value.split(", ");
                const newEmbed = EmbedBuilder.from(lfgEmbed);
                if(guardians.length === 6){
                    if(alternatives.includes(ic.user.tag)){
                        return ic.reply({content: "You're already in this LFG.", ephemeral: true});
                    } else {
                        alternatives.push(ic.user.tag);
                    }
                } else {
                    if(guardians.includes(ic.user.tag)){
                        return ic.reply({content: "You're already in this LFG.", ephemeral: true});
                    } else {
                        guardians.push(ic.user.tag);
                    }
                }
                newEmbed.addFields({value: guardians.join(", "), name: `**Guardians Joined: ${guardians.length}/6**`, inline: true});
                newEmbed.addFields({value: alternatives.join(", "), name: `**Alternatives**`, inline: true});
                m.edit({embeds: [newEmbed]});
            });
        } else if(action === "leave"){
            ic.reply({content: "**No.**", ephemeral: true});
        }
    }
}
module.exports = new CreateLFG();