// load the webcrypto api either from `window.crypto` when in browser
// or import from crypto standard lib when in node
const crypto = typeof window === 'undefined' ? (await import('crypto')).webcrypto : window.crypto


// crypto config
const EC_PARAMS = {
  name: 'ECDH',
  namedCurve: 'P-521'
}
const AES_PARAMS = {
  name: `AES-CBC`,
  length: 256
}
const IV_LENGTH = 16
const PBKDF2_PARAMS = {
  name: 'PBKDF2',
  iterations: 64000,
  hash: 'SHA-256'
}
const OIDS = {
  pbkdf2: '06092a864886f70d01050c', // PBKDF2
  pbes2: '06092a864886f70d01050d',  // PBES2
  hash: '06082a864886f70d02090500', // SHA-256
  cipher: '060960864801650304012a'  // AES-256-CBC
}

export const cipher = `${EC_PARAMS.name}-${EC_PARAMS.namedCurve}-${AES_PARAMS.name.split('-')[0]}-${AES_PARAMS.length}-${AES_PARAMS.name.split('-')[1]}`


// utils

// decode text message
export const decodeText = text => {
  const enc = new TextEncoder()
  return enc.encode(text)
}

// encode data as text
export const encodeText = data => {
  const dec = new TextDecoder()
  return dec.decode(data)
}


// decode hex string
export const decodeHex = hex => new Uint8Array(
  hex.match(/[\da-f]{2}/gi).map(h => parseInt(h, 16))
)

// encode data as hex string
export const encodeHex = data => Array.from(new Uint8Array(data))
  .map(x => ('00' + x.toString(16)).slice(-2))
  .join('')


// decode base64 string
export const decodeBase64 = base64 => {
  var i, d = atob(base64.trim()), b = new Uint8Array(d.length)
  for (i = 0; i < d.length; i++) b[i] = d.charCodeAt(i)
  return b
}

// encode data as base64 string
export const encodeBase64 = data => btoa(String.fromCharCode(...new Uint8Array(data)))


// pem

// decode public ecdh key pem
const decodePublicKeyPem = pem => decodeBase64(pem.trim().slice(27, -25).replace(/\n/g, ''))

// encode public ecdh key as pem
const encodePublicKeyPem = data => `-----BEGIN PUBLIC KEY-----
${encodeBase64(data).match(/.{1,64}/g).join('\n')}
-----END PUBLIC KEY-----`

// decode private key pem
const decodePrivateKeyPem = pem => decodeBase64(pem.trim().slice(28, -26).replace(/\n/g, ''))

// encode private key as pem
const encodePrivateKeyPem = data => `-----BEGIN PRIVATE KEY-----
${encodeBase64(data).match(/.{1,64}/g).join('\n')}
-----END PRIVATE KEY-----`


// encrypted pem encoding

// utilities
const decimalToHex = d => {
   const h = (d).toString(16)
   return h.length % 2 ? '0' + h : h
}
const hexLength = d => {
   const h = (d.length / 2).toString(16)
   return h.length % 2 ? '0' + h : h
}

// encode encrypted private key as pem
const encodeEncryptedPrivateKeyPem = ({ wrappedKey, iv, salt }) => {
  const wrappedKeyHex = encodeHex(wrappedKey)
  const saltHex = encodeHex(salt)
  const ivHex = encodeHex(iv)
  const iter = '00' + decimalToHex(PBKDF2_PARAMS.iterations)
  const iterInteger = '02' + decimalToHex(iter.length / 2) + iter
  const saltOctet = '04' + hexLength(saltHex) + saltHex
  const ivOctet = '04' + hexLength(ivHex) + ivHex
  const keyOctetPadding = hexLength(wrappedKeyHex).length / 2 === 2 ? '82' : '81'
  const keyOctet = '04' + keyOctetPadding + hexLength(wrappedKeyHex) + wrappedKeyHex
  const aesContainer = '30' + hexLength(OIDS.cipher + ivOctet)
  const hashContainer = '30' + hexLength(OIDS.hash)
  const pbkdf2InnerParameters = saltOctet + iterInteger + hashContainer + OIDS.hash
  const pbkdf2InnerContainer = '30' + hexLength(pbkdf2InnerParameters)
  const pbkdf2Parameters = OIDS.pbkdf2 + pbkdf2InnerContainer + pbkdf2InnerParameters
  const pbkdf2Container = '30' + hexLength(pbkdf2Parameters)
  const pbes2InnerParameters = pbkdf2Container + pbkdf2Parameters + aesContainer + OIDS.cipher + ivOctet
  const pbes2InnerContainer = '30' + hexLength(pbes2InnerParameters)
  const sequenceParameters = OIDS.pbes2 + pbes2InnerContainer + pbes2InnerParameters
  const sequenceContainer = '30' + hexLength(sequenceParameters) + sequenceParameters
  const sequenceLength = hexLength(sequenceContainer + keyOctet)
  const sequencePadding = sequenceLength.length / 2 === 2 ? '82' : '81'
  const sequence = '30' + sequencePadding + sequenceLength + sequenceContainer + keyOctet

  const asnKey = decodeHex(sequence)

  return `-----BEGIN ENCRYPTED PRIVATE KEY-----
${encodeBase64(asnKey).match(/.{1,64}/g).join('\n')}
-----END ENCRYPTED PRIVATE KEY-----`
}

const decodeEncryptedPrivateKeyPem = pem => {
  const pemData = decodeBase64(pem.trim().slice(38, -36).replace(/\n/g, ''))
  const hex = encodeHex(pemData)

  if (!hex.includes(OIDS.pbkdf2) || !hex.includes(OIDS.pbes2)) {
    throw(new Error('Invalid pem: no PBKDF2 or PBES2 header'))
  }
  if (!hex.includes(OIDS.cipher)) {
    throw(new Error('Invalid pem: unsupported cipher'))
  }
  if (!hex.includes(OIDS.hash)) {
    throw(new Error('Invalid pem: unsupported hash'))
  }

  const saltBegin = hex.indexOf(OIDS.pbkdf2) + 28
  const ivBegin = hex.indexOf(OIDS.cipher) + 24
  const saltLength = parseInt(hex.substr(saltBegin, 2), 16)
  const ivLength = parseInt(hex.substr(ivBegin, 2), 16)
  const saltHex = hex.substr(saltBegin + 2, saltLength * 2)
  const ivHex = hex.substr(ivBegin + 2, ivLength * 2)
  const iterBegin = saltBegin + 4 + (saltLength * 2)
  const iterLength = parseInt(hex.substr(iterBegin, 2), 16)
  const iter = parseInt(hex.substr(iterBegin + 2, iterLength * 2), 16)
  const sequencePadding = hex.substr(2, 2) === '81' ? 8 : 10
  const parametersPadding = hex.substr(2, 2) === '81' ? 12 : 16
  const sequenceLength = parseInt(hex.substr(sequencePadding, 2), 16)
  const encryptedDataBegin = parametersPadding + (sequenceLength * 2)
  const encryptedDataPadding = hex.substr(encryptedDataBegin - 2, 2) === '81' ? 2 : 4
  const encryptedDataLength = parseInt(hex.substr(encryptedDataBegin, 6), 16)
  const encryptedData = hex.substr(encryptedDataBegin + encryptedDataPadding, (encryptedDataLength * 2))

  const salt = decodeHex(saltHex)
  const iv = decodeHex(ivHex)
  const wrappedKey = decodeHex(encryptedData)

  return {
    wrappedKey,
    iv,
    salt
  }
}


// key generation

// generate ecdh key pair pair
export const generateKeyPair = () => crypto.subtle.generateKey(
  EC_PARAMS,
  true,
  ['deriveKey', 'deriveBits']
)

// generate aes key
export const generateKey = () => crypto.subtle.generateKey(
  AES_PARAMS,
  true,
  ['encrypt', 'decrypt']
)

// derive aes encryption key from ecdh public and private key
export const deriveKey = ({ publicKey, privateKey }) => crypto.subtle.deriveKey(
  {
    ...EC_PARAMS,
    public: publicKey
  },
  privateKey,
  AES_PARAMS,
  true,
  ['encrypt', 'decrypt']
)

// derive bits from ecdh key pair
export const deriveBits = ({ length, publicKey, privateKey }) => crypto.subtle.deriveBits(
  {
    ...EC_PARAMS,
    public: publicKey
  },
  privateKey,
  length * 8
)

// derive wrapping key from passphrase with pkdf2
const deriveWrappingKey = async ({ salt, passphrase }) => {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    passphrase,
    {
      name: 'PBKDF2'
    },
    false,
    ['deriveKey']
  )
  
  return crypto.subtle.deriveKey(
    {
      ...PBKDF2_PARAMS,
      salt
    },
    baseKey,
    AES_PARAMS,
    false,
    ['wrapKey', 'unwrapKey']
  )
}

// wrap a key in pkcs8 encrypted with wrappingKey
const wrapKey = async ({ key, wrappingKey }) => {
  const iv = await crypto.getRandomValues(new Uint8Array(16))
  const wrappedKey = await crypto.subtle.wrapKey(
    'pkcs8',
    key,
    wrappingKey,
    {
      ...AES_PARAMS,
      iv: iv
    }
  )

  return {
    wrappedKey,
    iv
  }
}

// unwrap a key from pkcs8 encrypted with wrappingKey
const unwrapKey = async ({ wrappedKey, wrappingKey, iv }) => {
  return crypto.subtle.unwrapKey(
    'pkcs8',
    wrappedKey,
    wrappingKey,
    {
      ...AES_PARAMS,
      iv: iv
    },
    EC_PARAMS,
    true,
    ['deriveKey', 'deriveBits']
  )
}


// derive password from private and public key
export const derivePassword = async ({ privateKey, publicKey, length }) => {
  const aes_length = AES_PARAMS.length / 8
  const bits = await deriveBits({ privateKey, publicKey, length: length + aes_length })
  return bits.slice(aes_length)
}

// derive public key from private key
export const getPublicKey = async privateKey => {
  const jwk = await crypto.subtle.exportKey(
    'jwk',
    privateKey
  )
  delete jwk.d
  return crypto.subtle.importKey(
    'jwk',
    jwk,
    EC_PARAMS,
    true,
    []
  )
}


// fingerprinting

// calculate a sha256 fingerprint of a key
export const sha256Fingerprint = async key => {
  const keyBits = await crypto.subtle.exportKey('spki', key)
  return crypto.subtle.digest('SHA-256', keyBits)
}

// calculate a sha1 fingerprint of a key
export const sha1Fingerprint = async key => {
  const keyBits = await crypto.subtle.exportKey('spki', key)
  return crypto.subtle.digest('SHA-1', keyBits)
}


// import & export keys

// import a raw aes key
export const importKey = data => crypto.subtle.importKey(
  'raw',
  data,
  AES_PARAMS,
  true,
  ['encrypt', 'decrypt']
)

// export an aes key as raw bytes
export const exportKey = key => crypto.subtle.exportKey(
  'raw',
  key
)

// internal functions

// export a public ecdh key as spki
const exportPublicKey = publicKey => crypto.subtle.exportKey(
  'spki',
  publicKey
)

// export a private ecdh key as pkcs8
const exportPrivateKey = privateKey => crypto.subtle.exportKey(
  'pkcs8',
  privateKey
)

// import a public ecdh key spki
const importPublicKey = data => crypto.subtle.importKey(
  'spki',
  data,
  EC_PARAMS,
  true,
  []
)

// import a private ecdh key pkcs8
const importPrivateKey = data => crypto.subtle.importKey(
  'pkcs8',
  data,
  EC_PARAMS,
  true,
  ['deriveKey', 'deriveBits']
)


// export public key as pem
export const exportPublicKeyPem = async key => {
  const data = await exportPublicKey(key)
  return encodePublicKeyPem(data)
}

// import public key pem
export const importPublicKeyPem = pem => {
  const data = decodePublicKeyPem(pem)
  return importPublicKey(data)
}

// export private key as pem
export const exportPrivateKeyPem = async key => {
  const data = await exportPrivateKey(key)
  return encodePrivateKeyPem(data)
}

// import private key pem
export const importPrivateKeyPem = pem => {
  const data = decodePrivateKeyPem(pem)
  return importPrivateKey(data)
}

// export encrypted private key as pem
export const exportEncryptedPrivateKeyPem = async ({ key, passphrase }) => {
  const salt = await crypto.getRandomValues(new Uint8Array(16))
  const wrappingKey = await deriveWrappingKey({ salt, passphrase })
  const { wrappedKey, iv } = await wrapKey({ key, wrappingKey })
  return encodeEncryptedPrivateKeyPem({ wrappedKey, iv, salt })
}

// import encrypted private key pem
export const importEncryptedPrivateKeyPem = async ({ pem, passphrase }) => {
  const { wrappedKey, iv, salt } = decodeEncryptedPrivateKeyPem(pem)
  const wrappingKey = await deriveWrappingKey({ salt, passphrase })
  return unwrapKey({ wrappedKey, wrappingKey, iv })
}


// derive wrapping key from peer
const deriveWrappingKeyFrom = async ({ salt, privateKey, publicKey }) => {
  const passphraseBits = await derivePassword({ privateKey, publicKey, length: 32 })
  const passphraseHex = encodeHex(passphraseBits)
  const passphrase = decodeText(passphraseHex)
  return deriveWrappingKey({ salt, passphrase })
}

// export encrypted private key as pem to peer
export const exportEncryptedPrivateKeyPemTo = async ({ key, privateKey, publicKey }) => {
  const salt = await crypto.getRandomValues(new Uint8Array(16))
  const wrappingKey = await deriveWrappingKeyFrom({ salt, privateKey, publicKey })
  const { wrappedKey, iv } = await wrapKey({ key, wrappingKey })
  return encodeEncryptedPrivateKeyPem({ wrappedKey, iv, salt })
}

// import encrypted private key pem from peer
export const importEncryptedPrivateKeyPemFrom = async ({ pem, privateKey, publicKey }) => {
  const { wrappedKey, iv, salt } = decodeEncryptedPrivateKeyPem(pem)
  const wrappingKey = await deriveWrappingKeyFrom({ salt, privateKey, publicKey })
  return unwrapKey({ wrappedKey, wrappingKey, iv })
}


// encryption & decryption

// internal: generate a initialization vector (aka nonce)
const generateIv = () => crypto.getRandomValues(new Uint8Array(IV_LENGTH))


// symmetric encryption

// encrypt a message with aes key
export const encrypt = async ({ message, key }) => {
  const iv = generateIv()
  const encrypted = await crypto.subtle.encrypt(
    {
      ...AES_PARAMS,
      iv
    },
    key,
    message
  )
  const box = new Uint8Array(IV_LENGTH + encrypted.byteLength)
  box.set(iv, 0)
  box.set(new Uint8Array(encrypted), IV_LENGTH)
  return box
}

// decrypt a message with aes key
export const decrypt = async ({ box, key }) => {
  const iv = box.slice(0, IV_LENGTH)
  const encrypted = box.slice(IV_LENGTH)
  const message = await crypto.subtle.decrypt(
    {
      ...AES_PARAMS,
      iv
    },
    key,
    encrypted
  )
  return new Uint8Array(message)
}


// asymmetric encryption

// encrypt with private key and public public peer key
export const encryptTo = async ({ message, privateKey, publicKey }) => {
  const key = await deriveKey({ privateKey, publicKey })
  return encrypt({ message, key })
}

// decrypt with private key and public peer key
export const decryptFrom = async ({ box, privateKey, publicKey }) => {
  const key = await deriveKey({ privateKey, publicKey })
  return decrypt({ box, key })
}
