# StellarSplit Level 2 (Yellow Belt) Upgrade Checklist

- [x] **1. Smart Contract Development**
  - [x] Set up Rust Cargo configuration in `contracts/stellar-split-contract`
  - [x] Implement `DataKey` enum for clean storage keys
  - [x] Implement `Bill` struct (`id`, `creator`, `title`, `total_amount`, `paid_amount`, `participants_count`, `created_at`, `is_paid`)
  - [x] Implement `create_bill` with validations (`total_amount > 0`, `participants_count > 0`, `title.len() <= 64`)
  - [x] Implement `get_bill` returning `Bill` or `BillNotFound` error
  - [x] Implement `pay_bill` with checks (auth, non-zero amount, paid state, overflow protection, write back to storage)
  - [x] Emit detailed event topics and payloads (`create_bill`, `pay_bill`)

- [x] **2. Setup Stellar CLI & Deploy Contract**
  - [x] Download and extract `stellar-cli` Windows binary locally
  - [x] Compile Rust smart contract using `stellar contract build`
  - [x] Deploy contract to Testnet using local `stellar-cli`
  - [x] Store `NEXT_PUBLIC_CONTRACT_ID` in `.env.local`

- [x] **3. Wallet Integration (Freighter & Albedo)**
  - [x] Install `@creit.tech/stellar-wallets-kit`
  - [x] Update `src/lib/wallet.ts` to initialize and wrap the kit

- [x] **4. Soroban SDK Integration**
  - [x] Update `src/lib/stellar.ts` to initialize Soroban RPC client
  - [x] Implement `createBillOnChain` calling the contract
  - [x] Implement `getBillFromChain` calling the contract
  - [x] Implement `payBillOnChain` calling the contract
  - [x] Implement event parsing from RPC transaction details

- [x] **5. Frontend UI Upgrades**
  - [x] Create `CreateBillForm.tsx` component
  - [x] Create `BillView.tsx` component
  - [x] Update `src/app/page.tsx` to mount forms and include the real-time event activity feed
  - [x] Provide clear transaction feedback states (Pending -> Success/Failed, Hash, Testnet Explorer link)
  - [x] Handle 3 error types: wallet connection missing, invalid inputs, transaction rejected/failed

- [x] **6. Final Verification & Documentation**
  - [x] Verify production Next.js compilation (`npm run build`)
  - [x] Update `README.md` with Level 2 instructions, contract address, transaction hash, and prerequisites
  - [x] Generate `walkthrough.md` with implementation summary
