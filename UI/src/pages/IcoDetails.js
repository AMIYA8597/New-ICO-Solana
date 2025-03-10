import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getProgram } from '../utils/anchor-connection';
import { formatUnixTimestamp, formatSol } from '../utils/formatters';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

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
      setIcoData(data);
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
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>ICO Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  // const progress = (icoData.tokensSold.toNumber() / icoData.totalSupply.toNumber()) * 100;
  const progress = (parseFloat(icoData.tokensSold.toString()) / parseFloat(icoData.totalSupply.toString())) * 100;

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>ICO Details</CardTitle>
        <CardDescription>Current status and information about the ICO</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Total Supply</h3>
            <p className="text-3xl font-bold">{formatSol(icoData.totalSupply.toString())} SOL</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Tokens Sold</h3>
            <p className="text-3xl font-bold">{formatSol(icoData.tokensSold.toString())} SOL</p>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Sale Progress</h3>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">{progress.toFixed(2)}% sold</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Current Price</h3>
            <p className="text-2xl font-bold">{formatSol(icoData.currentPublicPrice.toString())} SOL</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Round Type</h3>
            <p className="text-2xl font-bold">{Object.keys(icoData.roundType)[0]}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Start Time</h3>
            <p className="text-xl">{formatUnixTimestamp(icoData.startTime)}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">End Time</h3>
            <p className="text-xl">{formatUnixTimestamp(icoData.startTime.toString() + icoData.duration.toString())}</p>
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
  );
};

export default IcoDetails;

