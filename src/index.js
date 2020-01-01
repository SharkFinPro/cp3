const WebSocket = require("ws"),
  Grid = require("./lib/grid.js"),
  Player = require("./entities/player.js"),
  FakePlayer = require("./entities/fakePlayer.js");

const server = {
  lastTime: Date.now(),
  now: this.lastTime,
  wsServer: new WebSocket.Server({ port: 3000 }),
  entities: new Grid(10000),
  movingEntities: new Map(),
  players: new Map(),
  lastId: 0,
  init() {
    for(let i = 0; i < 100000; i++) {
      const fake = new FakePlayer(this.nextId(), this);
      this.players.set(fake.id, fake);
    }
    this.gameLoop();
    this.wsServer.on("connection", (socket) => {
      this.onConnect(socket);
    });
  },
  gameLoop() {
    setTimeout(() => {
      this.gameLoop();
    }, 10);
    this.now = Date.now();
    const delta = this.now - this.lastTime;
    this.lastTime = this.now;
    this.movingEntities.forEach((entity) => {
      entity.update(delta);
    });
  },
  onConnect(socket) {
    const player = new Player(socket, this.nextId(), this);
    socket.player = player;
    this.players.set(player.id, player);
  },
  onDisconnect(player) {
    player.destroyed = true;
    this.players.delete(player.id);
    this.movingEntities.delete(player.id);
    this.entities.delete(player);
  },
  nextId() {
    return this.lastId++;
  }
}.init();
