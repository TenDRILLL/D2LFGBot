class Command {
    constructor(slashy){
        this.slashObj = slashy;
    }
    get(){return this.slashObj;}
    exec(){return console.log(`${this.slashObj.name} was executed, but the method hasn't been overridden.`);}
}
module.exports = Command;