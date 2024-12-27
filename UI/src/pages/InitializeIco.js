import React, { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getProgram } from '../utils/anchor-connection';
import * as anchor from '@project-serum/anchor';

import { Buffer } from "buffer";

Buffer.from("anything", "base64");
window.Buffer = window.Buffer || require("buffer").Buffer;


const InitializeIco = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [totalSupply, setTotalSupply] = useState('');
  const [tokenPrice, setTokenPrice] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('');
  const [roundType, setRoundType] = useState('SeedRound');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInitialize = async (e) => {
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

      const mint = new PublicKey(process.env.REACT_APP_TOKEN_MINT_ADDRESS);

      const tx = await program.methods
        .initialize(
          new anchor.BN(totalSupply),
          new anchor.BN(tokenPrice),
          new anchor.BN(Math.floor(new Date(startTime).getTime() / 1000)),
          new anchor.BN(parseInt(duration) * 24 * 60 * 60),
          { [roundType]: {} }
        )
        .accounts({
          authority: wallet.publicKey,
          icoAccount,
          tokenMint: mint,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      setSuccess(`ICO initialized successfully! TxID: ${tx}`);
    } catch (err) {
      console.error('Error initializing ICO:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Initialize ICO</h2>
      <form onSubmit={handleInitialize} className="space-y-4">
        <div>
          <label htmlFor="totalSupply" className="block text-sm font-medium text-gray-700">Total Supply:</label>
          <input
            type="number"
            id="totalSupply"
            value={totalSupply}
            onChange={(e) => setTotalSupply(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>
        <div>
          <label htmlFor="tokenPrice" className="block text-sm font-medium text-gray-700">Token Price (in lamports):</label>
          <input
            type="number"
            id="tokenPrice"
            value={tokenPrice}
            onChange={(e) => setTokenPrice(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>
        <div>
          <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Start Time:</label>
          <input
            type="datetime-local"
            id="startTime"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>
        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Duration (in days):</label>
          <input
            type="number"
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>
        <div>
          <label htmlFor="roundType" className="block text-sm font-medium text-gray-700">Round Type:</label>
          <select
            id="roundType"
            value={roundType}
            onChange={(e) => setRoundType(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          >
            <option value="SeedRound">Seed Round</option>
            <option value="PreICO">Pre-ICO</option>
            <option value="PublicICO">Public ICO</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Initializing...' : 'Initialize ICO'}
        </button>
      </form>
      {error && <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}
      {success && <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">{success}</div>}
    </div>
  );
};

export default InitializeIco;

