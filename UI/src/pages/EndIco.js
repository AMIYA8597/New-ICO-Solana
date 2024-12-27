import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getProgram } from '../utils/anchor-connection';
import { lamportsToSol } from '../utils/formatters';
import { endIco } from '../utils/ico-instructions';

const EndIco = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [icoData, setIcoData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (wallet.publicKey) {
      fetchIcoData();
    }
  }, [connection, wallet.publicKey]);

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
      setError('Failed to fetch ICO data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndIco = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      await endIco(connection, wallet);
      setSuccess('ICO ended successfully');
      fetchIcoData(); // Refresh ICO data after ending
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
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
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">End ICO</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading ICO data...</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">ICO Status</h2>
              <p className="text-lg">
                Status: {' '}
                {icoData?.isActive ? (
                  <span className="text-green-600 font-semibold">Active</span>
                ) : (
                  <span className="text-red-600 font-semibold">Inactive</span>
                )}
              </p>
              <p className="text-lg mt-2">
                Tokens Sold: {lamportsToSol(icoData?.tokensSold).toFixed(4)} SOL
              </p>
              <p className="text-lg mt-2">
                Total Raised: {lamportsToSol(icoData?.totalSupply).toFixed(4)} SOL
              </p>
            </div>
            {icoData?.isActive && (
              <div className="mt-6">
                <button
                  onClick={handleEndIco}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? 'Ending ICO...' : 'End ICO'}
                </button>
                <p className="mt-2 text-sm text-gray-600">
                  Warning: This action is irreversible. Make sure you want to end the ICO before proceeding.
                </p>
              </div>
            )}
            {!icoData?.isActive && (
              <p className="text-lg font-semibold text-center">The ICO has already ended.</p>
            )}
          </>
        )}
        {error && <p className="mt-4 text-red-600">{error}</p>}
        {success && <p className="mt-4 text-green-600">{success}</p>}
      </div>
    </div>
  );
};

export default EndIco;

