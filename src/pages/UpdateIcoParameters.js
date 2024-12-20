import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getProgram } from '../utils/anchor-connection';
import * as anchor from '@project-serum/anchor';
import { getRoundTypeFromString, getRoundTypeString } from '../utils/enum-helpers';
import { formatUnixTimestamp } from '../utils/formatters';

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
              <p><strong>Total Supply:</strong> {currentParameters.totalSupply.toString()}</p>
              <p><strong>Token Price:</strong> {currentParameters.tokenPrice.toString()} lamports</p>
              <p><strong>Start Time:</strong> {formatUnixTimestamp(currentParameters.startTime)}</p>
              <p><strong>Duration:</strong> {currentParameters.duration.toString()} seconds</p>
              <p><strong>Round Type:</strong> {getRoundTypeString(currentParameters.roundType)}</p>
            </div>
          )}
          <form onSubmit={handleUpdateParameters} className="space-y-4">
            <div>
              <label htmlFor="totalSupply" className="block text-sm font-medium text-gray-700">
                Total Supply:
              </label>
              <input
                type="text"
                id="totalSupply"
                value={totalSupply}
                onChange={(e) => setTotalSupply(e.target.value)}
                placeholder="Leave blank to keep current value"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="tokenPrice" className="block text-sm font-medium text-gray-700">
                Token Price (in lamports):
              </label>
              <input
                type="text"
                id="tokenPrice"
                value={tokenPrice}
                onChange={(e) => setTokenPrice(e.target.value)}
                placeholder="Leave blank to keep current value"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
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
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
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
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
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
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
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