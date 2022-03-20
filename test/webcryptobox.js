import tap from 'tap'
import { webcrypto as crypto } from 'crypto'
import * as wcb from '../index.js'

tap.Test.prototype.addAssert('sameKey', 2, async function (key, otherKey, message, extra) {
  message = message || 'keys should be identical'

  const format = key.type === 'private' ? 'pkcs8' : 'raw'

  const keyRaw = await crypto.subtle.exportKey(format, key)
  const otherKeyRaw = await crypto.subtle.exportKey(format, otherKey)

  return this.same(new Uint8Array(keyRaw), new Uint8Array(otherKeyRaw), message, extra)
})

const alice = {
  privateKeyPem: `-----BEGIN PRIVATE KEY-----
MIHuAgEAMBAGByqGSM49AgEGBSuBBAAjBIHWMIHTAgEBBEIBcf8zEjlssqn4aTEB
RR43ofwH/4BAXDAAd83Kz1Dyd+Ko0pit4ESgqSu/bJMdnDrpiGYuz0Klarwip8LD
rYd9mEahgYkDgYYABAF2Nu9XKPs2CVFocuqCfaX5FzDUt6/nT/3Evqq8jBhK/ziN
TrEs4wkZjuei5TS25aabX6iMex3etoN/GOw1KYpI4QBtIUnWudG8FT8N+USHSL9G
h9fi+Yofeq4Io9DxPU1ChCKPIoQ6ORAMWoOCk9bTdIy6yqx33+RIM04wub4QAgDo
LQ==
-----END PRIVATE KEY-----`,
  publicKeyPem: `-----BEGIN PUBLIC KEY-----
MIGbMBAGByqGSM49AgEGBSuBBAAjA4GGAAQBdjbvVyj7NglRaHLqgn2l+Rcw1Lev
50/9xL6qvIwYSv84jU6xLOMJGY7nouU0tuWmm1+ojHsd3raDfxjsNSmKSOEAbSFJ
1rnRvBU/DflEh0i/RofX4vmKH3quCKPQ8T1NQoQijyKEOjkQDFqDgpPW03SMusqs
d9/kSDNOMLm+EAIA6C0=
-----END PUBLIC KEY-----`,
  sha1Fingerprint: 'd91829d8fc9a28608e007149e1cf3c8f35d26c5f',
  sha256Fingerprint: '0c8584b5a48138cde0cb3788734870108a90ed0a7eb62498f00c0838b6868653',
  derivedBits: new Uint8Array([
    0, 212, 225, 22, 80, 136, 36, 142, 33, 144, 117, 93, 78, 201, 53, 127
  ])
}

const bob = {
  privateKeyPem: `-----BEGIN PRIVATE KEY-----
MIHuAgEAMBAGByqGSM49AgEGBSuBBAAjBIHWMIHTAgEBBEIAvVtKGBatnJz0J+Tt
L3MFjdHp4JXE4pVs+mUJNYaIxnLyLHnUDQhgNo6va7EJeupHDpL8ixwz6pb6qoZZ
x3G21wOhgYkDgYYABAFtE04yjeLeUC8V4RvDY6tlCv5wz5g8etFduTOqhYvw/GzN
aY1VbKa6W9MjlpYyYnfBQmyZCbvoeHTmULAWscQ8NAGCj9gH+T6D5lPhKR8WuNtB
CvKGKDtCwTxzJDFEo2F6ZhJ11ucV/sLNJrd62LXjN5aURArbSsEKuib7l4rvAN8A
0g==
-----END PRIVATE KEY-----`,
  publicKeyPem: `-----BEGIN PUBLIC KEY-----
MIGbMBAGByqGSM49AgEGBSuBBAAjA4GGAAQBbRNOMo3i3lAvFeEbw2OrZQr+cM+Y
PHrRXbkzqoWL8PxszWmNVWymulvTI5aWMmJ3wUJsmQm76Hh05lCwFrHEPDQBgo/Y
B/k+g+ZT4SkfFrjbQQryhig7QsE8cyQxRKNhemYSddbnFf7CzSa3eti14zeWlEQK
20rBCrom+5eK7wDfANI=
-----END PUBLIC KEY-----`,
  sha1Fingerprint: '12a5fc4b7fd94d291d94f8f9e1357675b4bd25c8',
  sha256Fingerprint: 'fd5397c78d0c249d864408f9cf90994f3e7a6505077b6262845ad6d6e7609e9c',
  derivedBits: new Uint8Array([
    0, 221, 22, 12, 113, 57, 255, 119, 187, 119, 232, 29, 78, 236, 137, 62
  ])
}

// 'a secret message'
const message = new Uint8Array([
   97,  32, 115, 101, 99, 114, 101, 116, 32, 109, 101, 115, 115, 97, 103, 101
])

const keyData = new Uint8Array([
  1, 111, 248, 82, 88, 255, 144, 7, 193, 187, 122, 192, 179, 225, 244, 241, 169, 215, 155, 221, 71, 168, 123, 161, 82, 74, 117, 207, 48, 72, 78, 187
])

tap.test('ciphers', async g => {
  alice.privateKey = await wcb.importPrivateKeyPem(alice.privateKeyPem)
  alice.publicKey = await wcb.importPublicKeyPem(alice.publicKeyPem)
  bob.privateKey = await wcb.importPrivateKeyPem(bob.privateKeyPem)
  bob.publicKey = await wcb.importPublicKeyPem(bob.publicKeyPem)
  const key = await  crypto.subtle.importKey(
    'raw',
    keyData,
    {
      name: `AES-CBC`,
      length: 256
    },
    true,
    ['encrypt', 'decrypt']
  )

  g.test('key generation', async t => {
    t.test('generateKeyPair', async t => {
      const { publicKey, privateKey } = await wcb.generateKeyPair()
      t.type(publicKey, 'CryptoKey')
      t.type(privateKey, 'CryptoKey')
    })

    t.test('generateKey', async t => {
      const key = await wcb.generateKey()
      t.type(key, 'CryptoKey')
    })
  })

  g.test('key derivation', async t => {
    t.test('deriveKey for alice', async t => {
      const derivedKey = await wcb.deriveKey({ privateKey: alice.privateKey, publicKey: bob.publicKey })
      await t.sameKey(derivedKey, key)
    })

    t.test('deriveKey for bob', async t => {
      const derivedKey = await wcb.deriveKey({ privateKey: bob.privateKey, publicKey: alice.publicKey })
      await t.sameKey(derivedKey, key)
    })

    t.test('deriveBits for alice', async t => {
      const derivedBits = await wcb.deriveBits({ length: 16, privateKey: alice.privateKey, publicKey: alice.publicKey })
      t.same(new Uint8Array(derivedBits), alice.derivedBits)
    })

    t.test('deriveBits for bob', async t => {
      const derivedBits = await wcb.deriveBits({ length: 16, privateKey: bob.privateKey, publicKey: bob.publicKey })
      t.same(new Uint8Array(derivedBits), bob.derivedBits)
    })

    t.test('getPublicKey for alice', async t => {
      const publicKey = await wcb.getPublicKey(alice.privateKey)
      await t.sameKey(publicKey, alice.publicKey)
    })

    t.test('getPublicKey for bob', async t => {
      const publicKey = await wcb.getPublicKey(bob.privateKey)
      await t.sameKey(publicKey, bob.publicKey)
    })
  })

  g.test('key export & import', async t => {
    t.test('importPublicKeyPem for alice', async t => {
      const pem = await wcb.exportPublicKeyPem(alice.publicKey)
      t.equal(pem, alice.publicKeyPem)
    })

    t.test('importPublicKeyPem for bob', async t => {
      const pem = await wcb.exportPublicKeyPem(bob.publicKey)
      t.equal(pem, bob.publicKeyPem)
    })

    t.test('exportPrivateKeyPem for alice', async t => {
      const pem = await wcb.exportPrivateKeyPem(alice.privateKey)
      t.equal(pem, alice.privateKeyPem)
    })
    
    t.test('exportPrivateKeyPem for bob', async t => {
      const pem = await wcb.exportPrivateKeyPem(bob.privateKey)
      t.equal(pem, bob.privateKeyPem)
    })

    t.test('exportEncryptedPrivateKeyPem and importEncryptedPrivateKeyPem', async t => {
      const passphrase = wcb.decodeText('secure')
      const pem = await wcb.exportEncryptedPrivateKeyPem({ key: alice.privateKey, passphrase })
      const alicePrivateKey = await wcb.importEncryptedPrivateKeyPem({ pem, passphrase })
      await t.sameKey(alicePrivateKey, alice.privateKey)
    })
    
    t.test('exportEncryptedPrivateKeyPemTo bob and importEncryptedPrivateKeyPemFrom alice', async t => {
      const pem = await wcb.exportEncryptedPrivateKeyPemTo({
        key: alice.privateKey,
        privateKey: alice.privateKey,
        publicKey: bob.publicKey
      })
      const alicePrivateKey = await wcb.importEncryptedPrivateKeyPemFrom({
        pem,
        privateKey: bob.privateKey,
        publicKey: alice.publicKey
      })
      await t.sameKey(alicePrivateKey, alice.privateKey)
    })
  })

  g.test('sha256Fingerprint for alice', async t => {
    const fingerprint = await wcb.sha256Fingerprint(alice.publicKey)
    t.equal(wcb.encodeHex(fingerprint), alice.sha256Fingerprint)
  })

  g.test('sha256Fingerprint for bob', async t => {
    const fingerprint = await wcb.sha256Fingerprint(bob.publicKey)
    t.equal(wcb.encodeHex(fingerprint), bob.sha256Fingerprint)
  })

  g.test('sha1Fingerprint for alice', async t => {
    const fingerprint = await wcb.sha1Fingerprint(alice.publicKey)
    t.equal(wcb.encodeHex(fingerprint), alice.sha1Fingerprint)
  })

  g.test('sha1Fingerprint for bob', async t => {
    const fingerprint = await wcb.sha1Fingerprint(bob.publicKey)
    t.equal(wcb.encodeHex(fingerprint), bob.sha1Fingerprint)
  })

  g.test('encryption and decryption', async t => {
    t.test('encrypt and decrypt', async t => {
      const box = await wcb.encrypt({ message, key })
      const data = await wcb.decrypt({ box, key })
      t.same(data, message)
    })

    t.test('encryptTo and decryptFrom', async t => {
      const box = await wcb.encryptTo({ privateKey: alice.privateKey, publicKey: bob.publicKey, message })
      const data = await wcb.decryptFrom({ privateKey: bob.privateKey, publicKey: alice.publicKey, box })
      t.same(data, message)
    })
  })
})
