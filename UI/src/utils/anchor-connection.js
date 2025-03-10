import * as anchor from "@project-serum/anchor"
import { Connection, PublicKey } from "@solana/web3.js"
import icoIdl from "./idl/ico_program.json"
import stakingIdl from "./idl/staking_program.json"

export const getProgram = (connection, wallet) => {
  const provider = new anchor.AnchorProvider(connection, wallet, { preflightCommitment: "processed" })
  const programId = new PublicKey(process.env.REACT_APP_ICO_PROGRAM_ID)
  return new anchor.Program(icoIdl, programId, provider)
}

export const getStakingProgram = (connection, wallet) => {
  const provider = new anchor.AnchorProvider(connection, wallet, { preflightCommitment: "processed" })
  const programId = new PublicKey(process.env.REACT_APP_STAKING_PROGRAM_ID)
  return new anchor.Program(stakingIdl, programId, provider)
}

export const getConnection = () => {
  return new Connection(process.env.REACT_APP_RPC_ENDPOINT, "processed")
}










































// import * as anchor from '@project-serum/anchor';
// import { Connection, PublicKey } from '@solana/web3.js';
// import idl from './idl/ico_program.json';

// export const getProgram = (connection, wallet) => {
//   const provider = new anchor.AnchorProvider(
//     connection,
//     wallet,
//     { preflightCommitment: 'processed' }
//   );
//   const programId = new PublicKey(process.env.REACT_APP_PROGRAM_ID);
//   return new anchor.Program(idl, programId, provider);
// };

// export const getConnection = () => {
//   return new Connection(process.env.REACT_APP_RPC_ENDPOINT, 'processed');
// };

