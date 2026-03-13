/**
 * OpenClaw Keet - P2P Messaging Channel
 * Main entry point
 * 
 * This module provides P2P messaging capability for OpenClaw,
 * using the same technology as Keet.io (Pear Runtime/Hypercore)
 */

const { createPeer } = require('./peer')
const { MessageHandler } = require('./messaging')
const { StorageManager } = require('./storage')

module.exports = {
  createPeer,
  MessageHandler,
  StorageManager,
  // Legacy exports for compatibility
  KeetChannel: require('./channel')
}

// CLI handling
if (require.main === module) {
  const args = process.argv.slice(2)
  const command = args[0]

  async function main() {
    switch (command) {
      case '--create':
      case 'create':
        console.log('🆕 Creating new P2P peer...')
        const peer = await createPeer({
          storagePath: './data/peer-' + Date.now()
        })
        console.log('✅ Peer created!')
        console.log('📍 Your public key (share this):')
        console.log(peer.publicKey)
        console.log('')
        console.log('Cabal key:', peer.cabalKey)
        break

      case '--help':
      case 'help':
      case undefined:
        console.log(`
OpenClaw Keet - P2P Messaging Channel

Usage:
  node index.js create        Create a new P2P peer
  node index.js --join <key>  Join existing cabal
  node index.js --help        Show this help

Examples:
  node index.js create        # Create new peer
  node index.js --join abc123 # Join existing cabal
        `)
        break

      default:
        if (command && command.startsWith('--join')) {
          const key = args[1]
          console.log('🔗 Joining cabal:', key)
          const peer = await createPeer({
            storagePath: './data/peer-' + Date.now(),
            cabalKey: key
          })
          console.log('✅ Connected!')
          console.log('📍 Your key:', peer.publicKey)
        } else {
          console.log('Unknown command. Run --help for usage.')
        }
    }
  }

  main().catch(console.error)
}