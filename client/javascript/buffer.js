(function() {
  class Reader {
    constructor(buffer) {
      this.index = 0;
      this.buffer = new DataView(buffer);
    }

    readInt8() {
      return this.buffer.getInt8(this.index++);
    }

    readUInt8() {
      return this.buffer.getUint8(this.index++);
    }

    readInt16(le) {
      this.index += 2;
      return this.buffer.getInt16(this.index - 2, le || false);
    }

    readUInt16(le) {
      this.index += 2;
      return this.buffer.getUint16(this.index - 2, le || false);
    }

    readInt32(le) {
      this.index += 4;
      return this.buffer.getInt32(this.index - 4, le || false);
    }

    readUInt32(le) {
      this.index += 4;
      return this.buffer.getUint32(this.index - 4, le || false);
    }

    readFloat32(le) {
      this.index += 4;
      return this.buffer.getFloat32(this.index - 4, le || false);
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

    readString32(length, le) {
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
  }

  class Writer {
    constructor(size) {
      this.index = 0;
      this.buffer = new DataView(new ArrayBuffer(size));
    }

    toBuffer() {
      return this.buffer.buffer;
    }

    reset() {
      this.index = 0;
      return this;
    }

    writeInt8(n) {
      this.buffer.setInt8(this.index++, n);
      return this;
    }

    writeUInt8(n) {
      this.buffer.setUint8(this.index++, n);
      return this;
    }

    writeInt16(n, le) {
      this.buffer.setInt16(this.index, n, le || false);
      this.index += 2;
      return this;
    }

    writeUInt16(n, le) {
      this.buffer.setUint16(this.index, n, le || false);
      this.index += 2;
      return this;
    }

    writeInt32(n, le) {
      this.buffer.setInt32(this.index, n, le || false);
      this.index += 4;
      return this;
    }

    writeUInt32(n, le) {
      this.buffer.setUint32(this.index, n, le || false);
      this.index += 4;
      return this;
    }

    writeFloat32(n, le) {
      this.buffer.setFloat32(this.index, n, le || false);
      this.index += 4;
      return this;
    }

    writeString8(n) {
      if (typeof n !== 'string') {
        return;
      }
      for (let i in n) {
        this.writeUInt8(n.charCodeAt(i));
      }
      return this.writeUInt8(0);
    }

    writeString16(n, le) {
      if (typeof n !== 'string') {
        return;
      }
      le = le || false;
      for (let i in n) {
        this.writeUInt16(n.charCodeAt(i), le);
      }
      return this.writeUInt16(0);
    }

    writeString32(n, le) {
      if (typeof n !== 'string') {
        return;
      }
      le = le || false;
      for (let i in n) {
        this.writeUInt32(n.charCodeAt(i), le);
      }
      return this.writeUInt32(0);
    }
  }

  window.Buffer = {
    Writer: Writer,
    Reader: Reader
  };
})();
