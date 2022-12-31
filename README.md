# 离线、安全的生成以太坊私钥/公钥/地址
与比特币采取的UTXO模式不同，以太坊采取的是账户模式，以太坊地址可以看作一个个账户，它们都具有**唯一性**，**私密性**和**权限控制**的能力。

与现实中银行账户不同的是，以太坊地址背后不仅仅可以是个人和公司，同样也可以是协议，因为地址是可以包含代码的，这类地址被称作合约地址。

首先我们来看一下以太坊地址的定义和分类：

- 外部地址（Externally Owned Account，EOA）：由私钥生成并控制
- 合约地址（Smart Contract Account），由EOA部署生成，由内部代码控制

![Untitled](https://user-images.githubusercontent.com/99269419/210132816-2fbef840-813a-4fbd-938a-7ffa60298b10.png)

绝大多数web3用户都是通过钱包（例如MetaMask）的方式创建公私钥对和地址，今天我们会采取纯代码的方式带大家把全流程走通。

值得一提的是，当环境搭建好之后，整个过程完全不需要接触互联网，因此这种方式可以更加安全的保护你的私钥。

![由私钥生成外部地址的过程](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/03a30e80-b415-48f1-9e66-47a96d2f5645/Untitled.png)

由私钥生成外部地址的过程

从私钥可以单向生成地址，完全不需要任何其他信息，这也是为什么我们说有了私钥就有了地址，但是反之不可行，因为生成过程中的椭圆曲线加密算法和哈希算法都是不可逆的。

### 生成私钥

私钥本质上就是1-2**256之间的随机数，所以生成私钥的过程中有可靠的随机源至关重要，理论上扔256次硬币的方式生成的私钥非常可靠。

我们采用的是node自带的符合OpenSSL标准的crypto库，可以放心使用。

```jsx
// 01_generateSK.js
const crypto = require("crypto");
const SK = crypto.randomBytes(32).toString("hex");

console.log("Private Key: ", SK);
```

在终端输入`node 01_generateSK.js` 运行后生成私钥的格式为32字节的十六进制字符串。

例子：`”75c7e7c3a022276216f7cbed396787bf25931bcf6924bffd246bc7772cbba086"`。

### 用私钥生成公钥

32字节的私钥通过ECDSA椭圆曲线加密算法（具体为secp256k1曲线）生成64字节的公钥，我们需要安装对应的npm库：`npm i secp256k1`。

```jsx
// 02_generatePKfromSK.js
const { publicKeyCreate } = require("secp256k1");
const SK = "75c7e7c3a022276216f7cbed396787bf25931bcf6924bffd246bc7772cbba086";
const SKBuffer = Buffer.from(SK, "hex");
const PK = Buffer.from(publicKeyCreate(SKBuffer, false)).toString("hex");
console.log("Public Key: ", PK);
```

公钥返回值为130位16进制字符串，去掉固定前缀04即可得到64字节/128位公钥。

例子：”`210e93d406a66998ba69d3c9f26fffcccc432f3152e204aef49402eddaaa6cf155ea52d17bb40fc9f3ee3b13a0d8824acf49ff7af2ca5397770fc2475b160cb6“`。

### 压缩公钥得到地址

将公钥通过哈希算法Keccak-256获得32字节的压缩公钥，需要安装对应的npm库：`npm i keccak256`。最后，取压缩公钥最后40位/20字节，并且加入0x前缀即可得到42位的最终地址。

例子：“`0xf3f3037f2a393234998dbc589a057fbe65810760`”。

```jsx
// 03_generateAddressfromPK.js
const keccak256 = require("keccak256");
const PK =
  "210e93d406a66998ba69d3c9f26fffcccc432f3152e204aef49402eddaaa6cf155ea52d17bb40fc9f3ee3b13a0d8824acf49ff7af2ca5397770fc2475b160cb6";
const PKBuffer = Buffer.from(PK, "hex");
const Address = keccak256(PKBuffer)
  .toString("hex")
  .slice(64 - 40);

console.log("Ethereum Address: ", "0x" + Address);
```

### 直接生成私钥/公钥/地址

我们可以用`ethereumjs-wallet`库将上面三步集成到一起，一键生成公私钥对和地址，市面上主流的钱包应用都是用这个方法生成地址账户。

安装：`npm i ethereumjs-wallet`。

```jsx
// 04_generateWallet.js
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

// Output:
// SK:  0x3fa8b14e683907bfefdebe44f91d81225197136f59cba6e8bf5a8e3b9fa40569
// PK:  0xc77d41e166d05a112683879095007c8572c32f4a129a0a6264a26bd3d4c746a125595468aecf833b468b93edb33d4b48ab77d1795ba4dcb32b589689ba31dddf
// Address before checksum:  0x73989e1bdd4bd5849932cbc24c8d4f97ef79d544
// Address after  checksum : 0x73989e1bdd4bD5849932CBC24C8D4f97eF79D544
```

你可能注意到这个例子生成了两个地址，第一个里面字母部分都是小写，第二个字母部分有大写也有小写，这是因为我们引入了`eip55`，对地址进行了校验。

### EIP-55

[EIP-55](https://eips.ethereum.org/EIPS/eip-55) 是V神在2016年提出的以太坊改善提案，目前市面上所有的主流协议均已支持，它的原理如下：

- 将原始地址（字母全部为小写）取哈希
- 如果地址第i位是字母，那么就去查一下哈希的第4i位
- 第4i位如果是1，第i位改为大写，如果是0，第i位不变，仍为小写

由于以太坊地址有42位，平均会有15个字母，经过15次校验后，地址有更改但无法被识别的概率只有0.0247%，这一方法可以大大的降低转账时出现输入错误的几率。
