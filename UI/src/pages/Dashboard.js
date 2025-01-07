import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getProgram } from '../utils/anchor-connection';
import { formatUnixTimestamp, formatSol } from '../utils/formatters';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

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
    if (icoData && icoData.startTime && icoData.duration) {
      const timer = setInterval(() => {
        const now = Math.floor(Date.now() / 1000);
        const startTime = icoData.startTime.toNumber();
        const duration = icoData.duration.toNumber();
        const endTime = startTime + duration;
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading ICO details...</p>
      </div>
    );
  }

  const tokensSoldPercentage = icoData.tokensSold && icoData.totalSupply
    ? (icoData.tokensSold.toNumber() / icoData.totalSupply.toNumber()) * 100
    : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-6">ICO Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Supply</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatSol(icoData.totalSupply)} SOL</p>
            <p className="mt-2 text-sm text-gray-600">Round Type: {Object.keys(icoData.roundType)[0]}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tokens Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatSol(icoData.tokensSold)} SOL</p>
            <p className="mt-2 text-sm text-gray-600">
              {tokensSoldPercentage.toFixed(2)}% of total supply
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sale Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                  {tokensSoldPercentage.toFixed(2)}%
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-blue-600">
                  {formatSol(icoData.tokensSold)} / {formatSol(icoData.totalSupply)} SOL
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
              <div
                style={{ width: `${tokensSoldPercentage}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ICO Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Current Price</p>
              <p className="text-lg font-semibold">{formatSol(icoData.currentPublicPrice)} SOL</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Start Time</p>
              <p className="text-lg font-semibold">{formatUnixTimestamp(icoData.startTime)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">End Time</p>
              <p className="text-lg font-semibold">
                {formatUnixTimestamp(icoData.startTime.toNumber() + icoData.duration.toNumber())}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

