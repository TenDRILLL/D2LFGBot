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
        if(!(/#\d{4}/.test(interaction.member.displayName))) return interaction.reply({content: "You haven't changed your name to contain your Destiny name, in the format of Name#0000", ephemeral: true});
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
            /*TODO: Implement this.
            Allow editing time or description. Anything else should be a new post.
            */
        } else if(interaction.options.getSubcommand() === "join"){
            /*TODO: Implement this.
            Only allow admins to do this.
            */
        } else if(interaction.options.getSubcommand() === "leave"){
            /*TODO: Implement this.
            Only allow admins to do this.
            */
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
            {name: "**Queue:**", value: "None.", inline: true}
        ]).setFooter({text: `Creator: ${interaction.member.nickname ?? interaction.user.tag}`});
        interaction.reply({embeds: [embed]}).then(async () => {
            const reply = await interaction.fetchReply();
            const soloButton = new ButtonBuilder()
                .setLabel("Join in Queue")
                .setStyle(ButtonStyle.Primary)
                .setCustomId(`lfg-join-${reply.id}`);
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
                .setCustomId(`lfg-delete-${reply.id}-${interaction.user.id}`);
            const row = new ActionRowBuilder().setComponents([parseInt(size) === 1 ? soloButton : joinButton,leaveButton,deleteButton]);
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

    async handleLFG(ic, bot){
        if(!(/#\d{4}/.test(ic.member.displayName))) return ic.reply({content: "You haven't changed your name to contain your Destiny name, in the format of Name#0000", ephemeral: true});
        const action = ic.customId.split("-")[1];
        const posts = bot.db.get(ic.guild.id).posts;
        const post = posts.get(ic.customId.split("-")[2]);
        const fireteam = post.members;
        const alts = post.alts;

        const m = await ic.channel.messages.fetch(ic.customId.split("-")[2]);
        const lfgEmbed = m.embeds[0];
        const size = lfgEmbed.fields[3].name.split("/")[1].split("**")[0];
        const alternatives = lfgEmbed.fields.pop().value.split(", ");
        const guardians = lfgEmbed.fields.pop().value.split(", ");
        const newEmbed = EmbedBuilder.from(lfgEmbed);
        if(action === "join"){
            if(fireteam.length === parseInt(size)){
                if(alts.includes(ic.user.id)){
                    return ic.reply({content: "You're already in this LFG.", ephemeral: true});
                } else {
                    const name = await this.resolveName(ic.guild, ic.user.id);
                    alts.push(ic.user.id);
                    if(alternatives[0] === "None."){
                        alternatives[0] = name;
                    } else {
                        alternatives.push(name);
                    }
                }
            } else {
                if(fireteam.includes(ic.user.id)){
                    return ic.reply({content: "You're already in this LFG.", ephemeral: true});
                } else {
                    const name = await this.resolveName(ic.guild, ic.user.id);
                    fireteam.push(ic.user.id);
                    if(guardians[0] === "None."){
                        guardians[0] = name;
                    } else {
                        guardians.push(name);
                    }
                }
            }
            newEmbed.addFields([{value: guardians.join(", "), name: `**Guardians Joined: ${guardians.length}/${size}**`, inline: true}]);
            newEmbed.addFields([{value: alternatives.join(", "), name: `**Queue**`, inline: true}]);
            const firstButton = ButtonBuilder.from(m.components[0].components[0].toJSON());
            if(guardians.length === parseInt(size)){
                firstButton
                    .setLabel("Join in Queue")
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId(`lfg-join-${post.messageID}`);
            } else {
                firstButton
                    .setLabel("Join")
                    .setStyle(ButtonStyle.Success)
                    .setCustomId(`lfg-join-${post.messageID}`);
            }
            m.components[0].components.shift();
            const actionRow = new ActionRowBuilder().setComponents([firstButton, ...m.components[0].components]);
            m.edit({embeds: [newEmbed], components: [actionRow]});
            ic.deferUpdate();
            posts.set(post.messageID,post);
            bot.db.set(ic.guild.id,posts,"posts");
        } else if(action === "leave"){
            if(alts.includes(ic.user.id)){
                const index = alts.indexOf(ic.user.id);
                alts.splice(index,1);
                alternatives.splice(index,1);
            } else if(fireteam.includes(ic.user.id)){
                const index = fireteam.indexOf(ic.user.id);
                guardians.splice(index,1);
                fireteam.splice(index,1);
                if(alternatives.length > 0 && alternatives[0] !== "None."){
                    const moveAlts = alts.splice(0,1);
                    const moveGuardian = alternatives.splice(0,1);
                    guardians.push(moveGuardian);
                    fireteam.push(moveAlts);
                }
            } else {
                return ic.reply({content: "You're not in this LFG.", ephemeral: true});
            }
            newEmbed.addFields([{value: guardians.length > 0 ? guardians.join(", ") : "None.", name: `**Guardians Joined: ${guardians[0] !== "None." ? guardians.length : "0"}/${size}**`, inline: true}]);
            newEmbed.addFields([{value: alternatives.length > 0 ? alternatives.join(", ") : "None.", name: `**Queue**`, inline: true}]);
            const firstButton = ButtonBuilder.from(m.components[0].components[0].toJSON());
            if(guardians.length === parseInt(size)){
                firstButton
                    .setLabel("Join in Queue")
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId(`lfg-join-${post.messageID}`);
            } else {
                firstButton
                    .setLabel("Join")
                    .setStyle(ButtonStyle.Success)
                    .setCustomId(`lfg-join-${post.messageID}`);
            }
            m.components[0].components.shift();
            const actionRow = new ActionRowBuilder().setComponents([firstButton, ...m.components[0].components]);
            m.edit({embeds: [newEmbed], components: [actionRow]});
            ic.deferUpdate();
            posts.set(post.messageID,post);
            bot.db.set(ic.guild.id,posts,"posts");
        } else if(action === "delete"){
            console.log(`${ic.user.tag} attempted deletion.`);
            if(ic.user.id !== ic.customId.split("-")[3] && !(ic.member.permissions.has(PermissionsBitField.resolve("ManageMessages"),true))) return ic.reply({content: "You aren't allowed to delete this post.", ephemeral: true});
            console.log(`${ic.user.tag} has the rights to delete.
Is creator: ${ic.user.id === ic.customId.split("-")[3]}
Has ManageMessages or Admin: ${ic.member.permissions.has(PermissionsBitField.resolve("ManageMessages"),true)}`);
            if(bot.db.get(ic.guild.id)[ic.customId.split("-")[2]] !== null){
                posts.delete(post.messageID);
                bot.db.set(ic.guild.id,posts,"posts");
            }
            m.delete().then(()=>{
                ic.reply({content: "Deleted.", ephemeral: true});
            }).catch(e => console.log(e));
        }
    }

    resolveName(guild,id){
        return new Promise((res,rej)=>{
            guild.members.fetch(id).then(member => {
                res(member.displayName);
            }).catch(e => {
                rej(e);
            });
        });
    }
}
module.exports = new Lfg();