/**
 * Message Handler
 * Processes and manages P2P messages
 */

const { EventEmitter } = require('events')

class MessageHandler extends EventEmitter {
  constructor(options = {}) {
    super()
    this.peer = null
    this.channel = options.channel || 'default'
    this.messageQueue = []
    this.processing = false
  }

  /**
   * Attach to a peer instance
   */
  attach(peer) {
    this.peer = peer
    
    // Set up message listener
    peer.onMessage((message) => {
      this._handleMessage(message)
    })
  }

  /**
   * Handle incoming message
   */
  _handleMessage(message) {
    // Filter by channel
    if (message.channel !== this.channel && message.channel !== undefined) {
      return
    }

    // Don't process own messages
    if (message.from === this.peer.localKey) {
      return
    }

    this.emit('message', message)
  }

  /**
   * Send a message
   */
  async send(text, options = {}) {
    if (!this.peer) {
      throw new Error('No peer attached')
    }

    const channel = options.channel || this.channel
    const recipient = options.recipient || null

    return await this.peer.sendMessage(text, channel, recipient)
  }

  /**
   * Get message history
   */
  async getHistory(limit = 100) {
    if (!this.peer) {
      throw new Error('No peer attached')
    }

    return await this.peer.getMessages(this.channel, limit)
  }

  /**
   * Queue a message for later processing
   */
  queue(message) {
    this.messageQueue.push({
      message,
      timestamp: Date.now()
    })
    
    this.emit('queued', message)
  }

  /**
   * Process queued messages
   */
  async processQueue() {
    if (this.processing || this.messageQueue.length === 0) {
      return
    }

    this.processing = true
    
    while (this.messageQueue.length > 0) {
      const item = this.messageQueue.shift()
      this.emit('process', item.message)
    }

    this.processing = false
  }

  /**
   * Clear message queue
   */
  clearQueue() {
    this.messageQueue = []
  }

  /**
   * Get queue status
   */
  getQueueStatus() {
    return {
      length: this.messageQueue.length,
      processing: this.processing,
      oldest: this.messageQueue[0]?.timestamp,
      newest: this.messageQueue[this.messageQueue.length - 1]?.timestamp
    }
  }
}

/**
 * Parse message content for commands
 */
function parseCommand(text) {
  if (!text || !text.startsWith('/')) {
    return null
  }

  const parts = text.slice(1).split(' ')
  const command = parts[0].toLowerCase()
  const args = parts.slice(1)

  return { command, args, raw: text }
}

/**
 * Build response message
 */
function buildMessage(text, options = {}) {
  return {
    text,
    channel: options.channel || 'default',
    timestamp: Date.now(),
    ...options
  }
}

module.exports = {
  MessageHandler,
  parseCommand,
  buildMessage
}