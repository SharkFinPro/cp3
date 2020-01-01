const Entity = require("./entity.js");

module.exports = class FakePlayer extends Entity {
    constructor(id, main) {
        const area = 100000;
        super(id, main, 0, 0, Math.floor((Math.random() * area) - area) * (Math.random() < 0.5 ? -1 : 1), Math.floor((Math.random() * area) - area) * (Math.random() < 0.5 ? -1 : 1), 25);
        this.speed = 0.1;
        this.init();
    }

    move(delta) {
        this.xvel += Math.random() < 0.5 ? -this.speed : this.speed;
        this.yvel += Math.random() < 0.5 ? -this.speed : this.speed;
        this.x += this.xvel * delta;
        this.y += this.yvel * delta;
        this.xvel /= 1.75;
        this.yvel /= 1.75;
    }
};
