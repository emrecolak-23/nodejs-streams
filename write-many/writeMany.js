// const fs = require("fs/promises");

// Execution Time: 9.5 seconds
// CPU Usage: 100% (one core)
// Memory Usage: 45.1 MB

// (async () => {
//   console.time("writeMany");
//   const fileHandler = await fs.open("text.txt", "w");

//   for (let i = 0; i < 1000000; i++) {
//     await fileHandler.write(` ${i} `);
//   }

//   console.timeEnd("writeMany");
// })();

// Execution Time: 2 seconds
// CPU Usage: 100% (one core)
// Memory Usage: 700 MB

// const fs = require("fs");
// (async () => {
//   console.time("writeMany");
//   fs.open("text.txt", "w", (err, fd) => {
//     for (let i = 0; i < 1000000; i++) {
//       fs.writeSync(fd, ` ${i} `);
//     }
//   });
//   console.timeEnd("writeMany");
// })();

// DONT DO IT
// Execution Time: 260 mseconds
// CPU Usage: 100% (one core)
// Memory Usage: 200 MB // When increase loop count it might be reach 1.5 GB memory issue problem
// const { Buffer } = require("buffer");
// const fs = require("fs/promises");
// (async () => {
//   console.time("writeMany");
//   const fileHandler = await fs.open("text.txt", "w");
//   const stream = fileHandler.createWriteStream();

//   for (let i = 0; i < 1000000; i++) {
//     const buff = Buffer.from(` ${i} `, "utf-8");
//     stream.write(buff);
//   }

//   console.timeEnd("writeMany");
// })();

const { Buffer } = require("buffer");
const fs = require("fs/promises");
(async () => {
  console.time("writeMany");
  const fileHandler = await fs.open("text-gigantic.txt", "w");
  const stream = fileHandler.createWriteStream();
  console.log(stream.writableHighWaterMark);

  stream.on("close", () => {
    console.log("Stream was closed");
  });

  // 8 bits = 1 byte
  // 1000 bytes = 1 kilobyte
  // 1000 kilobytes = 1 megabyte

  // 1a => 0001 1010 4 bits
  // const buff = Buffer.alloc(16383, "aaa");
  // console.log(stream.write(buff));
  // console.log(stream.write(Buffer.alloc(1, "a")));
  // console.log(stream.write(Buffer.alloc(1, "a")));
  // console.log(stream.write(Buffer.alloc(1, "a")));

  // console.log(stream.writableLength);

  // stream.on("drain", () => {
  //   console.log(stream.write(Buffer.alloc(16384, "a")));
  //   console.log(stream.writableLength);
  //   console.log("We are now safe to write more");
  // });

  let i = 0;
  const numberOfWrites = 10000000000;
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

  // resume out loop one our streams internal buffer empty
  stream.on("drain", () => {
    console.log("Drained!!!");
    writeMany();
  });

  stream.on("finish", () => {
    console.timeEnd("writeMany");

    fileHandler.close();
  });
})();
