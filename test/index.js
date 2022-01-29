import tap from 'tap'
import * as wcb from '../index.js'

tap.test('encoding & decoding', async t => {
  const testData = new Uint8Array([97, 98, 99])
  const testText = 'abc'
  const testHex = '616263'
  const testBase64 = 'YWJj'
  const testPublicKeyPem = '-----BEGIN PUBLIC KEY-----\nYWJj\n-----END PUBLIC KEY-----'
  const testPrivateKeyPem = '-----BEGIN PRIVATE KEY-----\nYWJj\n-----END PRIVATE KEY-----'

  t.test('decodeText', async t => {
    const decoded = wcb.decodeText(testText)
    t.type(decoded, 'Uint8Array')
    t.same(decoded, testData)
    console.log(decoded)
  })

  t.test('encodeText', async t => {
    const encoded = wcb.encodeText(testData)
    t.equal(encoded, testText)
  })

  t.test('decodeHex', async t => {
    const decoded = wcb.decodeHex(testHex)
    t.type(decoded, 'Uint8Array')
    t.same(decoded, testData)
  })

  t.test('encodeHex', async t => {
    const encoded = wcb.encodeHex(testData)
    t.equal(encoded, testHex)
  })

  t.test('decodeBase64', async t => {
    const decoded = wcb.decodeBase64(testBase64)
    t.type(decoded, 'Uint8Array')
    t.same(decoded, testData)
  })

  t.test('encodeBase64', async t => {
    const encoded = wcb.encodeBase64(testData)
    t.equal(encoded, testBase64)
  })

  t.test('decodePublicKeyPem', async t => {
    const decoded = wcb.decodePublicKeyPem(testPublicKeyPem)
    t.type(decoded, 'Uint8Array')
    t.same(decoded, testData)
  })

  t.test('encodePublicKeyPem', async t => {
    const encoded = wcb.encodePublicKeyPem(testData)
    t.type(encoded, 'string')
    t.same(encoded, testPublicKeyPem)
  })

  t.test('decodePrivateKeyPem', async t => {
    const decoded = wcb.decodePrivateKeyPem(testPrivateKeyPem)
    t.type(decoded, 'Uint8Array')
    t.same(decoded, testData)
  })

  t.test('encodePrivateKeyPem', async t => {
    const encoded = wcb.encodePrivateKeyPem(testData)
    t.type(encoded, 'string')
    t.same(encoded, testPrivateKeyPem)
  })
})

tap.test('key generation and derivation', async t => {
  t.test('generateKeyPair', async t => {
    const { publicKey, privateKey } = await wcb.generateKeyPair()
    t.type(publicKey, 'CryptoKey')
    t.type(privateKey, 'CryptoKey')
  })

  t.test('generateKey', async t => {
    const key = await wcb.generateKey()
    t.type(key, 'CryptoKey')
  })

  t.test('deriveKey', async t => {
    const { publicKey, privateKey } = await wcb.generateKeyPair()
    const key = await wcb.deriveKey({ publicKey, privateKey })
    t.type(key, 'CryptoKey')
  })

  t.test('derivePublicKey', async t => {
    const { publicKey, privateKey } = await wcb.generateKeyPair()
    const derivedKey = await wcb.derivePublicKey(privateKey)
    t.type(derivedKey, 'CryptoKey')
    t.same(derivedKey, publicKey)
  })
})

tap.test('key export & import', async t => {
  const { publicKey, privateKey } = await wcb.generateKeyPair()

  t.test('exportPublicKey', async t => {
    const exportedKey = await wcb.exportPublicKey(publicKey)
    t.type(exportedKey, 'ArrayBuffer')
  })

  t.test('exportPublicKey as pem', async t => {
    const pem = await wcb.exportPublicKeyPem(publicKey)
    t.type(pem, 'string')
    t.match(pem, /^-----BEGIN PUBLIC KEY-----\n/g)
  })

  t.test('importPublicKey', async t => {
    const data = await wcb.exportPublicKey(publicKey)
    const importedKey = await wcb.importPublicKey(data)
    t.type(importedKey, 'CryptoKey')
    t.same(importedKey, publicKey)
  })

  t.test('importPublicKeyPem', async t => {
    const pem = await wcb.exportPublicKeyPem(publicKey)
    const importedKey = await wcb.importPublicKeyPem(pem)
    t.type(importedKey, 'CryptoKey')
    t.same(importedKey, publicKey)
  })

  t.test('exportPrivateKey', async t => {
    const exportedKey = await wcb.exportPrivateKey(privateKey)
    t.type(exportedKey, 'ArrayBuffer')
  })

  t.test('importPrivateKey', async t => {
    const data = await wcb.exportPrivateKey(privateKey)
    const importedKey = await wcb.importPrivateKey(data)
    t.type(importedKey, 'CryptoKey')
    t.same(importedKey, privateKey)
  })

  t.test('exportPrivateKeyPem', async t => {
    const pem = await wcb.exportPrivateKeyPem(privateKey)
    t.type(pem, 'string')
    t.match(pem, /^-----BEGIN PRIVATE KEY-----\n/g)
  })

  t.test('importPrivateKeyPem', async t => {
    const pem = await wcb.exportPrivateKeyPem(privateKey)
    const importedKey = await wcb.importPrivateKeyPem(pem)
    t.type(importedKey, 'CryptoKey')
    t.same(importedKey, privateKey)
  })
})

tap.test('generateFingerprint', async t => {
  const key = await wcb.generateKey()
  const fingerprint = await wcb.generateFingerprint(key)
  t.type(fingerprint, 'string')
  t.equal(fingerprint.length, 64)
})

tap.test('encryption and decryption', async t => {
  const { publicKey, privateKey } = await wcb.generateKeyPair()
  const key = await wcb.deriveKey({ publicKey, privateKey })
  const text = 'a secret message'
  const message = wcb.decodeText(text)

  t.test('generateIv', async t => {
    const iv = await wcb.generateIv()
    t.type(iv, 'object')
  })

  t.test('encrypt', async t => {
    const iv = await wcb.generateIv()
    const box = await wcb.encrypt({ message, iv, key })
    t.type(box, 'ArrayBuffer')
  })

  t.test('deriveAndEncrypt', async t => {
    const iv = await wcb.generateIv()
    const box = await wcb.deriveAndEncrypt({ message, iv, privateKey, publicKey })
    t.type(box, 'ArrayBuffer')
  })

  t.test('decrypt', async t => {
    const iv = await wcb.generateIv()
    const box = await wcb.encrypt({ message, iv, key })
    const openedBox = await wcb.decrypt({ box, iv, key })
    t.type(openedBox, 'ArrayBuffer')
    const encodedBox = wcb.encodeText(openedBox)
    t.equal(encodedBox, text)
  })

  t.test('deriveAndDecrypt', async t => {
    const iv = await wcb.generateIv()
    const box = await wcb.encrypt({ message, iv, key })
    const openedBox = await wcb.deriveAndDecrypt({ box, iv, privateKey, publicKey })
    t.type(openedBox, 'ArrayBuffer')
    const encodedBox = wcb.encodeText(openedBox)
    t.equal(encodedBox, text)
  })
})
