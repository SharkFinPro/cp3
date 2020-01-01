const Entity = require("./entity.js");

module.exports = class Bullet extends Entity {
  constructor(id, main, xvel, yvel, x, y) {
    super(id, main, xvel, yvel, x, y, 15);
    this.life = 500;
    this.init();
  }

  update(delta) {
    this.move(delta);
    this.main.entities.update(this, this.getBounds(this.x, this.y, this.r));
    this.life--;
    if (this.life <= 0) this.destroy();
  }
};
