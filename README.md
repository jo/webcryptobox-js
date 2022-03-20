# Webcryptobox
WebCrypto compatible encryption with Bash and OpenSSL.

This package implements the [Webcryptobox](https://github.com/jo/webcryptobox) encryption API.

Compatible packages:
* [Webcryptobox Rust](https://github.com/jo/webcryptobox-rs)
* [Webcryptobox Bash](https://github.com/jo/webcryptobox-sh)

There is also a CLI tool: [wcb.sh](https://github.com/jo/wcb-js)

Demo: https://jo.github.io/webcryptobox-js/

This library provides easy to use and convenient wrappers around the WebCrypto primitives, as well as some helpers for encoding/decoding and a few sugar functions, with zero dependencies.

It works directly in the browser and in latest Node.js versions (via [the experimental WebCrypto API](https://nodejs.org/api/webcrypto.html)).


## Usage
In Node, you can use the lib as usual:
```sh
npm install webcryptobox
```

and then
```js
import * as wcb from 'webcryptobox'
```

In modern browser which support es6 modules, just include the file directly:
```html
<script type=module>
  import * as wcb from './´webcryptobox.js'
</script>
```

Now you can dance with the lib like its 1984:
```js
const { privateKey, publicKey } = await wcb.generateKeyPair()
const text = 'Nobody else can offer me something, something heart felt like you did it.'
const message = wcb.decodeText(text)
const box = await wcb.encryptoTo({ message, privateKey, publicKey })
```


## API
This lib is written with some ECMAScript 6 features, mainly modules, dynamic import, async, destructuring and object spreading.

Most of the functions return promises, except for the encoding/decoding utilities.


#### `cipher`
Returns a cipher identifier:

```js
wcb.cipher
// 'ECDH-P-521-AES-256-CBC'
```


### Utils for Encoding & Decoding
Webcryptobox provides utility functions to convert between several text representations and the internally used `Uint8Array`s.

#### `decodeText`
Takes an unicode string and encodes it to an Uint8Array:

```js
const data = wcb.decodeText('my message')
// Uint8Array(10) [
//   109, 121,  32, 109,
//   101, 115, 115,  97,
//   103, 101
// ]
```

#### `encodeText`
Given a Uint8Array, encodes the data as unicode string:

```js
const text = wcb.encodeText(new Uint8Array([
  109, 121,  32, 109,
  101, 115, 115,  97,
  103, 101
]))
// my message
```

#### `decodeHex`
Takes a hex string and encodes it to an Uint8Array:

```js
const data = wcb.decodeHex('6d79206d657373616765')
// Uint8Array(10) [
//   109, 121,  32, 109,
//   101, 115, 115,  97,
//   103, 101
// ]
```

#### `encodeHex`
Given a Uint8Array, encodes the data as hex string:

```js
const hex = wcb.encodeHex(new Uint8Array([
  109, 121,  32, 109,
  101, 115, 115,  97,
  103, 101
]))
// 6d79206d657373616765
```

#### `decodeBase64`
Takes a base64 string and encodes it to an Uint8Array:

```js
const data = wcb.decodeBase64('bXkgbWVzc2FnZQ==')
// Uint8Array(10) [
//   109, 121,  32, 109,
//   101, 115, 115,  97,
//   103, 101
// ]
```

#### `encodeBase64`
Given a Uint8Array, encodes the data as base64 string:

```js
const base64 = wcb.encodeBase64(new Uint8Array([
  109, 121,  32, 109,
  101, 115, 115,  97,
  103, 101
]))
// bXkgbWVzc2FnZQ==
```


### Key Generation and Derivation
Functions for generating a ecdh and aes-cbc keys, for deriving an aes-cbc key or the public key from a private one and for generating a sha-256 fingerprint of a key.

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

#### `getPublicKey`
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

#### `derivePassword`
To be described.


### Fingerprinting
Methods for calculating fingerprints of public keys. Note that the fingerprints differ from the fingerprints from `ssh-keygen`.

#### `sha256Fingerprint`
Calculate a SHA-256 fingerprint of a key. It has a length of 64 hex chars.

```js
const { publicKey } = await wcb.generateKeyPair()
const fingerprintBits = await wcb.sha256Fingerprint(publicKey)
const fingerprint = wcb.encodeHex(fingerprintBits)
// aca8f766cdef8346177987a86b0f04b14fd4060b0e2478f941adc91982d6668c
```

#### `sha1Fingerprint`
Calculate a SHA-1 fingerprint of a key. It has a length of 40 hex chars.

```js
const { publicKey } = await wcb.generateKeyPair()
const fingerprintBits = await wcb.sha1Fingerprint(publicKey)
const fingerprint = wcb.encodeHex(fingerprintBits)
// d04f73b7eb0b865a8d4711b5a379273a27c65581
```


### Key Import and Export
Tools for exchanging keys. Also comes with convenient helpers to deal with PEM formatted keys.

#### `exportKey`
To be described.

#### `importKey`
To be described.

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

#### `exportEncryptedPrivateKeyPem`
To be described.

#### `importEncryptedPrivateKeyPem`
To be described.

#### `exportEncryptedPrivateKeyPemTo`
To be described.

#### `importEncryptedPrivateKeyPemFrom`
To be described.


### Encryption and Decryption
Encrypt and decrypt a message with aes-cbc, and with ECDH key pairs.

#### `encrypt`
Encrypts a message with aes-cbc:

```js
const key = await wcb.generateKey()
const iv = wcb.generateIv()
const text = 'my message'
const message = decodeText(text)
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
const message = decodeText(text)
const box = await wcb.encrypt({ message, iv, key })

const data = await wcb.decrypt({ box, iv, key })
// ArrayBuffer {
//   [Uint8Contents]: <6d 79 20 6d 65 73 73 61 67 65>,
//   byteLength: 10
// }
```

#### `encryptoTo`
Encrypts a message with aes-cbc for given private and public ecdh key:

```js
const { privateKey, publicKey } = await wcb.generateKeyPair()
const iv = wcb.generateIv()
const text = 'my message'
const message = decodeText(text)
const data = await wcb.encryptoTo({ message, iv, privateKey, publicKey })
// ArrayBuffer {
//   [Uint8Contents]: <e3 93 88 af 9a 48 eb 44 cc a7 d1 11 ca 66 33 a2 31 ... more bytes>,
//   byteLength: 26
// }
```

#### `decryptFrom`
Decrypts a message for given private and public ecdh key:

```js
const { privateKey, publicKey } = await wcb.generateKeyPair()
const iv = wcb.generateIv()

const text = 'my message'
const message = decodeText(text)
const box = await wcb.encryptoTo({ message, iv, privateKey, publicKey })

const data = await wcb.decryptFrom({ box, iv, privateKey, publicKey })
// ArrayBuffer {
//   [Uint8Contents]: <6d 79 20 6d 65 73 73 61 67 65>,
//   byteLength: 10
// }
```


## Test
There's a little test suite which ensures the lib works as expected. You can run it either directly:
```sh
node test/utils.js
node test/webcryptobox.js
```

or via npm:
```sh
npm test
```


## License
This package is licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0).

© 2022 Johannes J. Schmidt
