import {
  Horizon,
  TransactionBuilder,
  Asset,
  Operation,
  Networks,
  BASE_FEE,
} from "@stellar/stellar-sdk";
import { signTransaction } from "@stellar/freighter-api";

// Initialize the Horizon server for Stellar Testnet
const HORIZON_URL = "https://horizon-testnet.stellar.org";
const server = new Horizon.Server(HORIZON_URL);

/**
 * Fetches the native XLM balance for a given public key on the Testnet.
 */
export async function getBalance(publicKey: string): Promise<string> {
  if (!publicKey) return "0.0000000";

  try {
    const account = await server.loadAccount(publicKey);
    const nativeBalance = account.balances.find(
      (balance) => balance.asset_type === "native"
    );
    return nativeBalance ? nativeBalance.balance : "0.0000000";
  } catch (error: any) {
    console.error("Error loading account balance:", error);
    if (error?.response?.status === 404) {
      // Horizon returns 404 if the testnet account hasn't been funded yet
      throw new Error(
        "Account not found on Testnet. Please fund your account using Friendbot (https://laboratory.stellar.org/#friendbot) first."
      );
    }
    throw new Error(error?.message || "Failed to fetch XLM balance from Horizon Testnet.");
  }
}

/**
 * Builds, signs (via Freighter), and submits an XLM payment transaction on the Testnet.
 * Returns the resulting transaction hash.
 */
export async function sendPayment(
  senderPublicKey: string,
  recipientPublicKey: string,
  amount: string
): Promise<string> {
  // 1. Basic validation
  if (!senderPublicKey) {
    throw new Error("Sender address is missing. Please connect your wallet.");
  }
  if (!recipientPublicKey || recipientPublicKey.trim().length !== 56 || !recipientPublicKey.startsWith("G")) {
    throw new Error("Invalid recipient address. A Stellar address must be 56 characters starting with 'G'.");
  }
  if (!amount || parseFloat(amount) <= 0 || isNaN(Number(amount))) {
    throw new Error("Amount must be a positive number greater than 0.");
  }

  try {
    // 2. Load the sender account to get the current sequence number
    const account = await server.loadAccount(senderPublicKey);

    // 3. Build the payment transaction
    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.payment({
          destination: recipientPublicKey,
          asset: Asset.native(),
          amount: amount,
        })
      )
      .setTimeout(180) // 3 minutes timeout
      .build();

    const xdr = transaction.toXDR();

    let signedXdr: string;
    try {
      const signResult = await signTransaction(xdr, {
        networkPassphrase: Networks.TESTNET,
      });
      signedXdr = signResult.signedTxXdr;
    } catch (signError: any) {
      console.error("Freighter signing error:", signError);
      throw new Error(
        signError?.message || "Transaction signing was rejected by the user or failed."
      );
    }

    if (!signedXdr) {
      throw new Error("No signature returned from Freighter Wallet.");
    }

    // 5. Re-create the transaction object from signed XDR and submit to Testnet
    const signedTx = TransactionBuilder.fromXDR(signedXdr, Networks.TESTNET);
    const result = await server.submitTransaction(signedTx);

    if (!result.successful) {
      throw new Error("Transaction was rejected by the network.");
    }

    return result.hash;
  } catch (error: any) {
    console.error("Payment submission failure:", error);
    
    // Horizon error details might be buried in the response
    const resultCodes = error?.response?.data?.extras?.result_codes;
    if (resultCodes) {
      const operationsCodes = resultCodes.operations ? `, Operations: ${resultCodes.operations.join(", ")}` : "";
      throw new Error(
        `Transaction failed. Network Code: ${resultCodes.transaction}${operationsCodes}`
      );
    }
    
    throw new Error(error?.message || "Failed to submit payment to the Stellar Testnet.");
  }
}
