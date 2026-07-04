"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Wallet, LogOut, Loader2 } from "lucide-react";

interface NavbarProps {
  walletAddress: string | null;
  isConnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export default function Navbar({
  walletAddress,
  isConnecting,
  onConnect,
  onDisconnect,
}: NavbarProps) {
  // Truncate address for display: e.g. GAAA...XXXX
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 text-white font-bold shadow-md shadow-violet-950/20">
              S⚡S
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              StellarSplit
            </span>
            <span className="rounded-full bg-violet-950/60 px-2 py-0.5 text-xs font-semibold text-violet-400 border border-violet-800/50">
              Testnet
            </span>
          </div>

          {/* Connection Button */}
          <div className="flex items-center gap-4">
            {walletAddress ? (
              <div className="flex items-center gap-2">
                <span className="hidden md:inline-block text-xs font-medium text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg font-mono">
                  {formatAddress(walletAddress)}
                </span>
                <Button
                  onClick={onDisconnect}
                  variant="outline"
                  className="gap-2 border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Disconnect</span>
                </Button>
              </div>
            ) : (
              <Button
                onClick={onConnect}
                disabled={isConnecting}
                className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 shadow-md shadow-violet-950/20 font-medium transition-all duration-200"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Wallet className="h-4 w-4" />
                    <span>Connect Wallet</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
