"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getBillFromChain, payBillOnChain, BillData } from "@/lib/stellar";
import { Search, Loader2, CheckCircle2, AlertTriangle, XCircle, ExternalLink, Calendar, User, ArrowUpRight } from "lucide-react";

interface BillViewProps {
  walletAddress: string | null;
  activeBillId: number | null;
  onPaymentSuccess: () => void;
}

type SearchState = "idle" | "loading" | "found" | "not_found";
type PayState = "idle" | "pending" | "success" | "error";

export default function BillView({
  walletAddress,
  activeBillId,
  onPaymentSuccess,
}: BillViewProps) {
  // Search State
  const [searchId, setSearchId] = useState("");
  const [searchState, setSearchState] = useState<SearchState>("idle");
  const [searchError, setSearchError] = useState<string | null>(null);
  const [bill, setBill] = useState<BillData | null>(null);

  // Pay State
  const [payAmount, setPayAmount] = useState("");
  const [payState, setPayState] = useState<PayState>("idle");
  const [payStatusMsg, setPayStatusMsg] = useState("");
  const [payTxHash, setPayTxHash] = useState<string | null>(null);
  const [payErrorMsg, setPayErrorMsg] = useState<string | null>(null);

  // Trigger search
  const handleSearch = async (e?: React.FormEvent, forceId?: number) => {
    e?.preventDefault();
    const idToSearch = forceId !== undefined ? forceId : parseInt(searchId);
    
    if (isNaN(idToSearch) || idToSearch <= 0) {
      setSearchError("Please enter a valid positive Bill ID.");
      setSearchState("not_found");
      return;
    }

    setSearchError(null);
    setSearchState("loading");
    setPayState("idle");
    setPayTxHash(null);
    setPayErrorMsg(null);

    try {
      const data = await getBillFromChain(idToSearch);
      setBill(data);
      setSearchState("found");
      
      // Auto-populate pay amount with the estimated individual share or remaining amount
      const share = data.total_amount / data.participants_count;
      const remaining = data.total_amount - data.paid_amount;
      const defaultPay = Math.min(share, remaining);
      setPayAmount(defaultPay.toString());
      
      if (forceId === undefined) {
        setSearchId(idToSearch.toString());
      }
    } catch (err: any) {
      console.error(err);
      setSearchError(err.message || "Bill not found on-chain.");
      setBill(null);
      setSearchState("not_found");
    }
  };

  // Automatically fetch details if parent tells us there is an active bill ID
  React.useEffect(() => {
    if (activeBillId !== null) {
      setSearchId(activeBillId.toString());
      handleSearch(undefined, activeBillId);
    }
  }, [activeBillId]);

  // Execute payment
  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress || !bill) return;

    setPayErrorMsg(null);
    setPayTxHash(null);
    setPayState("pending");
    setPayStatusMsg("Validating amount...");

    const amountNum = parseFloat(payAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setPayErrorMsg("Payment amount must be a positive number greater than 0.");
      setPayState("error");
      return;
    }

    const remaining = bill.total_amount - bill.paid_amount;
    if (amountNum > remaining) {
      setPayErrorMsg(`Payment amount (${amountNum} XLM) cannot exceed the remaining balance (${remaining} XLM).`);
      setPayState("error");
      return;
    }

    try {
      const { hash, bill: updatedBill, events } = await payBillOnChain(
        walletAddress,
        bill.id,
        amountNum,
        (status) => setPayStatusMsg(status)
      );

      setPayTxHash(hash);
      setBill(updatedBill);
      setPayState("success");
      setPayAmount("0");

      // Notify parent to refresh balance
      onPaymentSuccess();
    } catch (err: any) {
      console.error(err);
      setPayErrorMsg(err.message || "Failed to process contract payment.");
      setPayState("error");
    }
  };

  // Truncate address helper
  const truncateAddr = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
  };

  // Date format helper
  const formatDate = (timestamp: number) => {
    if (timestamp === 0) return "Unknown";
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <Card className="border-zinc-800 bg-zinc-900/40 backdrop-blur-md text-zinc-100 shadow-xl overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-600" />

      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold tracking-tight text-white flex items-center justify-between">
          <span>Search & Pay Bill</span>
          <Search className="h-4 w-4 text-cyan-400" />
        </CardTitle>
        <CardDescription className="text-zinc-400 text-sm">
          Lookup any registered bill ID and pay your share.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search Input Box */}
        <form onSubmit={(e) => handleSearch(e)} className="flex gap-2">
          <div className="relative flex-grow">
            <span className="absolute left-3 top-2.5 text-zinc-500 font-mono text-sm">#</span>
            <Input
              type="number"
              placeholder="Enter Bill ID (e.g. 1)"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="bg-zinc-950/80 border-zinc-800 text-zinc-100 placeholder-zinc-600 pl-7 focus-visible:ring-cyan-500"
            />
          </div>
          <Button
            type="submit"
            disabled={searchState === "loading"}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 transition-all px-4"
          >
            {searchState === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Search"
            )}
          </Button>
        </form>

        {/* Loading details state */}
        {searchState === "loading" && (
          <div className="py-12 text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mx-auto" />
            <p className="text-sm text-zinc-500">Querying Soroban contract storage...</p>
          </div>
        )}

        {/* Not Found/Error Details */}
        {searchState === "not_found" && searchError && (
          <div className="rounded-lg border border-red-950/40 bg-red-950/20 p-4 text-red-300 text-sm flex gap-3 leading-relaxed">
            <AlertTriangle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
            <div>
              <p className="font-semibold text-red-200">Bill Lookup Error</p>
              <p className="text-xs text-red-400/90">{searchError}</p>
            </div>
          </div>
        )}

        {/* Found Details Page */}
        {searchState === "found" && bill && (
          <div className="space-y-6">
            {/* Bill Info Card */}
            <div className="rounded-lg bg-zinc-950/80 border border-zinc-800/80 p-4 space-y-4 relative">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/30">
                    Bill #{bill.id}
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1.5 leading-snug">{bill.title}</h3>
                </div>
                <div>
                  {bill.is_paid ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800/40">
                      Paid
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-800/40">
                      Pending
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono text-zinc-500">
                  <span>Collected: {bill.paid_amount} / {bill.total_amount} XLM</span>
                  <span>{Math.round((bill.paid_amount / bill.total_amount) * 100)}%</span>
                </div>
                <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/50">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, (bill.paid_amount / bill.total_amount) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Metadata list */}
              <div className="grid grid-cols-2 gap-3 text-xs border-t border-zinc-900 pt-3">
                <div className="flex items-center gap-2 text-zinc-400">
                  <User className="h-3.5 w-3.5 text-zinc-600" />
                  <span>Creator: <strong className="text-zinc-300 font-mono" title={bill.creator}>{truncateAddr(bill.creator)}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <Calendar className="h-3.5 w-3.5 text-zinc-600" />
                  <span>Created: <strong className="text-zinc-300">{formatDate(bill.created_at)}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <span>Participants: <strong className="text-white font-mono">{bill.participants_count}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <span>Share Size: <strong className="text-white font-mono">{(bill.total_amount / bill.participants_count).toFixed(2)} XLM</strong></span>
                </div>
              </div>
            </div>

            {/* Payment Sub-Form */}
            {!bill.is_paid && (
              <form onSubmit={handlePay} className="border-t border-zinc-800 pt-4 space-y-4">
                <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <ArrowUpRight className="h-4 w-4 text-cyan-400" /> Pay Towards Bill
                </h4>
                
                <div className="space-y-2">
                  <Label htmlFor="payAmount" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Amount to Pay (XLM)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="payAmount"
                      type="number"
                      step="any"
                      placeholder="0.00"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      disabled={!walletAddress || payState === "pending"}
                      className="bg-zinc-950/80 border-zinc-800 text-zinc-100 placeholder-zinc-600 font-mono text-sm focus-visible:ring-cyan-500"
                      required
                    />
                    <Button
                      type="button"
                      onClick={() => setPayAmount((bill.total_amount - bill.paid_amount).toString())}
                      disabled={!walletAddress || payState === "pending"}
                      variant="outline"
                      className="border-zinc-800 text-zinc-400 hover:text-white bg-zinc-950 text-xs shrink-0"
                    >
                      Pay Full
                    </Button>
                  </div>
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  disabled={!walletAddress || payState === "pending"}
                  className="w-full bg-gradient-to-r from-cyan-600 to-indigo-600 text-white hover:from-cyan-500 hover:to-indigo-500 font-semibold transition-all"
                >
                  {payState === "pending" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span>Signing & Processing...</span>
                    </>
                  ) : (
                    <span>Submit Payment</span>
                  )}
                </Button>

                {/* Pay states feedback */}
                {payState === "pending" && (
                  <div className="rounded-lg border border-indigo-950 bg-indigo-950/20 p-3 text-indigo-300 text-xs flex items-center gap-2.5">
                    <Loader2 className="h-4.5 w-4.5 animate-spin text-indigo-400 shrink-0" />
                    <div>
                      <p className="font-semibold text-indigo-200">Processing Payment...</p>
                      <p className="text-[10px] text-indigo-400/90">{payStatusMsg}</p>
                    </div>
                  </div>
                )}

                {payState === "success" && payTxHash && (
                  <div className="rounded-lg border border-emerald-950 bg-emerald-950/20 p-4 text-emerald-300 text-xs space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
                      <p className="font-bold text-emerald-200">Payment Submitted Successfully!</p>
                    </div>
                    <p className="font-mono break-all bg-zinc-950/60 p-2 rounded border border-emerald-950/30">
                      Tx Hash: {payTxHash}
                    </p>
                    <div className="flex justify-between items-center pt-0.5">
                      <a
                        href={`https://stellar.expert/explorer/testnet/tx/${payTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 hover:underline transition-all"
                      >
                        <span>View on Stellar Expert</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      <button
                        type="button"
                        onClick={() => setPayState("idle")}
                        className="font-bold text-zinc-400 hover:text-white"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}

                {payState === "error" && payErrorMsg && (
                  <div className="rounded-lg border border-red-950 bg-red-950/20 p-4 text-red-300 text-xs space-y-1.5">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4.5 w-4.5 text-red-400 shrink-0" />
                      <p className="font-bold text-red-200">Payment Failed</p>
                    </div>
                    <p className="leading-relaxed bg-zinc-950/60 p-2 rounded border border-red-950/30 font-mono">
                      {payErrorMsg}
                    </p>
                    <div className="flex justify-end pt-0.5">
                      <button
                        type="button"
                        onClick={() => setPayState("idle")}
                        className="font-bold text-zinc-400 hover:text-white"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
