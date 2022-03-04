import tap from 'tap'
import { utils } from '../index.js'

tap.test('cipher agnostic', async g => {
  g.test('encoding & decoding', async t => {
    const testData = new Uint8Array([97, 98, 99])
    const testText = 'abc'
    const testHex = '616263'
    const testBase64 = 'YWJj'

    t.test('decodeText', async t => {
      const decoded = utils.decodeText(testText)
      t.type(decoded, 'Uint8Array')
      t.same(decoded, testData)
    })

    t.test('encodeText', async t => {
      const encoded = utils.encodeText(testData)
      t.equal(encoded, testText)
    })

    t.test('decodeHex', async t => {
      const decoded = utils.decodeHex(testHex)
      t.type(decoded, 'Uint8Array')
      t.same(decoded, testData)
    })

    t.test('encodeHex', async t => {
      const encoded = utils.encodeHex(testData)
      t.equal(encoded, testHex)
    })

    t.test('decodeBase64', async t => {
      const decoded = utils.decodeBase64(testBase64)
      t.type(decoded, 'Uint8Array')
      t.same(decoded, testData)
    })

    t.test('encodeBase64', async t => {
      const encoded = utils.encodeBase64(testData)
      t.equal(encoded, testBase64)
    })
  })
  
  g.test('pem encoding & decoding', async t => {
    const testData = new Uint8Array([97, 98, 99])
    const testPublicKeyPem = `-----BEGIN PUBLIC KEY-----
YWJj
-----END PUBLIC KEY-----
`
    const testPrivateKeyPem = `-----BEGIN PRIVATE KEY-----
YWJj
-----END PRIVATE KEY-----
`

    t.test('decodePublicKeyPem', async t => {
      const decoded = utils.decodePublicKeyPem(testPublicKeyPem)
      t.type(decoded, 'Uint8Array')
      t.same(decoded, testData)
    })

    t.test('encodePublicKeyPem', async t => {
      const encoded = utils.encodePublicKeyPem(testData)
      t.type(encoded, 'string')
      t.same(encoded, testPublicKeyPem)
    })

    t.test('decodePrivateKeyPem', async t => {
      const decoded = utils.decodePrivateKeyPem(testPrivateKeyPem)
      t.type(decoded, 'Uint8Array')
      t.same(decoded, testData)
    })

    t.test('encodePrivateKeyPem', async t => {
      const encoded = utils.encodePrivateKeyPem(testData)
      t.type(encoded, 'string')
      t.same(encoded, testPrivateKeyPem)
    })
  })

})
