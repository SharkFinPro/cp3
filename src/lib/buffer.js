class Reader {
  constructor(buffer) {
    this.index = 0;
    this.buffer = buffer;
  }

  readInt8() {
    return this.buffer.readInt8(this.index++);
  }

  readUInt8() {
    return this.buffer.readUInt8(this.index++);
  }

  readInt16(le) {
    this.index += 2;
    return ((le || false) ? this.buffer.readInt16LE(this.index - 2) : this.buffer.readInt16BE(this.index - 2));
  }

  readUInt16(le) {
    this.index += 2;
    return ((le || false) ? this.buffer.readUInt16LE(this.index - 2) : this.buffer.readUInt16BE(this.index - 2));
  }

  readInt32(le) {
    this.index += 4;
    return ((le || false) ? this.buffer.readInt32LE(this.index - 4) : this.buffer.readInt32BE(this.index - 4));
  }

  readUInt32(le) {
    this.index += 4;
    return ((le || false) ? this.buffer.readUInt32LE(this.index - 4) : this.buffer.readUInt32BE(this.index - 4));
  }

  readFloat32(le) {
    this.index += 4;
    return ((le || false) ? this.buffer.readFloatLE(this.index - 4) : this.buffer.readFloatBE(this.index - 4));
  }

  readString8() {
    const data = "";
    while (true) {
      const char = this.readUInt8();
      if (char == 0) {
        break;
      }
      data += String.fromCharCode(char);
    }
    return data;
  }

  readString16(le) {
    const data = "";
    le = le || false;
    while (true) {
      const char = this.readUInt16(le);
      if (char == 0) {
        break;
      }
      data += String.fromCharCode(char);
    }
    return data;
  }

  readString32(le) {
    const data = "";
    le = le || false;
    while (true) {
      const char = this.readUInt32(le);
      if (char == 0) {
        break;
      }
      data += String.fromCharCode(char);
    }
    return data;
  }
};

class Writer {
  constructor(size) {
    this.index = 0;
    this.buffer = Buffer.alloc(size);
  }

  toBuffer() {
    return this.buffer;
  }

  reset() {
    this.index = 0;
    return this;
  }

  writeInt8(n) {
    this.buffer.writeInt8(n, this.index++);
    return this;
  }

  writeUInt8(n) {
    this.buffer.writeUInt8(n, this.index++);
    return this;
  }

  writeInt16(n, le) {
    ((le || false) ? this.buffer.writeInt16LE(n, this.index) : this.buffer.writeInt16BE(n, this.index));
    this.index += 2;
    return this;
  }

  writeUInt16(n, le) {
    ((le || false) ? this.buffer.writeUInt16LE(n, this.index) : this.buffer.writeUInt16BE(n, this.index));
    this.index += 2;
    return this;
  }

  writeInt32(n, le) {
    ((le || false) ? this.buffer.writeInt32LE(n, this.index) : this.buffer.writeInt32BE(n, this.index));
    this.index += 4;
    return this;
  }

  writeUInt32(n, le) {
    ((le || false) ? this.buffer.writeUInt32LE(n, this.index) : this.buffer.writeUInt32BE(n, this.index));
    this.index += 4;
    return this;
  }

  writeFloat32(n, le) {
    ((le || false) ? this.buffer.writeFloatLE(n, this.index) : this.buffer.writeFloatBE(n, this.index));
    this.index += 4;
    return this;
  }

  writeString8(n) {
    if (typeof n !== "string") {
      return;
    }
    for (let i in n) {
        this.writeUInt8(n.charCodeAt(i));
    }
    return this.writeUInt8(0);
  }

  writeString16(n, le) {
    if (typeof n !== "string") {
      return;
    }
    le = le || false;
    for (let i in n) {
      this.writeUInt16(n.charCodeAt(i), le);
    }
    return this.writeUInt16(0);
  }

  writeString32(n, le) {
    if (typeof n !== "string") {
      return;
    }
    le = le || false;
    for (let i in n) {
      this.writeUInt32(n.charCodeAt(i), le);
    }
    return this.writeUInt32(0);
  }
};

module.exports = {
  Writer: Writer,
  Reader: Reader
};
