const lfgOptions = require("../lfg-options.json");
const {
    ApplicationCommandOptionType,
    ModalBuilder,
    TextInputBuilder,
    ActionRowBuilder,
    TextInputStyle,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionsBitField
} = require("discord.js");
const parser = require("any-date-parser");
const databaseManager = require("../automation/databaseManager");
class Lfg extends require("../automation/commandClass"){
    constructor() {
        super({
            name: "lfg",
            description: "Access LFG commands.",
            options: [
                {
                    name: "create",
                    description: "Create an LFG.",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {name:"type", description: "Type of an activity to create an LFG for.", type: ApplicationCommandOptionType.String, autocomplete: true, required: true},
                        {name:"activity", description: "The activity to create an LFG for.", type: ApplicationCommandOptionType.String, autocomplete: true, required: true},
                    ]
                }
            ],
        });
    }
    exec(interaction,bot){
        if(interaction.options.getSubcommand() === "create"){
            const type = interaction.options.get("type").value;
            const activity = interaction.options.get("activity").value;
            if(!lfgOptions["activity"].includes(type)) return interaction.reply({content: `${type} is not a valid ActivityType.`});
            if(!lfgOptions[type].includes(activity)) return interaction.reply({content: `${activity} is not a valid \`${type}\`.`});
            const modal = new ModalBuilder()
                .setTitle("LFG Creation")
                .setCustomId(`lfg-${lfgOptions["activity"].indexOf(type)}-${lfgOptions[type].indexOf(activity)}`)
                .addComponents([
                    new ActionRowBuilder().addComponents([new TextInputBuilder().setCustomId("lfg-size").setLabel("Size of the fireteam").setStyle(TextInputStyle.Short)]),
                    new ActionRowBuilder().addComponents([new TextInputBuilder().setCustomId("lfg-time").setLabel("Time [Format: DD.MM HH:MM (TZ)]").setStyle(TextInputStyle.Short)]),
                    new ActionRowBuilder().addComponents([new TextInputBuilder().setCustomId("lfg-desc").setLabel("Description").setStyle(TextInputStyle.Paragraph)])
                ]);
            interaction.showModal(modal);
        } else if(interaction.options.getSubcommand() === "edit"){

        } else if(interaction.options.getSubcommand() === "join"){

        } else if(interaction.options.getSubcommand() === "leave"){

        }
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
    modalSubmit(interaction,bot){
        const indexes = interaction.customId.split("-");
        const activity = lfgOptions[lfgOptions["activity"][indexes[1]]][indexes[2]];
        const size = interaction.fields.getTextInputValue("lfg-size");
        let timeString = interaction.fields.getTextInputValue("lfg-time");
        if(timeString.split(" ").length === 1){
            const now = new Date();
            timeString = `${now.getDay()}.${now.getMonth()} ${timeString}:00 EEST`;
        } else if(timeString.split(" ").length === 2){
            timeString = timeString + ":00 EEST";
        } else {
            timeString = timeString.split(":").join(":00:");
        }
        const time = parser.fromString(timeString);
        if(time["invalid"]) return;
        time.setFullYear(new Date().getFullYear());
        const embed = new EmbedBuilder().addFields([
            {name: "**Activity:**", value: activity, inline: true},
            {name: "**Start Time:**", value: `<t:${Math.floor(time.getTime()/1000)}:F>
<t:${Math.floor(time.getTime()/1000)}:R>`, inline: true},
            {name: "**Description:**", value: interaction.fields.getTextInputValue("lfg-desc")},
            {name: `**Guardians Joined: 1/${size}**`, value: interaction.member.nickname ?? interaction.user.tag, inline: true},
            {name: "**Alternatives:**", value: "None.", inline: true}
        ]).setFooter({text: `Creator: ${interaction.member.nickname ?? interaction.user.tag}`});
        interaction.reply({embeds: [embed]}).then(async () => {
            const reply = await interaction.fetchReply();
            const joinButton = new ButtonBuilder()
                .setLabel("Join")
                .setStyle(ButtonStyle.Success)
                .setCustomId(`lfg-join-${reply.id}`);
            const leaveButton = new ButtonBuilder()
                .setLabel("Leave")
                .setStyle(ButtonStyle.Danger)
                .setCustomId(`lfg-leave-${reply.id}`);
            const deleteButton = new ButtonBuilder()
                .setLabel("Delete")
                .setStyle(ButtonStyle.Danger)
                .setCustomId(`lfg-delete-${reply.id}-${interaction.user.id}`)
            const row = new ActionRowBuilder().setComponents([joinButton,leaveButton,deleteButton]);
            const embed = EmbedBuilder.from(reply.embeds[0]);
            embed.setFooter({text: `Creator: ${interaction.member.nickname ?? interaction.user.tag} | ID: ${reply.id}`});
            interaction.editReply({embeds: [embed], components: [row]}).then(()=>{
                interaction.fetchReply().then(reply => {
                    const posts = bot.db.get(interaction.guild.id).posts;
                    const post = {
                        activity: activity,
                        guildID: interaction.guild.id,
                        channelID: interaction.channel.id,
                        messageID: reply.id,
                        url: reply.url,
                        timestamp: time.getTime(),
                        members: [interaction.user.id],
                        alts: []
                    };
                    posts.set(reply.id,post);
                    bot.db.set(interaction.guild.id,posts,"posts");
                    databaseManager.createTimer(post,bot);
                });
            });
        });
    }

    handleLFG(ic, bot){
        const action = ic.customId.split("-")[1];
        const posts = bot.db.get(ic.guild.id).posts;
        const post = posts.get(ic.customId.split("-")[2]);
        const fireteam = post.members;
        const alts = post.alts;
        if(action === "join"){
            ic.channel.messages.fetch(ic.customId.split("-")[2]).then(m => {
                const lfgEmbed = m.embeds[0];
                const size = lfgEmbed.fields[3].name.split("/")[1];
                const alternatives = lfgEmbed.fields.pop().value.split(", ");
                const guardians = lfgEmbed.fields.pop().value.split(", ");
                const newEmbed = EmbedBuilder.from(lfgEmbed);
                if(guardians.length === 6){
                    if(alts.includes(ic.user.id)){
                        return ic.reply({content: "You're already in this LFG.", ephemeral: true});
                    } else {
                        alts.push(ic.user.tag);
                        if(alternatives[0] === "None."){
                            alternatives[0] = ic.member.nickname ?? ic.user.tag;
                        } else {
                            alternatives.push(ic.member.nickname ?? ic.user.tag);
                        }
                    }
                } else {
                    if(fireteam.includes(ic.user.id)){
                        return ic.reply({content: "You're already in this LFG.", ephemeral: true});
                    } else {
                        fireteam.push(ic.user.id);
                        if(guardians[0] === "None."){
                            guardians[0] = ic.member.nickname ?? ic.user.tag;
                        } else {
                            guardians.push(ic.member.nickname ?? ic.user.tag);
                        }
                    }
                }
                newEmbed.addFields([{value: guardians.join(", "), name: `**Guardians Joined: ${guardians.length}/${size}`, inline: true}]);
                newEmbed.addFields([{value: alternatives.join(", "), name: `**Alternatives**`, inline: true}]);
                m.edit({embeds: [newEmbed]});
                ic.deferUpdate();
                posts.set(post.messageID,post);
                bot.db.set(ic.guild.id,posts,"posts");
            });
        } else if(action === "leave"){
            ic.channel.messages.fetch(ic.customId.split("-")[2]).then(m => {
                const lfgEmbed = m.embeds[0];
                const size = lfgEmbed.fields[3].name.split("/")[1];
                const alternatives = lfgEmbed.fields.pop().value.split(", ");
                const guardians = lfgEmbed.fields.pop().value.split(", ");
                const newEmbed = EmbedBuilder.from(lfgEmbed);
                if(alts.includes(ic.user.id)){
                    alts.splice(fireteam.indexOf(ic.user.id),1);
                    const name = ic.member.nickname ?? ic.user.tag;
                    alternatives.splice(alternatives.indexOf(name),1);
                } else if(fireteam.includes(ic.user.id)){
                    const name = ic.member.nickname ?? ic.user.tag;
                    guardians.splice(guardians.indexOf(name),1);
                    fireteam.splice(fireteam.indexOf(ic.user.id),1);
                    if(alternatives.length > 0 && alternatives[0] !== "None."){
                        const moveAlts = alts.splice(0,1);
                        const moveGuardian = alternatives.splice(0,1);
                        guardians.push(moveGuardian);
                        fireteam.push(moveAlts);
                    }
                } else {
                    return ic.reply({content: "You're not in this LFG.", ephemeral: true});
                }
                newEmbed.addFields([{value: guardians.length > 0 ? guardians.join(", ") : "None.", name: `**Guardians Joined: ${guardians[0] !== "None." ? guardians.length : "0"}/${size}`, inline: true}]);
                newEmbed.addFields([{value: alternatives.length > 0 ? alternatives.join(", ") : "None.", name: `**Alternatives**`, inline: true}]);
                m.edit({embeds: [newEmbed]});
                ic.deferUpdate();
                posts.set(post.messageID,post);
                bot.db.set(ic.guild.id,posts,"posts");
            });
        } else if(action === "delete"){
            console.log(`${ic.user.tag} attempted deletion.`);
            if(ic.user.id !== ic.customId.split("-")[3] && !(ic.member.permissions.has(PermissionsBitField.resolve("ManageMessages"),true))) return ic.reply({content: "You aren't allowed to delete this post.", ephemeral: true});
            console.log(`${ic.user.tag} has the rights to delete.
Is creator: ${ic.user.id === ic.customId.split("-")[3]}
Has ManageMessages or Admin: ${ic.member.permissions.has(PermissionsBitField.resolve("ManageMessages"),true)}`);
            ic.channel.messages.fetch(ic.customId.split("-")[2]).then(m => {
                if(bot.db.get(ic.guild.id)[ic.customId.split("-")[2]] !== null){
                    posts.delete(post.messageID);
                    bot.db.set(ic.guild.id,posts,"posts");
                }
                m.delete().then(()=>{
                    ic.reply({content: "Deleted.", ephemeral: true});
                }).catch(e => console.log(e));
            });
        }
    }
}
module.exports = new Lfg();