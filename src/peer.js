/**
 * Peer Management
 * Handles P2P connection creation and lifecycle
 */

const Cabal = require('cabal-core')
const swarm = require('cabal-core/swarm')
const path = require('path')
const os = require('os')
const { EventEmitter } = require('events')

class PeerManager extends EventEmitter {
  constructor(options = {}) {
    super()
    
    this.storagePath = options.storagePath || path.join(os.tmpdir(), 'openclaw-keet-' + Date.now())
    this.cabalKey = options.cabalKey || null
    this.debug = options.debug || false
    
    this.cabal = null
    this.swarmInstance = null
    this.localKey = null
    this.connected = false
  }

  /**
   * Initialize and start the P2P peer
   */
  async start() {
    return new Promise((resolve, reject) => {
      try {
        // Create cabal instance
        this.cabal = Cabal(this.storagePath, this.cabalKey, {
          db: require('level')(this.storagePath + '/db')
        })

        this.cabal.ready(() => {
          // Get our local public key
          this.cabal.getLocalKey((err, localKey) => {
            if (err) {
              reject(err)
              return
            }

            this.localKey = localKey
            this.cabalKey = this.cabal.key.toString('hex')
            
            this.log('✅ Peer initialized')
            this.log('📍 Public key:', this.localKey)
            this.log('🔗 Cabal key:', this.cabalKey)

            // Start swarm (connect to peers)
            this._startSwarm()
            
            resolve({
              publicKey: this.localKey,
              cabalKey: this.cabalKey,
              storagePath: this.storagePath
            })
          })
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Start the P2P swarm for peer discovery
   */
  _startSwarm() {
    this.swarmInstance = swarm(this.cabal)
    
    this.swarmInstance.on('connection', (peer, info) => {
      this.log('🤝 New peer connection')
      this.emit('connection', { peer, info })
    })

    this.swarmInstance.on('peer-added', (peerKey) => {
      this.log('📥 Peer joined:', peerKey.substring(0, 10) + '...')
      this.connected = true
      this.emit('peer-added', peerKey)
    })

    this.swarmInstance.on('peer-dropped', (peerKey) => {
      this.log('📤 Peer left:', peerKey.substring(0, 10) + '...')
      this.emit('peer-dropped', peerKey)
    })
  }

  /**
   * Send a message to a specific peer
   */
  sendMessage(text, channel = 'default', recipientKey = null) {
    return new Promise((resolve, reject) => {
      if (!this.cabal) {
        reject(new Error('Peer not initialized'))
        return
      }

      const message = {
        type: 'chat/text',
        content: {
          text: text,
          channel: channel,
          timestamp: Date.now(),
          // Include recipient for DM, or null for broadcast
          ...(recipientKey && { recipient: recipientKey })
        }
      }

      this.cabal.publish(message, (err) => {
        if (err) {
          this.log('❌ Error sending:', err.message)
          reject(err)
        } else {
          this.log('✅ Message sent')
          resolve(true)
        }
      })
    })
  }

  /**
   * Get message history
   */
  getMessages(channel = 'default', limit = 100) {
    return new Promise((resolve, reject) => {
      if (!this.cabal) {
        reject(new Error('Peer not initialized'))
        return
      }

      const stream = this.cabal.messages.read(channel, { limit })
      const messages = []
      
      stream.on('data', (message) => {
        messages.push({
          key: message.key,
          seq: message.seq,
          content: message.value.content,
          timestamp: message.value.timestamp
        })
      })

      stream.on('end', () => {
        resolve(messages)
      })

      stream.on('error', reject)
    })
  }

  /**
   * Set up message listener
   */
  onMessage(callback) {
    if (!this.cabal) {
      throw new Error('Peer not initialized')
    }

    this.cabal.messages.events.on('message', (message) => {
      callback({
        from: message.key,
        content: message.value.content.text,
        channel: message.value.content.channel,
        timestamp: message.value.timestamp,
        raw: message
      })
    })
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      initialized: this.cabal !== null,
      connected: this.connected,
      publicKey: this.localKey,
      cabalKey: this.cabalKey,
      storagePath: this.storagePath
    }
  }

  /**
   * Stop the peer
   */
  stop() {
    return new Promise((resolve) => {
      if (this.swarmInstance) {
        this.swarmInstance.destroy()
      }
      
      if (this.cabal) {
        this.cabal.close(() => {
          this.log('🛑 Peer stopped')
          resolve(true)
        })
      } else {
        resolve(true)
      }
    })
  }

  /**
   * Debug logging
   */
  log(...args) {
    if (this.debug) {
      console.log('[Keet]', ...args)
    }
  }
}

/**
 * Create a new P2P peer
 */
async function createPeer(options = {}) {
  const peer = new PeerManager(options)
  await peer.start()
  return peer
}

module.exports = {
  PeerManager,
  createPeer
}