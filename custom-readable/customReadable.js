const { Readable } = require("stream");
const fs = require("fs");

class FileReadStream extends Readable {
  constructor({ highWaterMark, fileName }) {
    super({ highWaterMark });
    this.fileName = fileName;
    this.fd = null;
  }

  _construct(callback) {
    fs.open(this.fileName, "r", (err, fd) => {
      if (err) {
        return callback(err);
      }

      this.fd = fd;
      callback();
    });
  }

  _read(size) {
    const buff = Buffer.alloc(size);
    fs.read(this.fd, buff, 0, size, null, (err, bytesRead) => {
      if (err) {
        return this.destroy(err);
      }
      // null is to indicate the end of stream
      this.push(bytesRead === 0 ? null : buff.subarray(0, bytesRead));
    });
  }

  _destroy(error, callback) {
    if (this.fd) {
      fs.close(this.fd, (err) => {
        if (err) {
          return callback(err || error);
        }

        callback();
      });
    } else {
      callback(error);
    }
  }
}

const stream = new FileReadStream({
  highWaterMark: 1024,
  fileName: "text.txt",
});

stream.on("data", (chunk) => {
  console.log(chunk.toString("utf-8"));
});

stream.on("end", () => {
  console.log("Stream ended");
});
