# ChainSpace — Smart Contract Studio

A beautiful, interactive Ethereum DApp built with **Next.js + ethers.js + Solidity + Hardhat**.

The project started as a small ethers.js learning repository and has been upgraded into a polished smart-contract playground with wallet telemetry, contract writes, transaction receipts, events, token transfers and on-chain voting.

## ✨ Features

- 🦊 MetaMask wallet connection
- 🌐 Network detection + Sepolia network validation
- 💰 Live ETH balance
- ✍️ Greeter read/write interaction
- 📡 `GreetingChanged` event history
- 🪙 Token balance + token transfer
- 🗳️ On-chain voting
- ⛓️ Transaction hash, block number and gas used
- 🔎 Etherscan transaction links on Sepolia
- 🧪 Hardhat contract tests
- 🧊 3D/glass/neon responsive interface
- 🔐 No wallet private keys in frontend code
- 🚀 Vercel-ready production configuration

## Tech stack

- Next.js 10
- React 17
- ethers.js 5
- Solidity 0.8.4
- Hardhat 2
- Tailwind CSS 2
- MetaMask

The dependency versions intentionally remain close to the original repository so the existing learning material stays compatible. The build script compiles contracts before building Next.js so frontend ABI artifacts are available.

## 1. Install

```powershell
npm install
```

If PowerShell blocks the legacy Next.js/OpenSSL combination on a modern Node version:

```powershell
$env:NODE_OPTIONS="--openssl-legacy-provider"
npm run dev
```

## 2. Run local blockchain

Terminal 1:

```powershell
npx hardhat node
```

Keep this terminal running.

## 3. Deploy locally

Terminal 2:

```powershell
npm run deploy:local
```

The deployment script prints the addresses for all contracts.

For the frontend, the local contract addresses can be provided through
`.env.local`. The app includes the standard Hardhat deployment addresses
as local fallbacks, but updating `.env.local` is recommended after a fresh
deployment.

Example:

```env
NEXT_PUBLIC_CHAIN_ID=1337
NEXT_PUBLIC_NETWORK_NAME=Hardhat Local
NEXT_PUBLIC_GREETER_ADDRESS=0x...
NEXT_PUBLIC_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_VOTING_ADDRESS=0x...
NEXT_PUBLIC_EXPLORER_URL=
```

## 4. Start the DApp

```powershell
$env:NODE_OPTIONS="--openssl-legacy-provider"
npm run dev
```

Open:

```text
http://localhost:3000
```

Add Hardhat Local to MetaMask:

```text
Network name: Hardhat Local
RPC URL: http://127.0.0.1:8545
Chain ID: 1337
Currency symbol: ETH
```

Import one of the development accounts printed by Hardhat.

**Never use a Hardhat development private key with real funds.**

## 5. Test contracts

```powershell
npm test
```

Compile only:

```powershell
npm run compile
```

## 6. Sepolia deployment

Create a local `.env` file:

```env
SEPOLIA_RPC_URL=YOUR_SEPOLIA_RPC_URL
DEPLOYER_PRIVATE_KEY=YOUR_SEPOLIA_PRIVATE_KEY
```

Never commit `.env`.

Then:

```powershell
npm run deploy:sepolia
```

Copy the printed contract addresses into `.env.local`:

```env
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_NETWORK_NAME=Sepolia
NEXT_PUBLIC_GREETER_ADDRESS=0x...
NEXT_PUBLIC_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_VOTING_ADDRESS=0x...
NEXT_PUBLIC_EXPLORER_URL=https://sepolia.etherscan.io
```

The deployment wallet only needs Sepolia test ETH for gas.

## 7. Production build

```powershell
npm run build
```

The build first runs:

```text
hardhat compile
```

and then:

```text
next build
```

This ensures `Components/artifacts` exists when the frontend imports contract ABIs.

## 8. Vercel

Import the GitHub repository into Vercel.

Set these Vercel environment variables for Production
(and Preview if you want preview deployments to use Sepolia):

```text
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_NETWORK_NAME=Sepolia
NEXT_PUBLIC_GREETER_ADDRESS=<deployed address>
NEXT_PUBLIC_TOKEN_ADDRESS=<deployed address>
NEXT_PUBLIC_VOTING_ADDRESS=<deployed address>
NEXT_PUBLIC_EXPLORER_URL=https://sepolia.etherscan.io
```

Do **not** add `DEPLOYER_PRIVATE_KEY` to the frontend environment. It is not needed by the browser.

After changing Vercel environment variables, redeploy the project.

## 9. Git

```powershell
git init
git add .
git commit -m "feat: build ChainSpace smart contract studio"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## Security

- `.env` is ignored.
- Never commit wallet seed phrases or private keys.
- Never put a deployer private key in `NEXT_PUBLIC_*`.
- Browser-side code uses MetaMask as the signer.
- If an RPC provider credential was previously committed, rotate it before publishing the repository.

## Project structure

```text
SmartContracts/
├── Components/
│   ├── HomePage.jsx
│   ├── artifacts/
│   └── examples/
├── contracts/
│   ├── BankAccount.sol
│   ├── CounterContract.sol
│   ├── DocumentRegistry.sol
│   ├── Greeter.sol
│   ├── ToDoContract.sol
│   ├── Token.sol
│   ├── Voting.sol
│   └── Wallet.sol
├── pages/
│   ├── _app.js
│   └── index.js
├── scripts/
│   └── deploy.js
├── styles/
│   └── globals.css
├── test/
│   ├── CounterContract.js
│   ├── Greeter.js
│   ├── Token.js
│   └── Voting.js
├── .env.example
├── hardhat.config.js
├── next.config.js
├── package.json
└── tailwind.config.js
```

## License

This project is licensed under the MIT License.

Copyright (c) 2026 Pratyush Bhattacharya

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.