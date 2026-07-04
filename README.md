# StellarSplit MVP - Stellar White Belt Challenge

**StellarSplit** is a future Global Group Payment platform designed for seamless, cross-border bill splitting using the Stellar blockchain. 

This repository contains the **Level 1 (White Belt) MVP** frontend application, demonstrating Freighter Wallet integration, Stellar Testnet Horizon communication, real-time XLM balance retrieval, and instant testnet transactions.

---

## ⚡ White Belt Challenge Features

- **Freighter Wallet Integration**: Automatically detects and hooks into the Freighter browser extension API.
- **Stellar Testnet Connection**: Configured to query and send transactions to the Stellar Horizon Testnet.
- **Connect / Disconnect Wallet**: Simple connect/disconnect flow with active status indicators and key mask displays.
- **Balance Display**: Fetches and displays native XLM balance in real-time, handling loading and unfunded (404) states.
- **Instant Payment Form**: Provides recipient key validation and XLM amount checking, routing payments on-chain.
- **Real-time Transaction Feedback**: Displays clean `idle`, `Sending...`, `Success` (with transaction hash and explorer link), or `Failed` status cards.
- **Error Handling**: Captures and handles Freighter missing, user rejection, network anomalies, invalid public keys, and insufficient funds.

---

## 📸 Required Screenshot Checklist (for Submission)

When submitting this project for your certification, make sure to capture the following states:
1. **Wallet Connected**: Show the connected status badge and the masked wallet public key.
2. **XLM Balance**: Show your active XLM balance in the balance card.
3. **Successful Testnet Transaction**: Show the transaction status card displaying the success checkmark.
4. **Transaction Result & Hash**: Show the exact resulting transaction hash displayed in the status card.

---

## 🛠️ Tech Stack & Directory Structure

- **Framework**: Next.js 15 (App Router, Tailwind CSS v4)
- **UI Styling**: Tailwind CSS, lucide-react icons, and shadcn/ui primitives
- **Blockchain Libraries**: `@stellar/stellar-sdk` & `@stellar/freighter-api`

### Core Project Structure
```
stellarsplit/
├── src/
│   ├── app/
│   │   ├── globals.css      # Design system rules
│   │   └── page.tsx         # Dashboard layout and state controller
│   ├── components/
│   │   ├── Navbar.tsx       # Logo, network state, and connect button
│   │   ├── WalletCard.tsx   # Freighter status, key display, installation warnings
│   │   ├── BalanceCard.tsx  # Dynamic XLM balance, skeletons, and Friendbot funding warning
│   │   ├── PaymentForm.tsx  # Validation, 'Sending...' state, and hash reporting
│   │   └── ui/              # shadcn/ui components (card, input, label, button)
│   └── lib/
│       ├── stellar.ts       # Stellar Horizon fetch & transaction builder
│       └── wallet.ts        # Freighter wallet API integration layer
├── public/
├── package.json
├── tsconfig.json
└── .env.local.example       # Example configuration details
```

---

## 🚀 Getting Started

### Prerequisites

1. Install the [Freighter browser extension](https://www.freighter.app/).
2. Open Freighter, go to **Settings > Network**, and ensure it is set to **Testnet**.
3. Create or import an account in Freighter.
4. If your testnet wallet has 0 XLM, go to the [Stellar Laboratory Friendbot](https://laboratory.stellar.org/#friendbot), paste your public address, and fund it with testnet XLM.

### Run the App Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/hafizandrean/StellarSplit.git
   cd StellarSplit
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to test.

4. **Verify TypeScript and Production Build:**
   ```bash
   npm run build
   ```

---

## 🔮 Future Roadmap (Placeholders only, not in MVP)

- **Smart Split Settlement**: Auto-calculate optimal group settlements on-chain.
- **USDC Payments**: Settle group bills in stable coins to protect against crypto price fluctuations.
- **Cross-border Settlement**: Swap currencies instantly using Stellar anchor bridges.
- **QR Group Payments**: Scan a bill split QR code to join an active dining group instant settlement page.

---

## 📝 License
Built for educational purposes as part of the Stellar Developer White Belt Certification Challenge.
