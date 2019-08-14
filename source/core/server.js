"use strict";
const WebSocket = require('ws');
module.exports = class Server {
    constructor(main) {
        this.main = main;
        this.server = new WebSocket.Server({ port: 3000 });
    }

    init() {
        this.server.on('connection', (socket) => this.main.onConnect(socket));
    }
};
