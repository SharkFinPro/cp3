const { Reader, Writer } = require('../lib/buffer.js'),
    Bullet = require('./bullet.js'),
    Entity = require("./entity.js");

module.exports = class Player extends Entity {
    constructor(socket, id, main) {
        super(id, main, 0, 0, 0, 0, 25);
        this.socket = socket;
        this.keys = {};
        this.visibleEntities = new Map();
        this.collidingEntities = new Map();
        this.viewBox = {minX: 0, minY: 0, maxX: 0, maxY: 0};
        this.collisionBox = {minX: 0, minY: 0, maxX: 0, maxY: 0};
        this.killWriter = new Writer(5);
        this.playerWriter = new Writer(14);
        this.cWriter = new Writer(7);
        this.init();
    }

    init() {
        const id = new Writer(5)
            .writeUInt8(1)
            .writeUInt32(this.id);
        this.socket.send(id.toBuffer());
        this.socket.on('message', (data) => {
            const reader = new Reader(Buffer.from(data));
            switch(reader.readUInt8()) {
                case 2:
                    this.keys[reader.readUInt8()] = false;
                    break;
                case 3:
                    this.keys[reader.readUInt8()] = true;
                    break;
                case 4:
                    new Bullet(this.main.nextId(), this.main, reader.readFloat32(), reader.readFloat32(), this.x, this.y);
                    break;
            }
        });
        this.socket.on('close', () => this.main.onDisconnect(this));
        this.spawn(0, 0);
    }

    spawn(x, y) {
        this.x = x;
        this.y = y;
        this.main.movingEntities.set(this.id, this);
        this.main.entities.insert(this, this.getBounds(this.x, this.y, this.r));
        this.alive = true;
    }

    move(delta) {
        if (this.keys[39] || this.keys[68]) this.xvel += this.speed;
        if (this.keys[37] || this.keys[65]) this.xvel -= this.speed;
        if (this.keys[40] || this.keys[83]) this.yvel += this.speed;
        if (this.keys[38] || this.keys[87]) this.yvel -= this.speed;

        this.x += this.xvel * delta;
        this.y += this.yvel * delta;
        this.xvel /= 1.75;
        this.yvel /= 1.75;
    }

    update(delta, stop) {
        this.move(delta);
        this.viewBox.minX = this.x - 1000;
        this.viewBox.minY = this.y - 500;
        this.viewBox.maxX = this.x + 1000;
        this.viewBox.maxY = this.y + 500;

        this.collisionBox.minX = this.x - this.r * 2;
        this.collisionBox.minY = this.y - this.r * 2;
        this.collisionBox.maxX = this.x + this.r * 2;
        this.collisionBox.maxY = this.y + this.r * 2;

        this.visibleEntities.forEach((entity) => {
            if (!this.boundsCollide(this.viewBox, this.getBounds(entity.x, entity.y, entity.r)) || entity.destroyed || !entity.alive) {
                if (this.socket.readyState !== 1) return;
                this.killWriter.reset()
                    .writeUInt8(3)
                    .writeUInt32(entity.id);
                this.socket.send(this.killWriter.toBuffer());
                this.visibleEntities.delete(entity.id);
            }
        });
        this.collidingEntities.forEach((entity) => {
            if (!this.boundsCollide(this.collisionBox, this.getBounds(entity.x, entity.y, entity.r)) && entity.id !== this.id) {
                this.cWriter.reset()
                    .writeUInt8(6)
                    .writeUInt32(entity.id);
                this.socket.send(this.cWriter.toBuffer());
            }
        });

        this.main.entities.retrieve(this.viewBox).forEach((entity) => {
            if (this.boundsCollide(this.viewBox, this.getBounds(entity.x, entity.y, entity.r))) {
                this.visibleEntities.set(entity.id, entity);
                if (this.socket.readyState !== 1) return;
                this.playerWriter.reset()
                    .writeUInt8(2)
                    .writeUInt32(entity.id)
                    .writeInt32(entity.x)
                    .writeInt32(entity.y)
                    .writeUInt8(entity.r);
                this.socket.send(this.playerWriter.toBuffer());
            }
        });
        this.main.entities.retrieve(this.collisionBox).forEach((entity) => {
            if (this.boundsCollide(this.collisionBox, this.getBounds(entity.x, entity.y, entity.r)) && entity.id !== this.id) {
                this.collidingEntities.set(entity.id, entity);
                this.cWriter.reset()
                    .writeUInt8(5)
                    .writeUInt32(entity.id);
                this.socket.send(this.cWriter.toBuffer());
            }
        });
        this.main.entities.update(this, this.getBounds(this.x, this.y, this.r));
    }
};
