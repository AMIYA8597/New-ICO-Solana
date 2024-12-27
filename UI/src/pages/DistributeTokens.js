import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getProgram } from '../utils/anchor-connection';
import { lamportsToSol } from '../utils/formatters';
import { distributeTokens } from '../utils/ico-instructions';

const DistributeTokens = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [purchases, setPurchases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (wallet.publicKey) {
      fetchPurchases();
    }
  }, [connection, wallet.publicKey]);

  const fetchPurchases = async () => {
    setIsLoading(true);
    setError('');
    try {
      const program = getProgram(connection, wallet);
      const [icoAccount] = await PublicKey.findProgramAddress(
        [Buffer.from("ico")],
        program.programId
      );
      const icoData = await program.account.icoAccount.fetch(icoAccount);

      // Fetch all purchase accounts
      const purchaseAccounts = await program.account.purchaseAccount.all();
      
      setPurchases(purchaseAccounts.map(account => ({
        buyer: account.account.buyer.toString(),
        amount: account.account.amount,
        isDistributed: account.account.isDistributed,
        timestamp: account.account.timestamp,
      })));
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to fetch purchases');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDistribute = async (buyer) => {
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      const program = getProgram(connection, wallet);
      const [purchaseAccount] = await PublicKey.findProgramAddress(
        [Buffer.from("purchase"), new PublicKey(buyer).toBuffer()],
        program.programId
      );
      
      await distributeTokens(connection, wallet, purchaseAccount);
      setSuccess(`Tokens distributed successfully to ${buyer}`);
      fetchPurchases(); // Refresh purchase data after distribution
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
        <h2 className="text-2xl font-semibold mb-4">Distribute Tokens</h2>
        <p className="text-gray-600">Please connect your wallet to distribute tokens.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Distribute Tokens</h1>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <h2 className="text-xl font-semibold p-6 bg-gray-50 border-b">Token Purchases</h2>
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading purchases...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {purchases.map((purchase) => (
                  <tr key={purchase.buyer}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{purchase.buyer}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lamportsToSol(purchase.amount).toFixed(4)} SOL</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {purchase.isDistributed ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Distributed
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {!purchase.isDistributed && (
                        <button
                          onClick={() => handleDistribute(purchase.buyer)}
                          className="text-primary-600 hover:text-primary-900"
                          disabled={isLoading}
                        >
                          Distribute
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {error && <p className="mt-4 text-red-600">{error}</p>}
      {success && <p className="mt-4 text-green-600">{success}</p>}
    </div>
  );
};

export default DistributeTokens;

