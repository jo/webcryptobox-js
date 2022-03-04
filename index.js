// load the webcrypto api either from `window.crypto` when in browser
// or import from crypto standard lib when in node
const crypto = typeof window === 'undefined' ? (await import('crypto')).webcrypto : window.crypto

const CURVES = [ 'P-256', 'P-384', 'P-521' ]
const MODES = [ 'CBC', 'GCM' ]
const LENGTHS = [ 128, 256 ]

export const utils = {
  // decode text message
  decodeText: text => {
    const enc = new TextEncoder()
    return enc.encode(text)
  },

  // encode data as text
  encodeText: data => {
    const dec = new TextDecoder()
    return dec.decode(data)
  },

  // decode hex string
  decodeHex: hex => {
    return new Uint8Array(
      hex.match(/[\da-f]{2}/gi).map(h => parseInt(h, 16))
    )
  },

  // encode data as hex string
  encodeHex: data => {
    return Array.from(new Uint8Array(data))
      .map(x => ('00' + x.toString(16)).slice(-2))
      .join('')
  },

  // decode base64 string
  decodeBase64: base64 => {
    var i, d = atob(base64), b = new Uint8Array(d.length)
    for (i = 0; i < d.length; i++) b[i] = d.charCodeAt(i)
    return b
  },

  // encode data as base64 string
  encodeBase64: data => {
    return btoa(String.fromCharCode(...new Uint8Array(data)))
  }
}

export class Webcryptobox {
  constructor ({
    curve = 'P-521',
    mode = 'GCM',
    length = 256
  } = {}) {
    if (CURVES.indexOf(curve) === -1) {
      throw new Error(`Unsupported curve '${curve}'`)
    }
    if (MODES.indexOf(mode) === -1) {
      throw new Error(`Unsupported mode '${mode}'`)
    }
    if (LENGTHS.indexOf(length) === -1) {
      throw new Error(`Unsupported length '${length}'`)
    }
    
    this.ecParams = {
      name: 'ECDH',
      namedCurve: curve
    }
    this.aesParams = {
      name: `AES-${mode}`,
      length
    }
    this.ivLength = mode === 'CBC' ? 16 : 12
  }


  // encoding & decoding

  // decode public ecdh key pem
  decodePublicKeyPem (pem) {
    return utils.decodeBase64(pem.trim().slice(27, -25).replace(/\n/g, ''))
  }

  // encode public ecdh key as pem
  encodePublicKeyPem (data) {
    const base64 = utils.encodeBase64(data).match(/.{1,64}/g).join('\n')
    return `-----BEGIN PUBLIC KEY-----
${base64}
-----END PUBLIC KEY-----
`
  }

  // decode private ecdh key pem
  decodePrivateKeyPem (pem) {
    return utils.decodeBase64(pem.trim().slice(28, -26).replace(/\n/g, ''))
  }

  // encode private ecdh key as pem
  encodePrivateKeyPem (data) {
    return `-----BEGIN PRIVATE KEY-----
${utils.encodeBase64(data).match(/.{1,64}/g).join('\n')}
-----END PRIVATE KEY-----
`
  }


  // key generation

  // generate ecdh key pair pair
  generateKeyPair () {
    return crypto.subtle.generateKey(
      this.ecParams,
      true,
      ['deriveKey']
    )
  }

  // generate aes-cbc key
  generateKey () {
    return crypto.subtle.generateKey(
      this.aesParams,
      true,
      ['encrypt', 'decrypt']
    )
  }

  // derive aes-cbc encryption key from ecdh key pair
  deriveKey ({ publicKey, privateKey }) {
    return crypto.subtle.deriveKey(
      {
        ...this.ecParams,
        public: publicKey
      },
      privateKey,
      this.aesParams,
      true,
      ['encrypt', 'decrypt']
    )
  }

  async derivePublicKey (privateKey) {
    const jwk = await crypto.subtle.exportKey(
      'jwk',
      privateKey
    )
    delete jwk.d
    return crypto.subtle.importKey(
      'jwk',
      jwk,
      this.ecParams,
      true,
      []
    )
  }


  // fingerprinting

  // calculate a sha256 fingerprint of a key
  async sha256Fingerprint (key) {
    const keyBits = await crypto.subtle.exportKey('spki', key)
    const fingerprint = await crypto.subtle.digest('SHA-256', keyBits)
    return utils.encodeHex(fingerprint)
  }

  // calculate a sha1 fingerprint of a key
  async sha1Fingerprint (key) {
    const keyBits = await crypto.subtle.exportKey('spki', key)
    const fingerprint = await crypto.subtle.digest('SHA-1', keyBits)
    return utils.encodeHex(fingerprint)
  }


  // import & export keys

  // import a raw aes key
  importKey (data) {
    return crypto.subtle.importKey(
      'raw',
      data,
      this.aesParams,
      true,
      ['encrypt', 'decrypt']
    )
  }

  // export an aes key as raw bytes
  exportKey (key) {
    return crypto.subtle.exportKey(
      'raw',
      key
    )
  }

  // export a public ecdh key as spki
  exportPublicKey (publicKey) {
    return crypto.subtle.exportKey(
      'spki',
      publicKey
    )
  }

  // convenient helper to export public ecdh key directly as pem
  async exportPublicKeyPem (publicKey) {
    const data = await this.exportPublicKey(publicKey)
    return this.encodePublicKeyPem(data)
  }

  // import a public ecdh key spki
  importPublicKey (data) {
    return crypto.subtle.importKey(
      'spki',
      data,
      this.ecParams,
      true,
      []
    )
  }

  // convenient helper to import public ecdh pem directly
  importPublicKeyPem (pem) {
    const data = this.decodePublicKeyPem(pem)
    return this.importPublicKey(data)
  }

  // export a private ecdh key as pkcs8
  exportPrivateKey (privateKey) {
    return crypto.subtle.exportKey(
      'pkcs8',
      privateKey
    )
  }

  // convenient helper to export private ecdh key directly as pem
  async exportPrivateKeyPem (privateKey) {
    const data = await this.exportPrivateKey(privateKey)
    return this.encodePrivateKeyPem(data)
  }

  // import a private ecdh key pkcs8
  importPrivateKey (data) {
    return crypto.subtle.importKey(
      'pkcs8',
      data,
      this.ecParams,
      true,
      ['deriveKey']
    )
  }

  // convenient helper to import private ecdh pem directly
  importPrivateKeyPem (pem) {
    const data = this.decodePrivateKeyPem(pem)
    return this.importPrivateKey(data)
  }


  // encryption & decryption

  // generate a initialization vector (aka nonce)
  generateIv () {
    return crypto.getRandomValues(new Uint8Array(this.ivLength))
  }

  // encrypt a message
  async encrypt ({ message, iv, key }) {
    return crypto.subtle.encrypt(
      {
        ...this.aesParams,
        iv
      },
      key,
      message
    )
  }

  // convenient helper to encrypt with key private and public key
  async deriveAndEncrypt ({ message, iv, privateKey, publicKey }) {
    const key = await this.deriveKey({ privateKey, publicKey })
    return this.encrypt({ message, iv, key })
  }

  // decrypt a message
  async decrypt ({ box, iv, key }) {
    return crypto.subtle.decrypt(
      {
        ...this.aesParams,
        iv
      },
      key,
      box
    )
  }

  // convenient helper to decrypt with key private and public key
  async deriveAndDecrypt ({ box, iv, privateKey, publicKey }) {
    const key = await this.deriveKey({ privateKey, publicKey })
    return this.decrypt({ box, iv, key })
  }
}
