"use strict";
const { Reader, Writer } = require('../buffer.js');
module.exports = class Player {
    constructor(id, main) {
        this.id = id;
        this.main = main;
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.r = 25;
        this.speed = 0.2;
        this.xvel = 0;
        this.yvel = 0;
        this.zvel = 0;
        this.collisionBox = {
            minX: 0,
            minZ: 0,
            maxX: 0,
            maxZ: 0
        };
        this.alive = false;
        this.init()
    }

    init() {
        let area = 8000;
        this.spawn(Math.floor((Math.random() * area) - area) * (Math.random() < 0.5 ? -1 : 1), Math.floor((Math.random() * area) - area) * (Math.random() < 0.5 ? -1 : 1));
    }

    kill() {
        this.main.movingEntities.delete(this.id);
        this.main.entities.delete(this);
        this.alive = false;
    }

    spawn(x, z) {
        this.x = x;
        this.z = z;
        this.main.movingEntities.set(this.id, this);
        this.main.entities.insert(this, this.getBoundsCircle(this.x, this.z, this.r));
        this.alive = true;
    }

    move(delta) {
        this.xvel += Math.random() < 0.5 ? -this.speed : this.speed;
        this.zvel += Math.random() < 0.5 ? -this.speed : this.speed;
        this.x += this.xvel * delta;
        this.z += this.zvel * delta;
        this.xvel /= 1.75;
        this.zvel /= 1.75;
    }

    update(delta) {
        this.move(delta);
        this.main.entities.update(this, this.getBoundsCircle(this.x, this.z, this.r));
        /*this.collisionBox.minX = this.x - this.r * 2;
        this.collisionBox.minZ = this.z - this.r * 2;
        this.collisionBox.maxX = this.x + this.r * 2;
        this.collisionBox.maxZ = this.z + this.r * 2;

        this.main.entities.retrieve(this.collisionBox).forEach((entity) => {
            //if (this.boundsCollide(this.collisionBox, this.getBoundsCircle(entity.cx, entity.cz, entity.r))) {
                //
            //}
        });*/
    }

    getBoundsCircle(cx, cz, r) {
        return {
            minX: cx - r,
            minZ: cz - r,
            maxX: cx + r,
            maxZ: cz + r
        }
    }

    boundsCollide(a, b) {
        return !(a.minX > b.maxX || a.maxX < b.minX || a.minZ > b.maxZ || a.maxZ < b.minZ);
    }
}
