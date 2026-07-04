"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { sendPayment } from "@/lib/stellar";
import { Send, Loader2, CheckCircle2, XCircle, ExternalLink, ArrowRight } from "lucide-react";

interface PaymentFormProps {
  walletAddress: string | null;
  onPaymentSuccess: () => void;
}

type TxState = "idle" | "sending" | "success" | "error";

export default function PaymentForm({
  walletAddress,
  onPaymentSuccess,
}: PaymentFormProps) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [txState, setTxState] = useState<TxState>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quick inputs for easy testing
  const setQuickAmount = (val: string) => {
    setAmount(val);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress) return;

    // Reset state
    setErrorMsg(null);
    setTxHash(null);
    setTxState("sending");

    // Validations
    const trimmedRecipient = recipient.trim();
    if (trimmedRecipient.length !== 56 || !trimmedRecipient.startsWith("G")) {
      setErrorMsg("Recipient address must be a valid 56-character Stellar public key starting with 'G'.");
      setTxState("error");
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg("Amount must be a positive number greater than 0.");
      setTxState("error");
      return;
    }

    try {
      // Execute the payment via Stellar Horizons and Freighter API
      const hash = await sendPayment(walletAddress, trimmedRecipient, amount);
      
      setTxHash(hash);
      setTxState("success");
      setRecipient("");
      setAmount("");
      
      // Trigger balance update in parent page
      onPaymentSuccess();
    } catch (err: any) {
      console.error("Payment failed", err);
      setErrorMsg(err.message || "Failed to submit transaction.");
      setTxState("error");
    }
  };

  return (
    <Card className="border-zinc-800 bg-zinc-900/40 backdrop-blur-md text-zinc-100 shadow-xl overflow-hidden relative md:col-span-2">
      {/* Decorative top gradient border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500" />
      
      <CardHeader>
        <CardTitle className="text-lg font-semibold tracking-tight text-white flex items-center justify-between">
          <span>Send Instant Stellar Payment</span>
          <Send className="h-4 w-4 text-violet-400" />
        </CardTitle>
        <CardDescription className="text-zinc-400 text-sm">
          Transfer native XLM directly to any Stellar public key on Testnet.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSend}>
        <CardContent className="space-y-4">
          {/* Recipient Address */}
          <div className="space-y-2">
            <Label htmlFor="recipient" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Recipient Address
            </Label>
            <Input
              id="recipient"
              placeholder="e.g. GBM7Y... or GD3F..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              disabled={!walletAddress || txState === "sending"}
              className="bg-zinc-950/80 border-zinc-800 text-zinc-100 placeholder-zinc-600 font-mono text-sm focus-visible:ring-violet-500"
              required
            />
          </div>

          {/* Amount (XLM) */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="amount" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Amount (XLM)
              </Label>
              <div className="flex gap-1.5">
                {["1", "10", "100"].map((quickVal) => (
                  <button
                    key={quickVal}
                    type="button"
                    onClick={() => setQuickAmount(quickVal)}
                    disabled={!walletAddress || txState === "sending"}
                    className="text-[10px] font-bold text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-2 py-0.5 rounded transition-all"
                  >
                    {quickVal} XLM
                  </button>
                ))}
              </div>
            </div>
            <Input
              id="amount"
              type="number"
              step="any"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={!walletAddress || txState === "sending"}
              className="bg-zinc-950/80 border-zinc-800 text-zinc-100 placeholder-zinc-600 font-mono text-sm focus-visible:ring-violet-500"
              required
            />
          </div>

          {/* Transaction Feedback States */}
          {txState === "sending" && (
            <div className="rounded-lg border border-indigo-950 bg-indigo-950/30 p-3.5 text-indigo-300 text-sm flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-indigo-400 shrink-0" />
              <div>
                <p className="font-semibold text-indigo-200">Transaction Status: Sending...</p>
                <p className="text-xs text-indigo-400/90">
                  Please authorize the transaction in your Freighter Wallet pop-up window.
                </p>
              </div>
            </div>
          )}

          {txState === "success" && txHash && (
            <div className="rounded-lg border border-emerald-950 bg-emerald-950/20 p-4 text-emerald-300 text-sm space-y-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <p className="font-bold text-emerald-200">Transaction Successful!</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-emerald-400/90 font-mono break-all bg-zinc-950/60 p-2 rounded border border-emerald-950/50">
                  Hash: {txHash}
                </p>
                <div className="flex justify-between items-center pt-1">
                  <a
                    href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline transition-all"
                  >
                    <span>View on Stellar Expert</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setTxState("idle")}
                    className="text-xs font-bold text-zinc-400 hover:text-white transition-all"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {txState === "error" && errorMsg && (
            <div className="rounded-lg border border-red-950 bg-red-950/20 p-4 text-red-300 text-sm space-y-2">
              <div className="flex items-center gap-2.5">
                <XCircle className="h-5 w-5 text-red-400 shrink-0" />
                <p className="font-bold text-red-200">Transaction Failed</p>
              </div>
              <p className="text-xs text-red-400/90 leading-relaxed bg-zinc-950/60 p-2.5 rounded border border-red-950/50">
                {errorMsg}
              </p>
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setTxState("idle")}
                  className="text-xs font-bold text-zinc-400 hover:text-white transition-all"
                >
                  Clear Error
                </button>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-2 border-t border-zinc-800 bg-zinc-950/30">
          <Button
            type="submit"
            disabled={!walletAddress || txState === "sending"}
            className="w-full gap-2 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 hover:from-violet-500 hover:via-fuchsia-500 hover:to-pink-500 text-white font-semibold transition-all duration-200"
          >
            {txState === "sending" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Signing & Submitting...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Send Payment</span>
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
