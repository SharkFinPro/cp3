"use strict";
(function(){
var players = new Map();
var myId = null;
const renderer = new PIXI.autoDetectRenderer({
		resolution: 2,
		clearBeforeRender: true,
		autoResize: true,
		antialias: true,
		view: document.getElementsByTagName('canvas')[0],
		width: window.innerWidth,
		height: window.innerHeight,
		roundPixels: true,
});
if (!renderer) {
		alert('Canvas is not supported for your browser');
		throw new Error('No canvas support');
}
renderer.backgroundColor = 0x9AA0A8; // Black

var camera = new PIXI.Container();
camera.position.set(renderer.screen.width / 2, renderer.screen.height / 2)

const ticker = new PIXI.ticker.Ticker();
ticker.autoStart = false;
ticker.stop();
ticker.add(Update);

var graphics = new PIXI.Graphics();
graphics.beginFill(0xA7C4B5, 1);
graphics.lineStyle(2, 0xFFFFFF);
graphics.drawCircle(0, 0, 25);
graphics.endFill();
var texture = graphics.generateCanvasTexture(1, 1);

graphics.clear();
graphics.beginFill(0xA9D8B8, 1);
graphics.lineStyle(2, 0xFFFFFF);
graphics.drawCircle(0, 0, 25);
graphics.endFill();
var myTexture = graphics.generateCanvasTexture(1, 1);

var s = new PIXI.Graphics();
s.beginFill(0xBEFFC7, 1);
s.lineStyle(2, 0xFFFFFF);
s.drawCircle(0, 0, 15);
s.endFill();
var bullet = s.generateCanvasTexture(1, 1);

s.clear();
s.beginFill(0xFF00FF, 1);
s.lineStyle(2, 0xFFFFFF);
s.drawCircle(0, 0, 15);
s.endFill();
var ctext = s.generateCanvasTexture(1, 1);

var g = new PIXI.Graphics();
g.beginFill(0x72705B, 1)
g.lineStyle(2, 0xFFFFFF);
g.drawRect(100, 100, 100, 100);
g.endFill();
var rect = g.generateCanvasTexture(1, 1);


var stage = new PIXI.Container();
camera.addChild(stage)

var s = new PIXI.Sprite();
s.texture = rect;
stage.addChild(s)

var updatePos = (player) => {
		/*//var r = Math.min((Date.now() - player.t) / 100, 1);
		var r = Math.min((Date.now() - player.t), 1);
		player.sprite.x = (1 - r) * player.ox + r * player.nx;
		player.sprite.y = (1 - r) * player.oy + r * player.ny;*/
		player.sprite.x = player.nx;
		player.sprite.y = player.ny;
}

function Update(dT) {
		players.forEach((player) => updatePos(player));
		if (myId && players.has(myId)) {
				const tp = players.get(myId).sprite;
				camera.pivot.x = (tp.x - camera.pivot.x) + camera.pivot.x;
				camera.pivot.y = (tp.y - camera.pivot.y) + camera.pivot.y;
		}
		renderer.render(camera);
};

/** ws **/
var socket = new WebSocket('ws://localhost:3000');
socket.binaryType = 'arraybuffer';
const onOpen = data => ticker.start();
const onMessage = message => {
		var reader = new window.Buffer.Reader(message.data);
		switch(reader.readUInt8()) {
				case 1: // get myId
						myId = reader.readUInt32();
						break;
				case 2: // position update
						var id = reader.readUInt32(),
								x = reader.readInt32(),
								y = reader.readInt32(),
								r = reader.readUInt8();
						if (players.has(id)) {
								var player = players.get(id);
								player.ox = player.sprite.x;
								player.oy = player.sprite.y;
								player.nx = x;
								player.ny = y;
								player.t = Date.now();
						} else {
								var player = {
										sprite: new PIXI.Sprite(),
										t: Date.now(),
										ox: x,
										oy: y,
										nx: x,
										ny: y,
										r: r
								};
								switch(r) {
										case 15:
												player.sprite.texture = bullet;
												break;
										case 25:
												player.sprite.texture = id === myId ? myTexture : texture;
												break;
								}
								player.sprite.x = x;
								player.sprite.y = y;
								player.sprite.anchor.set(0.5, 0.5);
								players.set(id, player);
								stage.addChild(players.get(id).sprite);
						}
						break;
				case 3: // player remove
						var id = reader.readUInt32();
						stage.removeChild(players.get(id).sprite);
						players.delete(id);
						break;
				case 5:
						var id = reader.readUInt32();
						if(players.get(id).r !== 15) return;
						players.get(id).sprite.texture = ctext;
						break;
				case 6:
						var id = reader.readUInt32();
						if(players.get(id).r !== 15) return;
						players.get(id).sprite.texture = bullet;
						break

		}
};
socket.onopen = onOpen;
socket.onmessage = onMessage;

var keys = {};
window.addEventListener('keyup', (event) => {
		if (!keys[event.keyCode]) return;
		let writer = new window.Buffer.Writer(2)
				writer.writeUInt8(2)
				writer.writeUInt8(event.keyCode);
		socket.send(writer.toBuffer());
		keys[event.keyCode] = false;
}, false);
window.addEventListener('keydown', (event) => {
		if (keys[event.keyCode]) return;
		let writer = new window.Buffer.Writer(2)
				writer.writeUInt8(3)
				writer.writeUInt8(event.keyCode);
		socket.send(writer.toBuffer());
		keys[event.keyCode] = true;
}, false);
document.getElementsByTagName('canvas')[0].addEventListener('click', (event) => {
		let mouseX = event.clientX,
				mouseY = event.clientY;
		var r = Math.atan2(mouseY - window.innerHeight / 2, mouseX - window.innerWidth / 2);
		let writer = new window.Buffer.Writer(9)
				writer.writeUInt8(4)
				writer.writeFloat32(Math.cos(r))
				writer.writeFloat32(Math.sin(r));
		socket.send(writer.toBuffer());
}, false);

})();
