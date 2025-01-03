import * as anchor from '@project-serum/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import idl from './idl/ico-idl.json';

export const getProgram = (connection, wallet) => {
  const provider = new anchor.AnchorProvider(
    connection,
    wallet,
    anchor.AnchorProvider.defaultOptions()
  );
  const programId = new PublicKey(process.env.REACT_APP_PROGRAM_ID);
  return new anchor.Program(idl, programId, provider);
};

