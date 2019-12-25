"use strict";
const { Reader, Writer } = require('../modules/buffer.js');
module.exports = class Player {
    constructor(id, main, xdir, zdir, x, z) {
        this.id = id;
        this.main = main;
        this.x = x;
        this.z = z;
        this.r = 15;
        this.speed = 0.3;
        this.xdir = xdir;
        this.zdir = zdir;
        this.life = 500;
        this.alive = false;
        this.init();
    }

    init() {
        this.main.movingEntities.set(this.id, this);
        this.main.entities.insert(this, this.getBoundsCircle(this.x, this.z, this.r));
        this.alive = true;
    }

    kill() {
        this.main.movingEntities.delete(this.id);
        this.main.entities.delete(this);
        this.alive = false;
    }

    move(delta) {
        this.x += this.xdir * this.speed * delta;
        this.z += this.zdir * this.speed * delta;
    }

    update(delta) {
        this.move(delta);
        this.main.entities.update(this, this.getBoundsCircle(this.x, this.z, this.r));
        this.life--;
        if (this.life <= 0) this.kill();
    }

    getBoundsCircle(x, z, r) {
        return {
            minX: x - r,
            minZ: z - r,
            maxX: x + r,
            maxZ: z + r
        }
    }

    boundsCollide(a, b) {
        return !(a.minX > b.maxX || a.maxX < b.minX || a.minZ > b.maxZ || a.maxZ < b.minZ);
    }
};
