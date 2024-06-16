const fs = require("fs/promises");
const { Buffer } = require("buffer");
const { pipeline } = require("stream");
// File Size Coppied: 1 GB
// Memory Usage: 1GB
// Execution Time: 1 second
// (async () => {
//   console.time("copy");
//   const destFile = await fs.open("text-copy.txt", "w");
//   const result = await fs.readFile("text.txt");
//   await destFile.write(result);
//   console.timeEnd("copy");
// })();

// File Size Coppied: 1GB
// Memory Usage: 60 MB
// Execution Time: 1 second

// (async () => {
//   console.time("copy");

//   const srcFile = await fs.open("text.txt", "r");
//   const destFile = await fs.open("text-copy.txt", "w");

//   let bytesRead = -1;

//   while (bytesRead !== 0) {
//     const readResult = await srcFile.read();
//     bytesRead = readResult.bytesRead;

//     if (bytesRead !== 16384) {
//       const indexOfNotFilled = readResult.buffer.indexOf(0);
//       const newBuffer = Buffer.alloc(indexOfNotFilled);
//       readResult.buffer.copy(newBuffer, 0, 0, indexOfNotFilled);
//       destFile.write(newBuffer);
//     } else {
//       destFile.write(readResult.buffer);
//     }
//   }

//   console.timeEnd("copy");
// })();

// File Size Coppied: 1GB
// Memory Usage: 30 MB
// Execution Time: 500 ms

(async () => {
  console.time("copy");

  const srcFile = await fs.open("text.txt", "r");
  const destFile = await fs.open("text-copy.txt", "w");

  const readStream = srcFile.createReadStream();
  const writeStream = destFile.createWriteStream();
  //   console.log(readStream.readableFlowing);
  //   readStream.pipe(writeStream);
  //   console.log(readStream.readableFlowing);
  //   readStream.unpipe(writeStream);
  //   console.log(readStream.readableFlowing);
  //   readStream.pipe(writeStream);
  //   console.log(readStream.readableFlowing);

  //   readStream.on("end", () => {
  //     console.log("Done read");
  //     console.timeEnd("copy");
  //   });

  pipeline(readStream, writeStream, (err) => {
    if (err) {
      console.error("Pipeline failed", err);
    } else {
      console.log("Pipeline succeeded");
      console.timeEnd("copy");
    }
  });
})();
