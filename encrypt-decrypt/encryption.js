// encryption / decryption => crypto
// compression => zlib
// hashing / salting => crypto
// decoding / encoding => buffer text-encoding/decoding

// Ceasar cipher

const { Transform } = require("stream");
const fs = require("fs/promises");

class Encrypt extends Transform {
  _transform(chunk, encoding, callback) {
    console.log(chunk.toString("utf-8"));
    // <34 + 1 , ff + 1, a4+ 1, 11 + 1, 22 + 1 ....>
    for (let i = 0; i < chunk.length; ++i) {
      if (chunk[i] !== 255) {
        chunk[i] = chunk[i] + 1;
      }
    }
    this.push(chunk);
    callback(null);
  }
}

(async () => {
  const readFileHandle = await fs.open("read.txt", "r");
  const writeFileHandle = await fs.open("write.txt", "w");

  const readStream = readFileHandle.createReadStream();
  const writeStream = writeFileHandle.createWriteStream();

  const encrypt = new Encrypt();
  readStream.pipe(encrypt).pipe(writeStream);
})();
