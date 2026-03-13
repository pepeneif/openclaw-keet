/**
 * OpenClaw Channel Interface
 * 
 * This provides the interface for integrating with OpenClaw's
 * channel system. Currently a stub - actual implementation
 * depends on OpenClaw's plugin architecture.
 */

const { createPeer } = require('./peer')
const { MessageHandler } = require('./messaging')

class KeetChannel {
  constructor(config = {}) {
    this.config = {
      enabled: config.enabled || false,
      peerKey: config.peerKey || null,
      cabalKey: config.cabalKey || null,
      storagePath: config.storagePath || './data/keet',
      channel: config.channel || 'openclaw',
      debug: config.debug || false
    }
    
    this.peer = null
    this.messageHandler = null
    this.initialized = false
  }

  /**
   * Initialize the channel
   */
  async initialize() {
    if (this.initialized) {
      return this
    }

    console.log('[Keet Channel] Initializing...')

    // Create P2P peer
    this.peer = await createPeer({
      storagePath: this.config.storagePath,
      cabalKey: this.config.cabalKey,
      debug: this.config.debug
    })

    // Create message handler
    this.messageHandler = new MessageHandler({
      channel: this.config.channel
    })
    this.messageHandler.attach(this.peer)

    // Forward messages to OpenClaw
    this.messageHandler.on('message', (msg) => {
      this.emit('message', {
        from: msg.from,
        content: msg.content,
        channel: this.config.channel,
        timestamp: msg.timestamp
      })
    })

    this.initialized = true
    console.log('[Keet Channel] Initialized')
    console.log('[Keet Channel] Public Key:', this.peer.publicKey)
    console.log('[Keet Channel] Cabal Key:', this.peer.cabalKey)

    return this
  }

  /**
   * Send a message
   */
  async send(to, content) {
    if (!this.initialized) {
      throw new Error('Channel not initialized')
    }

    return await this.peer.sendMessage(content, this.config.channel, to)
  }

  /**
   * Get channel status
   */
  getStatus() {
    return {
      enabled: this.config.enabled,
      initialized: this.initialized,
      peer: this.peer ? this.peer.getStatus() : null
    }
  }

  /**
   * Clean up
   */
  async shutdown() {
    if (this.peer) {
      await this.peer.stop()
    }
    this.initialized = false
  }
}

// Make it an EventEmitter
const { EventEmitter } = require('events')
Object.setPrototypeOf(KeetChannel.prototype, EventEmitter.prototype)

module.exports = {
  KeetChannel
}