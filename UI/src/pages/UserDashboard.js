import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getProgram } from '../utils/anchor-connection';
import { formatSol, formatUnixTimestamp } from '../utils/formatters';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";

const UserDashboard = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [icoData, setIcoData] = useState(null);
  const [userPurchases, setUserPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (wallet.publicKey) {
      fetchData();
    }
  }, [connection, wallet.publicKey]);

  const fetchData = async () => {
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

      const purchaseAccounts = await connection.getProgramAccounts(program.programId, {
        filters: [
          { dataSize: program.account.purchaseAccount.size },
          { memcmp: { offset: 8, bytes: icoAccount.toBase58() } },
          { memcmp: { offset: 8 + 32, bytes: wallet.publicKey.toBase58() } },
        ],
      });

      const userPurchasesData = await Promise.all(
        purchaseAccounts.map(async (account) => {
          const purchaseData = await program.account.purchaseAccount.fetch(account.pubkey);
          return {
            amount: purchaseData.amount,
            timestamp: purchaseData.timestamp,
            isDistributed: purchaseData.isDistributed,
            purchaseAccountPubkey: account.pubkey,
          };
        })
      );

      setUserPurchases(userPurchasesData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (!wallet.publicKey) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">User Dashboard</h2>
        <p className="text-gray-600">Please connect your wallet to view your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-6">User Dashboard</h1>
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
          {error}
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>ICO Overview</CardTitle>
              <CardDescription>Current status of the ICO</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Current Price</p>
                  <p className="text-lg font-semibold">{formatSol(icoData.currentPublicPrice)} SOL</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Tokens Sold</p>
                  <p className="text-lg font-semibold">{formatSol(icoData.tokensSold)} / {formatSol(icoData.totalSupply)} SOL</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Round Type</p>
                  <p className="text-lg font-semibold">{Object.keys(icoData.roundType)[0]}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className="text-lg font-semibold">{icoData.isActive ? 'Active' : 'Inactive'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Purchases</CardTitle>
              <CardDescription>History of your token purchases</CardDescription>
            </CardHeader>
            <CardContent>
              {userPurchases.length === 0 ? (
                <p className="text-gray-600">You haven't made any purchases yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userPurchases.map((purchase, index) => (
                      <TableRow key={index}>
                        <TableCell>{formatSol(purchase.amount)} SOL</TableCell>
                        <TableCell>{formatUnixTimestamp(purchase.timestamp)}</TableCell>
                        <TableCell>{purchase.isDistributed ? 'Distributed' : 'Pending'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default UserDashboard;

