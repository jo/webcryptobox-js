// load the webcrypto api either from `window.crypto` when in browser
// or import from crypto standard lib when in node
const crypto = typeof window === 'undefined' ? (await import('crypto')).webcrypto : window.crypto


// crypto configuration

// eliptic curve params used for key generation and derivation
const ecParams = {
  name: 'ECDH',
  namedCurve: 'P-521' // can be `P-256`, `P-384` or `P-521`
}
// aes key params used for key derivation, encryption and decryption
const aesParams = {
  name: 'AES-GCM',
  length: 256 // can be `128`, `192`, or `256`
}


// encoding & decoding

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
  var i, d = atob(base64), b = new Uint8Array(d.length)
  for (i = 0; i < d.length; i++) b[i] = d.charCodeAt(i)
  return b
}

// encode data as base64 string
export const encodeBase64 = data => btoa(String.fromCharCode(...new Uint8Array(data)))


// decode public ecdh key pem
export const decodePublicKeyPem = pem => decodeBase64(pem.slice(27, -25).replace(/\n/g, ''))

// encode public ecdh key as pem
export const encodePublicKeyPem = data => `-----BEGIN PUBLIC KEY-----
${encodeBase64(data).match(/.{1,80}/g).join('\n')}
-----END PUBLIC KEY-----`

// decode private ecdh key pem
export const decodePrivateKeyPem = pem => decodeBase64(pem.slice(28, -26).replace(/\n/g, ''))

// encode private ecdh key as pem
export const encodePrivateKeyPem = data => `-----BEGIN PRIVATE KEY-----
${encodeBase64(data).match(/.{1,80}/g).join('\n')}
-----END PRIVATE KEY-----`


// key generation

// generate ecdh key pair pair
export const generateKeyPair = () => crypto.subtle.generateKey(
  ecParams,
  true,
  ['deriveKey']
)

// generate aes-gcm key
export const generateKey = () => crypto.subtle.generateKey(
  aesParams,
  true,
  ['encrypt', 'decrypt']
)

// derive aes-gcm encryption key from ecdh key pair
export const deriveKey = ({ publicKey, privateKey }) => crypto.subtle.deriveKey(
  {
    ...ecParams,
    public: publicKey
  },
  privateKey,
  aesParams,
  false,
  ['encrypt', 'decrypt']
)

export const derivePublicKey = async privateKey => {
  const jwk = await crypto.subtle.exportKey(
    'jwk',
    privateKey
  )
  delete jwk.d
  return crypto.subtle.importKey(
    'jwk',
    jwk,
    ecParams,
    true,
    []
  )
}


// fingerprinting

// generate a sha256 fingerprint of a key
export const generateSha256Fingerprint = async key => {
  const keyBits = await crypto.subtle.exportKey('raw', key)
  const fingerprint = await crypto.subtle.digest('SHA-256', keyBits)
  return encodeHex(fingerprint)
}

// generate a sha1 fingerprint of a key
export const generateSha1Fingerprint = async key => {
  const keyBits = await crypto.subtle.exportKey('raw', key)
  const fingerprint = await crypto.subtle.digest('SHA-1', keyBits)
  return encodeHex(fingerprint)
}


// import & export keys

// export a public ecdh key as spki
export const exportPublicKey = publicKey => crypto.subtle.exportKey(
  'spki',
  publicKey
)
// convenient helper to export public ecdh key directly as pem
export const exportPublicKeyPem = async publicKey => {
  const data = await exportPublicKey(publicKey)
  return encodePublicKeyPem(data)
}

// import a public ecdh key spki
export const importPublicKey = data => crypto.subtle.importKey(
  'spki',
  data,
  ecParams,
  true,
  []
)
// convenient helper to import public ecdh pem directly
export const importPublicKeyPem = pem => {
  const data = decodePublicKeyPem(pem)
  return importPublicKey(data)
}

// export a private ecdh key as pkcs8
export const exportPrivateKey = privateKey => crypto.subtle.exportKey(
  'pkcs8',
  privateKey
)
// convenient helper to export private ecdh key directly as pem
export const exportPrivateKeyPem = async privateKey => {
  const data = await exportPrivateKey(privateKey)
  return encodePrivateKeyPem(data)
}

// import a private ecdh key pkcs8
export const importPrivateKey = data => crypto.subtle.importKey(
  'pkcs8',
  data,
  ecParams,
  true,
  ['deriveKey']
)
// convenient helper to import private ecdh pem directly
export const importPrivateKeyPem = pem => {
  const data = decodePrivateKeyPem(pem)
  return importPrivateKey(data)
}


// encryption & decryption

// generate a initialization vector (aka nonce)
export const generateIv = () => crypto.getRandomValues(new Uint8Array(12))

// encrypt a message
export const encrypt = async ({ message, iv, key }) => {
  return crypto.subtle.encrypt(
    {
      ...aesParams,
      iv
    },
    key,
    message
  )
}
// convenient helper to encrypt with key private and public key
export const deriveAndEncrypt = async ({ message, iv, privateKey, publicKey }) => {
  const key = await deriveKey({ privateKey, publicKey })
  return encrypt({ message, iv, key })
}

// decrypt a message
export const decrypt = async ({ box, iv, key }) => {
  return crypto.subtle.decrypt(
    {
      ...aesParams,
      iv
    },
    key,
    box
  )
}
// convenient helper to decrypt with key private and public key
export const deriveAndDecrypt = async ({ box, iv, privateKey, publicKey }) => {
  const key = await deriveKey({ privateKey, publicKey })
  return decrypt({ box, iv, key })
}
