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

      // Fetch purchase amount
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

  if (loading) return <div className="text-center">Loading token balance...</div>;
  if (error) return <div className="text-center text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Your Token Balance</h2>
      <div className="bg-white shadow-md rounded-lg p-6">
        <p className="text-xl mb-4">Current Balance: {formatLamports(balance)} tokens</p>
        <p className="text-lg">Total Purchased: {formatLamports(purchaseAmount)} tokens</p>
        <button
          onClick={fetchTokenBalance}
          className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Refresh Balance
        </button>
      </div>
    </div>
  );
};

export default TokenBalance;
