import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getProgram } from '../utils/anchor-connection';
import * as anchor from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import { formatSol } from '../utils/formatters';

const BuyTokens = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [icoData, setIcoData] = useState(null);

  useEffect(() => {
    fetchIcoData();
  }, [connection, wallet.publicKey]);

  const fetchIcoData = async () => {

    if (!wallet.publicKey) return;
    
    try {
      const program = getProgram(connection, wallet);
      const [icoAccount] = await PublicKey.findProgramAddress(
        [Buffer.from('ico')],
        program.programId
      );
      const data = await program.account.icoAccount.fetch(icoAccount);
      setIcoData(data);
    } catch (err) {
      console.error('Error fetching ICO data:', err);
      setError('Failed to fetch ICO data. Please try again later.');
    }
  };

  const handleBuyTokens = async (e) => {
    e.preventDefault();
    if (!wallet.publicKey || !wallet.signTransaction || !icoData) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const program = getProgram(connection, wallet);
      const [icoAccount] = await PublicKey.findProgramAddress(
        [Buffer.from('ico')],
        program.programId
      );

      const mint = icoData.tokenMint;

      const treasuryWallet = icoData.authority;

      const buyerTokenAccount = await getAssociatedTokenAddress(mint, wallet.publicKey);

      const treasuryTokenAccount = await getAssociatedTokenAddress(mint, treasuryWallet);

      const [purchaseAccount] = await PublicKey.findProgramAddress(
        [Buffer.from('purchase'), wallet.publicKey.toBuffer()],
        program.programId
      );

      const tx = await program.methods
        .buyTokens(new anchor.BN(amount))
        .accounts({
          buyer: wallet.publicKey,
          icoAccount,
          purchaseAccount,
          buyerTokenAccount,
          treasuryTokenAccount,
          treasuryWallet,
          tokenMint: mint,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      setSuccess(`Tokens purchased successfully! Transaction ID: ${tx.substring(0, 8)}...`);
      fetchIcoData(); // Refresh ICO data after successful purchase
    } catch (err) {
      console.error('Error buying tokens:', err);
      if (err.message.includes('custom program error: 0x0')) {
        setError('Token purchase failed. You may have already purchased tokens or there might be an issue with the ICO contract.');
      } else {
        setError('Token purchase failed. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Buy Tokens</h2>
        <form onSubmit={handleBuyTokens} className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount of tokens to buy (in SOL):
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
              required
              min="0"
              step="0.000000001"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !wallet.publicKey}
            className="w-full bg-sky-600 text-white py-2 px-4 rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            {loading ? 'Processing...' : 'Buy Tokens'}
          </button>
        </form>
        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md text-sm">
            {success}
          </div>
        )}
        {icoData && (
          <div className="mt-6 p-4 bg-gray-100 rounded-md">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Current ICO Status</h3>
            <p className="text-sm text-gray-600"><strong>Token Price:</strong> {formatSol(icoData.tokenPrice)} SOL</p>
            <p className="text-sm text-gray-600"><strong>Tokens Available:</strong> {formatSol(icoData.totalSupply - icoData.tokensSold)} SOL</p>
            <div className="mt-2">
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-sky-600 bg-sky-200">
                      {((Number(icoData.tokensSold) / Number(icoData.totalSupply)) * 100).toFixed(2)}% Sold
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-sky-200">
                  <div
                    style={{ width: `${(Number(icoData.tokensSold) / Number(icoData.totalSupply)) * 100}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-sky-500"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyTokens;







































































// import React, { useState, useEffect } from 'react';
// import { useConnection, useWallet } from '@solana/wallet-adapter-react';
// import { PublicKey } from '@solana/web3.js';
// import { getProgram } from '../utils/anchor-connection';
// import * as anchor from '@project-serum/anchor';
// import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
// import { formatSol } from '../utils/formatters';

// const BuyTokens = () => {
//   const { connection } = useConnection();
//   const wallet = useWallet();
//   const [amount, setAmount] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [icoData, setIcoData] = useState(null);

//   useEffect(() => {
//     fetchIcoData();
//   }, [connection, wallet.publicKey]);

//   const fetchIcoData = async () => {
//     if (!wallet.publicKey) return;
//     try {
//       const program = getProgram(connection, wallet);
//       const [icoAccount] = await PublicKey.findProgramAddress(
//         [Buffer.from('ico')],
//         program.programId
//       );
//       const data = await program.account.icoAccount.fetch(icoAccount);
//       setIcoData(data);
//     } catch (err) {
//       console.error('Error fetching ICO data:', err);
//       setError('Failed to fetch ICO data');
//     }
//   };

//   const handleBuyTokens = async (e) => {
//     e.preventDefault();
//     if (!wallet.publicKey || !wallet.signTransaction || !icoData) return;

//     setLoading(true);
//     setError('');
//     setSuccess('');

//     try {
//       const program = getProgram(connection, wallet);
//       const [icoAccount] = await PublicKey.findProgramAddress(
//         [Buffer.from('ico')],
//         program.programId
//       );

//       const mint = icoData.tokenMint;
//       const treasuryWallet = icoData.authority;

//       const buyerTokenAccount = await getAssociatedTokenAddress(mint, wallet.publicKey);
//       const treasuryTokenAccount = await getAssociatedTokenAddress(mint, treasuryWallet);

//       const [purchaseAccount] = await PublicKey.findProgramAddress(
//         [Buffer.from('purchase'), wallet.publicKey.toBuffer()],
//         program.programId
//       );

//       const tx = await program.methods
//         .buyTokens(new anchor.BN(amount))
//         .accounts({
//           buyer: wallet.publicKey,
//           icoAccount,
//           purchaseAccount,
//           buyerTokenAccount,
//           treasuryTokenAccount,
//           treasuryWallet,
//           tokenMint: mint,
//           tokenProgram: TOKEN_PROGRAM_ID,
//           systemProgram: anchor.web3.SystemProgram.programId,
//         })
//         .rpc();

//       setSuccess(`Tokens purchased successfully! TxID: ${tx}`);
//     } catch (err) {
//       console.error('Error buying tokens:', err);
//       setError(`Error: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-lg mx-auto">
//       <div className="bg-white shadow-md rounded-lg p-6">
//         <h2 className="text-2xl font-semibold mb-6 text-gray-800">Buy Tokens</h2>
//         <form onSubmit={handleBuyTokens} className="space-y-4">
//           <div>
//             <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
//               Amount of tokens to buy (in SOL):
//             </label>
//             <input
//               type="number"
//               id="amount"
//               value={amount}
//               onChange={(e) => setAmount(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//               required
//             />
//           </div>
//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
//           >
//             {loading ? 'Buying...' : 'Buy Tokens'}
//           </button>
//         </form>
//         {error && (
//           <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
//             {error}
//           </div>
//         )}
//         {success && (
//           <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md text-sm">
//             {success}
//           </div>
//         )}
//         {icoData && (
//           <div className="mt-6 p-4 bg-gray-100 rounded-md">
//             <h3 className="text-lg font-semibold mb-2 text-gray-800">Current ICO Status</h3>
//             <p><strong>Token Price:</strong> {formatSol(icoData.tokenPrice)} SOL</p>
//             <p><strong>Tokens Available:</strong> {formatSol(icoData.totalSupply - icoData.tokensSold)} SOL</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default BuyTokens;

