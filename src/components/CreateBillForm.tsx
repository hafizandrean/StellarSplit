"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createBillOnChain } from "@/lib/stellar";
import { FilePlus, Loader2, CheckCircle2, XCircle, ExternalLink, Users, Coins } from "lucide-react";

interface CreateBillFormProps {
  walletAddress: string | null;
  onBillCreated: (billId: number) => void;
}

type TxState = "idle" | "pending" | "success" | "error";

export default function CreateBillForm({
  walletAddress,
  onBillCreated,
}: CreateBillFormProps) {
  const [title, setTitle] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [participants, setParticipants] = useState("2");
  
  const [txState, setTxState] = useState<TxState>("idle");
  const [statusMsg, setStatusMsg] = useState("");
  const [createdBillId, setCreatedBillId] = useState<number | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress) return;

    // Reset state
    setErrorMsg(null);
    setCreatedBillId(null);
    setTxHash(null);
    setTxState("pending");
    setStatusMsg("Validating inputs...");

    // Front-end validations
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setErrorMsg("Bill title cannot be empty.");
      setTxState("error");
      return;
    }
    if (trimmedTitle.length > 64) {
      setErrorMsg("Bill title must be 64 characters or less.");
      setTxState("error");
      return;
    }

    const numAmount = parseFloat(totalAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg("Total Amount must be a positive number greater than 0.");
      setTxState("error");
      return;
    }

    const numParticipants = parseInt(participants);
    if (isNaN(numParticipants) || numParticipants <= 0) {
      setErrorMsg("Number of participants must be at least 1.");
      setTxState("error");
      return;
    }

    try {
      // Execute create bill on-chain
      const { hash, billId } = await createBillOnChain(
        walletAddress,
        trimmedTitle,
        numAmount,
        numParticipants,
        (status) => setStatusMsg(status)
      );

      setTxHash(hash);
      setCreatedBillId(billId);
      setTxState("success");
      
      // Reset form fields
      setTitle("");
      setTotalAmount("");
      setParticipants("2");

      // Notify parent to fetch or show new details
      onBillCreated(billId);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to create bill.");
      setTxState("error");
    }
  };

  return (
    <Card className="border-zinc-800 bg-zinc-900/40 backdrop-blur-md text-zinc-100 shadow-xl overflow-hidden relative">
      {/* Decorative top gradient border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-500" />
      
      <CardHeader>
        <CardTitle className="text-lg font-semibold tracking-tight text-white flex items-center justify-between">
          <span>Create New Split Bill</span>
          <FilePlus className="h-4 w-4 text-violet-400" />
        </CardTitle>
        <CardDescription className="text-zinc-400 text-sm">
          Register a new expense split directly in the Soroban smart contract.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Bill Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Bill Title
            </Label>
            <Input
              id="title"
              placeholder="e.g. Dinner at Sushi Hiro"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={!walletAddress || txState === "pending"}
              className="bg-zinc-950/80 border-zinc-800 text-zinc-100 placeholder-zinc-600 focus-visible:ring-violet-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Total Amount */}
            <div className="space-y-2">
              <Label htmlFor="totalAmount" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <Coins className="h-3 w-3 text-zinc-500" /> Total Amount (XLM)
              </Label>
              <Input
                id="totalAmount"
                type="number"
                step="any"
                placeholder="0.00"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                disabled={!walletAddress || txState === "pending"}
                className="bg-zinc-950/80 border-zinc-800 text-zinc-100 placeholder-zinc-600 font-mono text-sm focus-visible:ring-violet-500"
                required
              />
            </div>

            {/* Participants */}
            <div className="space-y-2">
              <Label htmlFor="participants" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <Users className="h-3 w-3 text-zinc-500" /> Participants
              </Label>
              <Input
                id="participants"
                type="number"
                min="1"
                value={participants}
                onChange={(e) => setParticipants(e.target.value)}
                disabled={!walletAddress || txState === "pending"}
                className="bg-zinc-950/80 border-zinc-800 text-zinc-100 placeholder-zinc-600 font-mono text-sm focus-visible:ring-violet-500"
                required
              />
            </div>
          </div>

          {/* Share calculation preview */}
          {parseFloat(totalAmount) > 0 && parseInt(participants) > 0 && (
            <div className="bg-zinc-950/50 rounded-lg p-2.5 border border-zinc-800/60 text-xs text-zinc-400 flex justify-between items-center">
              <span>Estimated Share per Person:</span>
              <span className="font-semibold text-white font-mono">
                {(parseFloat(totalAmount) / parseInt(participants)).toFixed(4)} XLM
              </span>
            </div>
          )}

          {/* Pending Status Feedback */}
          {txState === "pending" && (
            <div className="rounded-lg border border-indigo-950 bg-indigo-950/20 p-3 text-indigo-300 text-sm flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-indigo-400 shrink-0" />
              <div>
                <p className="font-semibold text-indigo-200">Processing Transaction...</p>
                <p className="text-[11px] text-indigo-400/90">{statusMsg}</p>
              </div>
            </div>
          )}

          {/* Success Status Feedback */}
          {txState === "success" && createdBillId !== null && txHash && (
            <div className="rounded-lg border border-emerald-950 bg-emerald-950/20 p-4 text-emerald-300 text-sm space-y-2.5">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <p className="font-bold text-emerald-200">Bill Created Successfully!</p>
              </div>
              <div className="space-y-1.5 text-xs">
                <p className="text-zinc-300">
                  Bill ID: <strong className="text-emerald-400 font-mono">#{createdBillId}</strong>
                </p>
                <p className="text-emerald-400/90 font-mono break-all bg-zinc-950/60 p-2 rounded border border-emerald-950/30">
                  Hash: {txHash}
                </p>
                <div className="flex justify-between items-center pt-1">
                  <a
                    href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline transition-all"
                  >
                    <span>View transaction</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setTxState("idle")}
                    className="font-bold text-zinc-400 hover:text-white"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Error Status Feedback */}
          {txState === "error" && errorMsg && (
            <div className="rounded-lg border border-red-950 bg-red-950/20 p-4 text-red-300 text-sm space-y-2">
              <div className="flex items-center gap-2.5">
                <XCircle className="h-5 w-5 text-red-400 shrink-0" />
                <p className="font-bold text-red-200">Transaction Failed</p>
              </div>
              <p className="text-xs text-red-400/90 leading-relaxed bg-zinc-950/60 p-2.5 rounded border border-red-950/30 font-mono">
                {errorMsg}
              </p>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setTxState("idle")}
                  className="text-xs font-bold text-zinc-400 hover:text-white"
                >
                  Clear Error
                </button>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-2 border-t border-zinc-800 bg-zinc-950/20">
          <Button
            type="submit"
            disabled={!walletAddress || txState === "pending"}
            className="w-full gap-2 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:from-violet-500 hover:via-indigo-500 hover:to-cyan-500 text-white font-semibold transition-all duration-200"
          >
            {txState === "pending" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Simulating & Signing...</span>
              </>
            ) : (
              <>
                <FilePlus className="h-4 w-4" />
                <span>Create Bill</span>
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
