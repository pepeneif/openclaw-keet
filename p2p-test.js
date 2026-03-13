const Cabal = require('cabal-core')
const path = require('path')
const os = require('os')
const Level = require('level')

const storageDir = path.join(os.tmpdir(), 'cabal-openclaw-' + Date.now()); require('fs').mkdirSync(storageDir + '/db', { recursive: true })
const key = process.argv[2]

console.log('🟢 P2P Test - Storage:', storageDir)

const cabal = Cabal(storageDir, key, {
  db: new Level(storageDir + '/db')
})

cabal.ready(() => {
  cabal.getLocalKey((err, localKey) => {
    if (err) { console.error('Error:', err.message); process.exit(1) }
    
    console.log('✅ Conectado!')
    console.log('Tu clave pública:', localKey)
    console.log('')
    console.log('Clave del cabal:', key ? key.substring(0,20)+'...' : cabal.key.toString('hex'))
    
    // Try to start swarm
    let s
    try {
      const swarmFn = require('cabal-core/swarm')
      s = swarmFn(cabal)
    } catch (e) {
      console.log('⚠️ Swarm no disponible:', e.message)
    }
    
    if (s && s.on) {
      s.on('peer-added', (k) => console.log('📥 Peer:', k.substring(0,10)+'...'))
      s.on('peer-dropped', (k) => console.log('📤 Peer salió:', k.substring(0,10)+'...'))
    }
    
    cabal.messages.events.on('message', (m) => {
      console.log('')
      console.log('💬', m.key.substring(0,10)+'...:', m.value.content.text)
    })
    
    setTimeout(() => {
      cabal.publish({type: 'chat/text', content: {text: 'Hola desde OpenClaw! 👋', channel: 'default'}})
      console.log('📤 Mensaje de prueba enviado')
    }, 3000)
    
    console.log('⏳ Escuchando mensajes... (Ctrl+C para salir)')
  })
})

process.on('SIGINT', async () => {
  console.log('🛑 Cerrando...')
  process.exit(0)
})
