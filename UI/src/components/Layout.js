import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { isAdminWallet } from '../utils/admin-check';
import Navbar from './Navbar';
import AdminSidebar from './AdminSidebar';
import Footer from './Footer';

const Layout = ({ children }) => {
  const { publicKey } = useWallet();
  const isAdmin = isAdminWallet(publicKey);

  return (
    <div className="min-h-screen flex">
      {isAdmin && <AdminSidebar />}
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6 bg-gray-50">
          <div className={`mx-auto ${isAdmin ? 'max-w-7xl' : 'max-w-6xl'}`}>
            {children}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;

