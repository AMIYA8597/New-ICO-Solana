"use client"

import { useState } from "react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { PublicKey } from "@solana/web3.js"
import { getProgram } from "../utils/anchor-connection"
import * as anchor from "@project-serum/anchor"
import { isAdminWallet } from "../utils/admin-check"
import { Label } from "../components/ui/label"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Alert, AlertDescription } from "../components/ui/alert"
import { Loader2 } from "lucide-react"

const InitializeIco = () => {
  const { connection } = useConnection()
  const wallet = useWallet()
  const [formData, setFormData] = useState({
    totalSupply: "",
    seedPrice: "",
    preIcoPrice: "",
    publicPrice: "",
    startTime: "",
    duration: "",
    preIcoRoundDeadline: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!wallet.publicKey || !wallet.signTransaction) {
      setError("Please connect your wallet first")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const program = getProgram(connection, wallet)

      // Find the ICO account PDA
      const [icoAccount] = await PublicKey.findProgramAddress([Buffer.from("ico")], program.programId)

      // Convert form values to the correct format
      const totalSupply = new anchor.BN(
        Math.floor(Number.parseFloat(formData.totalSupply) * anchor.web3.LAMPORTS_PER_SOL),
      )
      const seedPrice = new anchor.BN(Math.floor(Number.parseFloat(formData.seedPrice) * anchor.web3.LAMPORTS_PER_SOL))
      const preIcoPrice = new anchor.BN(
        Math.floor(Number.parseFloat(formData.preIcoPrice) * anchor.web3.LAMPORTS_PER_SOL),
      )
      const publicPrice = new anchor.BN(
        Math.floor(Number.parseFloat(formData.publicPrice) * anchor.web3.LAMPORTS_PER_SOL),
      )
      const startTime = new anchor.BN(Math.floor(new Date(formData.startTime).getTime() / 1000))
      const duration = new anchor.BN(Number.parseInt(formData.duration) * 86400) // Convert days to seconds
      const preIcoRoundDeadline = new anchor.BN(Number.parseInt(formData.preIcoRoundDeadline) * 86400) // Convert days to seconds

      // Create the token mint account if it doesn't exist
      const tokenMint = new PublicKey(process.env.REACT_APP_TOKEN_MINT_ADDRESS)

      console.log("Initializing ICO with parameters:", {
        totalSupply: totalSupply.toString(),
        seedPrice: seedPrice.toString(),
        preIcoPrice: preIcoPrice.toString(),
        publicPrice: publicPrice.toString(),
        startTime: startTime.toString(),
        duration: duration.toString(),
        preIcoRoundDeadline: preIcoRoundDeadline.toString(),
        tokenMint: tokenMint.toString(),
        authority: wallet.publicKey.toString(),
      })

      const tx = await program.methods
        .initialize(totalSupply, seedPrice, preIcoPrice, publicPrice, startTime, duration, preIcoRoundDeadline)
        .accounts({
          icoAccount,
          authority: wallet.publicKey,
          tokenMint,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc()

      console.log("Transaction signature:", tx)
      setSuccess(`ICO initialized successfully! Transaction ID: ${tx}`)

      // Reset form
      setFormData({
        totalSupply: "",
        seedPrice: "",
        preIcoPrice: "",
        publicPrice: "",
        startTime: "",
        duration: "",
        preIcoRoundDeadline: "",
      })
    } catch (err) {
      console.error("Error initializing ICO:", err)
      setError(`Failed to initialize ICO: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (!wallet.publicKey || !isAdminWallet(wallet.publicKey)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>You must connect with an admin wallet to access this page.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Initialize ICO</CardTitle>
        <CardDescription>Set up the initial parameters for your ICO</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="totalSupply">Total Supply (SOL)</Label>
              <Input
                id="totalSupply"
                name="totalSupply"
                type="number"
                step="0.000000001"
                value={formData.totalSupply}
                onChange={handleInputChange}
                required
                placeholder="Enter total supply"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seedPrice">Seed Price (SOL)</Label>
              <Input
                id="seedPrice"
                name="seedPrice"
                type="number"
                step="0.000000001"
                value={formData.seedPrice}
                onChange={handleInputChange}
                required
                placeholder="Enter seed price"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preIcoPrice">Pre-ICO Price (SOL)</Label>
              <Input
                id="preIcoPrice"
                name="preIcoPrice"
                type="number"
                step="0.000000001"
                value={formData.preIcoPrice}
                onChange={handleInputChange}
                required
                placeholder="Enter pre-ICO price"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="publicPrice">Public Price (SOL)</Label>
              <Input
                id="publicPrice"
                name="publicPrice"
                type="number"
                step="0.000000001"
                value={formData.publicPrice}
                onChange={handleInputChange}
                required
                placeholder="Enter public price"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                name="startTime"
                type="datetime-local"
                value={formData.startTime}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (days)</Label>
              <Input
                id="duration"
                name="duration"
                type="number"
                min="1"
                value={formData.duration}
                onChange={handleInputChange}
                required
                placeholder="Enter duration in days"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preIcoRoundDeadline">Pre-ICO Round Deadline (days)</Label>
              <Input
                id="preIcoRoundDeadline"
                name="preIcoRoundDeadline"
                type="number"
                min="1"
                value={formData.preIcoRoundDeadline}
                onChange={handleInputChange}
                required
                placeholder="Enter pre-ICO deadline in days"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Initializing...
              </>
            ) : (
              "Initialize ICO"
            )}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 text-green-800 border-green-500">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

export default InitializeIco


































// "use client"

// import { useState } from "react"
// import { useConnection, useWallet } from "@solana/wallet-adapter-react"
// import { PublicKey } from "@solana/web3.js"
// import { getProgram } from "../utils/anchor-connection"
// import * as anchor from "@project-serum/anchor"
// import { isAdminWallet } from "../utils/admin-check"
// import { Label } from "../components/ui/label"
// import { Button } from "../components/ui/button"
// import { Input } from "../components/ui/input"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
// import { Alert, AlertDescription } from "../components/ui/alert"
// import { Loader2 } from "lucide-react"

// const InitializeIco = () => {
//   const { connection } = useConnection()
//   const wallet = useWallet()
//   const [formData, setFormData] = useState({
//     totalSupply: "",
//     seedPrice: "",
//     preIcoPrice: "",
//     publicPrice: "",
//     startTime: "",
//     duration: "",
//     preIcoRoundDeadline: "",
//   })
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState("")
//   const [success, setSuccess] = useState("")

//   const handleInputChange = (e) => {
//     const { name, value } = e.target
//     setFormData((prevState) => ({
//       ...prevState,
//       [name]: value,
//     }))
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     if (!wallet.publicKey || !wallet.signTransaction) {
//       setError("Please connect your wallet first")
//       return
//     }

//     setLoading(true)
//     setError("")
//     setSuccess("")

//     try {
//       const program = getProgram(connection, wallet)

//       // Find the ICO account PDA
//       const [icoAccount] = await PublicKey.findProgramAddressSync([Buffer.from("ico")], program.programId)

//       console.log("icoAccount " , icoAccount)

//       // Convert form values to the correct format
//       const totalSupply = new anchor.BN(
//         Math.floor(Number.parseFloat(formData.totalSupply) * anchor.web3.LAMPORTS_PER_SOL),
//       )

//       console.log("totalSupply" , totalSupply)
//       const seedPrice = new anchor.BN(Math.floor(Number.parseFloat(formData.seedPrice) * anchor.web3.LAMPORTS_PER_SOL))
//       const preIcoPrice = new anchor.BN(
//         Math.floor(Number.parseFloat(formData.preIcoPrice) * anchor.web3.LAMPORTS_PER_SOL),
//       )
//       const publicPrice = new anchor.BN(
//         Math.floor(Number.parseFloat(formData.publicPrice) * anchor.web3.LAMPORTS_PER_SOL),
//       )
//       const startTime = new anchor.BN(Math.floor(new Date(formData.startTime).getTime() / 1000))
//       const duration = new anchor.BN(Number.parseInt(formData.duration) * 86400) // Convert days to seconds
//       const preIcoRoundDeadline = new anchor.BN(Number.parseInt(formData.preIcoRoundDeadline) * 86400) // Convert days to seconds

//       // Create the token mint account if it doesn't exist
//       const tokenMint = new PublicKey(process.env.REACT_APP_TOKEN_MINT_ADDRESS)

//       console.log("Initializing ICO with parameters:", {
//         totalSupply: totalSupply.toString(),
//         seedPrice: seedPrice.toString(),
//         preIcoPrice: preIcoPrice.toString(),
//         publicPrice: publicPrice.toString(),
//         startTime: startTime.toString(),
//         duration: duration.toString(),
//         preIcoRoundDeadline: preIcoRoundDeadline.toString(),
//       })

//       const tx = await program.methods
//         .initialize(totalSupply, seedPrice, preIcoPrice, publicPrice, startTime, duration, preIcoRoundDeadline)
//         .accounts({
//           icoAccount,
//           authority: wallet.publicKey,
//           tokenMint,
//           systemProgram: anchor.web3.SystemProgram.programId,
//         })
//         .rpc()

//       console.log("Transaction signature:", tx)
//       setSuccess(`ICO initialized successfully! Transaction ID: ${tx}`)

//       // Reset form
//       setFormData({
//         totalSupply: "",
//         seedPrice: "",
//         preIcoPrice: "",
//         publicPrice: "",
//         startTime: "",
//         duration: "",
//         preIcoRoundDeadline: "",
//       })
//     } catch (err) {
//       console.error("Error initializing ICO:", err)
//       setError(err.message || "Failed to initialize ICO. Please try again later.")
//     } finally {
//       setLoading(false)
//     }
//   }

//   if (!wallet.publicKey || !isAdminWallet(wallet.publicKey)) {
//     return (
//       <Card>
//         <CardHeader>
//           <CardTitle>Access Denied</CardTitle>
//           <CardDescription>You must connect with an admin wallet to access this page.</CardDescription>
//         </CardHeader>
//       </Card>
//     )
//   }

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Initialize ICO</CardTitle>
//         <CardDescription>Set up the initial parameters for your ICO</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
//             <div className="space-y-2">
//               <Label htmlFor="totalSupply">Total Supply (SOL)</Label>
//               <Input
//                 id="totalSupply"
//                 name="totalSupply"
//                 type="number"
//                 step="0.000000001"
//                 value={formData.totalSupply}
//                 onChange={handleInputChange}
//                 required
//                 placeholder="Enter total supply"
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="seedPrice">Seed Price (SOL)</Label>
//               <Input
//                 id="seedPrice"
//                 name="seedPrice"
//                 type="number"
//                 step="0.000000001"
//                 value={formData.seedPrice}
//                 onChange={handleInputChange}
//                 required
//                 placeholder="Enter seed price"
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="preIcoPrice">Pre-ICO Price (SOL)</Label>
//               <Input
//                 id="preIcoPrice"
//                 name="preIcoPrice"
//                 type="number"
//                 step="0.000000001"
//                 value={formData.preIcoPrice}
//                 onChange={handleInputChange}
//                 required
//                 placeholder="Enter pre-ICO price"
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="publicPrice">Public Price (SOL)</Label>
//               <Input
//                 id="publicPrice"
//                 name="publicPrice"
//                 type="number"
//                 step="0.000000001"
//                 value={formData.publicPrice}
//                 onChange={handleInputChange}
//                 required
//                 placeholder="Enter public price"
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="startTime">Start Time</Label>
//               <Input
//                 id="startTime"
//                 name="startTime"
//                 type="datetime-local"
//                 value={formData.startTime}
//                 onChange={handleInputChange}
//                 required
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="duration">Duration (days)</Label>
//               <Input
//                 id="duration"
//                 name="duration"
//                 type="number"
//                 min="1"
//                 value={formData.duration}
//                 onChange={handleInputChange}
//                 required
//                 placeholder="Enter duration in days"
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="preIcoRoundDeadline">Pre-ICO Round Deadline (days)</Label>
//               <Input
//                 id="preIcoRoundDeadline"
//                 name="preIcoRoundDeadline"
//                 type="number"
//                 min="1"
//                 value={formData.preIcoRoundDeadline}
//                 onChange={handleInputChange}
//                 required
//                 placeholder="Enter pre-ICO deadline in days"
//               />
//             </div>
//           </div>

//           <Button type="submit" className="w-full" disabled={loading}>
//             {loading ? (
//               <>
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 Initializing...
//               </>
//             ) : (
//               "Initialize ICO"
//             )}
//           </Button>

//           {error && (
//             <Alert variant="destructive">
//               <AlertDescription>{error}</AlertDescription>
//             </Alert>
//           )}

//           {success && (
//             <Alert className="bg-green-50 text-green-800 border-green-500">
//               <AlertDescription>{success}</AlertDescription>
//             </Alert>
//           )}
//         </form>
//       </CardContent>
//     </Card>
//   )
// }

// export default InitializeIco

