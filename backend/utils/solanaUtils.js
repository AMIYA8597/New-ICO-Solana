import { Connection, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, web3 } from '@project-serum/anchor';
import idl from '../ico-idl.json';

const programID = new PublicKey(process.env.PROGRAM_ID);
const connection = new Connection(process.env.SOLANA_RPC_URL);

const provider = new AnchorProvider(
  connection,
  { publicKey: new PublicKey(process.env.ADMIN_WALLET) },
  { commitment: 'confirmed' }
);

const program = new Program(idl, programID, provider);

export const getIcoDetails = async () => {
  const [icoAccount] = await PublicKey.findProgramAddress(
    [Buffer.from('ico')],
    programID
  );
  const icoData = await program.account.icoAccount.fetch(icoAccount);
  return icoData;
};

export const buyTokens = async (amount, walletAddress) => {
  const [icoAccount] = await PublicKey.findProgramAddress(
    [Buffer.from('ico')],
    programID
  );

  const [purchaseAccount] = await PublicKey.findProgramAddress(
    [Buffer.from('purchase'), new PublicKey(walletAddress).toBuffer()],
    programID
  );

  const tx = await program.methods
    .buyTokens(new web3.BN(amount))
    .accounts({
      buyer: new PublicKey(walletAddress),
      icoAccount,
      purchaseAccount,
      systemProgram: web3.SystemProgram.programId,
    })
    .rpc();

  return { success: true, message: 'Tokens purchased successfully', txId: tx };
};

export const distributeTokens = async () => {
  const [icoAccount] = await PublicKey.findProgramAddress(
    [Buffer.from('ico')],
    programID
  );

  const tx = await program.methods
    .distributeTokens()
    .accounts({
      authority: provider.wallet.publicKey,
      icoAccount,
    })
    .rpc();

  return { success: true, message: 'Tokens distributed successfully', txId: tx };
};

export const endIco = async () => {
  const [icoAccount] = await PublicKey.findProgramAddress(
    [Buffer.from('ico')],
    programID
  );

  const tx = await program.methods
    .endIco()
    .accounts({
      icoAccount,
      authority: provider.wallet.publicKey,
    })
    .rpc();

  return { success: true, message: 'ICO ended successfully', txId: tx };
};

export const updateIcoParameters = async (totalSupply, tokenPrice, startTime, duration, roundType) => {
  const [icoAccount] = await PublicKey.findProgramAddress(
    [Buffer.from('ico')],
    programID
  );

  const tx = await program.methods
    .updateIcoParameters(
      totalSupply ? new web3.BN(totalSupply) : null,
      tokenPrice ? new web3.BN(tokenPrice) : null,
      startTime ? new web3.BN(startTime) : null,
      duration ? new web3.BN(duration) : null,
      roundType ? { [roundType]: {} } : null
    )
    .accounts({
      authority: provider.wallet.publicKey,
      icoAccount,
    })
    .rpc();

  return { success: true, message: 'ICO parameters updated successfully', txId: tx };
};