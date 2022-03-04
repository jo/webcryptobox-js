# Webcryptobox
Tiny utility library for asymetric encryption via WebCrypto with zero dependencies.

> I don't usually do libraries any more but when I do, it's mainly for educational purposes.

Demo: https://jo.github.io/webcryptobox/

This is a small opiniated wrapper around the [WebCrypto](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) API. When I first started to get into WebCrypto, coming from NaCl it felt a little difficult to me to get things right. Here I encapsulate my learnings. Before WebCrypto, I used [TweetNaCl.js](https://github.com/dchest/tweetnacl-js) a lot. I really liked its simplicity, and the choices it (and NaCl in general) made for me. Now I offer to you similar choices on encryption algorithms, but using the browser native WebCrypto instead. This library provides part of the functionality I liked when using TweetNaCl.

This library provides easy to use and convenient wrappers around the WebCrypto primitives, as well as some helpers for encoding/decoding and a few sugar functions, with zero dependencies.

It works directly in the browser and in latest Node.js versions (via [the experimental WebCrypto API](https://nodejs.org/api/webcrypto.html)).


## Usage
In Node, you can use the lib as usual:
```sh
npm install webcryptobox
```

and then
```js
import { utils, Webcryptobox } from 'webcryptobox'
```

In modern browser which support es6 modules, just include the file directly:
```html
<script type=module>
  import { utils, Webcryptobox } from './´webcryptobox.js'
</script>
```

Now you can dance with the lib like its 1984:
```js
const wcb = new Webcryptobox()
const { privateKey, publicKey } = await wcb.generateKeyPair()
const text = 'Nobody else can offer me something, something heart felt like you did it!'
const message = utils.decodeText(text)
const iv = wcb.generateIv()
const box = await wcb.deriveAndEncrypt({ message, iv, privateKey, publicKey })
```


## API
This lib is written with some ECMAScript 6 features, mainly modules, dynamic import, async, destructuring and object spreading.

Most of the functions return promises. Webcryptobox comes with two exports: `utils` and `Webcryptobox`. The first provides some convenient functions for dealing with encoding and decoding (base64, hex, text). The `Webcryptobox` class provides the crypto functions and must be initialized like described below:

### Crypto Algorithm Configuration
Initialize Webcryptobox with a crypto configuration:

* `curve`: ECDH named curve. Default is `P-521`
* `mode`: AES mode. Default is `GCM`
* `length`: AES key length. Default is `256`

Eg:
```js
const wcb = new Webcryptobox({
  curve: 'P-521',
  mode: 'GCM',
  length: 256
})
```

Above are the defaults, so its the same as:
```js
const wcb = new Webcryptobox()
```

#### Supported Curves
* `P-256`: 256-bit prime field Weierstrass curve. Also known as `secp256r1` or `prime256v1`.
* `P-384`: 384-bit prime field Weierstrass curve. Also known as: `secp384r1` or `ansip384r1`.
* `P-521`: 521-bit prime field Weierstrass curve. Also known as: `secp521r1` or `ansip521r1`.

#### Supported Modes
* `CBC`: Cipher Block Chaining Mode
* `GCM`: Galois/Counter Mode

#### Supported Length
* `128`
* `256`


### Utils for Encoding & Decoding
Webcryptobox provides utility functions to convert between several text representations and the internally used `Uint8Array`s.

#### `decodeText`
Takes an unicode string and encodes it to an Uint8Array:

```js
const data = utils.decodeText('my message')
// Uint8Array(10) [
//   109, 121,  32, 109,
//   101, 115, 115,  97,
//   103, 101
// ]
```

#### `encodeText`
Given a Uint8Array, encodes the data as unicode string:

```js
const text = utils.encodeText(new Uint8Array([
  109, 121,  32, 109,
  101, 115, 115,  97,
  103, 101
]))
// my message
```

#### `decodeHex`
Takes a hex string and encodes it to an Uint8Array:

```js
const data = utils.decodeHex('6d79206d657373616765')
// Uint8Array(10) [
//   109, 121,  32, 109,
//   101, 115, 115,  97,
//   103, 101
// ]
```

#### `encodeHex`
Given a Uint8Array, encodes the data as hex string:

```js
const hex = utils.encodeHex(new Uint8Array([
  109, 121,  32, 109,
  101, 115, 115,  97,
  103, 101
]))
// 6d79206d657373616765
```

#### `decodeBase64`
Takes a base64 string and encodes it to an Uint8Array:

```js
const data = utils.decodeBase64('bXkgbWVzc2FnZQ==')
// Uint8Array(10) [
//   109, 121,  32, 109,
//   101, 115, 115,  97,
//   103, 101
// ]
```

#### `encodeBase64`
Given a Uint8Array, encodes the data as base64 string:

```js
const base64 = utils.encodeBase64(new Uint8Array([
  109, 121,  32, 109,
  101, 115, 115,  97,
  103, 101
]))
// bXkgbWVzc2FnZQ==
```

### Dealing with PEMs
PEM are common formats for exchaning keys.

#### `decodePrivateKeyPem`
Given private key data, encodes it as a pem.

```js
const { privateKey } = await wcb.generateKeyPair()
const privateKeyData = await wcb.exportPrivateKey(privateKey)
const pem = wcb.encodePrivateKeyPem(privateKeyData)
// -----BEGIN PRIVATE KEY-----
// MIHuAgEAMBAGByqGSM49AgEGBSuBBAAjBIHWMIHTAgEBBEIAaaRXNmPnb4NPvB8iF+FuNJEaztFIuU3S
// DcL8WFuUymIB2HH4XQZVvR/w5fi+sxbM/BpdX23nYp1D20hEEAdx/ZuhgYkDgYYABAE3i9CbMEJtSCDq
// en0An/S67viMIJLoslNHgOGbfvp8W4EE24vQtBH3bM+nNhDFgTMDKDYLreHWfQwYH/6hQR4vNQEPHr7A
// UwJwZ0oYtpbkt0P3W1qpHtxJF8WEZf+6Bms3tMZeUa4nhugqO1fq3ssXSx5bC6Ma7AW+dRmGVq60w/x8
// LA==
// -----END PRIVATE KEY-----
```

#### `encodePrivateKeyPem`
Returns the Uint8Array data of a private key for a pem.

```js
const data = wcb.encodePrivateKeyPem(`-----BEGIN PRIVATE KEY-----
MIHuAgEAMBAGByqGSM49AgEGBSuBBAAjBIHWMIHTAgEBBEIAaaRXNmPnb4NPvB8iF+FuNJEaztFIuU3S
DcL8WFuUymIB2HH4XQZVvR/w5fi+sxbM/BpdX23nYp1D20hEEAdx/ZuhgYkDgYYABAE3i9CbMEJtSCDq
en0An/S67viMIJLoslNHgOGbfvp8W4EE24vQtBH3bM+nNhDFgTMDKDYLreHWfQwYH/6hQR4vNQEPHr7A
UwJwZ0oYtpbkt0P3W1qpHtxJF8WEZf+6Bms3tMZeUa4nhugqO1fq3ssXSx5bC6Ma7AW+dRmGVq60w/x8
LA==
-----END PRIVATE KEY-----`)
// int8Array(241) [
//    48, 129, 238,   2,   1,   0,  48,  16,   6,   7,  42, 134,
//    72, 206,  61,   2,   1,   6,   5,  43, 129,   4,   0,  35,
//     4, 129, 214,  48, 129, 211,   2,   1,   1,   4,  66,   0,
//    55,  90, 211,  22, 241,  55,  47,  56, 191,  19,  68, 146,
//    28, 179, 129,  11, 112,  89, 212, 152, 136, 249, 122,  99,
//   222,  28,  90, 143, 116, 143, 141, 144,  79,  61, 149, 244,
//    10,  64, 194, 177, 173, 134, 144,  69,  11, 156, 156,   2,
//   220,  97,  61,  30,  22, 201, 130, 186, 246, 245, 254,   9,
//    84, 217, 200, 244,
//   ... 141 more items
// ]
```

#### `decodePublicKeyPem`
Given public key data, encodes it as a pem.

```js
const { publicKey } = await wcb.generateKeyPair()
const publicKeyData = await wcb.exportPublicKey(publicKey)
const pem = wcb.encodePublicKeyPem(publicKeyData)
// -----BEGIN PUBLIC KEY-----
// MIGbMBAGByqGSM49AgEGBSuBBAAjA4GGAAQBpsg9VAkqNoSEHcP1HiC12clzfCH4vqCo5067wsltUlPS
// qKr22n8+ClNNYINKvWP0cGg4Z7cTxqnus3CpAMAvZTEAUfbLZOm/WGwrPxdY2IDy8UQcUvDU/N8Q5xiP
// 18dqrijI4M/RDpjYsz7BZAg+UvaWtD6EJBK0/rgppo3rNxsEK7I=
// -----END PUBLIC KEY-----
```

#### `encodePublicKeyPem`
Returns the Uint8Array data of a public key for a pem.

```js
const data = wcb.encodePublicKeyPem(`-----BEGIN PUBLIC KEY-----
MIGbMBAGByqGSM49AgEGBSuBBAAjA4GGAAQBpsg9VAkqNoSEHcP1HiC12clzfCH4vqCo5067wsltUlPS
qKr22n8+ClNNYINKvWP0cGg4Z7cTxqnus3CpAMAvZTEAUfbLZOm/WGwrPxdY2IDy8UQcUvDU/N8Q5xiP
18dqrijI4M/RDpjYsz7BZAg+UvaWtD6EJBK0/rgppo3rNxsEK7I=
-----END PUBLIC KEY-----`)
// Uint8Array(158) [
   48, 129, 155,  48,  16,   6,   7,  42, 134,  72, 206,  61,
    2,   1,   6,   5,  43, 129,   4,   0,  35,   3, 129, 134,
    0,   4,   0, 174,  43,   0, 227,  67,  88,  84,  45, 187,
  100, 205, 177, 191, 139, 129, 119,  57,   6, 200, 236, 175,
  231, 171, 246,   1, 173,  29,  64, 138,   5, 219, 173,  69,
    4, 234, 158, 197,   6,  90,  40, 235, 186, 112, 125, 139,
  144, 223, 156, 109, 233, 209, 104,  52,  56,  90, 109,  78,
  204, 241, 164,   6, 253, 157, 117, 237,   1, 196, 109, 208,
   71,   5, 199,   3,
  ... 58 more items
]
```

### Key Generation and Derivation
Functions for generating a ecdh and aes-cbc keys, for deriving an aes-cbc key or the public key from a private one and for generating a sha-256 fingerprint of a key.

#### `generateKeyPair`
Generates ecdh key pair with curve `P-521`. The private key will be extractable, and can be used to derive a key.

```js
const keyPair = await wcb.generateKeyPair()
// {
//   publicKey: CryptoKey {
//     type: 'public',
//     extractable: true,
//     algorithm: { name: 'ECDH', namedCurve: 'P-521' },
//     usages: []
//   },
//   privateKey: CryptoKey {
//     type: 'private',
//     extractable: true,
//     algorithm: { name: 'ECDH', namedCurve: 'P-521' },
//     usages: [ 'deriveKey' ]
//   }
// }
```

#### `generateKey`
Generate aes-cbc key with a length of 256. The key will be extractable and can be used for encryption and decryption.

```js
const key = await wcb.generateKey()
// CryptoKey {
//   type: 'secret',
//   extractable: true,
//   algorithm: { name: 'AES-GCM', length: 256 },
//   usages: [ 'encrypt', 'decrypt' ]
// }
```

#### `deriveKey`
Given a private and a public key, this function derives an aes-cbc key. For two key pairs `A` and `B`, the derived key will be the same for
`deriveKey({ privateKey: A.privateKey, publicKey: B.publicKey })` and `deriveKey({ privateKey: B.privateKey, publicKey: A.publicKey })`.

```js
const { privateKey } = await wcb.generateKeyPair()
const { publicKey } = await wcb.generateKeyPair()
const key = await wcb.deriveKey({ privateKey, publicKey })
// CryptoKey {
//   type: 'secret',
//   extractable: true,
//   algorithm: { name: 'AES-GCM', length: 256 },
//   usages: [ 'encrypt', 'decrypt' ]
// }
```

#### `derivePublicKey`
Given a private key, returns its corresponding public key. As there is no direct API for this in WebCrypto, this utilizes import and export of the key (in `jwk` format), while removing the private key parts.

```js
const { privateKey } = await wcb.generateKeyPair()
const publicKey = await wcb.derivePublicKey(privateKey)
// CryptoKey {
//   type: 'public',
//   extractable: true,
//   algorithm: { name: 'ECDH', namedCurve: 'P-521' },
//   usages: []
// }
```

### Fingerprinting
Methods for calculating fingerprints of public keys. Note that the fingerprints differ from the fingerprints from `ssh-keygen`.

#### `sha256Fingerprint`
Calculate a SHA-256 fingerprint of a key. It has a length of 64 hex chars.

```js
const { publicKey } = await wcb.generateKeyPair()
const fingerprint = wcb.sha256Fingerprint(publicKey)
// aca8f766cdef8346177987a86b0f04b14fd4060b0e2478f941adc91982d6668c
```

#### `sha1Fingerprint`
Calculate a SHA-1 fingerprint of a key. It has a length of 40 hex chars.

```js
const { publicKey } = await wcb.generateKeyPair()
const fingerprint = wcb.sha1Fingerprint(publicKey)
// d04f73b7eb0b865a8d4711b5a379273a27c65581
```

### Key Import and Export
Tools for exchanging keys. Also comes with convenient helpers to deal with PEM formatted keys.

#### `exportKey`
Exports aes key data as ArrayBuffer

```js
const key = await wcb.generateKey()
const data = await wcb.exportKey(key)
// ArrayBuffer {
//   [Uint8Contents]: <ac 54 d5 01 74 ca d6 87 f5 65 18 d0 4f e4 0f 18 77 7c 53 74 79 c1 a7 4d 83 f6 9a 1a 10 90 06 32>,
//   byteLength: 32
// }
```

#### `importKey`
Import aes key data, returns CryptoKey:

```js
const data = new Uint8Array([
  210, 29, 179, 47, 204, 90, 109, 111, 95, 64, 50, 48, 192, 105, 44, 236, 74, 120, 2, 193, 83, 122, 22, 99, 202, 73, 20, 23, 187, 160, 140, 112
])
const key = await wcb.importKey(data)
// CryptoKey {
//   type: 'secret',
//   extractable: true,
//   algorithm: { name: 'AES-GCM', length: 256 },
//   usages: [ 'encrypt', 'decrypt' ]
// }
```

#### `exportPrivateKey`
Exports private key data as ArrayBuffer

```js
const { privateKey } = await wcb.generateKeyPair()
const data = await wcb.exportPrivateKey(privateKey)
// ArrayBuffer {
//   [Uint8Contents]: <30 81 ee 02 01 00 30 10 06 07 2a 86 48 ce 3d 02 01 06 05 2b 81 04 00 23 04 81 d6 30 81 d3 02 01 01 04 42 00 7c ae 23 7e e5 88 eb 93 93 f9 9e a7 d3 16 3c 9c cd 18 f6 a5 72 d9 04 21 28 05 9b 11 a7 ae e8 81 7b 26 a3 97 96 7c f4 97 54 c7 d5 db c2 ae 04 d7 86 03 f0 92 c1 87 35 90 53 10 a7 6f d4 f3 4f f8 ... 141 more bytes>,
//   byteLength: 241
// }
```

#### `importPrivateKey`
Given private key data, imports the key and returns a CryptoKey:

```js
const { privateKey } = await wcb.generateKeyPair()
const data = await wcb.exportPrivateKey(privateKey)
const importedPrivateKey = await wcb.importPrivateKey(data)
// CryptoKey {
//   type: 'private',
//   extractable: true,
//   algorithm: { name: 'ECDH', namedCurve: 'P-521' },
//   usages: [ 'deriveKey' ]
// }
```

#### `exportPublicKey`
Exports public key data as ArrayBuffer

```js
const { publicKey } = await wcb.generateKeyPair()
const data = await wcb.exportPublicKey(publicKey)
// ArrayBuffer {
//   [Uint8Contents]: <30 81 9b 30 10 06 07 2a 86 48 ce 3d 02 01 06 05 2b 81 04 00 23 03 81 86 00 04 00 27 60 ca ed ba a7 a9 81 2b 29 58 fd b5 14 ce 51 82 dc 8b c2 0e cf 03 15 12 a6 a5 d5 7b 08 ea 55 d1 cd 28 20 8e 8e c3 ee 81 4c 15 85 05 f5 45 af 6e d9 0a 67 dc 5c 24 0a 7d 6c f3 bb 42 fe fe 17 15 00 78 bf e3 ff f0 9b e2 ... 58 more bytes>,
//   byteLength: 158
// }
```

#### `importPublicKey`
Given public key data, imports the key and returns a CryptoKey:

```js
const { publicKey } = await wcb.generateKeyPair()
const data = await wcb.exportPublicKey(publicKey)
const importedPublicKey = await wcb.importPublicKey(data)
// CryptoKey {
//   type: 'public',
//   extractable: true,
//   algorithm: { name: 'ECDH', namedCurve: 'P-521' },
//   usages: []
// }
```

#### `exportPrivateKeyPem`
Utility function to export a private key as pem:

```js
const { privateKey } = await wcb.generateKeyPair()
const pem = await wcb.exportPrivateKeyPem(privateKey)
// -----BEGIN PRIVATE KEY-----
// MIHuAgEAMBAGByqGSM49AgEGBSuBBAAjBIHWMIHTAgEBBEIADL2kTtM5abY6q93yTYFL+wWYAORVDEqU3hxy2DGetX61p8I1gNlxCQZ+R+O+il9MicFsxOeXq7duot1kpsPTzmmhgYkDgYYABAAHLtBwbSs5O7X0YMFywmkcEzB4nWrOFj3eL7MW2LXVf91HfAawwwlay5LpELiwRS1H9woqYK5PVjIwj/elKGbWJQDtiDqcCdfaOOuEBaZBbgTMVTTpKjJ5sKmwN8Z6blsNDgCqlF10H2/PWGSFOkWxxMP8xjeZoBwrmh5INaR19h/Qng==
// -----END PRIVATE KEY-----
```

#### `importPrivateKeyPem`
Given a pem of a private key, returns the CryptoKey:

```js
const privateKey = await wcb.importPrivateKeyPem(`-----BEGIN PRIVATE KEY-----
MIHuAgEAMBAGByqGSM49AgEGBSuBBAAjBIHWMIHTAgEBBEIADL2kTtM5abY6q93yTYFL+wWYAORVDEqU3hxy2DGetX61p8I1gNlxCQZ+R+O+il9MicFsxOeXq7duot1kpsPTzmmhgYkDgYYABAAHLtBwbSs5O7X0YMFywmkcEzB4nWrOFj3eL7MW2LXVf91HfAawwwlay5LpELiwRS1H9woqYK5PVjIwj/elKGbWJQDtiDqcCdfaOOuEBaZBbgTMVTTpKjJ5sKmwN8Z6blsNDgCqlF10H2/PWGSFOkWxxMP8xjeZoBwrmh5INaR19h/Qng==
-----END PRIVATE KEY-----`)
// CryptoKey {
//   type: 'private',
//   extractable: true,
//   algorithm: { name: 'ECDH', namedCurve: 'P-521' },
//   usages: [ 'deriveKey' ]
// }
```

#### `exportPublicKeyPem`
Utility function to export a public key as pem:

```js
const { publicKey } = await wcb.generateKeyPair()
const pem = await wcb.exportPublicKeyPem(publicKey)
// -----BEGIN PUBLIC KEY-----
// MIGbMBAGByqGSM49AgEGBSuBBAAjA4GGAAQAjHH6XfHQpYpdQVH3xGcnQ5MpIMXbwJNnYakhXNTyY5a7eb0EkfUPxMFcBobCb9TNL/ESYQnY0QhMufayklhPUYMAOoEgyE3wNV1owlq5qY3xH3oNkwe1QOGVgdV7+3CBLACsTCv4BFcQ34BJfeYywssNfO5ZRy4+WJJSDnGCGxio+b0=
// -----END PUBLIC KEY-----
```

#### `importPublicKeyPem`
Given a pem of a public key, returns the CryptoKey:

```js
const publicKey = await wcb.importPublicKeyPem(`-----BEGIN PUBLIC KEY-----
MIGbMBAGByqGSM49AgEGBSuBBAAjA4GGAAQAjHH6XfHQpYpdQVH3xGcnQ5MpIMXbwJNnYakhXNTyY5a7eb0EkfUPxMFcBobCb9TNL/ESYQnY0QhMufayklhPUYMAOoEgyE3wNV1owlq5qY3xH3oNkwe1QOGVgdV7+3CBLACsTCv4BFcQ34BJfeYywssNfO5ZRy4+WJJSDnGCGxio+b0=
-----END PUBLIC KEY-----`)
// CryptoKey {
//   type: 'public',
//   extractable: true,
//   algorithm: { name: 'ECDH', namedCurve: 'P-521' },
//   usages: []
// }
```

### Encryption and Decryption
Encrypt and decrypt a message with aes-cbc. Also comes with helper functions to directly provide asymetric keys.

#### `generateIv`
Creata a random initialization vector for use with encryption:

```js
const iv = wcb.generateIv()
// Uint8Array(12) [
//    22,   6, 47, 120,  6,
//   126, 168, 10,  38, 46,
//   247, 133
// ]
```

#### `encrypt`
Encrypts a message with aes-cbc:

```js
const key = await wcb.generateKey()
const iv = wcb.generateIv()
const text = 'my message'
const message = utils.decodeText(text)
const data = await wcb.encrypt({ message, iv, key })
// ArrayBuffer {
//   [Uint8Contents]: <95 e1 e9 d4 72 74 27 6b b3 e3 e3 79 9e c3 dd f0 8a cc 70 72 73 a2 dc 66 e7 cd>,
//   byteLength: 26
// }
```

#### `decrypt`
Decrypts a message:

```js
const key = await wcb.generateKey()
const iv = wcb.generateIv()

const text = 'my message'
const message = utils.decodeText(text)
const box = await wcb.encrypt({ message, iv, key })

const data = await wcb.decrypt({ box, iv, key })
// ArrayBuffer {
//   [Uint8Contents]: <6d 79 20 6d 65 73 73 61 67 65>,
//   byteLength: 10
// }
```

#### `deriveAndEncrypt`
Encrypts a message with aes-cbc for given private and public ecdh key:

```js
const { privateKey, publicKey } = await wcb.generateKeyPair()
const iv = wcb.generateIv()
const text = 'my message'
const message = utils.decodeText(text)
const data = await wcb.deriveAndEncrypt({ message, iv, privateKey, publicKey })
// ArrayBuffer {
//   [Uint8Contents]: <e3 93 88 af 9a 48 eb 44 cc a7 d1 11 ca 66 33 a2 31 04 b4 68 cb 9f dd 01 40 73>,
//   byteLength: 26
// }
```

#### `deriveAndDecrypt`
Decrypts a message for given private and public ecdh key:

```js
const { privateKey, publicKey } = await wcb.generateKeyPair()
const iv = wcb.generateIv()

const text = 'my message'
const message = utils.decodeText(text)
const box = await wcb.deriveAndEncrypt({ message, iv, privateKey, publicKey })

const data = await wcb.deriveAndDecrypt({ box, iv, privateKey, publicKey })
// ArrayBuffer {
//   [Uint8Contents]: <6d 79 20 6d 65 73 73 61 67 65>,
//   byteLength: 10
// }
```


## Test
There's a little test suite which ensures the lib works as expected. You can run it either directly:
```sh
node test/index.js
```

or via npm:
```sh
npm test
```

## License
This package is licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0).

© 2022 Johannes J. Schmidt
