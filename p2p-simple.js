#!/usr/bin/env node

/**
 * OpenClaw Keet - Simplified P2P Test (No Native Modules)
 * Uses hypercore directly without level dependency
 * 
 * Usage:
 *   node p2p-simple.js                    - Create new cabal
 *   node p2p-simple.js <cabal-key>        - Join existing cabal
 */

const path = require('path')
const os = require('os')

// Use hypercore directly without level
const Hypercore = require('hypercore')
const hyperdht = require('hyperdht')
const hyperswarm = require('hyperswarm')

const storageDir = path.join(os.tmpdir(), 'hypercore-simple-' + Date.now())
const cabalKey = process.argv[2] || null

console.log('🟢 Hypercore P2P Test (Simplified)')
console.log('📁 Storage:', storageDir)

// Simple in-memory feed for messages
const messages = []

// Create a swarm for discovery
const swarm = new hyperswarm()

// Generate a random key pair for this peer
const keyPair = hyperdht.keyPair()

console.log('🔑 Tu clave pública:', keyPair.publicKey.toString('hex'))

if (cabalKey) {
  console.log('🔗 Uniendo a cabal existente:', cabalKey.substring(0, 20) + '...')
}

// Simple topic for discovery (use cabal key as topic)
const topic = cabalKey ? Buffer.from(cabalKey, 'hex') : require('crypto').randomBytes(32)

swarm.join(topic, {
  lookup: true, // find and connect to peers
  announce: true // advertise we're online
})

swarm.on('connection', (connection, info) => {
  console.log('🤝 Peer conectado!')
  
  // Handle incoming messages
  connection.on('data', (data) => {
    try {
      const msg = JSON.parse(data.toString())
      if (msg.type === 'chat') {
        console.log('')
        console.log('💬', msg.from.substring(0, 10) + '...:', msg.text)
        console.log('')
      }
    } catch (e) {}
  })
  
  // Send test message after connection
  setTimeout(() => {
    const msg = {
      type: 'chat',
      from: keyPair.publicKey.toString('hex'),
      text: 'Hola desde Hypercore P2P! 👋',
      timestamp: Date.now()
    }
    connection.write(JSON.stringify(msg))
    console.log('📤 Mensaje enviado')
  }, 1000)
})

swarm.on('up', () => {
  console.log('✅ Swarm conectado!')
  console.log('🌐 Buscando peers...')
})

// Send broadcast message periodically
setInterval(() => {
  // Only send if we have connections
  const connections = [...swarm.connections]
  if (connections.length > 0) {
    const msg = {
      type: 'chat',
      from: keyPair.publicKey.toString('hex'),
      text: 'Ping desde ' + keyPair.publicKey.toString('hex').substring(0, 8) + '...',
      timestamp: Date.now()
    }
    connections.forEach(conn => {
      try {
        conn.write(JSON.stringify(msg))
      } catch (e) {}
    })
  }
}, 10000)

console.log('')
console.log('⏳ Escuchando... (Ctrl+C para salir)')
console.log('')
console.log('📝 Para probar desde otra máquina, copia esta clave:')
console.log('   Clave pública:', keyPair.publicKey.toString('hex'))
console.log('   Topic (cabal):', topic.toString('hex'))
console.log('')

// Handle cleanup
process.on('SIGINT', () => {
  console.log('🛑 Cerrando...')
  swarm.destroy()
  process.exit(0)
})