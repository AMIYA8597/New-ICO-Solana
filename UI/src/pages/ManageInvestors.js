import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getProgram } from '../utils/anchor-connection';
import { formatSol } from '../utils/formatters';

const ManageInvestors = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [investors, setInvestors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (wallet.publicKey) {
      fetchInvestors();
    }
  }, [connection, wallet.publicKey]);

  const fetchInvestors = async () => {
    if (!wallet.publicKey) return;

    setLoading(true);
    setError('');

    try {
      const program = getProgram(connection, wallet);
      const [icoAccount] = await PublicKey.findProgramAddress(
        [Buffer.from('ico')],
        program.programId
      );
      const icoData = await program.account.icoAccount.fetch(icoAccount);

      const purchaseAccounts = await connection.getProgramAccounts(program.programId, {
        filters: [
          { dataSize: program.account.purchaseAccount.size },
          { memcmp: { offset: 8, bytes: icoAccount.toBuffer() } },
        ],
      });

      const investorsData = await Promise.all(
        purchaseAccounts.map(async (account) => {
          const purchaseData = await program.account.purchaseAccount.fetch(account.pubkey);
          return {
            address: purchaseData.buyer.toString(),
            amountPurchased: Number(purchaseData.amountPurchased),
          };
        })
      );

      setInvestors(investorsData);
    } catch (err) {
      console.error('Error fetching investors:', err);
      setError('Failed to fetch investors. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (!wallet.publicKey) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">Manage Investors</h2>
        <p className="text-gray-600">Please connect your wallet to manage investors.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Manage Investors</h2>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading investors...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
            {error}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Investor Address
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount Purchased
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {investors.map((investor, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {investor.address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatSol(investor.amountPurchased)} SOL
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageInvestors;






















































































// import React, { useState, useEffect } from 'react';
// import { useConnection, useWallet } from '@solana/wallet-adapter-react';
// import { PublicKey } from '@solana/web3.js';
// import { getProgram } from '../utils/anchor-connection';
// import { lamportsToSol } from '../utils/formatters';
// import { addToWhitelist, removeFromWhitelist } from '../utils/ico-instructions';

// const ManageInvestors = () => {
//   const { connection } = useConnection();
//   const wallet = useWallet();
//   const [investors, setInvestors] = useState([]);
//   const [newInvestor, setNewInvestor] = useState('');
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   useEffect(() => {
//     if (wallet.publicKey) {
//       fetchInvestors();
//     }
//   }, [connection, wallet.publicKey]);

//   const fetchInvestors = async () => {
//     setIsLoading(true);
//     setError('');
//     try {
//       const program = getProgram(connection, wallet);
//       const [icoAccount] = await PublicKey.findProgramAddress(
//         [Buffer.from("ico")],
//         program.programId
//       );
//       const ico = await program.account.icoAccount.fetch(icoAccount);
//       setInvestors(ico.seedInvestors.map(investor => ({
//         address: investor.toString(),
//         balance: 0 // We'll fetch balances separately
//       })));

//       // Fetch balances for each investor
//       for (let i = 0; i < investors.length; i++) {
//         const [tokenAccount] = await PublicKey.findProgramAddress(
//           [Buffer.from("token_account"), new PublicKey(investors[i].address).toBuffer()],
//           program.programId
//         );
//         try {
//           const accountInfo = await program.account.tokenAccount.fetch(tokenAccount);
//           investors[i].balance = accountInfo.balance;
//         } catch (err) {
//           console.error(`Error fetching balance for ${investors[i].address}:`, err);
//           investors[i].balance = 0;
//         }
//       }

//       setInvestors([...investors]);
//     } catch (err) {
//       console.error('Error:', err);
//       setError('Failed to fetch investors');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleAddInvestor = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');
//     try {
//       await addToWhitelist(connection, wallet, new PublicKey(newInvestor));
//       setSuccess(`Successfully added ${newInvestor} to whitelist`);
//       setNewInvestor('');
//       fetchInvestors();
//     } catch (err) {
//       console.error('Error:', err);
//       setError(err.message);
//     }
//   };

//   const handleRemoveInvestor = async (address) => {
//     setError('');
//     setSuccess('');
//     try {
//       await removeFromWhitelist(connection, wallet, new PublicKey(address));
//       setSuccess(`Successfully removed ${address} from whitelist`);
//       fetchInvestors();
//     } catch (err) {
//       console.error('Error:', err);
//       setError(err.message);
//     }
//   };

//   if (!wallet.publicKey) {
//     return (
//       <div className="text-center py-12">
//         <h2 className="text-2xl font-semibold mb-4">Manage Investors</h2>
//         <p className="text-gray-600">Please connect your wallet to manage investors.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-4xl mx-auto">
//       <h1 className="text-3xl font-bold mb-6">Manage Investors</h1>
//       <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//         <h2 className="text-xl font-semibold mb-4">Add Investor to Whitelist</h2>
//         <form onSubmit={handleAddInvestor} className="flex items-center">
//           <input
//             type="text"
//             value={newInvestor}
//             onChange={(e) => setNewInvestor(e.target.value)}
//             placeholder="Enter investor's public key"
//             className="flex-grow mr-2 p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
//             required
//           />
//           <button
//             type="submit"
//             className="bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
//           >
//             Add Investor
//           </button>
//         </form>
//       </div>

//       {error && <p className="text-red-600 mb-4">{error}</p>}
//       {success && <p className="text-green-600 mb-4">{success}</p>}

//       <div className="bg-white rounded-lg shadow-md overflow-hidden">
//         <h2 className="text-xl font-semibold p-6 bg-gray-50 border-b">Whitelisted Investors</h2>
//         {isLoading ? (
//           <div className="text-center py-12">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
//             <p className="mt-4 text-gray-600">Loading investors...</p>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {investors.map((investor) => (
//                   <tr key={investor.address}>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{investor.address}</td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lamportsToSol(investor.balance).toFixed(4)} SOL</td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                       <button
//                         onClick={() => handleRemoveInvestor(investor.address)}
//                         className="text-red-600 hover:text-red-900"
//                       >
//                         Remove
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ManageInvestors;

