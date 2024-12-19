import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getProgram } from '../utils/anchor-connection';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';

import { Buffer } from "buffer/"; 
window.Buffer = Buffer;

const DistributeTokens = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPurchases();
  }, [connection, wallet.publicKey]);

  const fetchPurchases = async () => {
    if (!wallet.publicKey) return;
    try {
      const program = getProgram(connection, wallet);
      // Fetch all purchase accounts
      // This is a simplified example and may need to be adjusted based on your actual implementation
      const purchaseAccounts = await program.account.purchaseAccount.all();
      setPurchases(purchaseAccounts);
    } catch (err) {
      console.error('Error fetching purchases:', err);
      setError('Failed to fetch purchases');
    }
  };

  const handleDistributeTokens = async (purchase) => {
    if (!wallet.publicKey || !wallet.signTransaction) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const program = getProgram(connection, wallet);
      const [icoAccount] = await PublicKey.findProgramAddress(
        [Buffer.from("ico")],
        program.programId
      );

      const icoData = await program.account.icoAccount.fetch(icoAccount);
      const mint = icoData.tokenMint;

      const treasuryTokenAccount = await getAssociatedTokenAddress(mint, wallet.publicKey);
      const buyerTokenAccount = await getAssociatedTokenAddress(mint, purchase.account.buyer);

      await program.methods
        .distributeTokens()
        .accounts({
          authority: wallet.publicKey,
          icoAccount,
          treasuryTokenAccount,
          buyerTokenAccount,
          purchaseAccount: purchase.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      setSuccess(`Tokens distributed successfully to ${purchase.account.buyer.toBase58()}`);
      fetchPurchases(); // Refresh the purchases list
    } catch (err) {
      console.error('Error distributing tokens:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-6">Distribute Tokens</h2>
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-600 rounded-md text-sm">
            {success}
          </div>
        )}
        <ul className="space-y-4">
          {purchases.map((purchase, index) => (
            <li key={index} className="bg-white shadow-md rounded-lg p-4">
              <p className="font-semibold">Buyer: {purchase.account.buyer.toBase58()}</p>
              <p>Amount: {purchase.account.amount.toString()} tokens</p>
              <p>Distributed: {purchase.account.isDistributed ? 'Yes' : 'No'}</p>
              {!purchase.account.isDistributed && (
                <button
                  onClick={() => handleDistributeTokens(purchase)}
                  disabled={loading}
                  className="mt-2 bg-black hover:bg-gray-800 text-white"
                >
                  {loading ? 'Distributing...' : 'Distribute Tokens'}
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DistributeTokens;







































// import React, { useState, useEffect } from 'react';
// import { useConnection, useWallet } from '@solana/wallet-adapter-react';
// import { PublicKey } from '@solana/web3.js';
// import { getProgram } from '../utils/anchor-connection';
// import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';

// const DistributeTokens = () => {
//   const { connection } = useConnection();
//   const wallet = useWallet();
//   const [purchases, setPurchases] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   useEffect(() => {
//     fetchPurchases();
//   }, [connection, wallet.publicKey]);

//   const fetchPurchases = async () => {
//     if (!wallet.publicKey) return;
//     try {
//       const program = getProgram(connection, wallet);
//       // Fetch all purchase accounts
//       // This is a simplified example and may need to be adjusted based on your actual implementation
//       const purchaseAccounts = await program.account.purchaseAccount.all();
//       setPurchases(purchaseAccounts);
//     } catch (err) {
//       console.error('Error fetching purchases:', err);
//       setError('Failed to fetch purchases');
//     }
//   };

//   const handleDistributeTokens = async (purchase) => {
//     if (!wallet.publicKey || !wallet.signTransaction) return;

//     setLoading(true);
//     setError('');
//     setSuccess('');

//     try {
//       const program = getProgram(connection, wallet);
//       const [icoAccount] = await PublicKey.findProgramAddress(
//         [Buffer.from("ico")],
//         program.programId
//       );

//       const icoData = await program.account.icoAccount.fetch(icoAccount);
//       const mint = icoData.tokenMint;

//       const treasuryTokenAccount = await getAssociatedTokenAddress(mint, wallet.publicKey);
//       const buyerTokenAccount = await getAssociatedTokenAddress(mint, purchase.account.buyer);

//       await program.methods
//         .distributeTokens()
//         .accounts({
//           authority: wallet.publicKey,
//           icoAccount,
//           treasuryTokenAccount,
//           buyerTokenAccount,
//           purchaseAccount: purchase.publicKey,
//           tokenProgram: TOKEN_PROGRAM_ID,
//         })
//         .rpc();

//       setSuccess(`Tokens distributed successfully to ${purchase.account.buyer.toBase58()}`);
//       fetchPurchases(); // Refresh the purchases list
//     } catch (err) {
//       console.error('Error distributing tokens:', err);
//       setError(`Error: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h2 className="text-2xl font-bold mb-6">Distribute Tokens</h2>
//       {error && <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}
//       {success && <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">{success}</div>}
//       <ul className="space-y-4">
//         {purchases.map((purchase, index) => (
//           <li key={index} className="bg-white shadow-md rounded-lg p-4">
//             <p className="font-semibold">Buyer: {purchase.account.buyer.toBase58()}</p>
//             <p>Amount: {purchase.account.amount.toString()} tokens</p>
//             <p>Distributed: {purchase.account.isDistributed ? 'Yes' : 'No'}</p>
//             {!purchase.account.isDistributed && (
//               <button
//                 onClick={() => handleDistributeTokens(purchase)}
//                 disabled={loading}
//                 className="mt-2 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
//               >
//                 {loading ? 'Distributing...' : 'Distribute Tokens'}
//               </button>
//             )}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default DistributeTokens;

