import React, { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getProgram } from '../utils/anchor-connection';

import { Buffer } from "buffer/"; 
window.Buffer = Buffer;

const EndIco = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleEndIco = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const program = getProgram(connection, wallet);
      const [icoAccount] = await PublicKey.findProgramAddress(
        [Buffer.from("ico")],
        program.programId
      );

      await program.methods
        .endIco()
        .accounts({
          icoAccount,
          authority: wallet.publicKey,
        })
        .rpc();

      setSuccess('ICO ended successfully!');
    } catch (err) {
      console.error('Error ending ICO:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-6">End ICO</h2>
        <div className="space-y-4">
          <p className="text-red-600">
            Warning: This action will end the ICO and cannot be undone. Make sure all tokens have been distributed before ending the ICO.
          </p>
          <button
            onClick={handleEndIco}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? 'Ending ICO...' : 'End ICO'}
          </button>
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 text-green-600 rounded-md text-sm">
              {success}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EndIco;
