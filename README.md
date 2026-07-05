# StellarSplit MVP - Stellar Yellow Belt Challenge (Level 2)

**StellarSplit** is a Global Group Payment platform designed for seamless, cross-border bill splitting using the Stellar blockchain. 

This repository contains the **Level 2 (Yellow Belt) MVP**, integrating a Rust-based Soroban Smart Contract deployed on Stellar Testnet, multi-wallet support (Freighter & Albedo), real-time on-chain transaction logs, contract event streaming, and robust error handling.

---

## ⚡ Deployed Smart Contract Details

- **Soroban Contract ID**: `CCNMXX6V5DZLH3LCJOTRMXWKKGNTUL4677FS4UO7HA4KWNDWD7C4EFNE`
- **Wasm Hash**: `c752993f215b7e7de264941e45f1e75fb8b7901497ea8ced4db824e981c4bba7`
- **Deployment Transaction Hash**: `72e75243e19c2523578f0c7b7fb1c1cb30f0037b88651b413111a166654b7cfd`
- **Stellar Expert URL**: [Transaction 72e75243... on Stellar.Expert](https://stellar.expert/explorer/testnet/tx/72e75243e19c2523578f0c7b7fb1c1cb30f0037b88651b413111a166654b7cfd)
- **Stellar Lab Explorer URL**: [Contract CCNMXX6V... on Stellar Laboratory](https://lab.stellar.org/r/testnet/contract/CCNMXX6V5DZLH3LCJOTRMXWKKGNTUL4677FS4UO7HA4KWNDWD7C4EFNE)

---

## 🌟 Yellow Belt Challenge Features

1. **Soroban Smart Contract**: Wrote a custom Rust Soroban contract implementing:
   - `create_bill(creator, title, total_amount, participants_count)`: Emits a `create` event topic.
   - `get_bill(bill_id)`: Fetches bill details from Soroban instance storage.
   - `pay_bill(bill_id, amount, payer)`: Processes payments, checks boundaries, prevents duplicate pay, and emits `pay` event topic.
2. **On-Chain Error Codes (Panic Handled)**:
   - `BillNotFound` (Error code: 1): Thrown if trying to look up or pay a non-existent bill.
   - `InvalidAmount` (Error code: 2): Thrown if payment amount is zero or bill total amount is invalid.
   - `AlreadyPaid` (Error code: 3): Thrown if the bill is already fully settled.
   - `AmountTooLarge` (Error code: 4): Thrown if payment exceeds the remaining split debt.
3. **Multi-Wallet Support**: Integrated Freighter and Albedo wallets via `@creit.tech/stellar-wallets-kit`, allowing users to select their favorite wallet client via a built-in modal.
4. **Real-time On-Chain Activity Feed**: Streams and displays logs of successful transactions, payouts, and system state changes locally in the dashboard in real-time.
5. **Interactive UI Dashboards**: Includes separate forms for **Create Split Bill** and **Search & Pay Split Bill**, complete with progress bars, fee estimates, transaction statuses, and hashes.

---

## 📸 Required Screenshot Checklist (for Submission)

1. **Wallet Selection Modal**: Show Albedo / Freighter options from Creit Tech's wallet kit modal.
2. **Active Wallet & Public Key**: Show the selected wallet badge (e.g. `Freighter`) next to the masked public address.
3. **Create Bill Transaction**: Show the `success` card showing the new on-chain Bill ID.
4. **Payment Progress**: Show the progress bar updating when paying towards a split bill ID.
5. **Activity Log Feed**: Show real-time logs updating at the bottom of your dashboard.

---

## 🛠️ Tech Stack & Directory Structure

- **Framework**: Next.js 15 (App Router, Tailwind CSS v4)
- **UI Styling**: Tailwind CSS, lucide-react icons, and shadcn/ui primitives
- **Blockchain Libraries**: `@stellar/stellar-sdk` & `@creit.tech/stellar-wallets-kit`
- **Smart Contract Language**: Rust (Soroban SDK v22.0.11)

```
StellarSplit/
├── contracts/
│   └── stellar-split-contract/
│       ├── src/
│       │   └── lib.rs       # Soroban Rust Contract (storage keys, logic, events)
│       └── Cargo.toml       # Cargo settings with target wasm32v1-none
├── src/
│   ├── app/
│   │   ├── globals.css      # Design system rules
│   │   └── page.tsx         # Dashboard layout, state logs, and event managers
│   ├── components/
│   │   ├── Navbar.tsx       # Logo, network state, wallet type, and address
│   │   ├── WalletCard.tsx   # StellarWalletsKit details and connection statuses
│   │   ├── BalanceCard.tsx  # Dynamic XLM balance and skeletal states
│   │   ├── CreateBillForm.tsx # Bill inputs, simulation stages, and success cards
│   │   ├── BillView.tsx     # Query inputs, payment forms, and progress bars
│   │   └── PaymentForm.tsx  # Level 1 native XLM transfer compatibility form
│   └── lib/
│       ├── stellar.ts       # Soroban RPC client, simulation, and transaction builders
│       └── wallet.ts        # StellarWalletsKit static class initializer
```

---

## 🚀 Getting Started

### Prerequisites

For developer contract updates, make sure you have the following preinstalled:
- Rust (toolchain `stable-x86_64-pc-windows-gnu` and target `wasm32v1-none` for Soroban builds)
- [Stellar CLI](https://developers.stellar.org/docs/tools/stellar-cli) (v27+) to compile and deploy.

For users:
- [Freighter Wallet browser extension](https://www.freighter.app/) or [Albedo Wallet account](https://albedo.link/).
- Set Freighter network settings to **Testnet**.

### Run the App Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/hafizandrean/StellarSplit.git
   cd StellarSplit
   ```

2. **Configure Environment Variables:**
   Create a `.env.local` file in the root (matching `.env.local.example`):
   ```env
   NEXT_PUBLIC_CONTRACT_ID=CCNMXX6V5DZLH3LCJOTRMXWKKGNTUL4677FS4UO7HA4KWNDWD7C4EFNE
   NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
   NEXT_PUBLIC_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to test.

5. **Compile production build:**
   ```bash
   npm run build
   ```

---

## 📝 License
Built for educational purposes as part of the Stellar Developer Yellow Belt Certification Challenge (Level 2).
