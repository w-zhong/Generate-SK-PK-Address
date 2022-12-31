/**
 * 采用keccak256对公钥取哈希，返回值取后40位，再加0x前缀就得到了地址
 * 0xf3f3037f2a393234998dbc589a057fbe65810760
 */

const keccak256 = require("keccak256");

const PK =
  "210e93d406a66998ba69d3c9f26fffcccc432f3152e204aef49402eddaaa6cf155ea52d17bb40fc9f3ee3b13a0d8824acf49ff7af2ca5397770fc2475b160cb6";

const PKBuffer = Buffer.from(PK, "hex");

const Address = keccak256(PKBuffer)
  .toString("hex")
  .slice(64 - 40);

console.log("Ethereum Address: ", "0x" + Address);
