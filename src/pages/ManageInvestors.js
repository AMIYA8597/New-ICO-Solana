import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getProgram } from '../utils/anchor-connection';

const ManageInvestors = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [investors, setInvestors] = useState([]);
  const [newInvestor, setNewInvestor] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSeedInvestors();
  }, [connection, wallet.publicKey]);

  const fetchSeedInvestors = async () => {
    if (!wallet.publicKey) return;
    try {
      const program = getProgram(connection, wallet);
      const [icoAccount] = await PublicKey.findProgramAddress(
        [Buffer.from("ico")],
        program.programId
      );
      const icoData = await program.account.icoAccount.fetch(icoAccount);
      setInvestors(icoData.seedInvestors.map(investor => investor.toBase58()));
    } catch (err) {
      console.error('Error fetching seed investors:', err);
      setError('Failed to fetch seed investors');
    }
  };

  const handleAddInvestor = async (e) => {
    e.preventDefault();
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

      await program.methods
        .addSeedInvestor(new PublicKey(newInvestor))
        .accounts({
          authority: wallet.publicKey,
          icoAccount,
        })
        .rpc();

      setSuccess(`Investor ${newInvestor} added successfully!`);
      setNewInvestor('');
      fetchSeedInvestors();
    } catch (err) {
      console.error('Error adding seed investor:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveInvestor = async (investorToRemove) => {
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

      await program.methods
        .removeSeedInvestor(new PublicKey(investorToRemove))
        .accounts({
          authority: wallet.publicKey,
          icoAccount,
        })
        .rpc();

      setSuccess(`Investor ${investorToRemove} removed successfully!`);
      fetchSeedInvestors();
    } catch (err) {
      console.error('Error removing seed investor:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Manage Seed Investors</h2>
      <form onSubmit={handleAddInvestor} className="mb-6">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newInvestor}
            onChange={(e) => setNewInvestor(e.target.value)}
            placeholder="Enter Solana address"
            className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Investor'}
          </button>
        </div>
      </form>
      {error && <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}
      {success && <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">{success}</div>}
      <h3 className="text-xl font-semibold mb-4">Current Seed Investors</h3>
      <ul className="space-y-2">
        {investors.map((investor, index) => (
          <li key={index} className="flex justify-between items-center bg-gray-100 p-2 rounded">
            <span className="text-sm font-mono">{investor}</span>
            <button
              onClick={() => handleRemoveInvestor(investor)}
              disabled={loading}
              className="text-red-600 hover:text-red-800 focus:outline-none"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageInvestors;

