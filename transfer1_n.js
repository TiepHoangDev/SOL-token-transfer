const {
  Connection,
  PublicKey,
  Keypair,
} = require('@solana/web3.js');
const {
  getMint,
  getOrCreateAssociatedTokenAccount,
  transfer,
  getAccount,
} = require('@solana/spl-token');
const bip39 = require('bip39');
const ed25519 = require('ed25519-hd-key');

function deriveKeypairFromMnemonic(mnemonic, accountIndex = 0) {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const path = `m/44'/501'/${accountIndex}'/0'`;
  const derived = ed25519.derivePath(path, seed.toString('hex'));
  return Keypair.fromSeed(derived.key);
}

async function transfer1N(params) {
  const {
    senderMnemonic,
    senderAccountIndex,
    receivers,
    mintAddress,
    isMainnet,
  } = params;

  const connection = new Connection(
    isMainnet
      ? 'https://api.mainnet-beta.solana.com'
      : 'https://api.testnet.solana.com',
    'confirmed'
  );

  const sender = deriveKeypairFromMnemonic(senderMnemonic, senderAccountIndex);
  const tokenMint = new PublicKey(mintAddress);
  const mintInfo = await getMint(connection, tokenMint);
  const decimals = mintInfo.decimals;

  const senderTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    sender,
    tokenMint,
    sender.publicKey
  );

  const senderTokenBefore = await getAccount(
    connection,
    senderTokenAccount.address
  );

  const result = {
    sender: sender.publicKey.toBase58(),
    mint: mintAddress,
    senderBalanceBefore: Number(senderTokenBefore.amount) / 10 ** decimals,
    senderBalanceAfter: 0,
    transfers: [],
  };

  for (const receiverInfo of receivers) {
    const { mnemonic, accountIndex, amount } = receiverInfo;
    let receiver;
    try {
      receiver = deriveKeypairFromMnemonic(mnemonic, accountIndex);
    } catch (e) {
      result.transfers.push({
        receiver: null,
        amount,
        txSignature: null,
        beforeBalance: null,
        afterBalance: null,
        success: false,
        error: `Invalid mnemonic: ${mnemonic}`,
      });
      continue;
    }

    const receiverTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      sender,
      tokenMint,
      receiver.publicKey
    );

    let before = 0;
    try {
      const beforeInfo = await getAccount(
        connection,
        receiverTokenAccount.address
      );
      before = Number(beforeInfo.amount) / 10 ** decimals;
    } catch (_) { }

    let txSignature = null;
    let after = before;
    let success = false;
    let error = null;

    try {
      txSignature = await transfer(
        connection,
        sender,
        senderTokenAccount.address,
        receiverTokenAccount.address,
        sender.publicKey,
        amount * 10 ** decimals
      );

      const afterInfo = await getAccount(
        connection,
        receiverTokenAccount.address
      );
      after = Number(afterInfo.amount) / 10 ** decimals;
      success = true;
    } catch (e) {
      error = e.message;
    }

    result.transfers.push({
      receiver: receiver.publicKey.toBase58(),
      amount,
      txSignature,
      beforeBalance: before,
      afterBalance: after,
      success,
      error,
      explorerUrl: txSignature
        ? `https://solscan.io/tx/${txSignature}${isMainnet ? '' : '?cluster=testnet'}`
        : null,
    });
  }

  const senderTokenAfter = await getAccount(
    connection,
    senderTokenAccount.address
  );
  result.senderBalanceAfter = Number(senderTokenAfter.amount) / 10 ** decimals;

  return result;
}

module.exports = { transfer1N };


// === CLI mode ===
if (require.main === module) {
  (async () => {
    try {
      const input = JSON.parse(process.argv[2]);
      const result = await transfer1N(input);
      console.log(JSON.stringify(result, null, 2));
    } catch (err) {
      console.error(JSON.stringify({
        status: 'error',
        message: err.message || err.toString()
      }));
      process.exit(1);
    }
  })();
}