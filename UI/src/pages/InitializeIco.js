import React, { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getProgram } from '../utils/anchor-connection';
import * as anchor from '@project-serum/anchor';

const InitializeIco = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [formData, setFormData] = useState({
    totalSupply: '',
    tokenPrice: '',
    startTime: '',
    duration: '',
    roundType: 'public',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
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

      const totalSupply = new anchor.BN(parseFloat(formData.totalSupply) * anchor.web3.LAMPORTS_PER_SOL);
      const tokenPrice = new anchor.BN(parseFloat(formData.tokenPrice) * anchor.web3.LAMPORTS_PER_SOL);
      const startTime = new anchor.BN(Math.floor(new Date(formData.startTime).getTime() / 1000));
      const duration = new anchor.BN(parseInt(formData.duration) * 24 * 60 * 60); // Convert days to seconds

      const tx = await program.methods
        .initializeIco(totalSupply, tokenPrice, startTime, duration, { [formData.roundType]: {} })
        .accounts({
          icoAccount,
          authority: wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      setSuccess(`ICO initialized successfully! Transaction ID: ${tx}`);
    } catch (err) {
      console.error('Error initializing ICO:', err);
      setError('Failed to initialize ICO. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Initialize ICO</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="totalSupply" className="block text-sm font-medium text-gray-700 mb-1">
              Total Supply (SOL):
            </label>
            <input
              type="number"
              id="totalSupply"
              name="totalSupply"
              value={formData.totalSupply}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
              min="0"
              step="0.000000001"
            />
          </div>
          <div>
            <label htmlFor="tokenPrice" className="block text-sm font-medium text-gray-700 mb-1">
              Token Price (SOL):
            </label>
            <input
              type="number"
              id="tokenPrice"
              name="tokenPrice"
              value={formData.tokenPrice}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
              min="0"
              step="0.000000001"
            />
          </div>
          <div>
            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
              Start Time:
            </label>
            <input
              type="datetime-local"
              id="startTime"
              name="startTime"
              value={formData.startTime}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
              Duration (days):
            </label>
            <input
              type="number"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
              min="1"
            />
          </div>
          <div>
            <label htmlFor="roundType" className="block text-sm font-medium text-gray-700 mb-1">
              Round Type:
            </label>
            <select
              id="roundType"
              name="roundType"
              value={formData.roundType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="seed">Seed</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading || !wallet.publicKey}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            {loading ? 'Initializing...' : 'Initialize ICO'}
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
  );
};

export default InitializeIco;

