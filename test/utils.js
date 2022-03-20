import tap from 'tap'
import * as utils from '../index.js'

tap.test('cipher', async t => {
  t.same(utils.cipher, 'ECDH-P-521-AES-256-CBC')
})

tap.test('utils', async t => {
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
