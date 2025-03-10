"use client"

import { useMemo } from "react"
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react"
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { PhantomWalletAdapter, SolflareWalletAdapter, TorusWalletAdapter } from "@solana/wallet-adapter-wallets"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { clusterApiUrl } from "@solana/web3.js"

import Layout from "./components/Layout"
import { AdminRoute } from "./components/AdminRoute"

// Pages
import Dashboard from "./pages/Dashboard"
import IcoDetails from "./pages/IcoDetails"
import BuyTokens from "./pages/BuyTokens"
import TokenBalance from "./pages/TokenBalance"
import InitializeIco from "./pages/InitializeIco"
import ManageInvestors from "./pages/ManageInvestors"
import UpdateRound from "./pages/UpdateRound"
import UpdateParameters from "./pages/UpdateIcoParameters"
import DistributeTokens from "./pages/DistributeTokens"
import EndIco from "./pages/EndIco"
import IcoAnalytics from "./pages/IcoAnalytics"
import Staking from "./pages/Staking"
import StakingAdmin from "./pages/StakingAdmin"

import "@solana/wallet-adapter-react-ui/styles.css"
import "./index.css"

function App() {
  // Use devnet for development
  const network = WalletAdapterNetwork.Devnet
  const endpoint = useMemo(() => clusterApiUrl(network), [network])

  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter(), new TorusWalletAdapter()], [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Router>
            <Layout>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Dashboard />} />
                <Route path="/ico-details" element={<IcoDetails />} />
                <Route path="/buy" element={<BuyTokens />} />
                <Route path="/balance" element={<TokenBalance />} />
                <Route path="/staking" element={<Staking />} />

                {/* Admin Routes */}
                <Route path="/admin">
                  <Route
                    path="initialize-ico"
                    element={
                      <AdminRoute>
                        <InitializeIco />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="manage-investors"
                    element={
                      <AdminRoute>
                        <ManageInvestors />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="update-round"
                    element={
                      <AdminRoute>
                        <UpdateRound />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="update-parameters"
                    element={
                      <AdminRoute>
                        <UpdateParameters />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="distribute-tokens"
                    element={
                      <AdminRoute>
                        <DistributeTokens />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="analytics"
                    element={
                      <AdminRoute>
                        <IcoAnalytics />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="end-ico"
                    element={
                      <AdminRoute>
                        <EndIco />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="staking"
                    element={
                      <AdminRoute>
                        <StakingAdmin />
                      </AdminRoute>
                    }
                  />
                </Route>
              </Routes>
            </Layout>
          </Router>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export default App




































// import React, { useMemo } from 'react';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
// import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
// import {
//   PhantomWalletAdapter,
//   SolflareWalletAdapter,
//   TorusWalletAdapter,
// } from '@solana/wallet-adapter-wallets';
// import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
// import { clusterApiUrl } from '@solana/web3.js';

// import Layout from './components/Layout';
// import { AdminRoute } from './components/AdminRoute';

// // Pages
// import Dashboard from './pages/Dashboard';
// import IcoDetails from './pages/IcoDetails';
// import BuyTokens from './pages/BuyTokens';
// import TokenBalance from './pages/TokenBalance';
// import InitializeIco from './pages/InitializeIco';
// import ManageInvestors from './pages/ManageInvestors';
// import UpdateRound from './pages/UpdateRound';
// import UpdateParameters from './pages/UpdateIcoParameters';
// import DistributeTokens from './pages/DistributeTokens';
// import EndIco from './pages/EndIco';
// import IcoAnalytics from './pages/IcoAnalytics';

// import '@solana/wallet-adapter-react-ui/styles.css';
// import './index.css';

// function App() {
//   // Use devnet for development
//   const network = WalletAdapterNetwork.Devnet;
//   const endpoint = useMemo(() => clusterApiUrl(network), [network]);

//   const wallets = useMemo(
//     () => [
//       new PhantomWalletAdapter(),
//       new SolflareWalletAdapter(),
//       new TorusWalletAdapter(),
//     ],
//     []
//   );

//   return (
//     <ConnectionProvider endpoint={endpoint}>
//       <WalletProvider wallets={wallets} autoConnect>
//         <WalletModalProvider>
//           <Router>
//             <Layout>
//               <Routes>
//                 {/* Public Routes */}
//                 <Route path="/" element={<Dashboard />} />
//                 <Route path="/ico-details" element={<IcoDetails />} />
//                 <Route path="/buy" element={<BuyTokens />} />
//                 <Route path="/balance" element={<TokenBalance />} />
                
//                 {/* Admin Routes */}
//                 <Route path="/admin">
//                   <Route path="initialize-ico" element={<AdminRoute><InitializeIco /></AdminRoute>} />
//                   <Route path="manage-investors" element={<AdminRoute><ManageInvestors /></AdminRoute>} />
//                   <Route path="update-round" element={<AdminRoute><UpdateRound /></AdminRoute>} />
//                   <Route path="update-parameters" element={<AdminRoute><UpdateParameters /></AdminRoute>} />
//                   <Route path="distribute-tokens" element={<AdminRoute><DistributeTokens /></AdminRoute>} />
//                   <Route path="analytics" element={<AdminRoute><IcoAnalytics /></AdminRoute>} />
//                   <Route path="end-ico" element={<AdminRoute><EndIco /></AdminRoute>} />
//                 </Route>
//               </Routes>
//             </Layout>
//           </Router>
//         </WalletModalProvider>
//       </WalletProvider>
//     </ConnectionProvider>
//   );
// }

// export default App;

