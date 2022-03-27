class Command {
    constructor(slashy){
        this.slashObj = slashy;
    }
    get(){return this.slashObj;}
    exec(){return console.log(`${this.slashObj.name} was executed, but the method hasn't been overridden.`);}
    autoComplete(interaction){interaction.respond([].map(x => ({name: x, value: x})))}
}
module.exports = Command;