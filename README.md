# OpenClaw Keet - P2P Messaging Channel

> ✅ **TESTED & WORKING** - P2P connection established between two servers!

A peer-to-peer messaging channel plugin for OpenClaw, built on Hypercore protocol (same technology as Keet.io). Enables direct encrypted communication without depending on WhatsApp, Telegram, or other centralized services.

## Why P2P?

- 🔒 **End-to-end encryption** - Messages go directly peer-to-peer
- 🌐 **No servers** - No dependency on centralized APIs
- 🔑 **No phone/email required** - Identity via public key
- ⚡ **Real-time** - Instant peer discovery and messaging
- 🚀 **Censorship resistant** - No single point of failure

## Quick Start

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

## Scripts

| File | Description |
|------|-------------|
| `p2p-simple.js` | ✅ Working - Uses hypercore directly (no native modules) |
| `p2p-test.js` | Uses cabal-core (requires `level@7`, native modules) |

**Recommendation:** Use `p2p-simple.js` - it's simpler and works without compiling native modules.

## Test Results

Successfully connected two servers:
- **Server 1 (USA):** `915c8b2f...`
- **Server 2 (Mexico):** `c21014c6...`

Messages flow directly between peers with encryption.

## Architecture

```
┌─────────────┐     P2P (DHT + Hyperswarm)     ┌─────────────┐
│   User      │◄────────────────────────────────►│  OpenClaw   │
│  (Client)   │                                 │  (Server)   │
└─────────────┘                                 └─────────────┘
```

## Next Steps

- [ ] Integrate with OpenClaw channel system
- [ ] Add QR code pairing for easy user setup
- [ ] Implement message persistence
- [ ] Add support for multi-user channels

## References

- [Hypercore Protocol](https://hypercore-protocol.org)
- [Hyperswarm](https://github.com/hyperswarm)
- [Keet.io](https://keet.io) - P2P chat app by Holepunch
- [Pear Runtime](https://docs.pears.com)

## License

MIT
