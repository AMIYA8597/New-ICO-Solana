import React, { useMemo } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import BuyTokens from './pages/BuyTokens';
import TokenBalance from './pages/TokenBalance';
import ManageInvestors from './pages/ManageInvestors';
import UpdateIcoParameters from './pages/UpdateIcoParameters';
import DistributeTokens from './pages/DistributeTokens';
import EndIco from './pages/EndIco';
import { isAdminWallet } from './utils/admin-check';
import '@solana/wallet-adapter-react-ui/styles.css';
import './App.css';

const AdminRoute = ({ children }) => {
  const { publicKey } = useWallet();
  return isAdminWallet(publicKey) ? children : <Navigate to="/" />;
};

function App() {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Router>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/buy" element={<BuyTokens />} />
                  <Route path="/balance" element={<TokenBalance />} />
                  <Route path="/manage-investors" element={<AdminRoute><ManageInvestors /></AdminRoute>} />
                  <Route path="/update-parameters" element={<AdminRoute><UpdateIcoParameters /></AdminRoute>} />
                  <Route path="/distribute-tokens" element={<AdminRoute><DistributeTokens /></AdminRoute>} />
                  <Route path="/end-ico" element={<AdminRoute><EndIco /></AdminRoute>} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;































































// import React, { useMemo } from 'react';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
// import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
// import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
// import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
// import { clusterApiUrl } from '@solana/web3.js';
// import Header from './components/Header';
// import Footer from './components/Footer';
// import Dashboard from './pages/Dashboard';
// import InitializeIco from './pages/InitializeIco';
// import BuyTokens from './pages/BuyTokens';
// import TokenBalance from './pages/TokenBalance';
// import ManageInvestors from './pages/ManageInvestors';
// import UpdateIcoParameters from './pages/UpdateIcoParameters';
// import DistributeTokens from './pages/DistributeTokens';
// import EndIco from './pages/EndIco';
// import '@solana/wallet-adapter-react-ui/styles.css';
// import './App.css';

// function App() {
//   const network = WalletAdapterNetwork.Devnet;
//   const endpoint = useMemo(() => clusterApiUrl(network), [network]);
//   const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

//   return (
//     <ConnectionProvider endpoint={endpoint}>
//       <WalletProvider wallets={wallets} autoConnect>
//         <WalletModalProvider>
//           <Router>
//             <div className="flex flex-col min-h-screen">
//               <Header />
//               <main className="flex-grow">
//                 <Routes>
//                   <Route path="/" element={<Dashboard />} />
//                   <Route path="/initialize" element={<InitializeIco />} />
//                   <Route path="/buy" element={<BuyTokens />} />
//                   <Route path="/balance" element={<TokenBalance />} />
//                   <Route path="/manage-investors" element={<ManageInvestors />} />
//                   <Route path="/update-parameters" element={<UpdateIcoParameters />} />
//                   <Route path="/distribute-tokens" element={<DistributeTokens />} />
//                   <Route path="/end-ico" element={<EndIco />} />
//                 </Routes>
//               </main>
//               <Footer />
//             </div>
//           </Router>
//         </WalletModalProvider>
//       </WalletProvider>
//     </ConnectionProvider>
//   );
// }

// export default App;

