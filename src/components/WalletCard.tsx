"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Copy, Check, Wallet, Landmark } from "lucide-react";

interface WalletCardProps {
  walletAddress: string | null;
  walletName: string | null;
  onConnect: () => void;
}

export default function WalletCard({
  walletAddress,
  walletName,
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
          <span>Koneksi Dompet Stellar</span>
          {walletAddress ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800/40">
              <CheckCircle2 className="h-3 w-3" /> Terhubung
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 bg-zinc-800 px-2.5 py-0.5 rounded-full border border-zinc-700/50">
              <AlertCircle className="h-3 w-3" /> Terputus
            </span>
          )}
        </CardTitle>
        <CardDescription className="text-zinc-400 text-sm">
          Hubungkan dompet digital Freighter atau Albedo Anda untuk bertransaksi aman.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {walletAddress ? (
          <div className="space-y-3">
            {/* Display active wallet name */}
            {walletName && (
              <div className="flex justify-between items-center text-xs text-zinc-400 bg-zinc-950/40 p-2 rounded border border-zinc-800/60">
                <span>Selected Wallet:</span>
                <strong className="text-violet-400 font-semibold flex items-center gap-1">
                  <Wallet className="h-3.5 w-3.5" /> {walletName}
                </strong>
              </div>
            )}

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

            <div className="text-xs text-zinc-500 flex flex-col gap-1 pt-1.5 border-t border-zinc-900">
              <div className="flex justify-between">
                <span>Network:</span>
                <span className="text-violet-400 font-semibold font-mono">Testnet</span>
              </div>
              <div className="flex justify-between">
                <span>Soroban RPC Status:</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">Online</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center space-y-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-zinc-950 border border-zinc-800 text-zinc-400 mb-1">
              <Wallet className="h-6 w-6" />
            </div>
            <p className="text-sm text-zinc-400 max-w-xs mx-auto">
              Hubungkan dompet Stellar Anda untuk melihat saldo XLM, membuat patungan baru, dan melunasi tagihan kelompok.
            </p>
            <Button
              onClick={onConnect}
              className="mt-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium shadow-md transition-all duration-200"
            >
              Hubungkan Dompet
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
