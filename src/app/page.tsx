"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import WalletCard from "@/components/WalletCard";
import BalanceCard from "@/components/BalanceCard";
import PaymentForm from "@/components/PaymentForm";
import { isFreighterInstalled, connectWallet, getActivePublicKey } from "@/lib/wallet";
import { getBalance } from "@/lib/stellar";
import { Flame, Landmark, Layers, QrCode } from "lucide-react";

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isWalletInstalled, setIsWalletInstalled] = useState(true);

  const [balance, setBalance] = useState<string | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);

  // 1. Initial check for Freighter extension and active session
  useEffect(() => {
    async function checkFreighter() {
      const installed = await isFreighterInstalled();
      setIsWalletInstalled(installed);

      if (installed) {
        // If installed, check if they are already connected/unlocked
        const activeKey = await getActivePublicKey();
        if (activeKey) {
          setWalletAddress(activeKey);
        }
      }
    }
    checkFreighter();
  }, []);

  // 2. Fetch balance when walletAddress changes
  useEffect(() => {
    if (walletAddress) {
      fetchUserBalance(walletAddress);
    } else {
      setBalance(null);
      setBalanceError(null);
    }
  }, [walletAddress]);

  const fetchUserBalance = async (address: string) => {
    setBalanceLoading(true);
    setBalanceError(null);
    try {
      const bal = await getBalance(address);
      setBalance(bal);
    } catch (err: any) {
      console.error(err);
      setBalanceError(err.message || "Failed to load balance.");
    } finally {
      setBalanceLoading(false);
    }
  };

  // 3. Connect Wallet click handler
  const handleConnect = async () => {
    setIsConnecting(true);
    setBalanceError(null);
    try {
      const address = await connectWallet();
      setWalletAddress(address);
    } catch (err: any) {
      console.error(err);
      // If error message indicates Freighter is not installed, update state
      if (err.message?.includes("not installed")) {
        setIsWalletInstalled(false);
      }
      setBalanceError(err.message || "Failed to connect wallet.");
    } finally {
      setIsConnecting(false);
    }
  };

  // 4. Disconnect Wallet handler
  const handleDisconnect = () => {
    setWalletAddress(null);
    setBalance(null);
    setBalanceError(null);
  };

  // 5. Callback when payment completes successfully
  const handlePaymentSuccess = () => {
    if (walletAddress) {
      // Automatically refresh the balance
      fetchUserBalance(walletAddress);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-violet-500 selection:text-white antialiased">
      {/* Navigation */}
      <Navbar
        walletAddress={walletAddress}
        isConnecting={isConnecting}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />

      {/* Hero Section */}
      <header className="relative py-20 px-4 overflow-hidden border-b border-zinc-900 bg-radial-[circle_at_top_rgba(124,58,237,0.08)]">
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-10 left-1/3 w-72 h-72 bg-indigo-600/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="mx-auto max-w-4xl text-center space-y-6 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-950/40 text-violet-400 border border-violet-900/50">
            ⚡ Stellar White Belt MVP
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Global Group Payments on{" "}
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
              Stellar
            </span>
          </h1>
          <p className="text-zinc-400 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            The future of cross-border bill splitting. This MVP demonstrates secure wallet connection and instant Stellar payments.
          </p>
        </div>
      </header>

      {/* Main Content / Dashboard */}
      <main className="flex-grow mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Wallet Status & Balance */}
          <div className="md:col-span-1 space-y-8">
            <WalletCard
              walletAddress={walletAddress}
              isFreighterInstalled={isWalletInstalled}
              onConnect={handleConnect}
            />
            <BalanceCard
              balance={balance}
              loading={balanceLoading}
              error={balanceError}
              walletAddress={walletAddress}
            />
          </div>

          {/* Right Column: Payment Form */}
          <div className="md:col-span-2">
            <PaymentForm
              walletAddress={walletAddress}
              onPaymentSuccess={handlePaymentSuccess}
            />
          </div>
        </div>

        {/* Future Features Showcase */}
        <section className="mt-20 border-t border-zinc-900 pt-16 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Future Roadmap Features
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto">
              Upcoming enhancements to evolve StellarSplit into a fully-featured global group bill splitting platform.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            {/* Feature 1 */}
            <div className="rounded-xl border border-zinc-900 bg-zinc-900/10 p-5 hover:border-zinc-800/80 hover:bg-zinc-900/20 transition-all duration-300 space-y-3 group">
              <div className="h-10 w-10 rounded-lg bg-zinc-950 border border-zinc-800 text-violet-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-white text-base">Smart Split Settlement</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Automate complex bill splits, track who owes whom, and settle multiple balances with optimized, single-transaction routing.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-xl border border-zinc-900 bg-zinc-900/10 p-5 hover:border-zinc-800/80 hover:bg-zinc-900/20 transition-all duration-300 space-y-3 group">
              <div className="h-10 w-10 rounded-lg bg-zinc-950 border border-zinc-800 text-fuchsia-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Flame className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-white text-base">USDC Payments</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Settle group expenses in dollar-backed stablecoins. Avoid cryptocurrency market fluctuations during settlement periods.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-xl border border-zinc-900 bg-zinc-900/10 p-5 hover:border-zinc-800/80 hover:bg-zinc-900/20 transition-all duration-300 space-y-3 group">
              <div className="h-10 w-10 rounded-lg bg-zinc-950 border border-zinc-800 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Landmark className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-white text-base">Cross-border Settlement</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Instantly clear debts across international borders using Stellar asset anchors without expensive traditional banking transfer fees.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-xl border border-zinc-900 bg-zinc-900/10 p-5 hover:border-zinc-800/80 hover:bg-zinc-900/20 transition-all duration-300 space-y-3 group">
              <div className="h-10 w-10 rounded-lg bg-zinc-950 border border-zinc-800 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <QrCode className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-white text-base">QR Group Payments</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Scan dynamic QR codes at restaurants, retail stores, or events to instantly add all attendees to a split group page.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-8 text-center text-xs text-zinc-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-2">
          <p>© {new Date().getFullYear()} StellarSplit MVP. All rights reserved.</p>
          <p className="text-zinc-600 font-medium">Built for Stellar White Belt Challenge.</p>
        </div>
      </footer>
    </div>
  );
}
