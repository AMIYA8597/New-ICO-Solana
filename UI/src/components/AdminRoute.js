import React from 'react';
import { Navigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { isAdminWallet } from '../utils/admin-check';

export const AdminRoute = ({ children }) => {
  const { publicKey } = useWallet();

  if (!publicKey || !isAdminWallet(publicKey)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

