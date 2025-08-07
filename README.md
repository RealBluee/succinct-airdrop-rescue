# 🛡️ Succinct Airdrop Atomic Rescue Tool

A secure solution to claim tokens from a compromised wallet using Flashbots MEV protection. This tool enables atomic claiming and transfer of Succinct Foundation airdrop tokens, preventing frontrunning attacks.

## 🚨 The Problem

Your wallet is compromised (private key potentially exposed), but it contains unclaimed airdrop tokens. Traditional claiming methods risk immediate theft by MEV bots or attackers monitoring the mempool.

## ✅ The Solution

This tool uses **Flashbots bundles** to execute both claiming and transfer transactions atomically in a single block, ensuring no one can intercept your tokens between claim and transfer.

## 🔄 How It Works

### 1. Authentication Phase
- Requests nonce from Succinct claim API
- Signs SIWE (Sign-In With Ethereum) message
- Obtains JWT authentication token

### 2. Claim Data Retrieval
- Fetches your eligibility proof from the API
- Gets claim index, token amount, and Merkle proof

### 3. Atomic Execution
- **Transaction 1**: Claims tokens to compromised wallet
- **Transaction 2**: Immediately transfers tokens to safe wallet
- Both execute in the same block or fail together

## 🛠️ Setup

### Prerequisites
- Node.js & npm
- Alchemy/Infura RPC endpoints
- Compromised wallet private key
- Sponsor wallet with ETH for gas fees

### Environment Variables
Create a `.env` file in your project root:

```bash
COMPROMISED_KEY=your_compromised_private_key
SPONSOR_KEY=your_sponsor_private_key  
NEW_WALLET_ADDRESS=your_new_safe_address
ALCHEMY_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR-API-KEY
INFURA_URL=https://mainnet.infura.io/v3/YOUR-PROJECT-ID
```

### 🔑 Getting API Keys

**Alchemy (Recommended):**
1. Visit [alchemy.com](https://alchemy.com) and create free account
2. Create new app → Select "Ethereum Mainnet"
3. Copy your API key and replace `YOUR-API-KEY` in the URL above

**Infura (Backup):**
1. Visit [infura.io](https://infura.io) and create free account  
2. Create new project → Select "Ethereum Mainnet"
3. Copy your Project ID and replace `YOUR-PROJECT-ID` in the URL above

💡 **Why both?** The tool uses RPC fallback - if one service is down, it automatically switches to the other for maximum reliability.

### Installation
```bash
# Install required dependencies
npm install ethers @flashbots/ethers-provider-bundle axios dotenv

# Run the rescue tool
node succinct-claim.js
```

### Dependencies Explained
- **ethers**: Ethereum blockchain interaction library
- **@flashbots/ethers-provider-bundle**: Official Flashbots MEV protection provider
- **axios**: HTTP client for API communication
- **dotenv**: Environment variable management

## 🔒 Security Features

- **✅ Atomic Execution**: Both transactions succeed together or fail together
- **✅ MEV Protection**: Uses Flashbots private mempool
- **✅ Frontrun Prevention**: Transactions invisible until execution
- **✅ Multiple RPC Fallback**: Redundant network connectivity

## ⚠️ Important Considerations

- **Gas Requirements**: Sponsor wallet needs sufficient ETH
- **One Opportunity**: Most airdrops allow single claim attempts
- **Timing Sensitive**: Target block must be current for inclusion
- **Test First**: Verify on testnet if possible

## 🎯 Use Cases

Perfect for rescuing tokens from wallets that may be:
- Compromised by malware
- Exposed through phishing
- Shared accidentally
- At risk of private key exposure

## 📊 Success Rate

The atomic bundle approach provides near-100% success rate when:
- Sufficient gas fees are provided
- Network conditions are stable
- Claim eligibility is verified

## 🤝 Contributing

Found this tool helpful? Consider contributing improvements or reporting issues. Pull requests welcome!

## 💝 Support This Project

If this tool helped you rescue your tokens safely, consider supporting continued development:

**Ethereum/EVM**: `[0x0a8324Ec1204d906C173A604fcE2D500ce20430e]`

Your donations help maintain and improve this tool for the community. Every contribution, no matter the size, is deeply appreciated and helps keep this project alive.

*"Helping the crypto community stay secure, one rescued wallet at a time."*

## ⚡ Quick Start

1. Clone this repository
2. Install dependencies: `npm install ethers @flashbots/ethers-provider-bundle axios dotenv`
3. Configure your `.env` file
4. Run: `node succinct-claim.js`
5. Watch your tokens get rescued safely! 🎉

## 📜 License

MIT License - Feel free to use, modify, and distribute.

---

**Disclaimer**: This tool is for educational and legitimate wallet recovery purposes only. Users are responsible for compliance with applicable laws and regulations. Always verify you have legitimate ownership of wallets and tokens before use.
