import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  getAccount,
} from '@solana/spl-token';
import { formatLamports } from '../utils/formatters';
import { getProgram } from '../utils/anchor-connection';

const TokenBalance = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [balance, setBalance] = useState(null);
  const [purchaseAmount, setPurchaseAmount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTokenBalance();
  }, [connection, wallet.publicKey]);

  const fetchTokenBalance = async () => {
    if (!wallet.publicKey) return;
    setLoading(true);
    setError('');
    try {
      const program = getProgram(connection, wallet);
      const [icoAccount] = await PublicKey.findProgramAddress(
        [Buffer.from("ico")],
        program.programId
      );
      const icoData = await program.account.icoAccount.fetch(icoAccount);
      const mint = icoData.tokenMint;

      const tokenAccount = await getAssociatedTokenAddress(mint, wallet.publicKey);
      try {
        const accountInfo = await getAccount(connection, tokenAccount);
        setBalance(accountInfo.amount.toString());
      } catch (err) {
        console.log('No token account found, balance is 0');
        setBalance('0');
      }

      const [purchaseAccount] = await PublicKey.findProgramAddress(
        [Buffer.from("purchase"), wallet.publicKey.toBuffer()],
        program.programId
      );
      try {
        const purchaseData = await program.account.purchaseAccount.fetch(purchaseAccount);
        setPurchaseAmount(purchaseData.amount.toString());
      } catch (err) {
        console.log('No purchase found for this wallet');
        setPurchaseAmount('0');
      }
    } catch (err) {
      console.error('Error fetching token balance:', err);
      setError('Failed to fetch token balance');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
    </div>
  );

  if (error) return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <strong className="font-bold">Error:</strong>
      <span className="block sm:inline"> {error}</span>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Token Balance</h2>
          <div className="space-y-4">
            <div className="bg-indigo-100 rounded-lg p-4">
              <p className="text-sm font-medium text-indigo-600">Current Balance:</p>
              <p className="text-3xl font-bold text-indigo-800">{formatLamports(balance)} tokens</p>
            </div>
            <div className="bg-green-100 rounded-lg p-4">
              <p className="text-sm font-medium text-green-600">Total Purchased:</p>
              <p className="text-3xl font-bold text-green-800">{formatLamports(purchaseAmount)} tokens</p>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50">
          <button
            onClick={fetchTokenBalance}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
          >
            Refresh Balance
          </button>
        </div>
      </div>
    </div>
  );
};

export default TokenBalance;
