"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, AlertCircle, ExternalLink } from "lucide-react";

interface BalanceCardProps {
  balance: string | null;
  loading: boolean;
  error: string | null;
  walletAddress: string | null;
}

export default function BalanceCard({
  balance,
  loading,
  error,
  walletAddress,
}: BalanceCardProps) {
  // Format XLM balance to nice decimals: e.g. 10,000.00
  const formatBalance = (bal: string | null) => {
    if (!bal) return "0.0000";
    const parsed = parseFloat(bal);
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(parsed);
  };

  return (
    <Card className="border-zinc-800 bg-zinc-900/40 backdrop-blur-md text-zinc-100 shadow-xl overflow-hidden relative">
      {/* Decorative top gradient border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-600" />

      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold tracking-tight text-white flex items-center justify-between">
          <span>Stellar Account Balance</span>
          <Coins className="h-5 w-5 text-indigo-400" />
        </CardTitle>
        <CardDescription className="text-zinc-400 text-sm">
          Available funds in native XLM asset
        </CardDescription>
      </CardHeader>

      <CardContent>
        {!walletAddress ? (
          <div className="py-6 text-center space-y-2">
            <div className="text-3xl font-bold tracking-tight text-zinc-600 font-mono">
              --.---- XLM
            </div>
            <p className="text-xs text-zinc-500">
              Connect your wallet to retrieve balance
            </p>
          </div>
        ) : loading ? (
          <div className="py-6 space-y-3">
            {/* Balance Loading Skeleton */}
            <div className="h-9 w-40 bg-zinc-800 rounded-md animate-pulse mx-auto" />
            <div className="h-4 w-48 bg-zinc-800 rounded-md animate-pulse mx-auto" />
          </div>
        ) : error ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-red-950/40 bg-red-950/20 p-3.5 text-red-200 text-sm flex gap-3 leading-relaxed">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
              <div className="space-y-2">
                <p className="font-semibold text-red-300">Balance Error</p>
                <p className="text-xs text-red-400/90">{error}</p>
                
                {/* Show Friendbot funding link if it's an unfunded account error */}
                {error.includes("Friendbot") && (
                  <a
                    href="https://laboratory.stellar.org/#friendbot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-red-300 hover:text-red-200 hover:underline transition-all mt-1"
                  >
                    <span>Go to Stellar Laboratory Friendbot</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center space-y-2">
            <div className="text-4xl font-black tracking-tight text-white font-mono bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              {formatBalance(balance)} <span className="text-xl font-bold text-indigo-400 font-sans">XLM</span>
            </div>
            <div className="text-xs text-zinc-500">
              100% Native Lumens
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
