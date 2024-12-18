import { Connection, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider } from '@project-serum/anchor';
import idl from './ico-idl.json';

const programID = new PublicKey(process.env.REACT_APP_PROGRAM_ID);

export const getProgram = (connection, wallet) => {
  if (!connection || !wallet) {
    throw new Error('Connection and wallet are required to get the program');
  }
  const provider = new AnchorProvider(
    connection, 
    wallet, 
    AnchorProvider.defaultOptions()
  );
  return new Program(idl, programID, provider);
};























// import { Connection, PublicKey } from '@solana/web3.js';
// import { Program, AnchorProvider } from '@project-serum/anchor';
// import idl from './ico-idl.json';

// const programID = new PublicKey(process.env.REACT_APP_PROGRAM_ID);

// export const getProgram = (connection, wallet) => {

//   const provider = new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions());
//   return new Program(idl, programID, provider);
// };
