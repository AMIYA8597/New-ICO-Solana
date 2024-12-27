import { getProgram } from './anchor-connection';
import { PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';

export const buyTokens = async (connection, wallet, amount) => {
  const program = getProgram(connection, wallet);
  const [icoAccount] = await PublicKey.findProgramAddress(
    [Buffer.from("ico")],
    program.programId
  );
  const [tokenAccount] = await PublicKey.findProgramAddress(
    [Buffer.from("token_account"), wallet.publicKey.toBuffer()],
    program.programId
  );

  await program.methods
    .buyTokens(amount)
    .accounts({
      ico: icoAccount,
      tokenAccount: tokenAccount,
      buyer: wallet.publicKey,
    })
    .rpc();
};

export const addToWhitelist = async (connection, wallet, investorPublicKey) => {
  const program = getProgram(connection, wallet);
  const [icoAccount] = await PublicKey.findProgramAddress(
    [Buffer.from("ico")],
    program.programId
  );

  await program.methods
    .addToWhitelist(investorPublicKey)
    .accounts({
      ico: icoAccount,
      authority: wallet.publicKey,
    })
    .rpc();
};

export const removeFromWhitelist = async (connection, wallet, investorPublicKey) => {
  const program = getProgram(connection, wallet);
  const [icoAccount] = await PublicKey.findProgramAddress(
    [Buffer.from("ico")],
    program.programId
  );

  await program.methods
    .removeFromWhitelist(investorPublicKey)
    .accounts({
      ico: icoAccount,
      authority: wallet.publicKey,
    })
    .rpc();
};

export const updateIcoParameters = async (connection, wallet, params) => {
  const program = getProgram(connection, wallet);
  const [icoAccount] = await PublicKey.findProgramAddress(
    [Buffer.from("ico")],
    program.programId
  );

  await program.methods
    .updateIcoParameters(params)
    .accounts({
      ico: icoAccount,
      authority: wallet.publicKey,
    })
    .rpc();
};

export const distributeTokens = async (connection, wallet, purchaseAccount) => {
  const program = getProgram(connection, wallet);
  const [icoAccount] = await PublicKey.findProgramAddress(
    [Buffer.from("ico")],
    program.programId
  );

  const [treasuryTokenAccount] = await PublicKey.findProgramAddress(
    [Buffer.from("treasury"), icoAccount.toBuffer()],
    program.programId
  );

  const purchase = await program.account.purchaseAccount.fetch(purchaseAccount);
  const buyerTokenAccount = await getAssociatedTokenAddress(
    program.programId,
    purchase.buyer
  );

  await program.methods
    .distributeTokens()
    .accounts({
      authority: wallet.publicKey,
      icoAccount: icoAccount,
      purchaseAccount: purchaseAccount,
      treasuryTokenAccount: treasuryTokenAccount,
      buyerTokenAccount: buyerTokenAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();
};

export const endIco = async (connection, wallet) => {
  const program = getProgram(connection, wallet);
  const [icoAccount] = await PublicKey.findProgramAddress(
    [Buffer.from("ico")],
    program.programId
  );

  await program.methods
    .endIco()
    .accounts({
      ico: icoAccount,
      authority: wallet.publicKey,
    })
    .rpc();
};

// Helper function to get associated token address
async function getAssociatedTokenAddress(mint, owner) {
  return (await PublicKey.findProgramAddress(
    [
      owner.toBuffer(),
      TOKEN_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    ASSOCIATED_TOKEN_PROGRAM_ID
  ))[0];
}

