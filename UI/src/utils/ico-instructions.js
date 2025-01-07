import * as anchor from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { ICO_SEED, PURCHASE_SEED, USER_TOKEN_ACCOUNT_SEED } from './constants';

export const createInitializeIcoInstruction = (
  program,
  authority,
  tokenMint,
  totalSupply,
  seedPrice,
  preIcoPrice,
  publicPrice,
  startTime,
  duration,
  roundType
) => {
  return program.methods
    .initialize(
      totalSupply,
      seedPrice,
      preIcoPrice,
      publicPrice,
      startTime,
      duration,
      roundType
    )
    .accounts({
      icoAccount: PublicKey.findProgramAddressSync(
        [Buffer.from(ICO_SEED)],
        program.programId
      )[0],
      authority,
      tokenMint,
      systemProgram: anchor.web3.SystemProgram.programId,
    });
};

export const createBuyTokensInstruction = (
  program,
  buyer,
  amount,
  purchaseCounter
) => {
  return program.methods
    .buyTokens(amount)
    .accounts({
      buyer,
      icoAccount: PublicKey.findProgramAddressSync(
        [Buffer.from(ICO_SEED)],
        program.programId
      )[0],
      purchaseAccount: PublicKey.findProgramAddressSync(
        [
          Buffer.from(PURCHASE_SEED),
          buyer.toBuffer(),
          new anchor.BN(purchaseCounter).toArrayLike(Buffer, 'le', 8),
        ],
        program.programId
      )[0],
      treasuryWallet: program.provider.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
    });
};

export const createDistributeTokensInstruction = (
  program,
  authority,
  buyer,
  purchaseAccountPubkey
) => {
  return program.methods
    .distributeTokens()
    .accounts({
      authority,
      icoAccount: PublicKey.findProgramAddressSync(
        [Buffer.from(ICO_SEED)],
        program.programId
      )[0],
      purchaseAccount: purchaseAccountPubkey,
      buyer,
      userTokenAccount: PublicKey.findProgramAddressSync(
        [Buffer.from(USER_TOKEN_ACCOUNT_SEED), buyer.toBuffer()],
        program.programId
      )[0],
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
    });
};

export const createUpdateRoundInstruction = (
  program,
  authority,
  newRoundType
) => {
  return program.methods
    .updateRound(newRoundType)
    .accounts({
      icoAccount: PublicKey.findProgramAddressSync(
        [Buffer.from(ICO_SEED)],
        program.programId
      )[0],
      authority,
    });
};

export const createEndIcoInstruction = (program, authority) => {
  return program.methods
    .endIco()
    .accounts({
      icoAccount: PublicKey.findProgramAddressSync(
        [Buffer.from(ICO_SEED)],
        program.programId
      )[0],
      authority,
    });
};

