class MessageCreate extends require("../automation/eventClass"){
    constructor() {
        super("messageCreate",false);
    }
    exec(message,bot){
        if(message.author.id === "484419124433518602" && message.content.startsWith("r!eval")){
            try {
                const code = message.content.slice(6).split(" ").join(" ");
                let evaled = eval(code);
                if (typeof evaled !== "string")
                    evaled = require("util").inspect(evaled);
                message.channel.send(clean(evaled), {code:"xl"});
            } catch (err) {
                message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
            }
            function clean(text) {
                if (typeof(text) === "string")
                    return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
                else
                    return text;
            }
        }
    }
}
module.exports = new MessageCreate();