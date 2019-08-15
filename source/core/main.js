"use strict";
const Grid = require('../modules/grid.js'),
    Player = require('../entities/player.js'),
    Server = require('./server.js'),
    FakePlayer = require('../entities/fakePlayer.js');
module.exports = class Main {
    constructor() {
        this.now = this.lastTime = Date.now();
        this.entities = new Grid(10000);
        this.movingEntities = new Map();
        this.players = new Map();
        this.lastId = 0;
        this.wsServer = new Server(this);
        this.wsServer.init();
        for(var i = 0; i < 100000; i++) {
            var fake = new FakePlayer(this.nextId(), this)
            this.players.set(fake.id, fake)
        }
        this.gameLoop();
    }

    gameLoop() {
        setTimeout(() => this.gameLoop(), 10);
        this.now = Date.now();
        let delta = this.now - this.lastTime;
        this.lastTime = this.now;
        this.movingEntities.forEach((entity) => entity.update(delta));
    }

    onConnect(socket) {
        let player = new Player(socket, this.nextId(), this);
        socket.player = player;
        this.players.set(player.id, player);
    }

    onDisconnect(player) {
        player.destroyed = true;
        this.players.delete(player.id);
        this.movingEntities.delete(player.id);
        this.entities.delete(player);
    }

    nextId() {
        this.lastId++;
        if (this.lastId > 4294967295) this.lastId = 1;
        return this.lastId;
    }
}
