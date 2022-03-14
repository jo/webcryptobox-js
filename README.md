# Webcryptobox
Tiny utility library for asymetric encryption via WebCrypto with zero dependencies.

> I don't usually do libraries any more but when I do, it's mainly for educational purposes.

Demo: https://jo.github.io/webcryptobox-js/

This is a small opiniated wrapper around the [WebCrypto](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) API. When I first started to get into WebCrypto, coming from NaCl it felt a little difficult to me to get things right. Here I encapsulate my learnings. Before WebCrypto, I used [TweetNaCl.js](https://github.com/dchest/tweetnacl-js) a lot. I really liked its simplicity, and the choices it (and NaCl in general) made for me. Now I offer to you similar choices on encryption algorithms, but using the browser native WebCrypto instead. This library provides part of the functionality I liked when using TweetNaCl.

This library provides easy to use and convenient wrappers around the WebCrypto primitives, as well as some helpers for encoding/decoding and a few sugar functions, with zero dependencies.

It works directly in the browser and in latest Node.js versions (via [the experimental WebCrypto API](https://nodejs.org/api/webcrypto.html)).

Works nicely together with the [Rust Webcryptobox](https://github.com/jo/webcryptobox-rs) and [Bash Webcryptobox](https://github.com/jo/webcryptobox-sh).

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

#### Supported EC Curves
* `P-256`: 256-bit prime field Weierstrass curve. Also known as `secp256r1` or `prime256v1`.
* `P-384`: 384-bit prime field Weierstrass curve. Also known as: `secp384r1` or `ansip384r1`.
* `P-521`: 521-bit prime field Weierstrass curve. Also known as: `secp521r1` or `ansip521r1`.

#### Supported AES Modes
* `CBC`: Cipher Block Chaining Mode
* `GCM`: Galois/Counter Mode

#### Supported AES Key Lengths
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

#### Dealing with PEMs
PEM are common formats for exchaning keys.

##### `decodePrivateKeyPem`
Given private key data, encodes it as a pem.

```js
const { privateKey } = await wcb.generateKeyPair()
const privateKeyData = await wcb.exportPrivateKey(privateKey)
const pem = utils.encodePrivateKeyPem(privateKeyData)
// -----BEGIN PRIVATE KEY-----
// MIHuAgEAMBAGByqGSM49AgEGBSuBBAAjBIHWMIHTAgEBBEIBcf8zEjlssqn4aTEB
// RR43ofwH/4BAXDAAd83Kz1Dyd+Ko0pit4ESgqSu/bJMdnDrpiGYuz0Klarwip8LD
// rYd9mEahgYkDgYYABAF2Nu9XKPs2CVFocuqCfaX5FzDUt6/nT/3Evqq8jBhK/ziN
// TrEs4wkZjuei5TS25aabX6iMex3etoN/GOw1KYpI4QBtIUnWudG8FT8N+USHSL9G
// h9fi+Yofeq4Io9DxPU1ChCKPIoQ6ORAMWoOCk9bTdIy6yqx33+RIM04wub4QAgDo
// LQ==
// -----END PRIVATE KEY-----
```

##### `encodePrivateKeyPem`
Returns the Uint8Array data of a private key for a pem.

```js
const data = utils.encodePrivateKeyPem(`-----BEGIN PRIVATE KEY-----
MIHuAgEAMBAGByqGSM49AgEGBSuBBAAjBIHWMIHTAgEBBEIBcf8zEjlssqn4aTEB
RR43ofwH/4BAXDAAd83Kz1Dyd+Ko0pit4ESgqSu/bJMdnDrpiGYuz0Klarwip8LD
rYd9mEahgYkDgYYABAF2Nu9XKPs2CVFocuqCfaX5FzDUt6/nT/3Evqq8jBhK/ziN
TrEs4wkZjuei5TS25aabX6iMex3etoN/GOw1KYpI4QBtIUnWudG8FT8N+USHSL9G
h9fi+Yofeq4Io9DxPU1ChCKPIoQ6ORAMWoOCk9bTdIy6yqx33+RIM04wub4QAgDo
LQ==
-----END PRIVATE KEY-----`)
// int8Array(241) [
//    48, 129, 238, 2, 1, 0, 48, 16, 6, 7, 42, 134,
//   ... more items
// ]
```

##### `decodePublicKeyPem`
Given public key data, encodes it as a pem.

```js
const { publicKey } = await wcb.generateKeyPair()
const publicKeyData = await wcb.exportPublicKey(publicKey)
const pem = utils.encodePublicKeyPem(publicKeyData)
// -----BEGIN PUBLIC KEY-----
// MIGbMBAGByqGSM49AgEGBSuBBAAjA4GGAAQBdjbvVyj7NglRaHLqgn2l+Rcw1Lev
// 50/9xL6qvIwYSv84jU6xLOMJGY7nouU0tuWmm1+ojHsd3raDfxjsNSmKSOEAbSFJ
// 1rnRvBU/DflEh0i/RofX4vmKH3quCKPQ8T1NQoQijyKEOjkQDFqDgpPW03SMusqs
// d9/kSDNOMLm+EAIA6C0=
// -----END PUBLIC KEY-----
```

##### `encodePublicKeyPem`
Returns the Uint8Array data of a public key for a pem.

```js
const data = utils.encodePublicKeyPem(`-----BEGIN PUBLIC KEY-----
MIGbMBAGByqGSM49AgEGBSuBBAAjA4GGAAQBdjbvVyj7NglRaHLqgn2l+Rcw1Lev
50/9xL6qvIwYSv84jU6xLOMJGY7nouU0tuWmm1+ojHsd3raDfxjsNSmKSOEAbSFJ
1rnRvBU/DflEh0i/RofX4vmKH3quCKPQ8T1NQoQijyKEOjkQDFqDgpPW03SMusqs
d9/kSDNOMLm+EAIA6C0=
-----END PUBLIC KEY-----`)
// Uint8Array(158) [
//    48, 129, 155, 48, 16, 6, 7, 42, 134, 72, 206, 61,
//   ... more items
// ]
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

#### `deriveBits`
Given a key pair, this function derives a 16 bit long password in an ArrayBuffer.

```js
const { privateKey, publicKey } = await wcb.generateKeyPair()
const key = await wcb.deriveBits({ privateKey, publicKey })
// ArrayBuffer {
//   [Uint8Contents]: <ac 54 d5 01 74 ca d6 87 f5 65 18 d0 4f e4 0f 18 77 ... more bytes>,
//   byteLength: 16
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
//   [Uint8Contents]: <ac 54 d5 01 74 ca d6 87 f5 65 18 d0 4f e4 0f 18 77 ... more bytes>,
//   byteLength: 32
// }
```

#### `importKey`
Import aes key data, returns CryptoKey:

```js
const data = new Uint8Array([
  210, 29, 179, 47, 204, 90, 109, 111, 95, 64, 50, 48, 192, 105, 44, 236,
  74, 120, 2, 193, 83, 122, 22, 99, 202, 73, 20, 23, 187, 160, 140, 112
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
//   [Uint8Contents]: <30 81 ee 02 01 00 30 10 06 07 2a 86 48 ce 3d 02 01 ... more bytes>,
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
//   [Uint8Contents]: <30 81 9b 30 10 06 07 2a 86 48 ce 3d 02 01 06 05 2b ... more bytes>,
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
// MIHuAgEAMBAGByqGSM49AgEGBSuBBAAjBIHWMIHTAgEBBEIBcf8zEjlssqn4aTEB
// RR43ofwH/4BAXDAAd83Kz1Dyd+Ko0pit4ESgqSu/bJMdnDrpiGYuz0Klarwip8LD
// rYd9mEahgYkDgYYABAF2Nu9XKPs2CVFocuqCfaX5FzDUt6/nT/3Evqq8jBhK/ziN
// TrEs4wkZjuei5TS25aabX6iMex3etoN/GOw1KYpI4QBtIUnWudG8FT8N+USHSL9G
// h9fi+Yofeq4Io9DxPU1ChCKPIoQ6ORAMWoOCk9bTdIy6yqx33+RIM04wub4QAgDo
// LQ==
// -----END PRIVATE KEY-----
```

#### `importPrivateKeyPem`
Given a pem of a private key, returns the CryptoKey:

```js
const privateKey = await wcb.importPrivateKeyPem(`-----BEGIN PRIVATE KEY-----
MIHuAgEAMBAGByqGSM49AgEGBSuBBAAjBIHWMIHTAgEBBEIBcf8zEjlssqn4aTEB
RR43ofwH/4BAXDAAd83Kz1Dyd+Ko0pit4ESgqSu/bJMdnDrpiGYuz0Klarwip8LD
rYd9mEahgYkDgYYABAF2Nu9XKPs2CVFocuqCfaX5FzDUt6/nT/3Evqq8jBhK/ziN
TrEs4wkZjuei5TS25aabX6iMex3etoN/GOw1KYpI4QBtIUnWudG8FT8N+USHSL9G
h9fi+Yofeq4Io9DxPU1ChCKPIoQ6ORAMWoOCk9bTdIy6yqx33+RIM04wub4QAgDo
LQ==
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
// MIGbMBAGByqGSM49AgEGBSuBBAAjA4GGAAQBdjbvVyj7NglRaHLqgn2l+Rcw1Lev
// 50/9xL6qvIwYSv84jU6xLOMJGY7nouU0tuWmm1+ojHsd3raDfxjsNSmKSOEAbSFJ
// 1rnRvBU/DflEh0i/RofX4vmKH3quCKPQ8T1NQoQijyKEOjkQDFqDgpPW03SMusqs
// d9/kSDNOMLm+EAIA6C0=
// -----END PUBLIC KEY-----
```

#### `importPublicKeyPem`
Given a pem of a public key, returns the CryptoKey:

```js
const publicKey = await wcb.importPublicKeyPem(`-----BEGIN PUBLIC KEY-----
MIGbMBAGByqGSM49AgEGBSuBBAAjA4GGAAQBdjbvVyj7NglRaHLqgn2l+Rcw1Lev
50/9xL6qvIwYSv84jU6xLOMJGY7nouU0tuWmm1+ojHsd3raDfxjsNSmKSOEAbSFJ
1rnRvBU/DflEh0i/RofX4vmKH3quCKPQ8T1NQoQijyKEOjkQDFqDgpPW03SMusqs
d9/kSDNOMLm+EAIA6C0=
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
//   [Uint8Contents]: <95 e1 e9 d4 72 74 27 6b b3 e3 e3 79 9e c3 dd f0 8a ... more bytes>,
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
//   [Uint8Contents]: <e3 93 88 af 9a 48 eb 44 cc a7 d1 11 ca 66 33 a2 31 ... more bytes>,
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
node test/utils.js
node test/generic.js
node test/ciphers.js
```

or via npm:
```sh
npm test
```

## License
This package is licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0).

© 2022 Johannes J. Schmidt
