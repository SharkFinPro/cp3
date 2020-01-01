module.exports = class Entity {
    constructor(id, main, xvel, yvel, x, y, r) {
        this.id = id;
        this.main = main;
        this.x = x;
        this.y = y;
        this.r = r;
        this.speed = 0.3;
        this.xvel = xvel;
        this.yvel = yvel;
        this.alive = false;
    }

    init() {
        this.main.movingEntities.set(this.id, this);
        this.main.entities.insert(this, this.getBounds(this.x, this.y, this.r));
        this.alive = true;
    }

    destroy() {
        this.main.movingEntities.delete(this.id);
        this.main.entities.delete(this);
        this.alive = false;
    }

    move(delta) {
        this.x += this.xvel * this.speed * delta;
        this.y += this.yvel * this.speed * delta;
    }

    update(delta) {
        this.move(delta);
        this.main.entities.update(this, this.getBounds(this.x, this.y, this.r));
    }

    getBounds(x, y, r) {
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
