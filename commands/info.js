const {EmbedBuilder, Colors, version} = require("discord.js");
const moment = require("moment");
require("moment-duration-format");
class Info extends require("../automation/commandClass"){
    constructor() {
        super({
            name: "info",
            description: "Get bot's ping, Discord.js version and other useful information."
        });
    }
    exec(interaction,bot){
        const ping = Math.round(bot.ws.ping);
        const embed = new EmbedBuilder()
            .setAuthor({name: bot.user.username, iconURL: bot.user.displayAvatarURL()})
            .setTitle(`Info from \`${bot.user.username}\``)
            .setFields(
                {name: ":ping_pong: Ping", value: `┕\`${ping}ms\``, inline: true},
                {name: ":clock: Uptime", value: `┕\`${moment.duration(bot.uptime).format(" D[d], H[h], m[m]")}\``, inline: true},
                {name: ":file_cabinet: Memory", value: `┕\`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}mb\``, inline: true},
                {name: ":homes: Servers", value: `┕\`${bot.guilds.cache.size}\``, inline: true},
                {name: ":blue_book: Discord.js", value: `┕\`v${version}\``, inline: true},
                {name: ":green_book: Node.js", value: `┕\`${process.version}\``, inline: true}
            )
            .setFooter({text: "Created by Ten#0010"});
        switch(true){
            case ping < 100:
                embed.setColor(Colors.Green);
                break;
            case ping < 200:
                embed.setColor(Colors.Yellow);
                break;
            default:
                embed.setColor(Colors.Red);
                break;
        }
        interaction.reply({embeds:[embed]});
    }
}
module.exports = new Info();