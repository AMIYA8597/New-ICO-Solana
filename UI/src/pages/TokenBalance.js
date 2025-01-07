import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getProgram } from '../utils/anchor-connection';
import { formatSol } from '../utils/formatters';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";

const TokenBalance = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (wallet.publicKey) {
      fetchTokenBalance();
    }
  }, [connection, wallet.publicKey]);

  const fetchTokenBalance = async () => {
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

      const [userTokenAccount] = await PublicKey.findProgramAddress(
        [Buffer.from('user_token_account'), wallet.publicKey.toBuffer()],
        program.programId
      );

      const userTokenAccountInfo = await connection.getAccountInfo(userTokenAccount);

      if (userTokenAccountInfo) {
        const userTokenBalance = await connection.getTokenAccountBalance(userTokenAccount);
        setBalance(Number(userTokenBalance.value.amount) / Math.pow(10, icoData.decimals));
      } else {
        setBalance(0);
      }
    } catch (err) {
      console.error('Error fetching token balance:', err);
      setError('Failed to fetch token balance. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (!wallet.publicKey) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">Token Balance</h2>
        <p className="text-gray-600">Please connect your wallet to view your token balance.</p>
      </div>
    );
  }

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Token Balance</CardTitle>
        <CardDescription>View your current token balance</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading token balance...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
            {error}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-4xl font-bold text-gray-800">{formatSol(balance)} SOL</p>
            <p className="mt-2 text-gray-600">Current token balance</p>
          </div>
        )}
        <Button
          onClick={fetchTokenBalance}
          className="mt-6 w-full"
        >
          Refresh Balance
        </Button>
      </CardContent>
    </Card>
  );
};

export default TokenBalance;

