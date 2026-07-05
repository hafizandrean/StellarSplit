import { StellarWalletsKit, Networks } from "@creit.tech/stellar-wallets-kit";
import { AlbedoModule } from "@creit.tech/stellar-wallets-kit/modules/albedo";
import { FreighterModule } from "@creit.tech/stellar-wallets-kit/modules/freighter";

// Initialize the wallets kit statically
// This configures Freighter and Albedo modules on Testnet
let isInitialized = false;

export function initWalletKit() {
  if (isInitialized) return;
  StellarWalletsKit.init({
    network: Networks.TESTNET,
    modules: [
      new FreighterModule(),
      new AlbedoModule(),
    ],
  });
  isInitialized = true;
}

/**
 * Opens the built-in modal for wallet connection.
 * Resolves with the public address and the selected wallet name.
 */
export async function connectWallet(): Promise<{ address: string; walletName: string }> {
  initWalletKit();
  try {
    const result = await StellarWalletsKit.authModal();
    if (!result?.address) {
      throw new Error("No address was returned from the wallet connection.");
    }
    
    // Retrieve the selected module's name
    const walletName = StellarWalletsKit.selectedModule?.productName || "Stellar Wallet";
    return {
      address: result.address,
      walletName,
    };
  } catch (error: any) {
    console.error("Wallet connection failed:", error);
    throw new Error(error?.message || "Wallet connection was rejected or failed.");
  }
}

/**
 * Retrieves the currently connected address from the kit's active memory, if any.
 */
export async function getConnectedAddress(): Promise<{ address: string; walletName: string } | null> {
  initWalletKit();
  try {
    const result = await StellarWalletsKit.getAddress();
    if (result?.address) {
      const walletName = StellarWalletsKit.selectedModule?.productName || "Stellar Wallet";
      return { address: result.address, walletName };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Signs a transaction XDR string using the active connected wallet.
 * Returns the signed transaction XDR string.
 */
export async function signTxWithWallet(xdr: string, address: string): Promise<string> {
  initWalletKit();
  try {
    const networkPassphrase =
      process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE ||
      "Test SDF Network ; September 2015";

    const result = await StellarWalletsKit.signTransaction(xdr, {
      networkPassphrase,
      address,
    });

    if (!result?.signedTxXdr) {
      throw new Error("No signed transaction XDR returned from the wallet.");
    }

    return result.signedTxXdr;
  } catch (error: any) {
    console.error("Signing transaction failed:", error);
    throw new Error(
      error?.message || "Transaction signing was rejected by the user or failed."
    );
  }
}
