import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getProgram } from '../utils/anchor-connection';
import * as anchor from '@project-serum/anchor';
import { isAdminWallet } from '../utils/admin-check';
import AdminLayout from '../components/AdminLayout';
import {Input} from '../components/ui/input';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/cardTitle";
import { Label } from "../components/ui/label";

const UpdateIcoParameters = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [icoData, setIcoData] = useState(null);
  const [formData, setFormData] = useState({
    seedPrice: '',
    preIcoPrice: '',
    publicPrice: '',
    duration: '',
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
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
      setFormData({
        seedPrice: (data.seedPrice.toNumber() / anchor.web3.LAMPORTS_PER_SOL).toString(),
        preIcoPrice: (data.preIcoPrice.toNumber() / anchor.web3.LAMPORTS_PER_SOL).toString(),
        publicPrice: (data.publicPrice.toNumber() / anchor.web3.LAMPORTS_PER_SOL).toString(),
        duration: data.duration.toString(),
      });
    } catch (err) {
      console.error('Error fetching ICO data:', err);
      setError('Failed to fetch ICO data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!wallet.publicKey || !wallet.signTransaction) return;

    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      const program = getProgram(connection, wallet);
      const [icoAccount] = await PublicKey.findProgramAddress(
        [Buffer.from('ico')],
        program.programId
      );

      const seedPrice = new anchor.BN(parseFloat(formData.seedPrice) * anchor.web3.LAMPORTS_PER_SOL);
      const preIcoPrice = new anchor.BN(parseFloat(formData.preIcoPrice) * anchor.web3.LAMPORTS_PER_SOL);
      const publicPrice = new anchor.BN(parseFloat(formData.publicPrice) * anchor.web3.LAMPORTS_PER_SOL);
      const duration = new anchor.BN(parseInt(formData.duration));

      const tx = await program.methods
        .updateIcoParameters(seedPrice, preIcoPrice, publicPrice, duration)
        .accounts({
          icoAccount,
          authority: wallet.publicKey,
        })
        .rpc();

      setSuccess(`ICO parameters updated successfully! Transaction ID: ${tx}`);
      await fetchIcoData();
    } catch (err) {
      console.error('Error updating ICO parameters:', err);
      setError('Failed to update ICO parameters. Please try again later.');
    } finally {
      setUpdating(false);
    }
  };

  if (!wallet.publicKey || !isAdminWallet(wallet.publicKey)) {
    return (
      <AdminLayout>
        <Card>
          <CardHeader>
            <CardTitle>Update ICO Parameters</CardTitle>
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
          <CardTitle>Update ICO Parameters</CardTitle>
          <CardDescription>Modify the current ICO parameters</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading ICO data...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seedPrice">Seed Price (SOL):</Label>
                <Input
                  type="number"
                  id="seedPrice"
                  name="seedPrice"
                  value={formData.seedPrice}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.000000001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preIcoPrice">Pre-ICO Price (SOL):</Label>
                <Input
                  type="number"
                  id="preIcoPrice"
                  name="preIcoPrice"
                  value={formData.preIcoPrice}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.000000001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="publicPrice">Public Price (SOL):</Label>
                <Input
                  type="number"
                  id="publicPrice"
                  name="publicPrice"
                  value={formData.publicPrice}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.000000001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (seconds):</Label>
                <Input
                  type="number"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                  min="1"
                />
              </div>
              {/* <Button type="submit" disabled={updating} className="w-full"> */}
              <Button type="submit" disabled={updating} >
                {updating ? 'Updating...' : 'Update'}
              </Button>
            </form>
          )}
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

export default UpdateIcoParameters;

