/**
 * OpenClaw Keet P2P Channel Plugin
 * 
 * A peer-to-peer messaging channel using Hypercore protocol
 */

import Hypercore from 'hypercore'
import hyperswarm from 'hyperswarm'
import crypto from 'crypto'

// Channel configuration interface
interface KeetConfig {
  accounts: {
    [accountId: string]: {
      enabled: boolean
      topicKey?: string // The P2P topic/cabal key
      publicKey?: string // Our public key for this account
    }
  }
}

// P2P state per account
const accountState = new Map<string, {
  swarm: any
  core: any
  publicKey: string
  topic: Buffer
}>()

/**
 * Send text message via P2P
 */
async function sendText({ text, accountId }: { text: string; accountId?: string }) {
  const acc = accountId || 'default'
  const state = accountState.get(acc)
  
  if (!state) {
    return { ok: false, error: 'Account not initialized' }
  }
  
  // Broadcast to all connected peers
  const connections = [...state.swarm.connections]
  const message = JSON.stringify({
    type: 'chat',
    from: state.publicKey,
    text,
    timestamp: Date.now()
  })
  
  for (const conn of connections) {
    try {
      conn.write(message)
    } catch (e) {
      // Connection may have closed
    }
  }
  
  return { ok: true }
}

/**
 * Initialize P2P for an account
 */
async function initializeAccount(accountId: string, topicKey?: string) {
  const keyPair = crypto.generateKeyPairSync('ed25519')
  const publicKey = keyPair.publicKey.export({ type: 'spki', format: 'der' }).toString('hex')
  
  // Use provided topic or generate random one
  const topic = topicKey 
    ? Buffer.from(topicKey, 'hex') 
    : crypto.randomBytes(32)
  
  // Create swarm
  const swarm = new hyperswarm()
  
  swarm.join(topic, {
    lookup: true,
    announce: true
  })
  
  // Store state
  accountState.set(accountId, {
    swarm,
    core: null,
    publicKey,
    topic
  })
  
  return { publicKey, topic: topic.toString('hex') }
}

// The channel plugin definition
const keetChannel = {
  id: 'keet',
  
  meta: {
    id: 'keet',
    label: 'Keet P2P',
    selectionLabel: 'Keet P2P (Hypercore)',
    docsPath: '/channels/keet',
    blurb: 'Peer-to-peer encrypted messaging via Hypercore protocol',
    aliases: ['p2p', 'hypercore'],
  },
  
  capabilities: {
    chatTypes: ['direct', 'group'],
    media: false,
    reactions: false,
  },
  
  config: {
    listAccountIds: (cfg: any) => 
      Object.keys(cfg.channels?.keet?.accounts ?? {}),
    
    resolveAccount: (cfg: any, accountId?: string) => 
      cfg.channels?.keet?.accounts?.[accountId ?? 'default'] ?? {
        accountId: accountId ?? 'default',
        enabled: true,
      },
  },
  
  outbound: {
    deliveryMode: 'direct' as const,
    sendText: async ({ text, accountId }: { text: string; accountId?: string }) => {
      return sendText({ text, accountId })
    },
  },
}

// Plugin registration function
export default function register(api: any) {
  api.logger.info('[Keet] Loading OpenClaw Keet P2P Channel plugin...')
  
  // Register the channel
  api.registerChannel({ plugin: keetChannel })
  
  // Register a background service for P2P connections
  api.registerService({
    id: 'keet-p2p-service',
    start: async (ctx: any) => {
      api.logger.info('[Keet] Starting P2P service...')
      
      // Get config
      const cfg = api.getConfig()
      const accounts = cfg.channels?.keet?.accounts ?? {}
      
      // Initialize each account
      for (const [accountId, accountConfig] of Object.entries(accounts)) {
        if (accountConfig.enabled) {
          api.logger.info(`[Keet] Initializing account: ${accountId}`)
          
          const { publicKey, topic } = await initializeAccount(
            accountId, 
            accountConfig.topicKey
          )
          
          api.logger.info(`[Keet] Account ${accountId} ready:`)
          api.logger.info(`  Public Key: ${publicKey}`)
          api.logger.info(`  Topic: ${topic}`)
          
          // Set up message handler
          const state = accountState.get(accountId)
          if (state) {
            state.swarm.on('connection', (conn: any, info: any) => {
              api.logger.info(`[Keet] New peer connection on ${accountId}`)
              
              conn.on('data', (data: Buffer) => {
                try {
                  const msg = JSON.parse(data.toString())
                  if (msg.type === 'chat' && msg.text) {
                    // Dispatch message to OpenClaw
                    api.dispatchMessage({
                      channel: 'keet',
                      accountId,
                      text: msg.text,
                      authorId: msg.from,
                    })
                  }
                } catch (e) {
                  // Not JSON or invalid
                }
              })
            })
          }
        }
      }
      
      api.logger.info('[Keet] P2P service started')
    },
    
    stop: async () => {
      api.logger.info('[Keet] Stopping P2P service...')
      
      // Clean up swarms
      for (const [accountId, state] of accountState) {
        state.swarm.destroy()
      }
      accountState.clear()
      
      api.logger.info('[Keet] P2P service stopped')
    },
  })
  
  api.logger.info('[Keet] Plugin loaded successfully')
}
