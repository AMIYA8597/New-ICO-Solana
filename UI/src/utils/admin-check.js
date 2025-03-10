import { PublicKey } from '@solana/web3.js';

export const isAdminWallet = (publicKey) => {
  if (!publicKey) return false;

  const adminPublicKeyString = process.env.REACT_APP_ADMIN_PUBLIC_KEY;
  if (!adminPublicKeyString) {
    console.error('Admin public key is not set in environment variables');
    return false;
  }

  try {
    const adminPublicKey = new PublicKey(adminPublicKeyString);
    return publicKey.equals(adminPublicKey);
  } catch (error) {
    console.error('Error creating PublicKey:', error);
    return false;
  }
};
