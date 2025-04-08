import { SuiClient } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";

const mnemonic = "acoustic mango victory near beach machine hand lecture night broccoli media name";
async function generateWalletAddress(mnemonic) {
  const keypair = Ed25519Keypair.deriveKeypair(mnemonic);

  try {
    const client = new SuiClient({ url: "https://fullnode.testnet.sui.io" });
    const walletAddress = keypair.getPublicKey().toSuiAddress();
    const balance = await client.getBalance({ owner: walletAddress });
    console.log("Wallet Balance:", Number(balance.totalBalance) / 10 ** 9, "SUI");

    return walletAddress;
  } catch (error) {
    console.error("Error fetching balance", error);
    throw error;
  }
}

async function transferSui(mnemonic, recipientAddress, amount) {
  const keypair = Ed25519Keypair.deriveKeypair(mnemonic);
  const client = new SuiClient({ url: "https://fullnode.testnet.sui.io" });

  try {
    const txb = new Transaction();
    const amountInMist = Math.floor(amount * 10 ** 9);
    const sender = keypair.getPublicKey().toSuiAddress();

    txb.setSender(sender); // ✅ this fixes the issue

    const [coin] = txb.splitCoins(txb.gas, [amountInMist]);
    txb.transferObjects([coin], recipientAddress);

    const result = await client.signAndExecuteTransaction({
      signer: keypair,
      transaction: txb, // ✅ make sure to use `transaction`, not `transactionBlock`
    });

    console.log("Transfer successful!");
    console.log("Transaction digest:", result.digest);
    return result;
  } catch (error) {
    console.error("Error transferring SUI:", error);
    throw error;
  }
}



async function main() {
  try {
    const address = await generateWalletAddress(mnemonic);
    console.log("Your Wallet Address:", address);

   
    const recipientAddress = "0x9466a055f86a2710d671a6303004f16f07e150a6a9b1fd0d41a6cb681f2df011";
    const amountToSend = 1;

    await transferSui(mnemonic, recipientAddress, amountToSend);
  } catch (error) {
    console.error("Error in main:", error);
  }
}

main();