import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getProgram } from '../utils/anchor-connection';
import { formatUnixTimestamp, formatLamports } from '../utils/formatters';

const IcoDetails = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [icoDetails, setIcoDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchIcoDetails();
  }, [connection, wallet.publicKey]);

  const fetchIcoDetails = async () => {
    if (!wallet.publicKey) {
      setLoading(false);
      setError('Please connect your wallet to view ICO details.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const program = getProgram(connection, wallet);
      const [icoAccount] = await PublicKey.findProgramAddress(
        [Buffer.from("ico")],
        program.programId
      );
      const icoData = await program.account.icoAccount.fetch(icoAccount);
      setIcoDetails({
        authority: icoData.authority.toString(),
        tokenMint: icoData.tokenMint.toString(),
        totalSupply: icoData.totalSupply.toString(),
        tokenPrice: icoData.tokenPrice.toString(),
        tokensSold: icoData.tokensSold.toString(),
        startTime: formatUnixTimestamp(icoData.startTime),
        duration: icoData.duration.toString(),
        isActive: icoData.isActive,
        roundType: Object.keys(icoData.roundType)[0],
        seedInvestors: icoData.seedInvestors.map(investor => investor.toString()),
      });
    } catch (err) {
      console.error('Error fetching ICO details:', err);
      setError('Failed to fetch ICO details. Please ensure the ICO has been initialized and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center">Loading ICO details...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;
  if (!icoDetails) return <div className="text-center">No ICO details available. The ICO may not have been initialized yet.</div>;

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4">ICO Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <p><span className="font-semibold">Authority:</span> {icoDetails.authority}</p>
        <p><span className="font-semibold">Token Mint:</span> {icoDetails.tokenMint}</p>
        <p><span className="font-semibold">Total Supply:</span> {formatLamports(icoDetails.totalSupply)} tokens</p>
        <p><span className="font-semibold">Token Price:</span> {formatLamports(icoDetails.tokenPrice)} SOL</p>
        <p><span className="font-semibold">Tokens Sold:</span> {formatLamports(icoDetails.tokensSold)}</p>
        <p><span className="font-semibold">Start Time:</span> {icoDetails.startTime}</p>
        <p><span className="font-semibold">Duration:</span> {icoDetails.duration} seconds</p>
        <p><span className="font-semibold">Status:</span> {icoDetails.isActive ? 'Active' : 'Inactive'}</p>
        <p><span className="font-semibold">Round Type:</span> {icoDetails.roundType}</p>
        <p><span className="font-semibold">Number of Seed Investors:</span> {icoDetails.seedInvestors.length}</p>
      </div>
    </div>
  );
};

export default IcoDetails;
