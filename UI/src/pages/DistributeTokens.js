import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getProgram } from '../utils/anchor-connection';
import { formatSol } from '../utils/formatters';

const DistributeTokens = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [investors, setInvestors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [distributing, setDistributing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (wallet.publicKey) {
      fetchInvestors();
    }
  }, [connection, wallet.publicKey]);

  const fetchInvestors = async () => {
    if (!wallet.publicKey) return;

    setLoading(true);
    setError('');

    try {
      const program = getProgram(connection, wallet);
      const [icoAccount] = await PublicKey.findProgramAddress(
        [Buffer.from('ico')],
        program.programId
      );
      const icoData = await program.account.icoAccount.fetch(icoAccount);

      const purchaseAccounts = await connection.getProgramAccounts(program.programId, {
        filters: [
          { dataSize: program.account.purchaseAccount.size },
          { memcmp: { offset: 8, bytes: icoAccount.toBuffer() } },
        ],
      });

      const investorsData = await Promise.all(
        purchaseAccounts.map(async (account) => {
          const purchaseData = await program.account.purchaseAccount.fetch(account.pubkey);
          return {
            address: purchaseData.buyer.toString(),
            amountPurchased: Number(purchaseData.amountPurchased),
            tokensOwed: Number(purchaseData.amountPurchased) / Number(icoData.tokenPrice),
          };
        })
      );

      setInvestors(investorsData);
    } catch (err) {
      console.error('Error fetching investors:', err);
      setError('Failed to fetch investors. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDistribute = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) return;

    setDistributing(true);
    setError('');
    setSuccess('');

    try {
      const program = getProgram(connection, wallet);
      const [icoAccount] = await PublicKey.findProgramAddress(
        [Buffer.from('ico')],
        program.programId
      );

      for (const investor of investors) {
        const [userTokenAccount] = await PublicKey.findProgramAddress(
          [Buffer.from('user_token_account'), new PublicKey(investor.address).toBuffer()],
          program.programId
        );

        const tx = await program.methods
          .distributeTokens()
          .accounts({
            icoAccount,
            buyer: new PublicKey(investor.address),
            userTokenAccount,
            authority: wallet.publicKey,
          })
          .rpc();

        console.log(`Tokens distributed to ${investor.address}. Transaction ID: ${tx}`);
      }

      setSuccess('Tokens distributed successfully to all investors!');
    } catch (err) {
      console.error('Error distributing tokens:', err);
      setError('Failed to distribute tokens. Please try again later.');
    } finally {
      setDistributing(false);
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
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Distribute Tokens</h2>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading investors...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
            {error}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray

-500 uppercase tracking-wider">
                      Investor Address
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount Purchased
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tokens Owed
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {investors.map((investor, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {investor.address}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatSol(investor.amountPurchased)} SOL
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatSol(investor.tokensOwed)} Tokens
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6">
              <button
                onClick={handleDistribute}
                disabled={distributing || investors.length === 0}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              >
                {distributing ? 'Distributing...' : 'Distribute Tokens'}
              </button>
            </div>
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

export default DistributeTokens;

