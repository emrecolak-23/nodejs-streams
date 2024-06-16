const { Writable } = require("stream");
const fs = require("fs");

class FileWriteStream extends Writable {
  constructor({ highWaterMark, fileName }) {
    super({ highWaterMark });
    this.fileName = fileName;
    this.fd = null;
    this.chunks = [];
    this.chunksSize = 0;
    this.writeCount = 0;
  }

  // This will run after constructor and it will put off all the other methods
  // until we call callback
  _construct(callback) {
    fs.open(this.fileName, "w", (err, fd) => {
      if (err) {
        // so if we call the callback witn an arguments that means we have an error and we should stop the stream
        return callback(err);
      }

      this.fd = fd;
      // no arguments means it was successfull
      callback();
    });
  }

  _write(chunk, encoding, callback) {
    this.chunks.push(chunk);
    this.chunksSize += chunk.length;

    if (this.chunksSize >= this.highWaterMark) {
      fs.write(this.fd, Buffer.concat(this.chunks), (err) => {
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

  _final(callback) {
    fs.write(this.fd, Buffer.concat(this.chunks), (err) => {
      if (err) return callback(err);
      ++this.writeCount;
      this.chunks = [];
      callback();
    });
  }

  _destroy(error, callback) {
    console.log("Number of writes: ", this.writeCount);
    if (this.fd) {
      fs.close(this.fd, (err) => {
        if (err) {
          return callback(err || error);
        }
        callback();
      });
    }
  }
}

const stream = new FileWriteStream({
  highWaterMark: 1800,
  fileName: "text.txt",
});

stream.write(Buffer.from("Hello World!"));
// stream._write(Buffer.from("Hello World!"));
stream.end(Buffer.from("Goodbye!"));

stream.on("finish", () => {
  console.log("All writes are now complete.");
});
// stream.on("drain", () => {
//   console.log("drain");
// });

(async () => {
  console.time("writeMany");
  const stream = new FileWriteStream({
    fileName: "text.txt",
  });

  stream.on("close", () => {
    console.log("Stream was closed");
  });

  let i = 0;
  const numberOfWrites = 1000000;
  const writeMany = () => {
    while (i < numberOfWrites) {
      const buff = Buffer.from(` ${i} `, "utf-8");
      if (i === numberOfWrites - 1) {
        return stream.end(buff);
      }

      // if strea.write returns false, stop the loop
      if (!stream.write(buff)) {
        break;
      }

      i++;
    }
  };

  writeMany();

  let d = 0;
  // resume out loop one our streams internal buffer empty
  stream.on("drain", () => {
    ++d;
    console.log("Drained!!!");
    writeMany();
  });

  stream.on("finish", () => {
    console.log(`Number of writes: ${i}`);
    console.timeEnd("writeMany");
  });
})();
