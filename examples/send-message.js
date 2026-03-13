#!/usr/bin/env node

/**
 * Send Message Example
 * 
 * Usage:
 *   node send-message.js <recipient-key> "<message>"
 * 
 * Example:
 *   node send-message.js abc123def456 "Hello from OpenClaw!"
 */

const { createPeer } = require('../src/peer')
const path = require('path')
const os = require('os')

const args = process.argv.slice(2)
const recipientKey = args[0]
const message = args[1]

if (!recipientKey || !message) {
  console.log(`
OpenClaw Keet - Send Message

Usage:
  node send-message.js <recipient-key> "<message>"

Example:
  node send-message.js abc123... "Hello!"

Notes:
  - You need to be part of the same cabal as the recipient
  - Use the cabal key when creating your peer: node index.js --join <cabal-key>
  `)
  process.exit(1)
}

const storageDir = path.join(os.tmpdir(), 'keet-send-' + Date.now())

async function main() {
  console.log('📤 Sending message...')
  console.log('To:', recipientKey.substring(0, 20) + '...')
  console.log('Content:', message)
  console.log('')

  const peer = await createPeer({
    storagePath: storageDir,
    debug: false
  })

  console.log('Your key:', peer.publicKey)
  console.log('')

  try {
    await peer.sendMessage(message, 'default', recipientKey)
    console.log('✅ Message sent successfully!')
  } catch (err) {
    console.log('❌ Error:', err.message)
  }

  // Give time for message to propagate
  setTimeout(async () => {
    await peer.stop()
    process.exit(0)
  }, 2000)
}

main().catch(console.error)