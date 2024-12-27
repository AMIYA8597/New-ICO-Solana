import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getProgram } from '../utils/anchor-connection';
import * as anchor from '@project-serum/anchor';
import { getRoundTypeFromString, getRoundTypeString } from '../utils/enum-helpers';
import { formatUnixTimestamp, formatSol } from '../utils/formatters';

import { Buffer } from "buffer";

Buffer.from("anything", "base64");
window.Buffer = window.Buffer || require("buffer").Buffer;

const UpdateIcoParameters = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [totalSupply, setTotalSupply] = useState('');
  const [tokenPrice, setTokenPrice] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('');
  const [roundType, setRoundType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentParameters, setCurrentParameters] = useState(null);

  useEffect(() => {
    fetchCurrentParameters();
  }, [connection, wallet.publicKey]);

  const fetchCurrentParameters = async () => {
    if (!wallet.publicKey) return;
    try {
      const program = getProgram(connection, wallet);
      const [icoAccount] = await PublicKey.findProgramAddress(
        [Buffer.from('ico')],
        program.programId
      );
      const icoData = await program.account.icoAccount.fetch(icoAccount);
      setCurrentParameters(icoData);
    } catch (err) {
      console.error('Error fetching current parameters:', err);
      setError('Failed to fetch current parameters');
    }
  };

  const handleUpdateParameters = async (e) => {
    e.preventDefault();
    if (!wallet.publicKey || !wallet.signTransaction) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const program = getProgram(connection, wallet);
      const [icoAccount] = await PublicKey.findProgramAddress(
        [Buffer.from('ico')],
        program.programId
      );

      const totalSupplyBN = totalSupply ? new anchor.BN(totalSupply) : null;
      const tokenPriceBN = tokenPrice ? new anchor.BN(tokenPrice) : null;
      const startTimeBN = startTime 
        ? new anchor.BN(Math.floor(new Date(startTime).getTime() / 1000))
        : null;
      const durationBN = duration ? new anchor.BN(duration) : null;
      const roundTypeEnum = roundType ? getRoundTypeFromString(roundType) : null;

      const tx = await program.methods
        .updateIcoParameters(
          totalSupplyBN,
          tokenPriceBN,
          startTimeBN,
          durationBN,
          roundTypeEnum
        )
        .accounts({
          authority: wallet.publicKey,
          icoAccount,
        })
        .rpc();

      setSuccess(`ICO parameters updated successfully! TxID: ${tx}`);
      await fetchCurrentParameters();
      
      setTotalSupply('');
      setTokenPrice('');
      setStartTime('');
      setDuration('');
      setRoundType('');
    } catch (err) {
      console.error('Error updating ICO parameters:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Update ICO Parameters</h2>
          {currentParameters && (
            <div className="mb-6 p-4 bg-gray-100 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Current Parameters:</h3>
              <p><strong>Total Supply:</strong> {formatSol(currentParameters.totalSupply)} SOL</p>
              <p><strong>Token Price:</strong> {formatSol(currentParameters.tokenPrice)} SOL</p>
              <p><strong>Start Time:</strong> {formatUnixTimestamp(currentParameters.startTime)}</p>
              <p><strong>Duration:</strong> {currentParameters.duration.toString()} seconds</p>
              <p><strong>Round Type:</strong> {getRoundTypeString(currentParameters.roundType)}</p>
            </div>
          )}
          <form onSubmit={handleUpdateParameters} className="space-y-4">
            <div>
              <label htmlFor="totalSupply" className="block text-sm font-medium text-gray-700">
                Total Supply (in SOL):
              </label>
              <input
                type="text"
                id="totalSupply"
                value={totalSupply}
                onChange={(e) => setTotalSupply(e.target.value)}
                placeholder="Leave blank to keep current value"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="tokenPrice" className="block text-sm font-medium text-gray-700">
                Token Price (in SOL):
              </label>
              <input
                type="text"
                id="tokenPrice"
                value={tokenPrice}
                onChange={(e) => setTokenPrice(e.target.value)}
                placeholder="Leave blank to keep current value"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                Start Time:
              </label>
              <input
                type="datetime-local"
                id="startTime"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                Duration (in seconds):
              </label>
              <input
                type="number"
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Leave blank to keep current value"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="roundType" className="block text-sm font-medium text-gray-700">
                Round Type:
              </label>
              <select
                id="roundType"
                value={roundType}
                onChange={(e) => setRoundType(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">Select to change round type</option>
                <option value="SeedRound">Seed Round</option>
                <option value="PreICO">Pre-ICO</option>
                <option value="PublicICO">Public ICO</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
            >
              {loading ? 'Updating...' : 'Update ICO Parameters'}
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
        </div>
      </div>
    </div>
  );
};

export default UpdateIcoParameters;










































































// import React, { useState, useEffect } from 'react';
// import { useConnection, useWallet } from '@solana/wallet-adapter-react';
// import { PublicKey } from '@solana/web3.js';
// import { getProgram } from '../utils/anchor-connection';
// import * as anchor from '@project-serum/anchor';
// import { getRoundTypeFromString, getRoundTypeString } from '../utils/enum-helpers';
// import { formatUnixTimestamp } from '../utils/formatters';

// const UpdateIcoParameters = () => {
//   const { connection } = useConnection();
//   const wallet = useWallet();
//   const [totalSupply, setTotalSupply] = useState('');
//   const [tokenPrice, setTokenPrice] = useState('');
//   const [startTime, setStartTime] = useState('');
//   const [duration, setDuration] = useState('');
//   const [roundType, setRoundType] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [currentParameters, setCurrentParameters] = useState(null);

//   useEffect(() => {
//     fetchCurrentParameters();
//   }, [connection, wallet.publicKey]);

//   const fetchCurrentParameters = async () => {
//     if (!wallet.publicKey) return;
//     try {
//       const program = getProgram(connection, wallet);
//       const [icoAccount] = await PublicKey.findProgramAddress(
//         [Buffer.from('ico')],
//         program.programId
//       );
//       const icoData = await program.account.icoAccount.fetch(icoAccount);
//       setCurrentParameters(icoData);
//     } catch (err) {
//       console.error('Error fetching current parameters:', err);
//       setError('Failed to fetch current parameters');
//     }
//   };

//   const handleUpdateParameters = async (e) => {
//     e.preventDefault();
//     if (!wallet.publicKey || !wallet.signTransaction) return;

//     setLoading(true);
//     setError('');
//     setSuccess('');

//     try {
//       const program = getProgram(connection, wallet);
//       const [icoAccount] = await PublicKey.findProgramAddress(
//         [Buffer.from('ico')],
//         program.programId
//       );

//       const totalSupplyBN = totalSupply ? new anchor.BN(totalSupply) : null;
//       const tokenPriceBN = tokenPrice ? new anchor.BN(tokenPrice) : null;
//       const startTimeBN = startTime 
//         ? new anchor.BN(Math.floor(new Date(startTime).getTime() / 1000))
//         : null;
//       const durationBN = duration 
//         ? new anchor.BN(Math.floor(parseFloat(duration) * 24 * 60 * 60))
//         : null;
//       const roundTypeEnum = roundType ? getRoundTypeFromString(roundType) : null;

//       const tx = await program.methods
//         .updateIcoParameters(
//           totalSupplyBN,
//           tokenPriceBN,
//           startTimeBN,
//           durationBN,
//           roundTypeEnum
//         )
//         .accounts({
//           authority: wallet.publicKey,
//           icoAccount,
//         })
//         .rpc();

//       setSuccess(`ICO parameters updated successfully! TxID: ${tx}`);
//       await fetchCurrentParameters();
      
//       setTotalSupply('');
//       setTokenPrice('');
//       setStartTime('');
//       setDuration('');
//       setRoundType('');
//     } catch (err) {
//       console.error('Error updating ICO parameters:', err);
//       setError(`Error: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-2xl mx-auto">
//       <div className="bg-white shadow-md rounded-lg overflow-hidden">
//         <div className="px-6 py-4">
//           <h2 className="text-2xl font-bold text-gray-800 mb-6">Update ICO Parameters</h2>
//           {currentParameters && (
//             <div className="mb-6 p-4 bg-gray-100 rounded-lg">
//               <h3 className="text-lg font-semibold mb-2">Current Parameters:</h3>
//               <p><strong>Total Supply:</strong> {currentParameters.totalSupply.toString()}</p>
//               <p><strong>Token Price:</strong> {currentParameters.tokenPrice.toString()} lamports</p>
//               <p><strong>Start Time:</strong> {formatUnixTimestamp(currentParameters.startTime)}</p>
//               <p><strong>Duration:</strong> {(currentParameters.duration.toNumber() / (24 * 60 * 60)).toFixed(2)} days</p>
//               <p><strong>Round Type:</strong> {getRoundTypeString(currentParameters.roundType)}</p>
//             </div>
//           )}
//           <form onSubmit={handleUpdateParameters} className="space-y-4">
//             <div>
//               <label htmlFor="totalSupply" className="block text-sm font-medium text-gray-700">
//                 Total Supply:
//               </label>
//               <input
//                 type="text"
//                 id="totalSupply"
//                 value={totalSupply}
//                 onChange={(e) => setTotalSupply(e.target.value)}
//                 placeholder="Leave blank to keep current value"
//                 className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
//               />
//             </div>
//             <div>
//               <label htmlFor="tokenPrice" className="block text-sm font-medium text-gray-700">
//                 Token Price (in lamports):
//               </label>
//               <input
//                 type="text"
//                 id="tokenPrice"
//                 value={tokenPrice}
//                 onChange={(e) => setTokenPrice(e.target.value)}
//                 placeholder="Leave blank to keep current value"
//                 className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
//               />
//             </div>
//             <div>
//               <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
//                 Start Time:
//               </label>
//               <input
//                 type="datetime-local"
//                 id="startTime"
//                 value={startTime}
//                 onChange={(e) => setStartTime(e.target.value)}
//                 className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
//               />
//             </div>
//             <div>
//               <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
//                 Duration (in days):
//               </label>
//               <input
//                 type="number"
//                 id="duration"
//                 value={duration}
//                 onChange={(e) => setDuration(e.target.value)}
//                 step="0.01"
//                 placeholder="Leave blank to keep current value"
//                 className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
//               />
//             </div>
//             <div>
//               <label htmlFor="roundType" className="block text-sm font-medium text-gray-700">
//                 Round Type:
//               </label>
//               <select
//                 id="roundType"
//                 value={roundType}
//                 onChange={(e) => setRoundType(e.target.value)}
//                 className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
//               >
//                 <option value="">Select to change round type</option>
//                 <option value="SeedRound">Seed Round</option>
//                 <option value="PreICO">Pre-ICO</option>
//                 <option value="PublicICO">Public ICO</option>
//               </select>
//             </div>
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
//             >
//               {loading ? 'Updating...' : 'Update ICO Parameters'}
//             </button>
//           </form>
//           {error && (
//             <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
//               {error}
//             </div>
//           )}
//           {success && (
//             <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md text-sm">
//               {success}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UpdateIcoParameters;








































// import React, { useState, useEffect } from 'react';
// import { useConnection, useWallet } from '@solana/wallet-adapter-react';
// import { PublicKey } from '@solana/web3.js';
// import { getProgram } from '../utils/anchor-connection';
// import { lamportsToSol, solToLamports } from '../utils/formatters';
// import { updateIcoParameters } from '../utils/ico-instructions';

// import { Buffer } from "buffer";

// Buffer.from("anything", "base64");
// window.Buffer = window.Buffer || require("buffer").Buffer;


// const UpdateIcoParameters = () => {
//   const { connection } = useConnection();
//   const wallet = useWallet();
//   const [icoData, setIcoData] = useState(null);
//   const [newParams, setNewParams] = useState({
//     tokenPrice: '',
//     totalSupply: '',
//     startTime: '',
//     duration: '',
//     roundType: '',
//   });
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   useEffect(() => {
//     if (wallet.publicKey) {
//       fetchIcoData();
//     }
//   }, [connection, wallet.publicKey]);

//   const fetchIcoData = async () => {
//     try {
//       const program = getProgram(connection, wallet);
//       const [icoAccount] = await PublicKey.findProgramAddress(
//         [Buffer.from("ico")],
//         program.programId
//       );
//       const data = await program.account.icoAccount.fetch(icoAccount);
//       setIcoData(data);
//       setNewParams({
//         tokenPrice: lamportsToSol(data.tokenPrice).toString(),
//         totalSupply: lamportsToSol(data.totalSupply).toString(),
//         startTime: data.startTime.toString(),
//         duration: data.duration.toString(),
//         roundType: Object.keys(data.roundType)[0],
//       });
//     } catch (err) {
//       console.error('Error:', err);
//       setError('Failed to fetch ICO data');
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError('');
//     setSuccess('');

//     try {
//       const updatedParams = {
//         tokenPrice: solToLamports(parseFloat(newParams.tokenPrice)),
//         totalSupply: solToLamports(parseFloat(newParams.totalSupply)),
//         startTime: new anchor.BN(newParams.startTime),
//         duration: new anchor.BN(newParams.duration),
//         roundType: { [newParams.roundType]: {} },
//       };

//       await updateIcoParameters(connection, wallet, updatedParams);
//       setSuccess('ICO parameters updated successfully');
//       fetchIcoData(); // Refresh ICO data after update
//     } catch (err) {
//       console.error('Error:', err);
//       setError(err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setNewParams(prev => ({ ...prev, [name]: value }));
//   };

//   if (!wallet.publicKey) {
//     return (
//       <div className="text-center py-12">
//         <h2 className="text-2xl font-semibold mb-4">Update ICO Parameters</h2>
//         <p className="text-gray-600">Please connect your wallet to update ICO parameters.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-2xl mx-auto">
//       <h1 className="text-3xl font-bold mb-6">Update ICO Parameters</h1>
//       <div className="bg-white rounded-lg shadow-md p-6">
//         <form onSubmit={handleSubmit}>
//           <div className="grid grid-cols-1 gap-6">
//             <div>
//               <label htmlFor="tokenPrice" className="block text-sm font-medium text-gray-700">
//                 Token Price (SOL)
//               </label>
//               <input
//                 type="number"
//                 id="tokenPrice"
//                 name="tokenPrice"
//                 value={newParams.tokenPrice}
//                 onChange={handleInputChange}
//                 className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
//                 required
//                 step="0.000000001"
//                 min="0"
//               />
//             </div>
//             <div>
//               <label htmlFor="totalSupply" className="block text-sm font-medium text-gray-700">
//                 Total Supply (SOL)
//               </label>
//               <input
//                 type="number"
//                 id="totalSupply"
//                 name="totalSupply"
//                 value={newParams.totalSupply}
//                 onChange={handleInputChange}
//                 className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
//                 required
//                 step="0.000000001"
//                 min="0"
//               />
//             </div>
//             <div>
//               <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
//                 Start Time (Unix Timestamp)
//               </label>
//               <input
//                 type="number"
//                 id="startTime"
//                 name="startTime"
//                 value={newParams.startTime}
//                 onChange={handleInputChange}
//                 className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
//                 required
//                 step="1"
//                 min="0"
//               />
//             </div>
//             <div>
//               <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
//                 Duration (Seconds)
//               </label>
//               <input
//                 type="number"
//                 id="duration"
//                 name="duration"
//                 value={newParams.duration}
//                 onChange={handleInputChange}
//                 className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
//                 required
//                 step="1"
//                 min="0"
//               />
//             </div>
//             <div>
//               <label htmlFor="roundType" className="block text-sm font-medium text-gray-700">
//                 Round Type
//               </label>
//               <select
//                 id="roundType"
//                 name="roundType"
//                 value={newParams.roundType}
//                 onChange={handleInputChange}
//                 className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
//                 required
//               >
//                 <option value="SeedRound">Seed Round</option>
//                 <option value="PreICO">Pre-ICO</option>
//                 <option value="PublicICO">Public ICO</option>
//               </select>
//             </div>
//           </div>
//           <div className="mt-6">
//             <button
//               type="submit"
//               className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
//               disabled={isLoading}
//             >
//               {isLoading ? 'Updating...' : 'Update Parameters'}
//             </button>
//           </div>
//         </form>
//         {error && <p className="mt-4 text-red-600">{error}</p>}
//         {success && <p className="mt-4 text-green-600">{success}</p>}
//       </div>
//     </div>
//   );
// };

// export default UpdateIcoParameters;















































// import React, { useState, useEffect } from 'react';
// import { useConnection, useWallet } from '@solana/wallet-adapter-react';
// import { PublicKey } from '@solana/web3.js';
// import { getProgram } from '../utils/anchor-connection';
// import * as anchor from '@project-serum/anchor';
// import { getRoundTypeFromString, getRoundTypeString } from '../utils/enum-helpers';

// const UpdateIcoParameters = () => {
//   const { connection } = useConnection();
//   const wallet = useWallet();
//   const [totalSupply, setTotalSupply] = useState('');
//   const [tokenPrice, setTokenPrice] = useState('');
//   const [startTime, setStartTime] = useState('');
//   const [duration, setDuration] = useState('');
//   const [roundType, setRoundType] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [currentParameters, setCurrentParameters] = useState(null);

//   useEffect(() => {
//     fetchCurrentParameters();
//   }, [connection, wallet.publicKey]);

//   const fetchCurrentParameters = async () => {
//     if (!wallet.publicKey) return;
//     try {
//       const program = getProgram(connection, wallet);
//       const [icoAccount] = await PublicKey.findProgramAddress(
//         [Buffer.from('ico')],
//         program.programId
//       );
//       const icoData = await program.account.icoAccount.fetch(icoAccount);
//       setCurrentParameters(icoData);
//     } catch (err) {
//       console.error('Error fetching current parameters:', err);
//       setError('Failed to fetch current parameters');
//     }
//   };

//   const handleUpdateParameters = async (e) => {
//     e.preventDefault();
//     if (!wallet.publicKey || !wallet.signTransaction) return;

//     setLoading(true);
//     setError('');
//     setSuccess('');

//     try {
//       const program = getProgram(connection, wallet);
//       const [icoAccount] = await PublicKey.findProgramAddress(
//         [Buffer.from('ico')],
//         program.programId
//       );

//       // Convert values to BN where needed and handle null cases
//       const totalSupplyBN = totalSupply ? new anchor.BN(totalSupply) : null;
//       const tokenPriceBN = tokenPrice ? new anchor.BN(tokenPrice) : null;
//       const startTimeBN = startTime 
//         ? new anchor.BN(Math.floor(new Date(startTime).getTime() / 1000))
//         : null;
//       const durationBN = duration 
//         ? new anchor.BN(Math.floor(parseFloat(duration) * 24 * 60 * 60))
//         : null;
//       const roundTypeEnum = roundType ? getRoundTypeFromString(roundType) : null;

//       const tx = await program.methods
//         .updateIcoParameters(
//           totalSupplyBN,
//           tokenPriceBN,
//           startTimeBN,
//           durationBN,
//           roundTypeEnum
//         )
//         .accounts({
//           authority: wallet.publicKey,
//           icoAccount,
//         })
//         .rpc();

//       setSuccess(`ICO parameters updated successfully! TxID: ${tx}`);
//       await fetchCurrentParameters();
      
//       // Clear form after successful update
//       setTotalSupply('');
//       setTokenPrice('');
//       setStartTime('');
//       setDuration('');
//       setRoundType('');
//     } catch (err) {
//       console.error('Error updating ICO parameters:', err);
//       setError(`Error: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatDateTime = (timestamp) => {
//     if (!timestamp) return '';
//     return new Date(timestamp.toNumber() * 1000).toLocaleString();
//   };

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h2 className="text-2xl font-bold mb-6">Update ICO Parameters</h2>
//       {currentParameters && (
//         <div className="mb-6 p-4 bg-gray-100 rounded">
//           <h3 className="text-lg font-semibold mb-2">Current Parameters:</h3>
//           <p>Total Supply: {currentParameters.totalSupply.toString()}</p>
//           <p>Token Price: {currentParameters.tokenPrice.toString()} lamports</p>
//           <p>Start Time: {formatDateTime(currentParameters.startTime)}</p>
//           <p>Duration: {(currentParameters.duration.toNumber() / (24 * 60 * 60)).toFixed(6)} days</p>
//           <p>Round Type: {getRoundTypeString(currentParameters.roundType)}</p>
//         </div>
//       )}
//       <form onSubmit={handleUpdateParameters} className="space-y-4">
//         <div>
//           <label htmlFor="totalSupply" className="block text-sm font-medium text-gray-700">
//             Total Supply:
//           </label>
//           <input
//             type="text"
//             id="totalSupply"
//             value={totalSupply}
//             onChange={(e) => setTotalSupply(e.target.value)}
//             className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
//             placeholder="Leave blank to keep current value"
//           />
//         </div>
//         <div>
//           <label htmlFor="tokenPrice" className="block text-sm font-medium text-gray-700">
//             Token Price (in lamports):
//           </label>
//           <input
//             type="text"
//             id="tokenPrice"
//             value={tokenPrice}
//             onChange={(e) => setTokenPrice(e.target.value)}
//             className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
//             placeholder="Leave blank to keep current value"
//           />
//         </div>
//         <div>
//           <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
//             Start Time:
//           </label>
//           <input
//             type="datetime-local"
//             id="startTime"
//             value={startTime}
//             onChange={(e) => setStartTime(e.target.value)}
//             className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
//           />
//         </div>
//         <div>
//           <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
//             Duration (in days):
//           </label>
//           <input
//             type="number"
//             id="duration"
//             value={duration}
//             onChange={(e) => setDuration(e.target.value)}
//             step="0.000001"
//             className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
//             placeholder="Leave blank to keep current value"
//           />
//         </div>
//         <div>
//           <label htmlFor="roundType" className="block text-sm font-medium text-gray-700">
//             Round Type:
//           </label>
//           <select
//             id="roundType"
//             value={roundType}
//             onChange={(e) => setRoundType(e.target.value)}
//             className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
//           >
//             <option value="">Select to change round type</option>
//             <option value="SeedRound">Seed Round</option>
//             <option value="PreICO">Pre-ICO</option>
//             <option value="PublicICO">Public ICO</option>
//           </select>
//         </div>
//         <button
//           type="submit"
//           disabled={loading}
//           className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
//         >
//           {loading ? 'Updating...' : 'Update ICO Parameters'}
//         </button>
//       </form>
//       {error && (
//         <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
//           {error}
//         </div>
//       )}
//       {success && (
//         <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
//           {success}
//         </div>
//       )}
//     </div>
//   );
// };

// export default UpdateIcoParameters;