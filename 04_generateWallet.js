/**
 * 通过ethereumjs-wallet库直接生成私钥，公钥，地址
 * 通过eip55库对地址进行checksum，形成目前主流应用都在支持的包含大小写字母的地址
 * eip55好处：平均每个地址有15个字母，经过15次校验后，地址有更改但无法被识别的概率只有0.0247%。
 * eip55原理：
 *  - 将原始地址（字母全部为小写）取哈希
 *  - 如果地址第i位是字母，那么就去查一下哈希的第4i位
 *  - 第4i位如果是1，第i位改为大写，如果是0，第i位不变，仍为小写
 */

const Wallet = require("ethereumjs-wallet");
const eip55 = require("eip55");
const wallet = Wallet.default.generate();

console.log("SK: ", wallet.getPrivateKeyString());
console.log("PK: ", wallet.getPublicKeyString());
console.log("Address before checksum: ", wallet.getAddressString());
console.log(
  "Address after  checksum :",
  eip55.encode(wallet.getAddressString())
);
