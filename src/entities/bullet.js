const { Reader, Writer } = require('../lib/buffer.js');
module.exports = class Player {
    constructor(id, main, xdir, ydir, x, y) {
        this.id = id;
        this.main = main;
        this.x = x;
        this.y = y;
        this.r = 15;
        this.speed = 0.3;
        this.xdir = xdir;
        this.ydir = ydir;
        this.life = 500;
        this.alive = false;
        this.init();
    }

    init() {
        this.main.movingEntities.set(this.id, this);
        this.main.entities.insert(this, this.getBoundsCircle(this.x, this.y, this.r));
        this.alive = true;
    }

    kill() {
        this.main.movingEntities.delete(this.id);
        this.main.entities.delete(this);
        this.alive = false;
    }

    move(delta) {
        this.x += this.xdir * this.speed * delta;
        this.y += this.ydir * this.speed * delta;
    }

    update(delta) {
        this.move(delta);
        this.main.entities.update(this, this.getBoundsCircle(this.x, this.y, this.r));
        this.life--;
        if (this.life <= 0) this.kill();
    }

    getBoundsCircle(x, y, r) {
        return {
            minX: x - r,
            minY: y - r,
            maxX: x + r,
            maxY: y + r
        }
    }

    boundsCollide(a, b) {
        return !(a.minX > b.maxX || a.maxX < b.minX || a.minY > b.maxY || a.maxY < b.minY);
    }
};
