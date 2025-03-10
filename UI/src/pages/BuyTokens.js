import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getProgram } from '../utils/anchor-connection';
import * as anchor from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { formatSol } from '../utils/formatters';
import {  Label } from "../components/ui/label"
import { Card, Input, Button } from "../components/ui/cardTitle";

const BuyTokens = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [icoData, setIcoData] = useState(null);

  useEffect(() => {
    if (wallet.publicKey) {
      fetchIcoData();
    }
  }, [connection, wallet.publicKey]);

  const fetchIcoData = async () => {
    if (!wallet.publicKey) return;
    
    try {
      const program = getProgram(connection, wallet);
      const [icoAccount] = await PublicKey.findProgramAddress(
        [Buffer.from('ico')],
        program.programId
      );
      const data = await program.account.icoAccount.fetch(icoAccount);
      setIcoData(data);
    } catch (err) {
      console.error('Error fetching ICO data:', err);
      setError('Failed to fetch ICO data. Please try again later.');
    }
  };

  const handleBuyTokens = async (e) => {
    e.preventDefault();
    if (!wallet.publicKey || !wallet.signTransaction || !icoData) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const program = getProgram(connection, wallet);
      const [icoAccount] = await PublicKey.findProgramAddress(
        [Buffer.from('ico')],
        program.programId
      );

      const treasuryWallet = icoData.authority;
      const purchaseCounter = icoData.purchaseCounter;
      
      const [purchaseAccount] = await PublicKey.findProgramAddress(
        [
          Buffer.from('purchase'),
          wallet.publicKey.toBuffer(),
          new anchor.BN(purchaseCounter).toArrayLike(Buffer, 'le', 8)
        ],
        program.programId
      );

      const amountLamports = new anchor.BN(parseFloat(amount) * anchor.web3.LAMPORTS_PER_SOL);

      const tx = await program.methods
        .buyTokens(amountLamports)
        .accounts({
          buyer: wallet.publicKey,
          icoAccount,
          purchaseAccount,
          treasuryWallet,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      setSuccess(`Tokens purchased successfully! Transaction ID: ${tx}`);
      await fetchIcoData();
    } catch (err) {
      console.error('Error buying tokens:', err);
      setError('Token purchase failed. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const calculateTokenAmount = () => {
    if (!amount || !icoData) return 0;
    return parseFloat(amount) / (icoData.currentPublicPrice.toString() / anchor.web3.LAMPORTS_PER_SOL);
  };

  const calculateTokensSoldPercentage = () => {
    if (!icoData || !icoData.tokensSold || !icoData.totalSupply) return 0;
    return (icoData.tokensSold.toString() / icoData.totalSupply.toString()) * 100;
  };

  const tokensSoldPercentage = calculateTokensSoldPercentage();

  return (
    <Card className="max-w-lg mx-auto">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Buy Tokens</h2>
        <p className="text-gray-600 mb-6">Purchase tokens for the Solana ICO</p>
        <form onSubmit={handleBuyTokens} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount of SOL to spend:</Label>
            <Input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="0"
              step="0.000000001"
            />
          </div>
          {icoData && (
            <div className="text-sm text-gray-600">
              You will receive approximately {calculateTokenAmount().toFixed(4)} tokens
            </div>
          )}
          <Button type="submit" disabled={loading || !wallet.publicKey} className="w-full">
            {loading ? 'Processing...' : 'Buy Tokens'}
          </Button>
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
        {icoData && (
          <div className="mt-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Current Price:</span>
              <span className="text-sm font-bold">{formatSol(icoData.currentPublicPrice)} SOL</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Tokens Available:</span>
              <span className="text-sm font-bold">{formatSol(icoData.totalSupply.sub(icoData.tokensSold))} SOL</span>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">Tokens Sold:</span>
                <span className="text-sm font-bold">{tokensSoldPercentage.toFixed(2)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${tokensSoldPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default BuyTokens;

