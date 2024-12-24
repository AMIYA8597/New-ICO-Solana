import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getProgram } from '../utils/anchor-connection';
import { formatUnixTimestamp, formatLamports } from '../utils/formatters';

const Dashboard = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [icoData, setIcoData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (wallet.publicKey) {
      fetchIcoData();
    }
  }, [connection, wallet.publicKey]);

  useEffect(() => {
    if (icoData) {
      const timer = setInterval(() => {
        const now = Math.floor(Date.now() / 1000);
        const endTime = Number(icoData.startTime) + Number(icoData.duration);
        const remaining = endTime - now;
        
        if (remaining <= 0) {
          clearInterval(timer);
          setTimeLeft("ICO Ended");
        } else {
          const days = Math.floor(remaining / 86400);
          const hours = Math.floor((remaining % 86400) / 3600);
          const minutes = Math.floor((remaining % 3600) / 60);
          const seconds = remaining % 60;
          setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [icoData]);

  const fetchIcoData = async () => {
    try {
      const program = getProgram(connection, wallet);
      const [icoAccount] = await PublicKey.findProgramAddress(
        [Buffer.from("ico")],
        program.programId
      );
      const data = await program.account.icoAccount.fetch(icoAccount);
      setIcoData(data);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  if (!wallet.publicKey) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">Welcome to Solana ICO Dashboard</h2>
        <p className="text-gray-600">Please connect your wallet to view ICO details.</p>
      </div>
    );
  }

  if (!icoData) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading ICO details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-6">ICO Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-gradient-to-br from-sky-700 to-sky-800 text-white">
          <h2 className="text-xl font-semibold mb-2">Total Supply</h2>
          <p className="text-3xl font-bold">{formatLamports(icoData.totalSupply)}</p>
          <p className="mt-2 text-sm">Round Type: {Object.keys(icoData.roundType)[0]}</p>
        </div>
        <div className="card bg-gradient-to-br from-slate-500 to-slate-600 text-white">
          <h2 className="text-xl font-semibold mb-2">Tokens Sold</h2>
          <p className="text-3xl font-bold">{formatLamports(icoData.tokensSold)}</p>
          <p className="mt-2 text-sm">
            {((Number(icoData.tokensSold) / Number(icoData.totalSupply)) * 100).toFixed(2)}% of total supply
          </p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-2xl font-semibold mb-4">Sale Progress</h2>
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-sky-600 bg-sky-200">
                {((Number(icoData.tokensSold) / Number(icoData.totalSupply)) * 100).toFixed(2)}%
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-sky-600">
                {formatLamports(icoData.tokensSold)} / {formatLamports(icoData.totalSupply)}
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-sky-200">
            <div
              style={{ width: `${(Number(icoData.tokensSold) / Number(icoData.totalSupply)) * 100}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-sky-500"
            ></div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-2xl font-semibold mb-4">ICO Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Token Price</p>
            <p className="text-lg font-semibold">{formatLamports(icoData.tokenPrice)} SOL</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Start Time</p>
            <p className="text-lg font-semibold">{formatUnixTimestamp(icoData.startTime)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">End Time</p>
            <p className="text-lg font-semibold">
              {formatUnixTimestamp(Number(icoData.startTime) + Number(icoData.duration))}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Time Remaining</p>
            <p className="text-lg font-semibold">{timeLeft}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Status</p>
            <p className="text-lg font-semibold">
              {icoData.isActive ? (
                <span className="text-green-500">Active</span>
              ) : (
                <span className="text-red-500">Inactive</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
