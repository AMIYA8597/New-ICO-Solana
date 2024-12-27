import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export const lamportsToSol = (lamports) => {
  return lamports / LAMPORTS_PER_SOL;
};

export const solToLamports = (sol) => {
  return Math.floor(sol * LAMPORTS_PER_SOL);
};

export const formatUnixTimestamp = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
};


















// import { LAMPORTS_PER_SOL } from '@solana/web3.js';

// export const formatUnixTimestamp = (timestamp) => {
//   return new Date(timestamp * 1000).toLocaleString();
// };

export const formatLamports = (lamports) => {
  return (lamports / LAMPORTS_PER_SOL).toFixed(9);
};


// // export const formatUnixTimestamp = (timestamp) => {
// //   return new Date(timestamp * 1000).toLocaleString();
// // };

export const formatSol = (lamports) => {
  return (lamports / LAMPORTS_PER_SOL).toFixed(4);
};