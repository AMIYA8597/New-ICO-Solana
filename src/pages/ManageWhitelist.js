// import React, { useState, useEffect } from 'react';
// import { useConnection, useWallet } from '@solana/wallet-adapter-react';
// import { PublicKey } from '@solana/web3.js';
// import { getProgram } from '../utils/anchor-connection';

// const ManageWhitelist = () => {
//   const { connection } = useConnection();
//   const wallet = useWallet();
//   const [investors, setInvestors] = useState([]);
//   const [newInvestor, setNewInvestor] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   useEffect(() => {
//     if (wallet.publicKey) {
//       fetchSeedInvestors();
//     }
//   }, [wallet.publicKey, connection]);

//   const fetchSeedInvestors = async () => {
//     if (!wallet.publicKey) return;
//     try {
//       const program = getProgram(connection, wallet);
//       const [icoAccount] = await PublicKey.findProgramAddress(
//         [Buffer.from("ico")],
//         program.programId
//       );
//       const icoData = await program.account.icoAccount.fetch(icoAccount);
//       setInvestors(icoData.seedInvestors.map(investor => investor.toBase58()));
//     } catch (err) {
//       console.error('Error fetching seed investors:', err);
//       setError('Failed to fetch seed investors');
//     }
//   };

//   const handleAddInvestor = async (e) => {
//     e.preventDefault();
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

//       await program.methods
//         .addSeedInvestor(new PublicKey(newInvestor))
//         .accounts({
//           authority: wallet.publicKey,
//           icoAccount,
//         })
//         .rpc();

//       setSuccess(`Investor ${newInvestor} added successfully!`);
//       setNewInvestor('');
//       fetchSeedInvestors();
//     } catch (err) {
//       console.error('Error adding seed investor:', err);
//       setError(`Error: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRemoveInvestor = async (investorToRemove) => {
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

//       await program.methods
//         .removeSeedInvestor(new PublicKey(investorToRemove))
//         .accounts({
//           authority: wallet.publicKey,
//           icoAccount,
//         })
//         .rpc();

//       setSuccess(`Investor ${investorToRemove} removed successfully!`);
//       fetchSeedInvestors();
//     } catch (err) {
//       console.error('Error removing seed investor:', err);
//       setError(`Error: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="manage-whitelist p-6 max-w-lg mx-auto">
//       <h2 className="text-2xl font-bold mb-6">Manage Whitelist</h2>
//       {!wallet.connected ? (
//         <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-yellow-800">
//           Please connect your wallet to manage the whitelist
//         </div>
//       ) : (
//         <>
//           <form onSubmit={handleAddInvestor} className="space-y-4">
//             <div className="space-y-2">
//               <label htmlFor="newInvestor" className="block text-sm font-medium">
//                 New Investor Address:
//               </label>
//               <input
//                 type="text"
//                 id="newInvestor"
//                 value={newInvestor}
//                 onChange={(e) => setNewInvestor(e.target.value)}
//                 placeholder="Enter Solana address"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
//                 required
//               />
//             </div>
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {loading ? 'Adding...' : 'Add Investor'}
//             </button>
//           </form>
//           {error && (
//             <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded text-red-800">
//               {error}
//             </div>
//           )}
//           {success && (
//             <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded text-green-800">
//               {success}
//             </div>
//           )}
//           <h3 className="text-xl font-semibold mt-8 mb-4">Current Whitelisted Investors</h3>
//           {investors.length > 0 ? (
//             <ul className="space-y-2">
//               {investors.map((investor, index) => (
//                 <li key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded">
//                   <span className="text-sm font-mono">{investor}</span>
//                   <button
//                     onClick={() => handleRemoveInvestor(investor)}
//                     disabled={loading}
//                     className="bg-red-500 text-white py-1 px-3 rounded-md text-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     Remove
//                   </button>
//                 </li>
//               ))}
//             </ul>
//           ) : (
//             <p>No investors are currently whitelisted.</p>
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// export default ManageWhitelist;

