import React, { useMemo } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

import Layout from './components/Layout';
import { AdminRoute } from './components/AdminRoute';

// Pages
import Dashboard from './pages/Dashboard';
import IcoDetails from './pages/IcoDetails';
import BuyTokens from './pages/BuyTokens';
import TokenBalance from './pages/TokenBalance';
import InitializeIco from './pages/InitializeIco';
import ManageInvestors from './pages/ManageInvestors';
import UpdateIcoParameters from './pages/UpdateIcoParameters';
import DistributeTokens from './pages/DistributeTokens';
import EndIco from './pages/EndIco';

import '@solana/wallet-adapter-react-ui/styles.css';
import './index.css';

function App() {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/ico-details" element={<IcoDetails />} />
                <Route path="/buy" element={<BuyTokens />} />
                <Route path="/balance" element={<TokenBalance />} />
                
                <Route path="/initialize-ico" element={<AdminRoute><InitializeIco /></AdminRoute>} />
                <Route path="/manage-investors" element={<AdminRoute><ManageInvestors /></AdminRoute>} />
                <Route path="/update-parameters" element={<AdminRoute><UpdateIcoParameters /></AdminRoute>} />
                <Route path="/distribute-tokens" element={<AdminRoute><DistributeTokens /></AdminRoute>} />
                <Route path="/end-ico" element={<AdminRoute><EndIco /></AdminRoute>} />
              </Routes>
            </Layout>
          </Router>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;

