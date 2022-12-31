/**
 * 采用椭圆曲线算法由私钥生成公钥，比特币/以太坊都采用secp256k1曲线
 * PK返回值为130位16进制字符串，去掉固定前缀04即可得到128位公钥
 * 04210e93d406a66998ba69d3c9f26fffcccc432f3152e204aef49402eddaaa6cf155ea52d17bb40fc9f3ee3b13a0d8824acf49ff7af2ca5397770fc2475b160cb6
 */
const { publicKeyCreate } = require("secp256k1");

const SK = "75c7e7c3a022276216f7cbed396787bf25931bcf6924bffd246bc7772cbba086";

const SKBuffer = Buffer.from(SK, "hex");

const PK = Buffer.from(publicKeyCreate(SKBuffer, false)).toString("hex");

console.log("Public Key: ", PK);
