import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getProgram } from '../utils/anchor-connection';
import { formatSol } from '../utils/formatters';
import { isAdminWallet } from '../utils/admin-check';
import AdminLayout from '../components/AdminLayout';
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";

const DistributeTokens = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [investors, setInvestors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [distributing, setDistributing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (wallet.publicKey && isAdminWallet(wallet.publicKey)) {
      fetchInvestors();
    }
  }, [connection, wallet.publicKey]);

  const fetchInvestors = async () => {
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

      const purchaseAccounts = await connection.getProgramAccounts(program.programId, {
        filters: [
          { dataSize: program.account.purchaseAccount.size },
          { memcmp: { offset: 8, bytes: icoAccount.toBase58() } },
        ],
      });

      const investorsData = await Promise.all(
        purchaseAccounts.map(async (account) => {
          const purchaseData = await program.account.purchaseAccount.fetch(account.pubkey);
          return {
            address: purchaseData.buyer.toString(),
            amount: purchaseData.amount,
            isDistributed: purchaseData.isDistributed,
            purchaseAccountPubkey: account.pubkey,
          };
        })
      );

      setInvestors(investorsData);
    } catch (err) {
      console.error('Error fetching investors:', err);
      setError('Failed to fetch investors. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDistribute = async (purchaseAccountPubkey) => {
    if (!wallet.publicKey || !wallet.signTransaction) return;

    setDistributing(true);
    setError('');
    setSuccess('');

    try {
      const program = getProgram(connection, wallet);
      const [icoAccount] = await PublicKey.findProgramAddress(
        [Buffer.from('ico')],
        program.programId
      );

      const tx = await program.methods
        .distributeTokens()
        .accounts({
          icoAccount,
          purchaseAccount: purchaseAccountPubkey,
          authority: wallet.publicKey,
        })
        .rpc();

      setSuccess(`Tokens distributed successfully! Transaction ID: ${tx}`);
      await fetchInvestors(); // Refresh investors list
    } catch (err) {
      console.error('Error distributing tokens:', err);
      setError('Failed to distribute tokens. Please try again later.');
    } finally {
      setDistributing(false);
    }
  };

  if (!wallet.publicKey || !isAdminWallet(wallet.publicKey)) {
    return (
      <AdminLayout>
        <Card>
          <CardHeader>
            <CardTitle>Distribute Tokens</CardTitle>
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
          <CardTitle>Distribute Tokens</CardTitle>
          <CardDescription>Distribute tokens to investors</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading investors...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
              {error}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Investor Address</TableHead>
                    <TableHead>Amount Purchased</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {investors.map((investor, index) => (
                    <TableRow key={index}>
                      <TableCell>{investor.address}</TableCell>
                      <TableCell>{formatSol(investor.amount)} SOL</TableCell>
                      <TableCell>
                        {investor.isDistributed ? 'Distributed' : 'Pending'}
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => handleDistribute(investor.purchaseAccountPubkey)}
                          disabled={distributing || investor.isDistributed}
                          size="sm"
                        >
                          {distributing ? 'Distributing...' : 'Distribute'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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

export default DistributeTokens;

