/**
 * Storage Manager
 * Handles data persistence for the P2P peer
 */

const path = require('path')
const fs = require('fs')

class StorageManager {
  constructor(options = {}) {
    this.basePath = options.basePath || './data'
    this.peerDataPath = null
  }

  /**
   * Initialize storage for a peer
   */
  async initialize(peerId) {
    this.peerDataPath = path.join(this.basePath, peerId)
    
    // Ensure directory exists
    await this._ensureDir(this.peerDataPath)
    
    return this.peerDataPath
  }

  /**
   * Ensure directory exists
   */
  async _ensureDir(dirPath) {
    return new Promise((resolve, reject) => {
      fs.mkdir(dirPath, { recursive: true }, (err) => {
        if (err) reject(err)
        else resolve(dirPath)
      })
    })
  }

  /**
   * Save peer keys
   */
  async saveKeys(peerId, keys) {
    const keysPath = path.join(this.peerDataPath, 'keys.json')
    
    return new Promise((resolve, reject) => {
      fs.writeFile(keysPath, JSON.stringify(keys, null, 2), (err) => {
        if (err) reject(err)
        else resolve(keysPath)
      })
    })
  }

  /**
   * Load peer keys
   */
  async loadKeys(peerId) {
    const keysPath = path.join(this.basePath, peerId, 'keys.json')
    
    return new Promise((resolve, reject) => {
      fs.readFile(keysPath, 'utf8', (err, data) => {
        if (err) {
          if (err.code === 'ENOENT') {
            resolve(null)
          } else {
            reject(err)
          }
        } else {
          try {
            resolve(JSON.parse(data))
          } catch (parseErr) {
            reject(parseErr)
          }
        }
      })
    })
  }

  /**
   * Save configuration
   */
  async saveConfig(peerId, config) {
    const configPath = path.join(this.basePath, peerId, 'config.json')
    
    return new Promise((resolve, reject) => {
      fs.writeFile(configPath, JSON.stringify(config, null, 2), (err) => {
        if (err) reject(err)
        else resolve(configPath)
      })
    })
  }

  /**
   * Load configuration
   */
  async loadConfig(peerId) {
    const configPath = path.join(this.basePath, peerId, 'config.json')
    
    return new Promise((resolve, reject) => {
      fs.readFile(configPath, 'utf8', (err, data) => {
        if (err) {
          if (err.code === 'ENOENT') {
            resolve({})
          } else {
            reject(err)
          }
        } else {
          try {
            resolve(JSON.parse(data))
          } catch (parseErr) {
            reject(parseErr)
          }
        }
      })
    })
  }

  /**
   * Save message cache
   */
  async cacheMessages(peerId, messages) {
    const cachePath = path.join(this.peerDataPath, 'message-cache.json')
    
    // Keep only last 1000 messages
    const trimmed = messages.slice(-1000)
    
    return new Promise((resolve, reject) => {
      fs.writeFile(cachePath, JSON.stringify(trimmed, null, 2), (err) => {
        if (err) reject(err)
        else resolve(cachePath)
      })
    })
  }

  /**
   * Load message cache
   */
  async loadMessageCache(peerId) {
    const cachePath = path.join(this.basePath, peerId, 'message-cache.json')
    
    return new Promise((resolve, reject) => {
      fs.readFile(cachePath, 'utf8', (err, data) => {
        if (err) {
          if (err.code === 'ENOENT') {
            resolve([])
          } else {
            reject(err)
          }
        } else {
          try {
            resolve(JSON.parse(data))
          } catch (parseErr) {
            resolve([])
          }
        }
      })
    })
  }

  /**
   * Get storage stats
   */
  async getStats(peerId) {
    const peerPath = path.join(this.basePath, peerId)
    
    return new Promise((resolve) => {
      fs.readdir(peerPath, (err, files) => {
        if (err) {
          resolve({ exists: false })
          return
        }

        let totalSize = 0
        const fileCount = files.length

        const calculateSize = () => {
          if (files.length === 0) {
            resolve({
              exists: true,
              fileCount,
              totalSize,
              path: peerPath
            })
            return
          }

          const file = files.pop()
          const filePath = path.join(peerPath, file)

          fs.stat(filePath, (err, stats) => {
            if (!err) {
              totalSize += stats.size
            }
            
            if (files.length === 0) {
              resolve({
                exists: true,
                fileCount,
                totalSize,
                path: peerPath
              })
            } else {
              calculateSize()
            }
          })
        }

        calculateSize()
      })
    })
  }

  /**
   * Delete peer storage
   */
  async delete(peerId) {
    const peerPath = path.join(this.basePath, peerId)
    
    return new Promise((resolve, reject) => {
      fs.rm(peerPath, { recursive: true, force: true }, (err) => {
        if (err) reject(err)
        else resolve(true)
      })
    })
  }

  /**
   * List all peers
   */
  async listPeers() {
    return new Promise((resolve, reject) => {
      fs.readdir(this.basePath, (err, files) => {
        if (err) {
          if (err.code === 'ENOENT') {
            resolve([])
          } else {
            reject(err)
          }
        } else {
          resolve(files.filter(f => !f.startsWith('.')))
        }
      })
    })
  }
}

module.exports = {
  StorageManager
}