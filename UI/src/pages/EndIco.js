import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getProgram } from '../utils/anchor-connection';
import { formatSol } from '../utils/formatters';

const EndIco = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [icoData, setIcoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (wallet.publicKey) {
      fetchIcoData();
    }
  }, [connection, wallet.publicKey]);

  const fetchIcoData = async () => {
    if (!wallet.publicKey) return;

    setLoading(true);
    setError('');

    try {
      const program = getProgram(connection, wallet);
      const [icoAccount] = await PublicKey.findProgramAddress(
        [Buffer.from('ico')],
        program.programId
      );
      const data = await program.account.icoAccount.fetch(icoAccount);
      setIcoData({
        ...data,
        tokensSold: Number(data.tokensSold),
        totalSupply: Number(data.totalSupply),
        tokenPrice: Number(data.tokenPrice),
      });
    } catch (err) {
      console.error('Error fetching ICO data:', err);
      setError('Failed to fetch ICO data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleEndIco = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) return;

    setEnding(true);
    setError('');
    setSuccess('');

    try {
      const program = getProgram(connection, wallet);
      const [icoAccount] = await PublicKey.findProgramAddress(
        [Buffer.from('ico')],
        program.programId
      );

      const tx = await program.methods
        .endIco()
        .accounts({
          icoAccount,
          authority: wallet.publicKey,
        })
        .rpc();

      setSuccess(`ICO ended successfully! Transaction ID: ${tx}`);
      await fetchIcoData(); // Refresh ICO data
    } catch (err) {
      console.error('Error ending ICO:', err);
      setError('Failed to end ICO. Please try again later.');
    } finally {
      setEnding(false);
    }
  };

  if (!wallet.publicKey) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">End ICO</h2>
        <p className="text-gray-600">Please connect your wallet to end the ICO.</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">End ICO</h2>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading ICO data...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
            {error}
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Supply</p>
                <p className="text-lg font-semibold">{formatSol(icoData.totalSupply)} SOL</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Tokens Sold</p>
                <p className="text-lg font-semibold">{formatSol(icoData.tokensSold)} SOL</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Token Price</p>
                <p className="text-lg font-semibold">{formatSol(icoData.tokenPrice)} SOL</p>
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
            <button
              onClick={handleEndIco}
              disabled={ending || !icoData.isActive}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              {ending ? 'Ending ICO...' : 'End ICO'}
            </button>
            {!icoData.isActive && (
              <p className="mt-2 text-sm text-gray-600">The ICO is already inactive.</p>
            )}
          </>
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

export default EndIco;

