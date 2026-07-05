import {
  Horizon,
  rpc,
  Contract,
  Address,
  nativeToScVal,
  scValToNative,
  TransactionBuilder,
  BASE_FEE,
  Networks,
  Operation,
  TimeoutInfinite,
  Account,
  Asset,
} from "@stellar/stellar-sdk";
import { signTxWithWallet } from "./wallet";

// Initialize Horizon server (for simple balance queries)
const HORIZON_URL = "https://horizon-testnet.stellar.org";
const horizonServer = new Horizon.Server(HORIZON_URL);

// Initialize Soroban RPC server (for smart contract interactions)
const RPC_URL = process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || "https://soroban-testnet.stellar.org";
const rpcServer = new rpc.Server(RPC_URL);

// Loaded contract details from environment
const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID || "CCNMXX6V5DZLH3LCJOTRMXWKKGNTUL4677FS4UO7HA4KWNDWD7C4EFNE";
const NETWORK_PASSPHRASE = process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE || "Test SDF Network ; September 2015";

// A dummy account address used to construct transaction shells for view-only simulations
const DUMMY_ADDRESS = "GD3F2L56IDKCMN2CCT32MVTZ2HNBMTWUN6K2M7C6Z3XN23UEXX2X2X2X";

export interface BillData {
  id: number;
  creator: string;
  title: string;
  total_amount: number; // mapped from BigInt
  paid_amount: number;  // mapped from BigInt
  participants_count: number;
  created_at: number;   // mapped from BigInt
  is_paid: boolean;
}

/**
 * Fetches the native XLM balance for a given public key on the Testnet.
 */
export async function getBalance(publicKey: string): Promise<string> {
  if (!publicKey) return "0.0000000";

  try {
    const account = await horizonServer.loadAccount(publicKey);
    const nativeBalance = account.balances.find(
      (balance) => balance.asset_type === "native"
    );
    return nativeBalance ? nativeBalance.balance : "0.0000000";
  } catch (error: any) {
    console.error("Error loading account balance:", error);
    if (error?.response?.status === 404) {
      throw new Error(
        "Account not found on Testnet. Please fund your account using Friendbot first."
      );
    }
    throw new Error(error?.message || "Failed to fetch XLM balance from Horizon Testnet.");
  }
}

/**
 * Maps the raw on-chain ScVal-serialized Bill struct into a clean JavaScript object.
 */
function mapRawBillToData(raw: any): BillData {
  return {
    id: Number(raw.id),
    creator: raw.creator.toString(),
    title: raw.title.toString(),
    total_amount: Number(raw.total_amount),
    paid_amount: Number(raw.paid_amount),
    participants_count: Number(raw.participants_count),
    created_at: Number(raw.created_at),
    is_paid: Boolean(raw.is_paid),
  };
}

/**
 * Submits a transaction to Soroban RPC, polls until confirmed, and returns the response.
 */
async function sendSorobanTx(
  senderAddress: string,
  operation: any,
  onStatusChange?: (status: string) => void
): Promise<{ hash: string; returnValue?: any; events?: any }> {
  try {
    onStatusChange?.("Preparing transaction...");
    
    // 1. Load active account details to retrieve sequence number
    const account = await rpcServer.getAccount(senderAddress);
    
    // 2. Build transaction shell
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(operation)
      .setTimeout(TimeoutInfinite)
      .build();

    // 3. Simulate the transaction (required to generate foot print and estimate resource fees)
    onStatusChange?.("Simulating transaction...");
    const simResult = await rpcServer.simulateTransaction(tx);
    if (rpc.Api.isSimulationError(simResult)) {
      throw new Error(simResult.error || "Simulation failed. Please verify input variables.");
    }

    // 4. Assemble the transaction with the simulation metadata
    const preparedTx = rpc.assembleTransaction(tx, simResult) as any;

    // 5. Sign transaction via user wallet
    onStatusChange?.("Pending Signature...");
    const xdr = preparedTx.toXDR();
    const signedXdr = await signTxWithWallet(xdr, senderAddress);

    // 6. Submit signed transaction XDR to the ledger
    onStatusChange?.("Submitting transaction...");
    const signedTx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
    const submitResult = await rpcServer.sendTransaction(signedTx);

    if (submitResult.status === "ERROR") {
      throw new Error(`RPC Submission error: ${submitResult.errorResult}`);
    }

    const txHash = submitResult.hash;

    // 7. Poll until transaction status changes from PENDING
    onStatusChange?.("Pending Ledger Confirmation...");
    let txResponse = await rpcServer.getTransaction(txHash);
    let attempts = 0;
    while (
      txResponse.status === "NOT_FOUND" &&
      attempts < 30
    ) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      txResponse = await rpcServer.getTransaction(txHash);
      attempts++;
    }

    if (txResponse.status !== "SUCCESS") {
      // Decode transaction errors
      if (txResponse.status === "FAILED") {
        throw new Error(
          `Transaction failed on-chain. Diagnostic details: ${txResponse.resultXdr}`
        );
      }
      throw new Error(`Transaction resulted in unknown status: ${txResponse.status}`);
    }

    // 8. Return results
    return {
      hash: txHash,
      returnValue: txResponse.returnValue,
      events: txResponse.events,
    };
  } catch (error: any) {
    console.error("Soroban tx failure:", error);
    
    // Attempt to extract Soroban contract error codes:
    // Diagnostic events often contain the raw error code if the contract panicked
    if (error?.message) {
      throw error;
    }
    throw new Error("Failed to execute contract transaction.");
  }
}

/**
 * Creates a split bill on-chain.
 * Invokes `create_bill(creator, title, total_amount, participants_count)`
 */
export async function createBillOnChain(
  creatorAddress: string,
  title: string,
  totalAmount: number,
  participantsCount: number,
  onStatusChange?: (status: string) => void
): Promise<{ hash: string; billId: number }> {
  const contract = new Contract(CONTRACT_ID);
  
  const creatorAddressVal = new Address(creatorAddress);
  const operation = contract.call(
    "create_bill",
    nativeToScVal(creatorAddressVal),
    nativeToScVal(title),
    nativeToScVal(BigInt(totalAmount), { type: "u64" }),
    nativeToScVal(participantsCount, { type: "u32" })
  );

  const { hash, returnValue } = await sendSorobanTx(
    creatorAddress,
    operation,
    onStatusChange
  );

  if (!returnValue) {
    throw new Error("Contract did not return a valid bill ID.");
  }

  const billId = Number(scValToNative(returnValue));
  return { hash, billId };
}

/**
 * Retrieves a bill's details from storage (View call, simulated).
 * Invokes `get_bill(bill_id)`
 */
export async function getBillFromChain(billId: number): Promise<BillData> {
  const contract = new Contract(CONTRACT_ID);
  
  // Construct a dummy transaction layout locally for simulation
  const dummyAccount = new Account(DUMMY_ADDRESS, "0");
  const tx = new TransactionBuilder(dummyAccount, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call("get_bill", nativeToScVal(billId, { type: "u32" }))
    )
    .setTimeout(TimeoutInfinite)
    .build();

  try {
    const simResult = await rpcServer.simulateTransaction(tx);
    
    if (rpc.Api.isSimulationError(simResult)) {
      // Contract returned an error. We check if it is contract-level panic (e.g. BillNotFound)
      throw new Error("Bill not found or error loading contract storage.");
    }

    if (!simResult.result?.retval) {
      throw new Error("Contract did not return a result.");
    }

    const rawBill = scValToNative(simResult.result.retval);
    return mapRawBillToData(rawBill);
  } catch (error: any) {
    console.error("Error calling get_bill:", error);
    throw new Error(error?.message || "Failed to fetch bill details from Soroban.");
  }
}

/**
 * Pays a share towards an existing bill.
 * Invokes `pay_bill(bill_id, amount, payer)`
 */
export async function payBillOnChain(
  payerAddress: string,
  billId: number,
  amount: number,
  onStatusChange?: (status: string) => void
): Promise<{ hash: string; bill: BillData; events: any[] }> {
  const contract = new Contract(CONTRACT_ID);
  const payerAddressVal = new Address(payerAddress);
  
  const operation = contract.call(
    "pay_bill",
    nativeToScVal(billId, { type: "u32" }),
    nativeToScVal(BigInt(amount), { type: "u64" }),
    nativeToScVal(payerAddressVal)
  );

  const { hash, returnValue, events } = await sendSorobanTx(
    payerAddress,
    operation,
    onStatusChange
  );

  if (!returnValue) {
    throw new Error("Contract did not return updated bill data.");
  }

  const rawBill = scValToNative(returnValue);
  return {
    hash,
    bill: mapRawBillToData(rawBill),
    events: events || [],
  };
}

/**
 * Sends a basic XLM payment on Testnet (restored from Level 1 for backwards compatibility).
 */
export async function sendPayment(
  senderPublicKey: string,
  recipientPublicKey: string,
  amount: string
): Promise<string> {
  if (!senderPublicKey) {
    throw new Error("Sender address is missing.");
  }
  if (!recipientPublicKey || recipientPublicKey.trim().length !== 56 || !recipientPublicKey.startsWith("G")) {
    throw new Error("Invalid recipient address.");
  }
  const amountNum = parseFloat(amount);
  if (isNaN(amountNum) || amountNum <= 0) {
    throw new Error("Amount must be greater than 0.");
  }

  try {
    const account = await horizonServer.loadAccount(senderPublicKey);
    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        Operation.payment({
          destination: recipientPublicKey,
          asset: Asset.native(),
          amount: amount,
        })
      )
      .setTimeout(180)
      .build();

    const xdr = transaction.toXDR();
    const signedXdr = await signTxWithWallet(xdr, senderPublicKey);

    const signedTx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
    const result = await horizonServer.submitTransaction(signedTx);

    return result.hash;
  } catch (error: any) {
    console.error("sendPayment failed:", error);
    throw new Error(error.message || "Failed to submit payment transaction.");
  }
}

