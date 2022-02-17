// Examples from the docs

import tap from 'tap'
import * as wcb from '../index.js'

tap.test('encoding and decoding', async t => {
  t.test('decodeText', async t => {
    const data = wcb.decodeText('my message')
    console.log(data)
  })

  t.test('encodeText', async t => {
    const text = wcb.encodeText(new Uint8Array([
      109, 121,  32, 109,
      101, 115, 115,  97,
      103, 101
    ]))
    console.log(text)
  })

  t.test('decodeHex', async t => {
    const data = wcb.decodeHex('6d79206d657373616765')
    console.log(data)
  })

  t.test('encodeHex', async t => {
    const hex = wcb.encodeHex(new Uint8Array([
      109, 121,  32, 109,
      101, 115, 115,  97,
      103, 101
    ]))
    console.log(hex)
  })

  t.test('decodeBase64', async t => {
    const data = wcb.decodeBase64('bXkgbWVzc2FnZQ==')
    console.log(data)
  })

  t.test('encodeBase64', async t => {
    const base64 = wcb.encodeBase64(new Uint8Array([
      109, 121,  32, 109,
      101, 115, 115,  97,
      103, 101
    ]))
    console.log(base64)
  })

  t.test('decodePrivateKeyPem', async t => {
    const data = wcb.decodePrivateKeyPem(`-----BEGIN PRIVATE KEY-----
MIHuAgEAMBAGByqGSM49AgEGBSuBBAAjBIHWMIHTAgEBBEIAN1rTFvE3Lzi/E0SSHLOBC3BZ1JiI+Xpj3hxaj3SPjZBPPZX0CkDCsa2GkEULnJwC3GE9HhbJgrr29f4JVNnI9HOhgYkDgYYABACDDclkGZg0BsVZCF5KV1j7zs5qBCg2shJz4V5PD0xc18eDh+EpYOp702wbejQGMGP4GSzT2Yu3VRH3gMMJy+L2zQDFXQGDiLEKZOJu4dN38aH8LwA+FUUg7RZoJWpypR5tImvdyuqFLvsjHC9mD29a9+xlJ5rTwh4uyuj6a219v3PyHQ==
-----END PRIVATE KEY-----`)
    console.log(data)
  })

  t.test('encodePrivateKeyPem', async t => {
    const { privateKey } = await wcb.generateKeyPair()
    const data = await wcb.exportPrivateKey(privateKey)
    const pem = wcb.encodePrivateKeyPem(data)
    console.log(pem)
  })

  t.test('decodePublicKeyPem', async t => {
    const data = wcb.decodePublicKeyPem(`-----BEGIN PUBLIC KEY-----
MIGbMBAGByqGSM49AgEGBSuBBAAjA4GGAAQArisA40NYVC27ZM2xv4uBdzkGyOyv56v2Aa0dQIoF261FBOqexQZaKOu6cH2LkN+cbenRaDQ4Wm1OzPGkBv2dde0BxG3QRwXHA3/1yN+unw4DFvo9Ik/taEgHkQQEjSj8GHcNvhZ8aSmLD8TqIUREzdin8Q+eLz+u77fSDvJJRJS/b4E=
-----END PUBLIC KEY-----`)
    console.log(data)
  })

  t.test('encodePublicKeyPem', async t => {
    const { publicKey } = await wcb.generateKeyPair()
    const data = await wcb.exportPublicKey(publicKey)
    const pem = wcb.encodePublicKeyPem(data)
    console.log(pem)
  })
})


tap.test('key generation and derivation', async t => {
  t.test('generateKeyPair', async t => {
    const keyPair = await wcb.generateKeyPair()
    console.log(keyPair)
  })
  
  t.test('generateKey', async t => {
    const key = await wcb.generateKey()
    console.log(key)
  })

  t.test('deriveKey', async t => {
    const { privateKey } = await wcb.generateKeyPair()
    const { publicKey } = await wcb.generateKeyPair()
    const key = await wcb.deriveKey({ privateKey, publicKey })
    console.log(key)
  })

  t.test('derivePublicKey', async t => {
    const { privateKey } = await wcb.generateKeyPair()
    const publicKey = await wcb.derivePublicKey(privateKey)
    console.log(publicKey)
  })

  t.test('generateSha256Fingerprint', async t => {
    const { publicKey } = await wcb.generateKeyPair()
    const fingerprint = await wcb.generateSha256Fingerprint(publicKey)
    console.log(fingerprint)
  })

  t.test('generateSha1Fingerprint', async t => {
    const { publicKey } = await wcb.generateKeyPair()
    const fingerprint = await wcb.generateSha1Fingerprint(publicKey)
    console.log(fingerprint)
  })
})

tap.test('key import and export', async t => {
  t.test('exportPrivateKey', async t => {
    const { privateKey } = await wcb.generateKeyPair()
    const data = await wcb.exportPrivateKey(privateKey)
    console.log(data)
  })

  t.test('importPrivateKey', async t => {
    const { privateKey } = await wcb.generateKeyPair()
    const data = await wcb.exportPrivateKey(privateKey)
    const importedPrivateKey = await wcb.importPrivateKey(data)
    console.log(importedPrivateKey)
  })

  t.test('exportPublicKey', async t => {
    const { publicKey } = await wcb.generateKeyPair()
    const data = await wcb.exportPublicKey(publicKey)
    console.log(data)
  })

  t.test('importPublicKey', async t => {
    const { publicKey } = await wcb.generateKeyPair()
    const data = await wcb.exportPublicKey(publicKey)
    const importedPublicKey = await wcb.importPublicKey(data)
    console.log(importedPublicKey)
  })

  t.test('exportPrivateKeyPem', async t => {
    const { privateKey } = await wcb.generateKeyPair()
    const pem = await wcb.exportPrivateKeyPem(privateKey)
    console.log(pem)
  })

  t.test('importPrivateKeyPem', async t => {
    const privateKey = await wcb.importPrivateKeyPem(`-----BEGIN PRIVATE KEY-----
MIHuAgEAMBAGByqGSM49AgEGBSuBBAAjBIHWMIHTAgEBBEIADL2kTtM5abY6q93yTYFL+wWYAORVDEqU3hxy2DGetX61p8I1gNlxCQZ+R+O+il9MicFsxOeXq7duot1kpsPTzmmhgYkDgYYABAAHLtBwbSs5O7X0YMFywmkcEzB4nWrOFj3eL7MW2LXVf91HfAawwwlay5LpELiwRS1H9woqYK5PVjIwj/elKGbWJQDtiDqcCdfaOOuEBaZBbgTMVTTpKjJ5sKmwN8Z6blsNDgCqlF10H2/PWGSFOkWxxMP8xjeZoBwrmh5INaR19h/Qng==
-----END PRIVATE KEY-----`)
    console.log(privateKey)
  })

  t.test('exportPublicKeyPem', async t => {
    const { publicKey } = await wcb.generateKeyPair()
    const pem = await wcb.exportPublicKeyPem(publicKey)
    console.log(pem)
  })

  t.test('importPublicKeyPem', async t => {
    const publicKey = await wcb.importPublicKeyPem(`-----BEGIN PUBLIC KEY-----
MIGbMBAGByqGSM49AgEGBSuBBAAjA4GGAAQAjHH6XfHQpYpdQVH3xGcnQ5MpIMXbwJNnYakhXNTyY5a7eb0EkfUPxMFcBobCb9TNL/ESYQnY0QhMufayklhPUYMAOoEgyE3wNV1owlq5qY3xH3oNkwe1QOGVgdV7+3CBLACsTCv4BFcQ34BJfeYywssNfO5ZRy4+WJJSDnGCGxio+b0=
-----END PUBLIC KEY-----`)
    console.log(publicKey)
  })
})

tap.test('encryption and decryption', async t => {
  t.test('generateIv', async t => {
    const iv = wcb.generateIv()
    console.log(iv)
  })

  t.test('encrypt', async t => {
    const key = await wcb.generateKey()
    const iv = wcb.generateIv()
    const text = 'my message'
    const message = wcb.decodeText(text)
    const data = await wcb.encrypt({ message, iv, key })
    console.log(data)
  })

  t.test('decrypt', async t => {
    const key = await wcb.generateKey()
    const iv = wcb.generateIv()
    const text = 'my message'
    const message = wcb.decodeText(text)
    const box = await wcb.encrypt({ message, iv, key })
    const data = await wcb.decrypt({ box, iv, key })
    console.log(data)
  })

  t.test('deriveAndEncrypt', async t => {
    const { privateKey, publicKey } = await wcb.generateKeyPair()
    const iv = wcb.generateIv()
    const text = 'my message'
    const message = wcb.decodeText(text)
    const data = await wcb.deriveAndEncrypt({ message, iv, privateKey, publicKey })
    console.log(data)
  })

  t.test('deriveAndDecrypt', async t => {
    const { privateKey, publicKey } = await wcb.generateKeyPair()
    const iv = wcb.generateIv()
    const text = 'my message'
    const message = wcb.decodeText(text)
    const box = await wcb.deriveAndEncrypt({ message, iv, privateKey, publicKey })
    const data = await wcb.deriveAndDecrypt({ box, iv, privateKey, publicKey })
    console.log(data)
  })
})

