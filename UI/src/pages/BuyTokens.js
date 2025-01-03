import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getProgram } from '../utils/anchor-connection';
import * as anchor from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { formatSol } from '../utils/formatters';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { Progress } from "../components/ui/progress"

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
      
      setIcoData({
        ...data,
        tokensSold: Number(data.tokensSold),
        totalSupply: Number(data.totalSupply),
        tokenPrice: Number(data.tokenPrice),
        purchaseCounter: Number(data.purchaseCounter)
      });
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
      const purchaseCounter = icoData.purchaseCounter || 0;
      
      const [purchaseAccount] = await PublicKey.findProgramAddress(
        [
          Buffer.from('purchase'),
          wallet.publicKey.toBuffer(),
          new anchor.BN(purchaseCounter).toArrayLike(Buffer, 'le', 8)
        ],
        program.programId
      );

      const amountLamports = Math.floor(parseFloat(amount) * anchor.web3.LAMPORTS_PER_SOL);

      const tx = await program.methods
        .buyTokens(new anchor.BN(amountLamports))
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

  const calculateTokensSoldPercentage = () => {
    if (!icoData || !icoData.tokensSold || !icoData.totalSupply) return 0;
    return (icoData.tokensSold / icoData.totalSupply) * 100;
  };

  const tokensSoldPercentage = calculateTokensSoldPercentage();

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Buy Tokens</CardTitle>
          <CardDescription>Purchase tokens for the Solana ICO</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleBuyTokens} className="space-y-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount of tokens to buy (in SOL):
              </label>
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
            <Button
              type="submit"
              disabled={loading || !wallet.publicKey}
              className="w-full"
            >
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
        </CardContent>
        {icoData && (
          <CardFooter>
            <div className="w-full space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Token Price:</span>
                <span className="text-sm font-bold">{formatSol(icoData.tokenPrice)} SOL</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Tokens Available:</span>
                <span className="text-sm font-bold">{formatSol(icoData.totalSupply - icoData.tokensSold)} SOL</span>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Tokens Sold:</span>
                  <span className="text-sm font-bold">{tokensSoldPercentage.toFixed(2)}%</span>
                </div>
                <Progress value={tokensSoldPercentage} className="w-full" />
              </div>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default BuyTokens;

