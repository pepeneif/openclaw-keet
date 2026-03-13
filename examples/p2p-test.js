#!/usr/bin/env node

/**
 * Basic P2P Test Script
 * 
 * Usage:
 *   node p2p-test.js                    - Create new cabal
 *   node p2p-test.js <cabal-key>        - Join existing cabal
 * 
 * This demonstrates the core P2P functionality:
 * - Creating/joining a P2P network
 * - Getting your public key (address)
 * - Sending and receiving messages
 */

const { createPeer } = require('../src/peer')
const path = require('path')
const os = require('os')

const storageDir = path.join(os.tmpdir(), 'openclaw-keet-test-' + Date.now())
const cabalKey = process.argv[2] || null

console.log('🟢 OpenClaw Keet - P2P Test')
console.log('📁 Storage:', storageDir)
console.log(cabalKey ? `🔗 Joining: ${cabalKey}` : '🆕 Creating new cabal')
console.log('---')

async function main() {
  // Create and start peer
  const peer = await createPeer({
    storagePath: storageDir,
    cabalKey: cabalKey,
    debug: true
  })

  console.log('')
  console.log('='.repeat(50))
  console.log('CONNECTION INFO (share this with users):')
  console.log('='.repeat(50))
  console.log('📍 YOUR PUBLIC KEY:')
  console.log(peer.publicKey)
  console.log('')
  console.log('🔗 CABAL KEY (share for others to join):')
  console.log(peer.cabalKey)
  console.log('='.repeat(50))
  console.log('')

  // Listen for messages
  peer.onMessage((message) => {
    console.log('')
    console.log('💬 NEW MESSAGE:')
    console.log('   From:', message.from.substring(0, 20) + '...')
    console.log('   Content:', message.content)
    console.log('   Channel:', message.channel)
    console.log('')
  })

  // Send test message after 3 seconds
  setTimeout(() => {
    console.log('📤 Sending test message...')
    peer.sendMessage('Hello from OpenClaw Keet P2P Test! 👋', 'default')
      .then(() => console.log('✅ Message sent!'))
      .catch(err => console.log('❌ Error:', err.message))
  }, 3000)

  // Keep alive
  console.log('⏳ Listening for messages... (press Ctrl+C to exit)')
  
  // Expose for manual testing
  global.peer = peer
  global.send = (text, channel = 'default') => peer.sendMessage(text, channel)
  
  console.log('')
  console.log('💡 Manual testing:')
  console.log('   send("your message")')
  console.log('')
}

// Handle errors
process.on('unhandledRejection', (err) => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})

// Handle cleanup
process.on('SIGINT', async () => {
  console.log('')
  console.log('🛑 Shutting down...')
  if (global.peer) {
    await global.peer.stop()
  }
  console.log('✅ Closed')
  process.exit(0)
})

main().catch(console.error)