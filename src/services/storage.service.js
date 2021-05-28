
import * as CryptoJS from "crypto-js";
//import SecureStorage from 'secure-web-storage'

export default class StorageService {
  SecureStorage = require("secure-web-storage");

  SECRET_KEY = "secret_key"; // not callable within secureStorage declaration
  // only option is to 1 by 1 declare 'secret_key'

  secureStorage = new this.SecureStorage(localStorage, {
    hash: function hash(key) {
      key = CryptoJS.SHA256(key, "secret_key");

      return key.toString();
    },
    encrypt: function encrypt(data) {
      data = CryptoJS.AES.encrypt(data, "secret_key");

      data = data.toString();

      return data;
    },
    decrypt: function decrypt(data) {
      data = CryptoJS.AES.decrypt(data, "secret_key");

      data = data.toString(CryptoJS.enc.Utf8);

      return data;
    },
  });
}
