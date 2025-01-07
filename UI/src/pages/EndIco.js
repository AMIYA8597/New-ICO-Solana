import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getProgram } from '../utils/anchor-connection';
import { formatSol } from '../utils/formatters';
import { isAdminWallet } from '../utils/admin-check';
import AdminLayout from '../components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";

const EndIco = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [icoData, setIcoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (wallet.publicKey && isAdminWallet(wallet.publicKey)) {
      fetchIcoData();
    }
  }, [connection, wallet.publicKey]);

  const fetchIcoData = async () => {
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
      console.error('Error fetching ICO data:', err);
      setError('Failed to fetch ICO data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleEndIco = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) return;

    setEnding(true);
    setError('');
    setSuccess('');

    try {
      const program = getProgram(connection, wallet);
      const [icoAccount] = await PublicKey.findProgramAddress(
        [Buffer.from('ico')],
        program.programId
      );

      const tx = await program.methods
        .endIco()
        .accounts({
          icoAccount,
          authority: wallet.publicKey,
        })
        .rpc();

      setSuccess(`ICO ended successfully! Transaction ID: ${tx}`);
      await fetchIcoData();
    } catch (err) {
      console.error('Error ending ICO:', err);
      setError('Failed to end ICO. Please try again later.');
    } finally {
      setEnding(false);
    }
  };

  if (!wallet.publicKey || !isAdminWallet(wallet.publicKey)) {
    return (
      <AdminLayout>
        <Card>
          <CardHeader>
            <CardTitle>End ICO</CardTitle>
            <CardDescription>You do not have permission to access this page.</CardDescription>
          </CardHeader>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Card>
        <CardHeader>
          <CardTitle>End ICO</CardTitle>
          <CardDescription>Finalize and end the current ICO</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading ICO data...</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Supply:</p>
                  <p className="text-lg font-semibold">{formatSol(icoData.totalSupply)} SOL</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Tokens Sold:</p>
                  <p className="text-lg font-semibold">{formatSol(icoData.tokensSold)} SOL</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Current Status:</p>
                  <p className="text-lg font-semibold">{icoData.isActive ? 'Active' : 'Inactive'}</p>
                </div>
              </div>
              <Button
                onClick={handleEndIco}
                disabled={ending || !icoData.isActive}
                className="w-full"
              >
                {ending ? 'Ending ICO...' : 'End ICO'}
              </Button>
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
            </>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default EndIco;

