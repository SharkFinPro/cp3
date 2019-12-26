const { Reader, Writer } = require('../lib/buffer.js');
module.exports = class Player {
    constructor(id, main) {
        this.id = id;
        this.main = main;
        this.x = 0;
        this.y = 0;
        this.r = 25;
        this.speed = 0.2;
        this.xvel = 0;
        this.yvel = 0;
        this.collisionBox = {
            minX: 0,
            minY: 0,
            maxX: 0,
            maxY: 0
        };
        this.alive = false;
        this.init();
    }

    init() {
        const area = 100000;
        this.spawn(Math.floor((Math.random() * area) - area) * (Math.random() < 0.5 ? -1 : 1), Math.floor((Math.random() * area) - area) * (Math.random() < 0.5 ? -1 : 1));
    }

    kill() {
        this.main.movingEntities.delete(this.id);
        this.main.entities.delete(this);
        this.alive = false;
    }

    spawn(x, y) {
        this.x = x;
        this.y = y;
        this.main.movingEntities.set(this.id, this);
        this.main.entities.insert(this, this.getBoundsCircle(this.x, this.y, this.r));
        this.alive = true;
    }

    move(delta) {
        this.xvel += Math.random() < 0.5 ? -this.speed : this.speed;
        this.yvel += Math.random() < 0.5 ? -this.speed : this.speed;
        this.x += this.xvel * delta;
        this.y += this.yvel * delta;
        this.xvel /= 1.75;
        this.yvel /= 1.75;
    }

    update(delta) {
        this.move(delta);
        this.main.entities.update(this, this.getBoundsCircle(this.x, this.y, this.r));
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
