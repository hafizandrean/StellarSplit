"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import WalletCard from "@/components/WalletCard";
import BalanceCard from "@/components/BalanceCard";
import CreateBillForm from "@/components/CreateBillForm";
import BillView from "@/components/BillView";
import { connectWallet, getConnectedAddress } from "@/lib/wallet";
import { getBalance } from "@/lib/stellar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Layers, Flame, Landmark, QrCode, Terminal, Clock, ShieldCheck, ExternalLink } from "lucide-react";

interface ActivityLog {
  id: string;
  type: "create" | "pay" | "info";
  message: string;
  hash?: string;
  timestamp: Date;
}

export default function Home() {
  // Wallet States
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [connectedWalletName, setConnectedWalletName] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Balance States
  const [balance, setBalance] = useState<string | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);

  // UI Flow States
  const [activeBillId, setActiveBillId] = useState<number | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  // 1. Initial check for active wallet sessions on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const connection = await getConnectedAddress();
        if (connection) {
          setWalletAddress(connection.address);
          setConnectedWalletName(connection.walletName);
          addActivityLog("info", `Reconnected to ${connection.walletName} session: ${connection.address.slice(0, 8)}...`);
        }
      } catch (err) {
        // No active session
      }
    }
    checkSession();
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

  // 3. Connect Wallet click handler (Creit Tech Modal)
  const handleConnect = async () => {
    setIsConnecting(true);
    setBalanceError(null);
    try {
      const connection = await connectWallet();
      setWalletAddress(connection.address);
      setConnectedWalletName(connection.walletName);
      addActivityLog(
        "info",
        `Wallet connected successfully via ${connection.walletName}.`
      );
    } catch (err: any) {
      console.error(err);
      setBalanceError(err.message || "Failed to connect wallet.");
      addActivityLog("info", `Wallet connection failed: ${err.message || "Rejected"}`);
    } finally {
      setIsConnecting(false);
    }
  };

  // 4. Disconnect Wallet handler
  const handleDisconnect = () => {
    setWalletAddress(null);
    setConnectedWalletName(null);
    setBalance(null);
    setBalanceError(null);
    addActivityLog("info", "Wallet disconnected.");
  };

  // 5. Activity Log Helper
  const addActivityLog = (
    type: "create" | "pay" | "info",
    message: string,
    hash?: string
  ) => {
    const log: ActivityLog = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      message,
      hash,
      timestamp: new Date(),
    };
    setActivities((prev) => [log, ...prev]);
  };

  // 6. Callback when bill is successfully created
  const handleBillCreated = (billId: number) => {
    setActiveBillId(billId);
    addActivityLog(
      "create",
      `Created split bill on-chain: ID #${billId}`
    );
    if (walletAddress) {
      fetchUserBalance(walletAddress);
    }
  };

  // 7. Callback when payment succeeds
  const handlePaymentSuccess = (billId: number) => {
    addActivityLog("pay", `Submitted split bill payment towards ID #${billId}`);
    if (walletAddress) {
      fetchUserBalance(walletAddress);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-violet-500 selection:text-white antialiased">
      {/* Navigation */}
      <Navbar
        walletAddress={walletAddress}
        walletName={connectedWalletName}
        isConnecting={isConnecting}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />

      {/* Hero Header */}
      <header className="relative py-16 px-4 overflow-hidden border-b border-zinc-900 bg-radial-[circle_at_top_rgba(124,58,237,0.08)]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-600/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="mx-auto max-w-4xl text-center space-y-6 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-950/40 text-violet-400 border border-violet-900/50">
            ⚡ Soroban Smart Contract integration
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Global Group Payments on{" "}
            <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
              Soroban
            </span>
          </h1>
          <p className="text-zinc-400 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            The future of cross-border bill splitting. This MVP demonstrates Freighter and Albedo connection with live Soroban contract payments.
          </p>
        </div>
      </header>

      {/* Dashboard Area */}
      <main className="flex-grow mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Wallet details & Balances */}
          <div className="lg:col-span-1 space-y-8">
            <WalletCard
              walletAddress={walletAddress}
              walletName={connectedWalletName}
              onConnect={handleConnect}
            />
            <BalanceCard
              balance={balance}
              loading={balanceLoading}
              error={balanceError}
              walletAddress={walletAddress}
            />
          </div>

          {/* Right Column: Forms & Activities */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Create & Pay split forms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <CreateBillForm
                walletAddress={walletAddress}
                onBillCreated={handleBillCreated}
              />
              <BillView
                walletAddress={walletAddress}
                activeBillId={activeBillId}
                onPaymentSuccess={handlePaymentSuccess}
              />
            </div>

            {/* On-Chain Activity Feed Log */}
            <Card className="border-zinc-800 bg-zinc-900/30 backdrop-blur-md">
              <CardHeader className="py-4">
                <CardTitle className="text-md font-semibold text-white flex items-center gap-2">
                  <Terminal className="h-4.5 w-4.5 text-cyan-400" />
                  <span>Real-time On-Chain Activity Feed</span>
                </CardTitle>
                <CardDescription className="text-xs text-zinc-500">
                  Logs transactions and events emitted by the Soroban contract.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                <div className="bg-zinc-950/80 border border-zinc-900 rounded-lg p-3 h-48 overflow-y-auto font-mono text-xs text-zinc-400 space-y-2 select-text">
                  {activities.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-zinc-600 text-center text-xs">
                      No transactions submitted yet in this session.
                    </div>
                  ) : (
                    activities.map((log) => (
                      <div
                        key={log.id}
                        className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-900/60 pb-1.5 last:border-none"
                      >
                        <div className="flex items-start gap-2 max-w-xl">
                          <span className="text-[10px] text-zinc-600 shrink-0 mt-0.5 flex items-center gap-0.5">
                            <Clock className="h-3 w-3" />
                            {log.timestamp.toLocaleTimeString()}
                          </span>
                          <span>
                            {log.type === "create" && (
                              <span className="text-violet-400 font-semibold mr-1.5">[Create]</span>
                            )}
                            {log.type === "pay" && (
                              <span className="text-cyan-400 font-semibold mr-1.5">[Pay]</span>
                            )}
                            {log.type === "info" && (
                              <span className="text-zinc-500 font-semibold mr-1.5">[System]</span>
                            )}
                            {log.message}
                          </span>
                        </div>
                        {log.hash && (
                          <a
                            href={`https://stellar.expert/explorer/testnet/tx/${log.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-zinc-500 hover:text-cyan-400 transition-all font-mono break-all md:text-right mt-1 md:mt-0 flex items-center gap-0.5"
                          >
                            <span>tx:{log.hash.slice(0, 6)}...</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>

        {/* Future Features */}
        <section className="border-t border-zinc-900 pt-16 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Roadmap Enhancements
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto">
              Features details to evolve StellarSplit into a fully automated global group expense solution.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            <div className="rounded-xl border border-zinc-900 bg-zinc-900/10 p-5 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-zinc-950 border border-zinc-800 text-violet-400 flex items-center justify-center">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-white text-base">Smart Split Settlement</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Automate complex bill splits, track balances, and settle multiple balances with optimized, single-transaction routing.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-900 bg-zinc-900/10 p-5 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-zinc-950 border border-zinc-800 text-fuchsia-400 flex items-center justify-center">
                <Flame className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-white text-base">USDC Payments</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Settle group expenses in dollar-backed stablecoins. Avoid cryptocurrency market fluctuations during settlement.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-900 bg-zinc-900/10 p-5 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-zinc-950 border border-zinc-800 text-indigo-400 flex items-center justify-center">
                <Landmark className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-white text-base">Cross-border Settlement</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Instantly clear debts across international borders using Stellar asset anchors without high banking fees.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-900 bg-zinc-900/10 p-5 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-zinc-950 border border-zinc-800 text-cyan-400 flex items-center justify-center">
                <QrCode className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-white text-base">QR Group Payments</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Scan dynamic QR codes at restaurants, retail stores, or events to instantly join an active dining group.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-8 text-center text-xs text-zinc-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-2">
          <p>© {new Date().getFullYear()} StellarSplit MVP. All rights reserved.</p>
          <p className="text-zinc-600 font-medium">Built for Stellar Yellow Belt Challenge (Level 2).</p>
        </div>
      </footer>
    </div>
  );
}
