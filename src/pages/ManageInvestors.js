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
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Manage Seed Investors</h2>
          <form onSubmit={handleAddInvestor} className="mb-6">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newInvestor}
                onChange={(e) => setNewInvestor(e.target.value)}
                placeholder="Enter Solana address"
                className="flex-grow px-3 py-2 placeholder-gray-400 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
              >
                {loading ? 'Adding...' : 'Add Investor'}
              </button>
            </div>
          </form>
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md text-sm">
              {success}
            </div>
          )}
          <h3 className="text-xl font-semibold mb-4">Current Seed Investors</h3>
          <ul className="space-y-2">
            {investors.map((investor, index) => (
              <li key={index} className="flex justify-between items-center bg-gray-100 p-3 rounded-lg">
                <span className="text-sm font-mono text-gray-600">{investor}</span>
                <button
                  onClick={() => handleRemoveInvestor(investor)}
                  disabled={loading}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-xs focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ManageInvestors;
