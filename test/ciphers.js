import tap from 'tap'
import { webcrypto as crypto } from 'crypto'
import { Webcryptobox } from '../index.js'

const CURVE = process.env.CURVE;
const LENGTH = process.env.LENGTH;
const MODE = process.env.MODE;

const alices = {
  'P-256': {
    privateKeyPem: `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgryXeI+o4cpYNpFJu
B1uG+NeNccXnowBepH5mPHur66ehRANCAATfLx6cIMHlGgP2iDoiVq22ayq3sb/s
6U9wc2tFI8nCsiWdztkjVW3UGHSYKofOfi/dgz5XLe1d22OnSLAiUBkZ
-----END PRIVATE KEY-----
`,
    publicKeyPem: `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE3y8enCDB5RoD9og6Ilattmsqt7G/
7OlPcHNrRSPJwrIlnc7ZI1Vt1Bh0mCqHzn4v3YM+Vy3tXdtjp0iwIlAZGQ==
-----END PUBLIC KEY-----
`,
    sha1Fingerprint: '0ee40270fbe7f14f46a90e9cc2b194e81c4b6508',
    sha256Fingerprint: 'f40888f7b26986c4c9a374c82e3527033c0623e8c3079d0b769cff46dfb0f381'
  },
  'P-384': {
    privateKeyPem: `-----BEGIN PRIVATE KEY-----
MIG2AgEAMBAGByqGSM49AgEGBSuBBAAiBIGeMIGbAgEBBDCuQPM6wSVy8dyQBti5
XsHguVWlqs6FU/ZMF83v+8XXjscLJfmbM9uAkn5BRWDqaDChZANiAASHY5cCveS+
US3eZ08yp5aWoX7jgtfFlojfdptTDudBnmfy56rRt/EuYjevc/f9U8sWrUQ5IqeB
woVMwjnNgj7bFDxbdI4+RF0QxUxR3UDTjle4Sn2kvnQ1kcIzOlPPOTQ=
-----END PRIVATE KEY-----
`,
    publicKeyPem: `-----BEGIN PUBLIC KEY-----
MHYwEAYHKoZIzj0CAQYFK4EEACIDYgAEh2OXAr3kvlEt3mdPMqeWlqF+44LXxZaI
33abUw7nQZ5n8ueq0bfxLmI3r3P3/VPLFq1EOSKngcKFTMI5zYI+2xQ8W3SOPkRd
EMVMUd1A045XuEp9pL50NZHCMzpTzzk0
-----END PUBLIC KEY-----
`,
    sha1Fingerprint: '4025ae6eebe2337bdd757cffb456daeb42986428',
    sha256Fingerprint: 'ef405ee5f90072a55601033f812146665d9f9dc5922d974cb20953e0ecfe1dfb'
  },
  'P-521': {
    privateKeyPem: `-----BEGIN PRIVATE KEY-----
MIHuAgEAMBAGByqGSM49AgEGBSuBBAAjBIHWMIHTAgEBBEIBcf8zEjlssqn4aTEB
RR43ofwH/4BAXDAAd83Kz1Dyd+Ko0pit4ESgqSu/bJMdnDrpiGYuz0Klarwip8LD
rYd9mEahgYkDgYYABAF2Nu9XKPs2CVFocuqCfaX5FzDUt6/nT/3Evqq8jBhK/ziN
TrEs4wkZjuei5TS25aabX6iMex3etoN/GOw1KYpI4QBtIUnWudG8FT8N+USHSL9G
h9fi+Yofeq4Io9DxPU1ChCKPIoQ6ORAMWoOCk9bTdIy6yqx33+RIM04wub4QAgDo
LQ==
-----END PRIVATE KEY-----
`,
    publicKeyPem: `-----BEGIN PUBLIC KEY-----
MIGbMBAGByqGSM49AgEGBSuBBAAjA4GGAAQBdjbvVyj7NglRaHLqgn2l+Rcw1Lev
50/9xL6qvIwYSv84jU6xLOMJGY7nouU0tuWmm1+ojHsd3raDfxjsNSmKSOEAbSFJ
1rnRvBU/DflEh0i/RofX4vmKH3quCKPQ8T1NQoQijyKEOjkQDFqDgpPW03SMusqs
d9/kSDNOMLm+EAIA6C0=
-----END PUBLIC KEY-----
`,
    sha1Fingerprint: 'd91829d8fc9a28608e007149e1cf3c8f35d26c5f',
    sha256Fingerprint: '0c8584b5a48138cde0cb3788734870108a90ed0a7eb62498f00c0838b6868653'
  }
}

const bobs = {
  'P-256': {
    privateKeyPem: `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgMmK5fwN1v0eI89p4
2aNruEudX977eAZ3azNrzO0rk+ihRANCAAQbElz9giX+c+WuO9Hg8PrPd+q/h7Yk
DC78ZkyofODWC7P/q6qh0wbEV+6ALrfZZA0Xzlo8nSJixVdSebqkjsJU
-----END PRIVATE KEY-----
`,
    publicKeyPem: `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEGxJc/YIl/nPlrjvR4PD6z3fqv4e2
JAwu/GZMqHzg1guz/6uqodMGxFfugC632WQNF85aPJ0iYsVXUnm6pI7CVA==
-----END PUBLIC KEY-----
`,
    sha1Fingerprint: '6c88bbdc4f462acaabac1cabe0876e6bee0185a8',
    sha256Fingerprint: '3988b5d449b9b57d1d55f9448520bd776209f64b7a12604f7fbd66fa7eadb4a1'
  },
  'P-384': {
    privateKeyPem: `-----BEGIN PRIVATE KEY-----
MIG2AgEAMBAGByqGSM49AgEGBSuBBAAiBIGeMIGbAgEBBDAvDD5oWIwcz86RVJw2
HMnESX4qQXhVsVM99C2SA7G6WnRx+HGR4ONkZQOKEzBBtdKhZANiAAQ4hFlPYw7r
eK1UCkd/7WoiYcKTajv9Em9J290PQ3X07uJ6DRWwT6Fbod/N+QmFqnS7rW7+Xuh/
G4C+dcrFjX/6JC1FcPuwl9Evg3PizSyVfbERzz3tphIyJWpsQj4qixw=
-----END PRIVATE KEY-----
`,
    publicKeyPem: `-----BEGIN PUBLIC KEY-----
MHYwEAYHKoZIzj0CAQYFK4EEACIDYgAEOIRZT2MO63itVApHf+1qImHCk2o7/RJv
SdvdD0N19O7ieg0VsE+hW6HfzfkJhap0u61u/l7ofxuAvnXKxY1/+iQtRXD7sJfR
L4Nz4s0slX2xEc897aYSMiVqbEI+Kosc
-----END PUBLIC KEY-----
`,
    sha1Fingerprint: 'c80a767bb7bfafe79534041e4849bcdac6c9dc6e',
    sha256Fingerprint: '4e3c056bcf548b7422531a2249a36baa9d9a235150dbec5bb07cc8b8dd4e58da'
  },
  'P-521': {
    privateKeyPem: `-----BEGIN PRIVATE KEY-----
MIHuAgEAMBAGByqGSM49AgEGBSuBBAAjBIHWMIHTAgEBBEIAvVtKGBatnJz0J+Tt
L3MFjdHp4JXE4pVs+mUJNYaIxnLyLHnUDQhgNo6va7EJeupHDpL8ixwz6pb6qoZZ
x3G21wOhgYkDgYYABAFtE04yjeLeUC8V4RvDY6tlCv5wz5g8etFduTOqhYvw/GzN
aY1VbKa6W9MjlpYyYnfBQmyZCbvoeHTmULAWscQ8NAGCj9gH+T6D5lPhKR8WuNtB
CvKGKDtCwTxzJDFEo2F6ZhJ11ucV/sLNJrd62LXjN5aURArbSsEKuib7l4rvAN8A
0g==
-----END PRIVATE KEY-----
`,
    publicKeyPem: `-----BEGIN PUBLIC KEY-----
MIGbMBAGByqGSM49AgEGBSuBBAAjA4GGAAQBbRNOMo3i3lAvFeEbw2OrZQr+cM+Y
PHrRXbkzqoWL8PxszWmNVWymulvTI5aWMmJ3wUJsmQm76Hh05lCwFrHEPDQBgo/Y
B/k+g+ZT4SkfFrjbQQryhig7QsE8cyQxRKNhemYSddbnFf7CzSa3eti14zeWlEQK
20rBCrom+5eK7wDfANI=
-----END PUBLIC KEY-----
`,
    sha1Fingerprint: '12a5fc4b7fd94d291d94f8f9e1357675b4bd25c8',
    sha256Fingerprint: 'fd5397c78d0c249d864408f9cf90994f3e7a6505077b6262845ad6d6e7609e9c'
  }
}

// 'a secret message'
const message = new Uint8Array([
   97,  32, 115, 101, 99, 114, 101, 116, 32, 109, 101, 115, 115, 97, 103, 101
])

const keys = {
  'P-256': {
    '128': new Uint8Array([
      210, 29, 179, 47, 204, 90, 109, 111, 95, 64, 50, 48, 192, 105, 44, 236
    ]),
    '256': new Uint8Array([
      210, 29, 179, 47, 204, 90, 109, 111, 95, 64, 50, 48, 192, 105, 44, 236, 74, 120, 2, 193, 83, 122, 22, 99, 202, 73, 20, 23, 187, 160, 140, 112
    ])
  },
  'P-384': {
    '128': new Uint8Array([
      79, 244, 229, 204, 242, 65, 225, 15, 233, 172, 5, 65, 1, 42, 75, 4
    ]),
    '256': new Uint8Array([
      79, 244, 229, 204, 242, 65, 225, 15, 233, 172, 5, 65, 1, 42, 75, 4, 239, 115, 134, 169, 135, 83, 234, 251, 9, 44, 207, 80, 48, 186, 236, 195
    ])
  },
  'P-521': {
    '128': new Uint8Array([
      1, 111, 248, 82, 88, 255, 144, 7, 193, 187, 122, 192, 179, 225, 244, 241
    ]),
    '256': new Uint8Array([
      1, 111, 248, 82, 88, 255, 144, 7, 193, 187, 122, 192, 179, 225, 244, 241, 169, 215, 155, 221, 71, 168, 123, 161, 82, 74, 117, 207, 48, 72, 78, 187
    ])
  }
}

const ivs = {
  'CBC': new Uint8Array([
    32, 225, 45, 122, 117, 212, 131, 210, 54, 198, 139, 167, 54, 231, 141, 238
  ]),
  'GCM': new Uint8Array([
    51, 254, 28, 126, 133, 205, 142, 16, 197, 103, 60, 152
  ])
}

const encryptedMessages = {
  'P-256': {
    '128': {
      'CBC': new Uint8Array([
        124, 212, 194, 198, 10, 188, 60, 46, 20, 119, 53, 249, 187, 231, 188, 65, 188, 43, 84, 129, 189, 173, 88, 184, 63, 105, 41, 230, 100, 37, 214, 248
      ]),
      'GCM': new Uint8Array([
        154, 209, 137, 56, 6, 211, 254, 128, 189, 39, 84, 229, 23, 157, 191, 219, 194, 126, 188, 225, 43, 243, 100, 138, 109, 190, 107, 178, 67, 94, 121, 164
      ])
    },
    '256': {
      'CBC': new Uint8Array([
        85, 46, 110, 252, 76, 241, 69, 4, 83, 211, 27, 157, 99, 233, 81, 199, 27, 246, 114, 75, 78, 60, 1, 173, 47, 14, 118, 142, 177, 2, 116, 13
      ]),
      'GCM': new Uint8Array([
        181, 50, 46, 9, 44, 191, 9, 1, 203, 96, 57, 245, 158, 63, 35, 72, 220, 66, 80, 143, 36, 169, 12, 247, 4, 32, 99, 178, 156, 6, 72, 231
      ])
    }
  },
  'P-384': {
    '128': {
      'CBC': new Uint8Array([
        61, 117, 90, 72, 124, 133, 255, 136, 45, 193, 19, 183, 61, 183, 107, 237, 124, 161, 197, 212, 149, 0, 228, 237, 23, 10, 126, 120, 226, 191, 146, 150
      ]),
      'GCM': new Uint8Array([
        14, 53, 123, 0, 115, 66, 207, 186, 70, 207, 200, 231, 167, 207, 247, 142, 160, 203, 185, 78, 81, 15, 127, 221, 244, 10, 22, 69, 151, 235, 213, 34
      ])
    },
    '256': {
      'CBC': new Uint8Array([
        144, 196, 31, 18, 112, 110, 175, 232, 55, 255, 129, 144, 187, 102, 160, 103, 6, 103, 249, 91, 188, 137, 206, 30, 247, 10, 211, 109, 173, 16, 204, 97
      ]),
      'GCM': new Uint8Array([
        102, 215, 232, 175, 140, 19, 245, 33, 107, 238, 66, 214, 242, 90, 212, 252, 44, 36, 82, 220, 39, 75, 142, 84, 179, 147, 49, 111, 46, 5, 237, 254
      ])
    }
  },
  'P-521': {
    '128': {
      'CBC': new Uint8Array([
        105, 189, 153, 234, 44, 214, 6, 196, 211, 12, 173, 7, 36, 80, 120, 59, 63, 53, 67, 244, 48, 146, 81, 196, 170, 85, 83, 79, 117, 19, 146, 117
      ]),
      'GCM': new Uint8Array([
        27, 88, 111, 231, 39, 97, 52, 183, 249, 133, 64, 186, 168, 247, 202, 234, 143, 167, 245, 56, 221, 221, 134, 84, 67, 77, 139, 20, 97, 138, 135, 83
      ])
    },
    '256': {
      'CBC': new Uint8Array([
        51, 38, 130, 100, 204, 160, 162, 221, 174, 183, 72, 219, 119, 128, 205, 94, 39, 165, 3, 172, 78, 210, 57, 58, 6, 132, 82, 155, 59, 235, 59, 103
      ]),
      'GCM': new Uint8Array([
        240, 86, 24, 178, 63, 22, 132, 170, 89, 249, 46, 220, 25, 186, 69, 229, 12, 139, 156, 194, 76, 189, 192, 180, 236, 57, 198, 208, 207, 179, 62, 14
      ])
    }
  }
}

for (const curve in keys) {
  const alice = alices[curve]
  const bob = bobs[curve]

  const skip = CURVE && curve !== CURVE
  tap.test(`curve ${curve}`, { skip }, async cg => {
    for (const lengthStr in keys[curve]) {
      const length = parseInt(lengthStr, 10)
      const keyData = keys[curve][length]

      const skip = LENGTH && length !== LENGTH
      cg.test(`length ${length}`, { skip }, async lg => {
        for (const mode in ivs) {
          const wcb = new Webcryptobox({ curve, mode, length })

          const iv = ivs[mode]
          const encryptedMessage = encryptedMessages[curve][length][mode]

          alice.privateKey = await wcb.importPrivateKeyPem(alice.privateKeyPem)
          alice.publicKey = await wcb.importPublicKeyPem(alice.publicKeyPem)
          bob.privateKey = await wcb.importPrivateKeyPem(bob.privateKeyPem)
          bob.publicKey = await wcb.importPublicKeyPem(bob.publicKeyPem)
          const key = await wcb.importKey(keyData)

          const skip = MODE && mode !== MODE
          lg.test(`mode ${mode}`, { skip }, async g => {
            g.test('key derivation', async t => {
              t.test('deriveKey for alice', async t => {
                const derivedKey = await wcb.deriveKey({ privateKey: alice.privateKey, publicKey: bob.publicKey })
                t.same(derivedKey, key)
              })

              t.test('deriveKey for bob', async t => {
                const derivedKey = await wcb.deriveKey({ privateKey: bob.privateKey, publicKey: alice.publicKey })
                t.same(derivedKey, key)
              })

              t.test('derivePublicKey for alice', async t => {
                const derivedKey = await wcb.derivePublicKey(alice.privateKey)
                t.same(derivedKey, alice.publicKey)
              })

              t.test('derivePublicKey for bob', async t => {
                const derivedKey = await wcb.derivePublicKey(bob.privateKey)
                t.same(derivedKey, bob.publicKey)
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
            })

            g.test('sha256Fingerprint for alice', async t => {
              const fingerprint = await wcb.sha256Fingerprint(alice.publicKey)
              t.equal(fingerprint, alice.sha256Fingerprint)
            })

            g.test('sha256Fingerprint for bob', async t => {
              const fingerprint = await wcb.sha256Fingerprint(bob.publicKey)
              t.equal(fingerprint, bob.sha256Fingerprint)
            })

            g.test('sha1Fingerprint for alice', async t => {
              const fingerprint = await wcb.sha1Fingerprint(alice.publicKey)
              t.equal(fingerprint, alice.sha1Fingerprint)
            })

            g.test('sha1Fingerprint for bob', async t => {
              const fingerprint = await wcb.sha1Fingerprint(bob.publicKey)
              t.equal(fingerprint, bob.sha1Fingerprint)
            })

            g.test('encryption and decryption', async t => {
              t.test('encrypt', async t => {
                const box = await wcb.encrypt({ message, iv, key })
                t.same(new Uint8Array(box), encryptedMessage)
              })

              t.test('decrypt', async t => {
                const data = await wcb.decrypt({ box: encryptedMessage, iv, key })
                t.same(new Uint8Array(data), message)
              })

              t.test('deriveAndEncrypt for alice', async t => {
                const box = await wcb.deriveAndEncrypt({ privateKey: alice.privateKey, publicKey: bob.publicKey, message, iv })
                t.same(new Uint8Array(box), encryptedMessage)
              })

              t.test('deriveAndEncrypt for bob', async t => {
                const box = await wcb.deriveAndEncrypt({ privateKey: bob.privateKey, publicKey: alice.publicKey, message, iv })
                t.same(new Uint8Array(box), encryptedMessage)
              })

              t.test('deriveAndDecrypt for alice', async t => {
                const data = await wcb.deriveAndDecrypt({ privateKey: alice.privateKey, publicKey: bob.publicKey, box: encryptedMessage, iv })
                t.same(new Uint8Array(data), message)
              })

              t.test('deriveAndDecrypt for bob', async t => {
                const data = await wcb.deriveAndDecrypt({ privateKey: bob.privateKey, publicKey: alice.publicKey, box: encryptedMessage, iv })
                t.same(new Uint8Array(data), message)
              })
            })
          })
        }
      })
    }
  })
}
