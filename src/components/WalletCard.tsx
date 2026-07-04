"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Copy, Check, ExternalLink, Wallet } from "lucide-react";

interface WalletCardProps {
  walletAddress: string | null;
  isFreighterInstalled: boolean;
  onConnect: () => void;
}

export default function WalletCard({
  walletAddress,
  isFreighterInstalled,
  onConnect,
}: WalletCardProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-zinc-800 bg-zinc-900/40 backdrop-blur-md text-zinc-100 shadow-xl overflow-hidden relative">
      {/* Decorative top gradient border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-500" />
      
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold tracking-tight text-white flex items-center justify-between">
          <span>Freighter Wallet</span>
          {walletAddress ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">
              <CheckCircle2 className="h-3 w-3" /> Connected
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-700/50">
              <AlertCircle className="h-3 w-3" /> Disconnected
            </span>
          )}
        </CardTitle>
        <CardDescription className="text-zinc-400 text-sm">
          Stellar blockchain connection and configuration
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* If Freighter is not installed */}
        {!isFreighterInstalled && (
          <div className="rounded-lg border border-amber-950/40 bg-amber-950/20 p-3.5 text-amber-200 text-sm flex gap-3 leading-relaxed">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
            <div className="space-y-2">
              <p className="font-semibold text-amber-300">Freighter Extension Not Detected</p>
              <p className="text-xs text-amber-400/90">
                To sign Stellar transactions, you need the Freighter browser extension installed and set to Testnet.
              </p>
              <a
                href="https://www.freighter.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 hover:text-amber-200 hover:underline transition-all mt-1"
              >
                <span>Install Freighter Wallet</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        )}

        {/* Connection status and address display */}
        {walletAddress ? (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
                Active Public Key
              </span>
              <div className="flex items-center justify-between gap-2 bg-zinc-950/80 p-2.5 rounded-lg border border-zinc-800/80">
                <span className="text-xs font-mono break-all text-zinc-300 select-all pr-2">
                  {walletAddress}
                </span>
                <Button
                  onClick={copyToClipboard}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-zinc-800 text-zinc-400 hover:text-white shrink-0"
                  title="Copy address"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="text-xs text-zinc-500 flex items-center justify-between">
              <span>Network: <strong className="text-violet-400 font-medium">Stellar Testnet</strong></span>
              <span>Horizon Server Status: <strong className="text-emerald-400 font-medium">Online</strong></span>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center space-y-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-zinc-950 border border-zinc-800 text-zinc-400 mb-1">
              <Wallet className="h-6 w-6" />
            </div>
            <p className="text-sm text-zinc-400 max-w-xs mx-auto">
              Please connect your Freighter Wallet to fetch your XLM balance and send transactions.
            </p>
            {isFreighterInstalled && (
              <Button
                onClick={onConnect}
                className="mt-2 bg-zinc-800 border border-zinc-700 text-zinc-200 hover:bg-zinc-700 hover:text-white transition-all font-medium"
              >
                Connect Wallet
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
