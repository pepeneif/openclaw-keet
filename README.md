# OpenClaw Keet Channel

P2P messaging channel plugin for OpenClaw using Pear Runtime (the same technology behind Keet).

**Status:** In Development - Proof of Concept

## Overview

This plugin enables OpenClaw to communicate via peer-to-peer encrypted messaging, removing dependency on centralized services like WhatsApp or Telegram. Built on the Pear Runtime/Hypercore protocol (same as Keet.io), it provides:

- 🔒 End-to-end encryption
- 🌐 No servers - direct peer-to-peer communication  
- 🔑 Identity via seed phrase (24 words)
- ⚡ Real-time messaging
- 🌊 No vendor lock-in

## Why P2P for OpenClaw?

Current OpenClaw channels have issues:
- WhatsApp: API changes frequently, login issues
- Telegram: Can be unreliable, bot API changes
- Other channels: Low adoption

**Bitcoin/Crypto users** prefer privacy-preserving tools. Keet-style P2P messaging is:
- More reliable (no single point of failure)
- Privacy-focused (no phone number required)
- Censorship resistant

## Architecture

```
┌─────────────┐     P2P (Hypercore)     ┌─────────────┐
│   User      │◄────────────────────────►│  OpenClaw   │
│  (Keet App) │                         │  (VPS/Node) │
└─────────────┘                         └─────────────┘
```

## Requirements

- Node.js >= 18.0.0
- Linux server (recommended) with build tools
- libtool, autoconf, automake (for native modules)

## Quick Start

```bash
# Install dependencies
npm install

# Run the P2P test
node examples/p2p-test.js

# Or create a new peer
node src/index.js --create
```

## Installation

```bash
# Clone this repo
git clone https://github.com/yourusername/openclaw-keet.git
cd openclaw-keet

# Install dependencies
npm install

# Build native modules (if needed)
npm run rebuild
```

## Configuration

```javascript
// In your OpenClaw config
{
  "channels": {
    "keet": {
      "enabled": true,
      "peerKey": "your-peer-public-key",
      "storagePath": "./keet-storage"
    }
  }
}
```

## API

### Create a new P2P peer

```javascript
const { createPeer } = require('./src/index')

const peer = await createPeer({
  storagePath: './data/my-peer',
  channel: 'openclaw' // default channel name
})

console.log('My public key:', peer.publicKey)
// Share this key with users who want to message you
```

### Send a message

```javascript
await peer.sendMessage('recipient-key-here', 'Hello!')
```

### Receive messages

```javascript
peer.on('message', (message) => {
  console.log('From:', message.from)
  console.log('Content:', message.content)
})
```

## Project Structure

```
openclaw-keet/
├── src/
│   ├── index.js          # Main entry point
│   ├── peer.js           # Peer connection logic
│   ├── messaging.js      # Message handling
│   └── storage.js        # Data persistence
├── examples/
│   ├── p2p-test.js       # Basic P2P test
│   └── send-message.js   # Send message example
├── docs/
│   ├── API.md            # API documentation
│   ├── PROTOCOL.md       # Protocol details
│   └── DEPLOYMENT.md     # Deployment guide
├── package.json
├── README.md
├── LICENSE
└── .gitignore
```

## Development

### Running tests

```bash
npm test
```

### Contributing

1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Submit a PR

## Current Status

- [x] Basic peer connection
- [x] Send/receive messages
- [ ] OpenClaw plugin integration
- [ ] Pairing/QR code system
- [ ] Multi-user support
- [ ] Message persistence

## References

- [Pear Runtime Docs](https://docs.pears.com)
- [Keet.io](https://keet.io)
- [Hypercore Protocol](https://hypercore-protocol.org)
- [Holepunch GitHub](https://github.com/holepunchto)

## License

MIT License - see LICENSE file

## Disclaimer

This is experimental software. P2P networking has different security characteristics than traditional client-server models. Use at your own risk.