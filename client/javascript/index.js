(function(){
const players = new Map();
let myId = null;
const Renderer = new PIXI.autoDetectRenderer({
	resolution: 1,
	clearBeforeRender: true,
	autoResize: true,
	antialias: true,
	view: document.getElementsByTagName("canvas")[0],
	width: window.innerWidth,
	height: window.innerHeight,
	roundPixels: true,
});
if (!Renderer) {
	alert("Canvas is not supported for your browser");
	throw new Error("No canvas support");
}
Renderer.backgroundColor = 0x9AA0A8;

const camera = new PIXI.Container();
camera.position.set(Renderer.screen.width / 2, Renderer.screen.height / 2);

const ticker = new PIXI.ticker.Ticker();
ticker.autoStart = false;
ticker.start();

const graphics = new PIXI.Graphics();
graphics.beginFill(0xA7C4B5, 1);
graphics.lineStyle(2, 0xFFFFFF);
graphics.drawCircle(0, 0, 25);
graphics.endFill();
const playersTexture = graphics.generateCanvasTexture(1, 1);

graphics.clear();
graphics.beginFill(0xA9D8B8, 1);
graphics.lineStyle(2, 0xFFFFFF);
graphics.drawCircle(0, 0, 25);
graphics.endFill();
const yourTexture = graphics.generateCanvasTexture(1, 1);

const s = new PIXI.Graphics();
s.beginFill(0xBEFFC7, 1);
s.lineStyle(2, 0xFFFFFF);
s.drawCircle(0, 0, 15);
s.endFill();
const bullet = s.generateCanvasTexture(1, 1);

s.clear();
s.beginFill(0xFF00FF, 1);
s.lineStyle(2, 0xFFFFFF);
s.drawCircle(0, 0, 15);
s.endFill();
const bulletCollided = s.generateCanvasTexture(1, 1);

const g = new PIXI.Graphics();
g.beginFill(0x72705B, 1);
g.lineStyle(2, 0xFFFFFF);
g.drawRect(100, 100, 100, 100);
g.endFill();
const rect = g.generateCanvasTexture(1, 1);


const stage = new PIXI.Container();
camera.addChild(stage);

const spr = new PIXI.Sprite();
spr.texture = rect;
stage.addChild(spr);

const updatePos = (player) => {
	player.sprite.x = player.nx;
	player.sprite.y = player.ny;
};

const Update = (dT) => {
	players.forEach((player) => updatePos(player));
	if (myId && players.has(myId)) {
		const tp = players.get(myId).sprite;
		camera.pivot.x = (tp.x - camera.pivot.x) + camera.pivot.x;
		camera.pivot.y = (tp.y - camera.pivot.y) + camera.pivot.y;
	}
	Renderer.render(camera);
};

/** ws **/
const socket = new WebSocket("ws://localhost:3000");
socket.binaryType = "arraybuffer";
socket.onmessage = (message) => {
	const reader = new window.Buffer.Reader(message.data);
	let id;
	switch(reader.readUInt8()) {
		case 1: // get myId
			myId = reader.readUInt32();
			ticker.add(Update);
			break;
		case 2: // position update
			id = reader.readUInt32();
			const x = reader.readInt32(),
				y = reader.readInt32(),
				r = reader.readUInt8();
			if (players.has(id)) {
				const player = players.get(id);
				player.ox = player.sprite.x;
				player.oy = player.sprite.y;
				player.nx = x;
				player.ny = y;
				player.t = Date.now();
			} else {
				const player = {
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
						player.sprite.texture = id === myId ? yourTexture : playersTexture;
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
			id = reader.readUInt32();
			stage.removeChild(players.get(id).sprite);
			players.delete(id);
			break;
		case 5: // bullet collision
			id = reader.readUInt32();
			if(players.get(id).r !== 15) {
				return;
			}
			players.get(id).sprite.texture = bulletCollided;
			break;
		case 6: // bullet not colliding
			id = reader.readUInt32();
			if(players.get(id).r !== 15) {
				return;
			}
			players.get(id).sprite.texture = bullet;
			break;
	}
};

const keys = {};
window.addEventListener("keyup", (event) => {
	if (!keys[event.keyCode]) {
		return;
	}
	const writer = new window.Buffer.Writer(2);
	writer.writeUInt8(2)
	writer.writeUInt8(event.keyCode);
	socket.send(writer.toBuffer());
	keys[event.keyCode] = false;
}, false);
window.addEventListener("keydown", (event) => {
	if (keys[event.keyCode]) {
		return;
	}
	const writer = new window.Buffer.Writer(2)
	writer.writeUInt8(3)
	writer.writeUInt8(event.keyCode);
	socket.send(writer.toBuffer());
	keys[event.keyCode] = true;
}, false);
document.getElementsByTagName("canvas")[0].addEventListener("click", (event) => {
	const mouseX = event.clientX,
		mouseY = event.clientY;
	const r = Math.atan2(mouseY - window.innerHeight / 2, mouseX - window.innerWidth / 2);
	const writer = new window.Buffer.Writer(9)
	writer.writeUInt8(4)
	writer.writeFloat32(Math.cos(r))
	writer.writeFloat32(Math.sin(r));
	socket.send(writer.toBuffer());
}, false);
})();
