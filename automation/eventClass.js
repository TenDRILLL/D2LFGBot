class Event {
    constructor(event,once) {
        this.eventName = event;
        this.runOnce = once;
    }
    getEventName(){return this.eventName;}
    isRunOnce(){return this.runOnce;}
    exec(){return console.log(`${this.eventName} was executed, but the method hasn't been overridden.`);}
}
module.exports = Event;