# Changelog

## v4.0.0 - Preselected Cipher
Went full circle. Back to a pure collection of functions. Cipher is set to ECDH P-521 AES-256-CBC.

**Features:**
* initialization vector included in cipher, no manual iv generation needed anymore
* import and export encrypted private key pems

**Breaking changes:**
* all functions previously under `utils` are now toplevel exports
* no more `Webcryptobox` class, class methods moved to toplevel exports using preselected cipher
* `derivePrivateKey` has been renamed to `getPrivateKey`


## v3.0.0 - Configurable Cipher
A restructured Webcryptobox, with configurable cipher. The export is now a class, which has to be initialized.

**Features:**
* configurable ciphers:
  - choose between `P-256`, `P-384` and `P-521` ec curves
  - choose a aes cipher: `GCM` or `CBC`
  - choose aes key length: `128` or `256`
* new functions `importKey` and `exportKey` to exchange aes keys

**Breaking changes:**
* decode and encode functions have been moved to `utils` export:
  - `decodeText`
  - `encodeText`
  - `decodeHex`
  - `encodeHex`
  - `decodeBase64`
  - `encodeBase64`
* `Webcryptobox` export is now a class, which is instantiated with `curve`, `mode` and `length` parameters configuring the ciphers
* `generateSha1Fingerprint` has been renamed to `sha1Fingerprint`
* `generateSha256Fingerprint` has been renamed to `sha256Fingerprint`

**Fix:**
* PEM wrapping has been set to 64 chars according to the standard


## v2.0.0 - SHA-1 Fingerprints
Introduction of a SHA-1 fingerprint function: `generateSha1Fingerprint`.

**Breaking change:**
* rename `generateFingerprint` to `generateSha256Fingerprint`


## v1.1.0 - Wrap PEM Lines
Small improvement: break lines after 80 chars in PEMs.


## v1.0.2 - README Typos
Fixes typo in example on README.


## v1.0.1 - Tight Package
Tightened the npm package by removing non-essential files.


## v1.0.0 - Hello World!
Initial release of Webcryptobox
