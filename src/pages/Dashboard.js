import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getProgram } from '../utils/anchor-connection';
import { formatUnixTimestamp, formatLamports } from '../utils/formatters';

const Dashboard = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [icoData, setIcoData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (wallet.publicKey) {
      fetchIcoData();
    }
  }, [connection, wallet.publicKey]);

  useEffect(() => {
    if (icoData) {
      const timer = setInterval(() => {
        const now = Math.floor(Date.now() / 1000);
        const endTime = Number(icoData.startTime) + Number(icoData.duration);
        const remaining = endTime - now;
        
        if (remaining <= 0) {
          clearInterval(timer);
          setTimeLeft("ICO Ended");
        } else {
          const days = Math.floor(remaining / 86400);
          const hours = Math.floor((remaining % 86400) / 3600);
          const minutes = Math.floor((remaining % 3600) / 60);
          const seconds = remaining % 60;
          setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [icoData]);

  const fetchIcoData = async () => {
    try {
      const program = getProgram(connection, wallet);
      const [icoAccount] = await PublicKey.findProgramAddress(
        [Buffer.from("ico")],
        program.programId
      );
      const data = await program.account.icoAccount.fetch(icoAccount);
      setIcoData(data);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  if (!wallet.publicKey) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">Welcome to Solana ICO Dashboard</h2>
        <p className="text-gray-600">Please connect your wallet to view ICO details.</p>
      </div>
    );
  }

  if (!icoData) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading ICO details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-6">ICO Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-gradient-to-br from-sky-700 to-sky-800 text-white">
          <h2 className="text-xl font-semibold mb-2">Total Supply</h2>
          <p className="text-3xl font-bold">{formatLamports(icoData.totalSupply)}</p>
          <p className="mt-2 text-sm">Round Type: {Object.keys(icoData.roundType)[0]}</p>
        </div>
        <div className="card bg-gradient-to-br from-slate-500 to-slate-600 text-white">
          <h2 className="text-xl font-semibold mb-2">Tokens Sold</h2>
          <p className="text-3xl font-bold">{formatLamports(icoData.tokensSold)}</p>
          <p className="mt-2 text-sm">
            {((Number(icoData.tokensSold) / Number(icoData.totalSupply)) * 100).toFixed(2)}% of total supply
          </p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-2xl font-semibold mb-4">Sale Progress</h2>
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-sky-600 bg-sky-200">
                {((Number(icoData.tokensSold) / Number(icoData.totalSupply)) * 100).toFixed(2)}%
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-sky-600">
                {formatLamports(icoData.tokensSold)} / {formatLamports(icoData.totalSupply)}
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

      <div className="card">
        <h2 className="text-2xl font-semibold mb-4">ICO Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Token Price</p>
            <p className="text-lg font-semibold">{formatLamports(icoData.tokenPrice)} SOL</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Start Time</p>
            <p className="text-lg font-semibold">{formatUnixTimestamp(icoData.startTime)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">End Time</p>
            <p className="text-lg font-semibold">
              {formatUnixTimestamp(Number(icoData.startTime) + Number(icoData.duration))}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Time Remaining</p>
            <p className="text-lg font-semibold">{timeLeft}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Status</p>
            <p className="text-lg font-semibold">
              {icoData.isActive ? (
                <span className="text-green-500">Active</span>
              ) : (
                <span className="text-red-500">Inactive</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
































































// import React, { useState, useEffect } from 'react';
// import { useConnection, useWallet } from '@solana/wallet-adapter-react';
// import { PublicKey } from '@solana/web3.js';
// import { getProgram } from '../utils/anchor-connection';

// import { Buffer } from "buffer/"; 
// window.Buffer = Buffer;

// const Dashboard = () => {
//   const { connection } = useConnection();
//   const wallet = useWallet();
//   const [icoData, setIcoData] = useState(null);

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
//     } catch (err) {
//       console.error('Error:', err);
//     }
//   };

//   if (!wallet.publicKey) {
//     return (
//       <div className="text-center py-12">
//         Please connect your wallet to view ICO details.
//       </div>
//     );
//   }

//   if (!icoData) {
//     return (
//       <div className="text-center py-12">
//         Loading ICO details...
//       </div>
//     );
//   }

//   const formatDuration = (duration) => {
//     const days = Math.floor(duration / 86400);
//     const hours = Math.floor((duration % 86400) / 3600);
//     const minutes = Math.floor((duration % 3600) / 60);
//     const seconds = duration % 60;
//     return `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;
//   };

//   const formatEndTime = (startTime, duration) => {
//     const endTime = new Date((startTime + duration) * 1000);
//     return endTime.toLocaleDateString(undefined, {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//       second: '2-digit',
//       hour12: false
//     });
//   };

//   return (
//     <div className="space-y-6">
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div className="bg-white p-6 rounded-lg shadow">
//           <div className="flex items-center space-x-4">
//             <div className="p-2 bg-gray-100 rounded-full">
//               <svg className="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//             </div>
//             <div>
//               <h3 className="text-sm font-medium text-gray-500">Total Supply</h3>
//               <p className="text-2xl font-semibold">{icoData.totalSupply.toString()}</p>
//               <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
//                 {Object.keys(icoData.roundType)[0]}
//               </span>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-lg shadow">
//           <div className="flex items-center space-x-4">
//             <div className="p-2 bg-gray-100 rounded-full">
//               <svg className="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
//               </svg>
//             </div>
//             <div>
//               <h3 className="text-sm font-medium text-gray-500">Tokens Sold</h3>
//               <p className="text-2xl font-semibold">{icoData.tokensSold.toString()}</p>
//               <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
//                 {((Number(icoData.tokensSold) / Number(icoData.totalSupply)) * 100).toFixed(2)}%
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div>
//         <h2 className="text-lg font-medium mb-4">Sale Progress</h2>
//         <div className="bg-white p-6 rounded-lg shadow">
//           <div className="space-y-4">
//             <div>
//               <div className="flex justify-between text-sm">
//                 <span>Tokens Sold</span>
//                 <span>{icoData.tokensSold.toString()} / {icoData.totalSupply.toString()}</span>
//               </div>
//               <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
//                 <div 
//                   className="h-full bg-purple-600 rounded-full transition-all duration-500 ease-in-out"
//                   style={{ 
//                     width: `${(Number(icoData.tokensSold) / Number(icoData.totalSupply)) * 100}%`
//                   }}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div>
//         <h2 className="text-lg font-medium mb-4">ICO Details</h2>
//         <div className="bg-white p-6 rounded-lg shadow">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <p className="text-sm font-medium text-gray-500">Token Price</p>
//               <p className="text-lg font-semibold">{icoData.tokenPrice.toString()} lamports</p>
//             </div>
//             <div>
//               <p className="text-sm font-medium text-gray-500">Start Time</p>
//               <p className="text-lg font-semibold">
//                 {new Date(icoData.startTime * 1000).toLocaleString()}
//               </p>
//             </div>
//             {/* <div>
//               <p className="text-sm font-medium text-gray-500">End Time</p>
//               <p className="text-lg font-semibold">
//                 {formatEndTime(icoData.startTime, icoData.duration)}
//               </p>
//             </div> */}
//             <div>
//               <p className="text-sm font-medium text-gray-500">End Time</p>
//               <p className="text-lg font-semibold">{formatDuration(icoData.duration)}</p>
//             </div>
//             <div>
//               <p className="text-sm font-medium text-gray-500">Status</p>
//               <p className="text-lg font-semibold">
//                 {icoData.isActive ? (
//                   <span className="text-green-600">Active</span>
//                 ) : (
//                   <span className="text-red-600">Inactive</span>
//                 )}
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;






















// import React, { useState, useEffect } from 'react';
// import { useConnection, useWallet } from '@solana/wallet-adapter-react';
// import { PublicKey } from '@solana/web3.js';
// import { getProgram } from '../utils/anchor-connection';

// import { Buffer } from "buffer/"; 
// window.Buffer = Buffer;

// const Dashboard = () => {
//   const { connection } = useConnection();
//   const wallet = useWallet();
//   const [icoData, setIcoData] = useState(null);

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
//     } catch (err) {
//       console.error('Error:', err);
//     }
//   };

//   if (!wallet.publicKey) {
//     return (
//       <div className="text-center py-12">
//         Please connect your wallet to view ICO details.
//       </div>
//     );
//   }

//   if (!icoData) {
//     return (
//       <div className="text-center py-12">
//         Loading ICO details...
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div className="bg-white p-6 rounded-lg shadow">
//           <div className="flex items-center space-x-4">
//             <div className="p-2 bg-gray-100 rounded-full">
//               <svg className="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//             </div>
//             <div>
//               <h3 className="text-sm font-medium text-gray-500">Total Supply</h3>
//               <p className="text-2xl font-semibold">{icoData.totalSupply.toString()}</p>
//               <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
//                 {Object.keys(icoData.roundType)[0]}
//               </span>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-lg shadow">
//           <div className="flex items-center space-x-4">
//             <div className="p-2 bg-gray-100 rounded-full">
//               <svg className="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
//               </svg>
//             </div>
//             <div>
//               <h3 className="text-sm font-medium text-gray-500">Tokens Sold</h3>
//               <p className="text-2xl font-semibold">{icoData.tokensSold.toString()}</p>
//               <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
//                 {((Number(icoData.tokensSold) / Number(icoData.totalSupply)) * 100).toFixed(2)}%
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div>
//         <h2 className="text-lg font-medium mb-4">Sale Progress</h2>
//         <div className="bg-white p-6 rounded-lg shadow">
//           <div className="space-y-4">
//             <div>
//               <div className="flex justify-between text-sm">
//                 <span>Tokens Sold</span>
//                 <span>{icoData.tokensSold.toString()} / {icoData.totalSupply.toString()}</span>
//               </div>
//               <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
//                 <div 
//                   className="h-full bg-purple-600 rounded-full transition-all duration-500 ease-in-out"
//                   style={{ 
//                     width: `${(Number(icoData.tokensSold) / Number(icoData.totalSupply)) * 100}%`
//                   }}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div>
//         <h2 className="text-lg font-medium mb-4">ICO Details</h2>
//         <div className="bg-white p-6 rounded-lg shadow">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <p className="text-sm font-medium text-gray-500">Token Price</p>
//               <p className="text-lg font-semibold">{icoData.tokenPrice.toString()} lamports</p>
//             </div>
//             <div>
//               <p className="text-sm font-medium text-gray-500">Start Time</p>
//               <p className="text-lg font-semibold">
//                 {new Date(icoData.startTime * 1000).toLocaleString()}
//               </p>
//             </div>
//             <div>
//               <p className="text-sm font-medium text-gray-500">Duration</p>
//               <p className="text-lg font-semibold">
//                 {`${Math.floor(icoData.duration / 86400)} days`}
//               </p>
//             </div>
//             <div>
//               <p className="text-sm font-medium text-gray-500">Status</p>
//               <p className="text-lg font-semibold">
//                 {icoData.isActive ? (
//                   <span className="text-green-600">Active</span>
//                 ) : (
//                   <span className="text-red-600">Inactive</span>
//                 )}
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

































// import React, { useState, useEffect } from 'react';
// import { useConnection, useWallet } from '@solana/wallet-adapter-react';
// import { PublicKey } from '@solana/web3.js';
// import { getProgram } from '../utils/anchor-connection';

// import { Buffer } from "buffer/"; 
// window.Buffer = Buffer;

// const Dashboard = () => {
//   const { connection } = useConnection();
//   const wallet = useWallet();
//   const [icoData, setIcoData] = useState(null);

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
//     } catch (err) {
//       console.error('Error:', err);
//     }
//   };

//   if (!wallet.publicKey) {
//     return (
//       <div className="text-center py-12">
//         Please connect your wallet to view ICO details.
//       </div>
//     );
//   }

//   if (!icoData) {
//     return (
//       <div className="text-center py-12">
//         Loading ICO details...
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div className="bg-white p-6 rounded-lg shadow">
//           <div className="flex items-center space-x-4">
//             <div className="p-2 bg-gray-100 rounded-full">
//               <svg className="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//             </div>
//             <div>
//               <h3 className="text-sm font-medium text-gray-500">Total Supply</h3>
//               <p className="text-2xl font-semibold">{icoData.totalSupply.toString()}</p>
//               <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
//                 {Object.keys(icoData.roundType)[0]}
//               </span>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-lg shadow">
//           <div className="flex items-center space-x-4">
//             <div className="p-2 bg-gray-100 rounded-full">
//               <svg className="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
//               </svg>
//             </div>
//             <div>
//               <h3 className="text-sm font-medium text-gray-500">Tokens Sold</h3>
//               <p className="text-2xl font-semibold">{icoData.tokensSold.toString()}</p>
//               <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
//                 {((Number(icoData.tokensSold) / Number(icoData.totalSupply)) * 100).toFixed(2)}%
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div>
//         <h2 className="text-lg font-medium mb-4">Sale Progress</h2>
//         <div className="bg-white p-6 rounded-lg shadow">
//           <div className="space-y-4">
//             <div>
//               <div className="flex justify-between text-sm">
//                 <span>Tokens Sold</span>
//                 <span>{icoData.tokensSold.toString()} / {icoData.totalSupply.toString()}</span>
//               </div>
//               <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
//                 <div 
//                   className="h-full bg-purple-600 rounded-full transition-all duration-500 ease-in-out"
//                   style={{ 
//                     width: `${(Number(icoData.tokensSold) / Number(icoData.totalSupply)) * 100}%`
//                   }}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div>
//         <h2 className="text-lg font-medium mb-4">ICO Details</h2>
//         <div className="bg-white p-6 rounded-lg shadow">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <p className="text-sm font-medium text-gray-500">Token Price</p>
//               <p className="text-lg font-semibold">{icoData.tokenPrice.toString()} lamports</p>
//             </div>
//             <div>
//               <p className="text-sm font-medium text-gray-500">Start Time</p>
//               <p className="text-lg font-semibold">
//                 {new Date(icoData.startTime * 1000).toLocaleString()}
//               </p>
//             </div>
//             <div>
//               <p className="text-sm font-medium text-gray-500">Duration</p>
//               <p className="text-lg font-semibold">{icoData.duration.toString()} seconds</p>
//             </div>
//             <div>
//               <p className="text-sm font-medium text-gray-500">Status</p>
//               <p className="text-lg font-semibold">
//                 {icoData.isActive ? (
//                   <span className="text-green-600">Active</span>
//                 ) : (
//                   <span className="text-red-600">Inactive</span>
//                 )}
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;





































































// import React from 'react';
// import { Link } from 'react-router-dom';
// import IcoDetails from '../components/Icodetails';

// import { Buffer } from "buffer/"; 
// window.Buffer = Buffer;

// const Dashboard = () => {
//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold mb-8">ICO Dashboard</h1>
//       <IcoDetails />
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//         <Link to="/buy" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded text-center">
//           Buy Tokens
//         </Link>
//         <Link to="/balance" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded text-center">
//           Check Balance
//         </Link>
//         <Link to="/manage-investors" className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded text-center">
//           Manage Investors
//         </Link>
//         <Link to="/update-parameters" className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded text-center">
//           Update ICO Parameters
//         </Link>
//         <Link to="/distribute-tokens" className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded text-center">
//           Distribute Tokens
//         </Link>
//         <Link to="/end-ico" className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded text-center">
//           End ICO
//         </Link>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
