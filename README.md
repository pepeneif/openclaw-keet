# OpenClaw Keet - P2P Messaging Channel

> ✅ **TESTED & WORKING** - P2P connection established between two servers!

> 🔧 **PLUGIN IN DEVELOPMENT** - Currently building the OpenClaw plugin integration

A peer-to-peer messaging channel plugin for OpenClaw, built on Hypercore protocol (same technology as Keet.io). Enables direct encrypted communication without depending on WhatsApp, Telegram, or other centralized services.

## Why P2P?

- 🔒 **End-to-end encryption** - Messages go directly peer-to-peer
- 🌐 **No servers** - No dependency on centralized APIs
- 🔑 **No phone/email required** - Identity via public key
- ⚡ **Real-time** - Instant peer discovery and messaging
- 🚀 **Censorship resistant** - No single point of failure

## Quick Start (Standalone Test)

### Prerequisites

- Node.js >= 18
- Linux server (tested on Ubuntu)

### Install

```bash
# Clone the repo
git clone https://github.com/pepeneif/openclaw-keet.git
cd openclaw-keet

# Install dependencies
npm install hypercore hyperdht hyperswarm
```

### Run P2P Test

**Server 1 (creates new cabal):**
```bash
node p2p-simple.js
```

Copy the **Topic (cabal)** key from the output.

**Server 2 (joins existing cabal):**
```bash
node p2p-simple.js <TOPIC-KEY>
```

### Result

You'll see:
```
🤝 Peer connected!
💬 [peer-key]...: Hola desde Hypercore P2P! 👋
```

## OpenClaw Plugin Installation (In Development)

### Install as Plugin

```bash
# Clone the repo
git clone https://github.com/pepeneif/openclaw-keet.git

# Install as local plugin
openclaw plugins install -l ./openclaw-keet
```

### Configure

Add to your OpenClaw config (`openclaw.json`):

```json
{
  "channels": {
    "keet": {
      "accounts": {
        "default": {
          "enabled": true,
          "topicKey": "your-shared-topic-key-here"
        }
      }
    }
  }
}
```

### Restart Gateway

```bash
openclaw gateway restart
```

## Plugin Architecture

```
┌─────────────┐     P2P (Hyperswarm)     ┌─────────────┐
│   User      │◄────────────────────────►│  OpenClaw   │
│  (Keet App) │                         │  (Gateway)  │
└─────────────┘                         └─────────────┘
       │                                       │
       │                              ┌────────┴────────┐
       │                              │ Keet Plugin     │
       │                              │ - sendText()    │
       │                              │ - P2P Service   │
       │                              │ - Message Router│
       │                              └─────────────────┘
```

### Plugin Components

- **Channel Definition** - Registers `keet` as a messaging channel
- **Outbound Handler** - `sendText()` sends messages via P2P
- **P2P Service** - Background service managing swarm connections
- **Message Dispatch** - Routes incoming P2P messages to OpenClaw

## Test Results

Successfully connected two servers:
- **Server 1 (USA):** `3154e495d80f0c747f0b8087e0d41215d0126e9c17ffd883a5cbb70d852a9261`
- **Server 2 (Mexico):** `794f230673d60402728eae8f69801fc810ff5afd61503e5052c4ff67aa3cd5dc`

Messages flow directly between peers with encryption.

## Scripts

| File | Description |
|------|-------------|
| `p2p-simple.js` | ✅ Working - Uses hypercore directly (no native modules) |
| `p2p-test.js` | Uses cabal-core (requires `level@7`, native modules) |
| `src/index.ts` | OpenClaw plugin (in development) |

## Project Structure

```
openclaw-keet/
├── src/
│   └── index.ts          # OpenClaw plugin (TypeScript)
├── p2p-simple.js         # Standalone test (working)
├── p2p-test.js           # Cabal-core version
├── openclaw.plugin.json  # Plugin manifest
├── package.json
└── README.md
```

## Next Steps

- [x] Standalone P2P test working
- [x] Create plugin structure
- [ ] Test plugin installation
- [ ] Implement message persistence
- [ ] Add QR code pairing for easy user setup
- [ ] Support multi-user channels

## References

- [Hypercore Protocol](https://hypercore-protocol.org)
- [Hyperswarm](https://github.com/hyperswarm)
- [Keet.io](https://keet.io) - P2P chat app by Holepunch
- [Pear Runtime](https://docs.pears.com)
- [OpenClaw Plugin Docs](https://docs.openclaw.ai/plugin)

## License

MIT
