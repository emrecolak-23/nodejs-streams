const { Duplex } = require("stream");
const fs = require("fs");

class DuplexStream extends Duplex {
  constructor({
    writableHighWaterMark,
    readableHighwaterMark,
    readFileName,
    writeFileName,
  }) {
    super({ writableHighWaterMark, readableHighwaterMark });
    this.readFileName = readFileName;
    this.writeFileName = writeFileName;
    this.readFd = null;
    this.writeFd = null;
    this.chunks = [];
    this.chunksSize = 0;
  }

  _construct(callback) {
    fs.open(this.readFileName, "r", (err, readFd) => {
      if (err) {
        return callback(err);
      }

      this.readFd = readFd;
      fs.open(this.writeFileName, "w", (err, writeFd) => {
        if (err) {
          return callback(err);
        }

        this.writeFd = writeFd;
        callback();
      });
    });
  }

  _write(chunk, encoding, callback) {
    this.chunks.push(chunk);
    this.chunksSize += chunk.length;

    if (this.chunksSize >= this.writableHighWaterMark) {
      fs.write(this.writeFd, Buffer.concat(this.chunks), (err) => {
        if (err) {
          return callback(err);
        }

        this.chunks = [];
        this.chunksSize = 0;
        ++this.writeCount;
        callback();
      });
    } else {
      callback();
    }
  }

  _read(size) {
    const buff = Buffer.alloc(size);
    fs.read(this.readFd, buff, 0, size, null, (err, bytesRead) => {
      if (err) {
        return this.destroy(err);
      }
      // null is to indicate the end of stream
      this.push(bytesRead === 0 ? null : buff.subarray(0, bytesRead));
    });
  }

  _final(callback) {
    fs.write(this.writeFd, Buffer.concat(this.chunks), (err) => {
      if (err) return callback(err);
      ++this.writeCount;
      this.chunks = [];
      callback();
    });
  }

  _destroy(error, callback) {
    callback(error);
  }
}

const dublex = new DuplexStream({
  readFileName: "read.txt",
  writeFileName: "write.txt",
  writableHighWaterMark: 1024,
  readableHighwaterMark: 1024,
});

dublex.write(Buffer.from("Hello World!"));
dublex.write(Buffer.from("Hello World!"));
dublex.write(Buffer.from("Hello World!"));
dublex.end(Buffer.from("Goodbye!"));

dublex.on("data", (chunk) => {
  console.log(chunk.toString("utf-8"));
});
