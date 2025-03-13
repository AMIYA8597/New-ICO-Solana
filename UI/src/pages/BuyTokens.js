"use client";

import { useState, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { getProgram } from "../utils/anchor-connection";
import * as anchor from "@project-serum/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { formatSol } from "../utils/formatters";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Loader2 } from "lucide-react";

const BuyTokens = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [icoData, setIcoData] = useState(null);

  useEffect(() => {
    if (wallet.publicKey) {
      fetchIcoData();
    }
  }, [connection, wallet.publicKey]);

  const fetchIcoData = async () => {
    if (!wallet.publicKey) return;

    try {
      const program = getProgram(connection, wallet);
      const [icoAccount] = await PublicKey.findProgramAddressSync([Buffer.from("ico")], program.programId);
      const data = await program.account.icoAccount.fetch(icoAccount);
      console.log("ICO Data:", data);
      setIcoData(data);
    } catch (err) {
      console.error("Error fetching ICO data:", err);
      setError("Failed to fetch ICO data. Please try again later.");
    }
  };

  const handleBuyTokens = async (e) => {
    e.preventDefault();
    if (!wallet.publicKey || !icoData) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const program = getProgram(connection, wallet);
      const [icoAccount] = await PublicKey.findProgramAddressSync([Buffer.from("ico")], program.programId);

      const treasuryWallet = icoData.authority;

      const purchaseCounter = icoData.purchaseCounter;
      const [purchaseAccount] = await PublicKey.findProgramAddressSync(
        [
          Buffer.from("purchase"),
          wallet.publicKey.toBuffer(),
          new anchor.BN(purchaseCounter).toArrayLike(Buffer, "le", 8),
        ],
        program.programId,
      );

      // Convert amount to lamports (using current price to determine token quantity)
      const currentPrice = Number(icoData.currentPublicPrice.toString());
      const totalLamports = new anchor.BN(Number(amount) * anchor.web3.LAMPORTS_PER_SOL);

      // Calculate the amount of tokens to buy based on the current price
      const tokensToBuy = totalLamports.div(new anchor.BN(currentPrice));

      const tx = await program.methods
        .buyTokens(tokensToBuy)
        .accounts({
          buyer: wallet.publicKey,
          icoAccount,
          purchaseAccount,
          treasuryWallet,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      console.log("Transaction successful:", tx);
      setSuccess(`Tokens purchased successfully! Transaction ID: ${tx}`);
      await fetchIcoData(); // Refresh ICO data
    } catch (err) {
      console.error("Error buying tokens:", err);
      setError(`Token purchase failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const calculateTokenAmount = () => {
    if (!amount || !icoData) return 0;
    const currentPrice = Number(icoData.currentPublicPrice.toString()) / anchor.web3.LAMPORTS_PER_SOL;
    return Number(amount) / currentPrice;
  };

  const calculateTokensSoldPercentage = () => {
    if (!icoData || !icoData.totalSupply || !icoData.tokensSold) return 0;
    return (icoData.tokensSold.toString() / icoData.totalSupply.toString()) * 100;
  };

  const tokensSoldPercentage = calculateTokensSoldPercentage();

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Buy Tokens</CardTitle>
        <CardDescription>Purchase tokens for the Solana ICO</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleBuyTokens} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount of SOL to spend:</Label>
            <Input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="0"
              step="0.000000001"
            />
          </div>
          {icoData && (
            <div className="text-sm text-gray-600">
              You will receive approximately {calculateTokenAmount().toFixed(4)} tokens
            </div>
          )}
          <Button type="submit" disabled={loading || !wallet.publicKey} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Buy Tokens"
            )}
          </Button>
        </form>
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mt-4 bg-green-50 text-green-800 border-green-500">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        {icoData && (
          <div className="mt-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Current Price:</span>
              <span className="text-sm font-bold">{formatSol(icoData.currentPublicPrice)} SOL</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Tokens Available:</span>
              <span className="text-sm font-bold">{formatSol(icoData.totalSupply.sub(icoData.tokensSold))}</span>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">Tokens Sold:</span>
                <span className="text-sm font-bold">{tokensSoldPercentage.toFixed(2)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${tokensSoldPercentage}%` }}></div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BuyTokens;



















































// "use client"

// import { useState, useEffect } from "react"
// import { useConnection, useWallet } from "@solana/wallet-adapter-react"
// import { PublicKey } from "@solana/web3.js"
// import { getProgram } from "../utils/anchor-connection"
// import * as anchor from "@project-serum/anchor"
// import { TOKEN_PROGRAM_ID } from "@solana/spl-token"
// import { formatSol } from "../utils/formatters"
// import { Label } from "../components/ui/label"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
// import { Input } from "../components/ui/input"
// import { Button } from "../components/ui/button"
// import { Alert, AlertDescription } from "../components/ui/alert"
// import { Loader2 } from "lucide-react"

// const BuyTokens = () => {
//   const { connection } = useConnection()
//   const wallet = useWallet()
//   const [amount, setAmount] = useState("")
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState("")
//   const [success, setSuccess] = useState("")
//   const [icoData, setIcoData] = useState(null)

//   useEffect(() => {
//     if (wallet.publicKey) {
//       fetchIcoData()
//     }
//   }, [connection, wallet.publicKey])

//   const fetchIcoData = async () => {
//     if (!wallet.publicKey) return

//     try {
//       const program = getProgram(connection, wallet)
//       const [icoAccount] = await PublicKey.findProgramAddress([Buffer.from("ico")], program.programId)
//       const data = await program.account.icoAccount.fetch(icoAccount)
//       setIcoData(data)
//     } catch (err) {
//       console.error("Error fetching ICO data:", err)
//       setError("Failed to fetch ICO data. Please try again later.")
//     }
//   }

//   const handleBuyTokens = async (e) => {
//     e.preventDefault()
//     if (!wallet.publicKey || !wallet.signTransaction || !icoData) return

//     setLoading(true)
//     setError("")
//     setSuccess("")

//     try {
//       const program = getProgram(connection, wallet)
//       const [icoAccount] = await PublicKey.findProgramAddress([Buffer.from("ico")], program.programId)

//       // Get the treasury wallet from the authority field
//       const treasuryWallet = icoData.authority
//       const purchaseCounter = icoData.purchaseCounter

//       // Create the purchase account PDA
//       const [purchaseAccount] = await PublicKey.findProgramAddress(
//         [
//           Buffer.from("purchase"),
//           wallet.publicKey.toBuffer(),
//           new anchor.BN(purchaseCounter).toArrayLike(Buffer, "le", 8),
//         ],
//         program.programId,
//       )

//       // Convert amount to lamports
//       const amountLamports = new anchor.BN(Number.parseFloat(amount) * anchor.web3.LAMPORTS_PER_SOL)

//       // Call the buyTokens instruction
//       const tx = await program.methods
//         .buyTokens(amountLamports)
//         .accounts({
//           buyer: wallet.publicKey,
//           icoAccount,
//           purchaseAccount,
//           treasuryWallet,
//           tokenProgram: TOKEN_PROGRAM_ID,
//           systemProgram: anchor.web3.SystemProgram.programId,
//         })
//         .rpc()

//       setSuccess(`Tokens purchased successfully! Transaction ID: ${tx}`)
//       await fetchIcoData() // Refresh ICO data
//     } catch (err) {
//       console.error("Error buying tokens:", err)
//       setError(`Token purchase failed: ${err.message}`)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const calculateTokenAmount = () => {
//     if (!amount || !icoData) return 0

//     // Calculate based on the current price
//     const currentPrice = icoData.currentPublicPrice.toString() / anchor.web3.LAMPORTS_PER_SOL
//     return Number.parseFloat(amount) / currentPrice
//   }

//   const calculateTokensSoldPercentage = () => {
//     if (!icoData) return 0
//     return (icoData.tokensSold.toString() / icoData.totalSupply.toString()) * 100
//   }

//   const tokensSoldPercentage = calculateTokensSoldPercentage()

//   return (
//     <Card className="max-w-lg mx-auto">
//       <CardHeader>
//         <CardTitle>Buy Tokens</CardTitle>
//         <CardDescription>Purchase tokens for the Solana ICO</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <form onSubmit={handleBuyTokens} className="space-y-4">
//           <div className="space-y-2">
//             <Label htmlFor="amount">Amount of SOL to spend:</Label>
//             <Input
//               type="number"
//               id="amount"
//               value={amount}
//               onChange={(e) => setAmount(e.target.value)}
//               required
//               min="0"
//               step="0.000000001"
//             />
//           </div>
//           {icoData && (
//             <div className="text-sm text-gray-600">
//               You will receive approximately {calculateTokenAmount().toFixed(4)} tokens
//             </div>
//           )}
//           <Button type="submit" disabled={loading || !wallet.publicKey} className="w-full">
//             {loading ? (
//               <>
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 Processing...
//               </>
//             ) : (
//               "Buy Tokens"
//             )}
//           </Button>
//         </form>
//         {error && (
//           <Alert variant="destructive" className="mt-4">
//             <AlertDescription>{error}</AlertDescription>
//           </Alert>
//         )}
//         {success && (
//           <Alert className="mt-4 bg-green-50 text-green-800 border-green-500">
//             <AlertDescription>{success}</AlertDescription>
//           </Alert>
//         )}
//         {icoData && (
//           <div className="mt-6 space-y-4">
//             <div className="flex justify-between items-center">
//               <span className="text-sm font-medium text-gray-700">Current Price:</span>
//               <span className="text-sm font-bold">{formatSol(icoData.currentPublicPrice)} SOL</span>
//             </div>
//             <div className="flex justify-between items-center">
//               <span className="text-sm font-medium text-gray-700">Tokens Available:</span>
//               <span className="text-sm font-bold">{formatSol(icoData.totalSupply.sub(icoData.tokensSold))}</span>
//             </div>
//             <div>
//               <div className="flex justify-between items-center mb-1">
//                 <span className="text-sm font-medium text-gray-700">Tokens Sold:</span>
//                 <span className="text-sm font-bold">{tokensSoldPercentage.toFixed(2)}%</span>
//               </div>
//               <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
//                 <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${tokensSoldPercentage}%` }}></div>
//               </div>
//             </div>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   )
// }

// export default BuyTokens

