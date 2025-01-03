import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getProgram } from '../utils/anchor-connection';
import { formatUnixTimestamp, formatSol } from '../utils/formatters';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Progress } from "../components/ui/progress"

const IcoDetails = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [icoData, setIcoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (wallet.publicKey) {
      fetchIcoDetails();
    }
  }, [connection, wallet.publicKey]);

  const fetchIcoDetails = async () => {
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
        startTime: Number(data.startTime),
        duration: Number(data.duration),
      });
    } catch (err) {
      console.error('Error fetching ICO details:', err);
      setError('Failed to fetch ICO details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (!wallet.publicKey) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">ICO Details</h2>
        <p className="text-gray-600">Please connect your wallet to view ICO details.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading ICO details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>ICO Details</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = (icoData.tokensSold / icoData.totalSupply) * 100;

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>ICO Details</CardTitle>
          <CardDescription>Current status and information about the ICO</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Total Supply</h3>
              <p className="text-3xl font-bold">{formatSol(icoData.totalSupply)} SOL</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Tokens Sold</h3>
              <p className="text-3xl font-bold">{formatSol(icoData.tokensSold)} SOL</p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Sale Progress</h3>
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-gray-500 mt-2">{progress.toFixed(2)}% sold</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Token Price</h3>
              <p className="text-2xl font-bold">{formatSol(icoData.tokenPrice)} SOL</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Round Type</h3>
              <p className="text-2xl font-bold">{icoData.roundType ? Object.keys(icoData.roundType)[0] : 'N/A'}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Start Time</h3>
              <p className="text-xl">{formatUnixTimestamp(icoData.startTime)}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">End Time</h3>
              <p className="text-xl">{formatUnixTimestamp(icoData.startTime + icoData.duration)}</p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Status</h3>
            <p className={`text-xl font-bold ${icoData.isActive ? 'text-green-500' : 'text-red-500'}`}>
              {icoData.isActive ? 'Active' : 'Inactive'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IcoDetails;

