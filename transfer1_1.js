// transfer1_1.js
const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const {
  getMint,
  getOrCreateAssociatedTokenAccount,
  getAccount,
  transfer,
} = require('@solana/spl-token');
const bip39 = require('bip39');
const ed25519 = require('ed25519-hd-key');

/**
 * Derive Keypair from mnemonic and account index
 */
function deriveKeypairFromMnemonic(mnemonic, accountIndex = 0) {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const path = `m/44'/501'/${accountIndex}'/0'`;
  const derived = ed25519.derivePath(path, seed.toString('hex'));
  return Keypair.fromSeed(derived.key);
}

/**
 * Transfer SPL Token (1-1)
 */
async function transfer1_1({
  senderMnemonic,
  receiverMnemonic,
  mintAddress,
  amount,
  senderAccountIndex = 0,
  isMainnet = false
}) {
  const endpoint = isMainnet
    ? 'https://api.mainnet-beta.solana.com'
    : 'https://api.testnet.solana.com';

  const connection = new Connection(endpoint, 'confirmed');
  const mint = new PublicKey(mintAddress);
  const sender = deriveKeypairFromMnemonic(senderMnemonic, senderAccountIndex);
  const receiver = deriveKeypairFromMnemonic(receiverMnemonic);

  const mintInfo = await getMint(connection, mint);
  const decimals = mintInfo.decimals;

  const senderSOL = await connection.getBalance(sender.publicKey) / 1e9;
  const receiverSOL = await connection.getBalance(receiver.publicKey) / 1e9;

  const senderTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    sender,
    mint,
    sender.publicKey
  );

  const receiverTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    sender,
    mint,
    receiver.publicKey
  );

  const beforeSenderToken = await getAccount(connection, senderTokenAccount.address);
  const beforeReceiverToken = await getAccount(connection, receiverTokenAccount.address);

  const signature = await transfer(
    connection,
    sender,
    senderTokenAccount.address,
    receiverTokenAccount.address,
    sender.publicKey,
    amount * (10 ** decimals)
  );

  const afterSenderToken = await getAccount(connection, senderTokenAccount.address);
  const afterReceiverToken = await getAccount(connection, receiverTokenAccount.address);

  return {
    status: "success",
    tx: signature,
    sol: {
      sender: senderSOL,
      receiver: receiverSOL
    },
    token: {
      mint: mintAddress,
      decimals,
      amountSent: amount,
      sender: {
        before: Number(beforeSenderToken.amount) / (10 ** decimals),
        after: Number(afterSenderToken.amount) / (10 ** decimals)
      },
      receiver: {
        before: Number(beforeReceiverToken.amount) / (10 ** decimals),
        after: Number(afterReceiverToken.amount) / (10 ** decimals)
      }
    },
    sender: sender.publicKey.toBase58(),
    receiver: receiver.publicKey.toBase58()
  };
}

module.exports = transfer1_1;

// === CLI Mode ===
if (require.main === module) {
  (async () => {
    const args = process.argv.slice(2);
    if (args.length < 4) {
      console.error(JSON.stringify({
        status: 'error',
        message: 'Usage: node transfer1_1.js <senderMnemonic> <receiverMnemonic> <mintAddress> <amount> [accountIndex]'
      }, null, 2));
      process.exit(1);
    }

    const [senderMnemonic, receiverMnemonic, mintAddr, rawAmount, rawAccountIndex] = args;
    const AMOUNT = parseFloat(rawAmount);
    const ACCOUNT_INDEX = rawAccountIndex ? parseInt(rawAccountIndex) : 0;

    try {
      const result = await transfer1_1({
        senderMnemonic,
        receiverMnemonic,
        mintAddress: mintAddr,
        amount: AMOUNT,
        senderAccountIndex: ACCOUNT_INDEX,
        isMainnet: false
      });

      console.log(JSON.stringify(result, null, 2));
    } catch (err) {
      console.error(JSON.stringify({
        status: 'error',
        message: err.message || err.toString()
      }, null, 2));
    }
  })();
}
