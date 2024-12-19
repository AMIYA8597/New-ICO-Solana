import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getProgram } from '../utils/anchor-connection';
import * as anchor from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';

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
      setError('Failed to fetch ICO data');
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

      setSuccess(`Tokens purchased successfully! TxID: ${tx}`);
    } catch (err) {
      console.error('Error buying tokens:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="card">
        <h2 className="text-2xl font-semibold mb-6">Buy Tokens</h2>
        <form onSubmit={handleBuyTokens} className="space-y-4">
          <div>
            <label htmlFor="amount" className="label">
              Amount of tokens to buy:
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? 'Buying...' : 'Buy Tokens'}
          </button>
        </form>
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 text-green-600 rounded-md text-sm">
            {success}
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

// const BuyTokens = () => {
//   const { connection } = useConnection();
//   const wallet = useWallet();
//   const [amount, setAmount] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [icoData, setIcoData] = useState(null);

//   useEffect(() => {
//     const fetchIcoData = async () => {
//       if (!wallet.publicKey) return;
//       try {
//         const program = getProgram(connection, wallet);
//         const [icoAccount] = await PublicKey.findProgramAddress(
//           [Buffer.from('ico')],
//           program.programId
//         );
//         const data = await program.account.icoAccount.fetch(icoAccount);
//         setIcoData(data);
//       } catch (err) {
//         console.error('Error fetching ICO data:', err);
//         setError('Failed to fetch ICO data');
//       }
//     };

//     fetchIcoData();
//   }, [connection, wallet.publicKey]);

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
//     <div className="container mx-auto px-4 py-8">
//       <h2 className="text-2xl font-bold mb-6">Buy Tokens</h2>
//       <form onSubmit={handleBuyTokens} className="space-y-4">
//         <div>
//           <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount of tokens to buy:</label>
//           <input
//             type="number"
//             id="amount"
//             value={amount}
//             onChange={(e) => setAmount(e.target.value)}
//             className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
//             required
//           />
//         </div>
//         <button
//           type="submit"
//           disabled={loading || !icoData}
//           className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
//         >
//           {loading ? 'Buying...' : 'Buy Tokens'}
//         </button>
//       </form>
//       {error && <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}
//       {success && <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">{success}</div>}
//     </div>
//   );
// };

// export default BuyTokens;

