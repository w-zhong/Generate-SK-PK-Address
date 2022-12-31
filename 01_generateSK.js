/**
 * 引入node自带crypto库，randomBytes()的关键是需要真正的随机源
 * crypto库采用的是OpenSSL标准，可以放心使用
 * 最后SK格式为64位的十六进制字符串
 * 75c7e7c3a022276216f7cbed396787bf25931bcf6924bffd246bc7772cbba086
 */

const crypto = require("crypto");
const SK = crypto.randomBytes(32).toString("hex");

console.log("Private Key: ", SK);
