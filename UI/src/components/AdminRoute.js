import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Navigate } from 'react-router-dom';
import { isAdminWallet } from '../utils/admin-check';

export const AdminRoute = ({ children }) => {
  const { publicKey } = useWallet();

  if (!isAdminWallet(publicKey)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

