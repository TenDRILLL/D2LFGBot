class Command {
    constructor(slashy){
        this.slashObj = slashy;
    }
    get(){return this.slashObj;}
    exec(interaction){interaction.reply(`${this.slashObj.name} was executed, but the method hasn't been overridden.`);}
    autoComplete(interaction){interaction.respond([].map(x => ({name: x, value: x})));}
    modalSubmit(interaction){interaction.reply(`${this.slashObj.name} got a modalsubmit, but the method hasn't been overridden.`);}
}
module.exports = Command;