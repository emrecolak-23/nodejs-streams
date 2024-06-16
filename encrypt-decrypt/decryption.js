// encryption / decryption => crypto
// compression => zlib
// hashing / salting => crypto
// decoding / encoding => buffer text-encoding/decoding

const { Transform } = require("stream");
const fs = require("fs/promises");

class Decrypt extends Transform {
  _transform(chunk, encoding, callback) {
    console.log(chunk.toString("utf-8"));
    // <35 - 1 , ff, a5 - 1, 12 - 1, 23 - 1 ....>
    for (let i = 0; i < chunk.length; ++i) {
      if (chunk[i] !== 255) {
        chunk[i] = chunk[i] - 1;
      }
    }
    this.push(chunk);
    callback(null);
  }
}

(async () => {
  const readFileHandle = await fs.open("write.txt", "r");
  const writeFileHandle = await fs.open("decrypted.txt", "w");

  const readStream = readFileHandle.createReadStream();
  const writeStream = writeFileHandle.createWriteStream();

  const decrypt = new Decrypt();
  readStream.pipe(decrypt).pipe(writeStream);
})();
