class Command {
    constructor(name,slashy){
        this.cmdName = name;
        this.slashObj = slashy ?? null;
    }
    getName(){return this.cmdName;}
    getSlashObj(){return this.slashObj;}
    exec(){return console.log(`${this.cmdName} was executed, but the method hasn't been overridden.`);}
}
module.exports = Command;