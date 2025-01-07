import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getProgram } from '../utils/anchor-connection';
import { isAdminWallet } from '../utils/admin-check';
import AdminLayout from '../components/AdminLayout';
import { Select } from "../components/ui/select"
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/cardTitle";

const UpdateRound = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [currentRound, setCurrentRound] = useState('');
  const [newRound, setNewRound] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (wallet.publicKey && isAdminWallet(wallet.publicKey)) {
      fetchCurrentRound();
    }
  }, [connection, wallet.publicKey]);

  const fetchCurrentRound = async () => {
    if (!wallet.publicKey) return;

    try {
      const program = getProgram(connection, wallet);
      const [icoAccount] = await PublicKey.findProgramAddress(
        [Buffer.from('ico')],
        program.programId
      );
      const icoData = await program.account.icoAccount.fetch(icoAccount);
      setCurrentRound(Object.keys(icoData.roundType)[0]);
    } catch (err) {
      console.error('Error fetching current round:', err);
      setError('Failed to fetch current round. Please try again later.');
    }
  };

  const handleUpdateRound = async (e) => {
    e.preventDefault();
    if (!wallet.publicKey || !isAdminWallet(wallet.publicKey)) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const program = getProgram(connection, wallet);
      const [icoAccount] = await PublicKey.findProgramAddress(
        [Buffer.from('ico')],
        program.programId
      );

      await program.methods
        .updateRound({ [newRound.toLowerCase()]: {} })
        .accounts({
          icoAccount,
          authority: wallet.publicKey,
        })
        .rpc();

      setSuccess(`Round updated successfully to ${newRound}`);
      setCurrentRound(newRound);
    } catch (err) {
      console.error('Error updating round:', err);
      setError('Failed to update round. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (!wallet.publicKey || !isAdminWallet(wallet.publicKey)) {
    return (
      <AdminLayout>
        <Card>
          <CardHeader>
            <CardTitle>Update Round</CardTitle>
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
          <CardTitle>Update Round</CardTitle>
          <CardDescription>Change the current ICO round</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateRound} className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Current Round:</p>
              <p className="text-lg font-semibold">{currentRound}</p>
            </div>
            <div>
              <label htmlFor="newRound" className="block text-sm font-medium text-gray-700 mb-1">
                New Round:
              </label>
              <Select
                id="newRound"
                value={newRound}
                onChange={(e) => setNewRound(e.target.value)}
                required
                className="w-full"
              >
                <option value="">Select new round</option>
                <option value="PreICO">Pre-ICO</option>
                <option value="PublicICO">Public ICO</option>
              </Select>
            </div>
            {/* <Button type="submit" disabled={loading || !newRound} className="w-full"> */}
            <Button type="submit" disabled={loading || !newRound} >
              {loading ? 'Updating...' : 'Update '}
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
      </Card>
    </AdminLayout>
  );
};

export default UpdateRound;

