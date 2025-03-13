"use client"

import { useState, useEffect } from "react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { PublicKey } from "@solana/web3.js"
import { getStakingProgram } from "../utils/anchor-connection"
import * as anchor from "@project-serum/anchor"
import { isAdminWallet } from "../utils/admin-check"
import AdminLayout from "../components/AdminLayout"
import { Label } from "../components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { Alert, AlertDescription } from "../components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Loader2 } from "lucide-react"

const StakingAdmin = () => {
  const { connection } = useConnection()
  const wallet = useWallet()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [stakingData, setStakingData] = useState(null)
  const [activeTab, setActiveTab] = useState("update")
  const [fetchingData, setFetchingData] = useState(true)

  // Update staking parameters form
  const [updateForm, setUpdateForm] = useState({
    lockupPeriod: "",
    lowTierFee: "",
    midTierFee: "",
    highTierFee: "",
  })

  // Create coupon form
  const [couponForm, setCreateCouponForm] = useState({
    code: "",
    bonusType: "Percentage",
    bonusValue: "",
    duration: "",
    minStakeAmount: "",
    maxUses: "",
    couponCategory: "NewUser",
  })

  useEffect(() => {
    if (wallet.publicKey && isAdminWallet(wallet.publicKey)) {
      fetchStakingData()
    } else {
      setFetchingData(false)
    }
  }, [connection, wallet.publicKey])

  const fetchStakingData = async () => {
    if (!wallet.publicKey) return

    try {
      setFetchingData(true)
      const program = getStakingProgram(connection, wallet)

      // Fetch staking account
      const [stakingAccount] = await PublicKey.findProgramAddressSync([Buffer.from("staking_account")], program.programId)

      console.log("stakingAccountttttttt", stakingAccount);
      

      try {
        const data = await program.account.stakingAccount.fetch(stakingAccount)
        console.log("Staking dataaaaaa:", data)
        setStakingData(data)

        // Set form values
        setUpdateForm({
          lockupPeriod: data.lockupPeriod.toString(),
          lowTierFee: data.lowTierFee.toString(),
          midTierFee: data.midTierFee.toString(),
          highTierFee: data.highTierFee.toString(),
        })
      } catch (err) {
        console.error("Error fetching staking account:", err)
        setError("Staking not initialized yet. Please initialize staking first.")
      }
    } catch (err) {
      console.error("Error fetching staking data:", err)
      setError("Failed to fetch staking data. Please try again later.")
    } finally {
      setFetchingData(false)
    }
  }

  const handleInitializeStaking = async (e) => {
    e.preventDefault()
    if (!wallet.publicKey || !isAdminWallet(wallet.publicKey)) return

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const program = getStakingProgram(connection, wallet)

      // Find staking account PDA
      const [stakingAccount] = await PublicKey.findProgramAddressSync([Buffer.from("staking_account")], program.programId)

      // Get token mint from environment
      const tokenMint = new PublicKey(process.env.REACT_APP_TOKEN_MINT_ADDRESS)

      // Convert form values
      const lockupPeriod = new anchor.BN(Number.parseInt(updateForm.lockupPeriod))
      const lowTierFee = Number.parseFloat(updateForm.lowTierFee)
      const midTierFee = Number.parseFloat(updateForm.midTierFee)
      const highTierFee = Number.parseFloat(updateForm.highTierFee)

      console.log("Initializing staking with parameters:", {
        lockupPeriod: lockupPeriod.toString(),
        lowTierFee,
        midTierFee,
        highTierFee,
        tokenMint: tokenMint.toString(),
        admin: wallet.publicKey.toString(),
      })

      // Initialize staking
      const tx = await program.methods
        .initialize(lockupPeriod, lowTierFee, midTierFee, highTierFee)
        .accounts({
          stakingAccount,
          admin: wallet.publicKey,
          tokenMint,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc()

      console.log("Transaction signature:", tx)
      setSuccess(`Staking initialized successfully! Transaction ID: ${tx}`)
      await fetchStakingData() // Refresh staking data
    } catch (err) {
      console.error("Error initializing staking:", err)
      setError(`Initialization failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStakingParams = async (e) => {
    e.preventDefault()
    if (!wallet.publicKey || !isAdminWallet(wallet.publicKey)) return

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const program = getStakingProgram(connection, wallet)
      const [stakingAccount] = await PublicKey.findProgramAddressSync([Buffer.from("staking_account")], program.programId)

      // Convert form values
      const lockupPeriod = new anchor.BN(Number.parseInt(updateForm.lockupPeriod))
      const lowTierFee = Number.parseFloat(updateForm.lowTierFee)
      const midTierFee = Number.parseFloat(updateForm.midTierFee)
      const highTierFee = Number.parseFloat(updateForm.highTierFee)

      console.log("Updating staking with parameters:", {
        lockupPeriod: lockupPeriod.toString(),
        lowTierFee,
        midTierFee,
        highTierFee,
        admin: wallet.publicKey.toString(),
      })

      // Call the update instruction
      const tx = await program.methods
        .update(lockupPeriod, lowTierFee, midTierFee, highTierFee)
        .accounts({
          stakingAccount,
          admin: wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc()

      console.log("Transaction signature:", tx)
      setSuccess(`Staking parameters updated successfully! Transaction ID: ${tx}`)
      await fetchStakingData() // Refresh staking data
    } catch (err) {
      console.error("Error updating staking parameters:", err)
      setError(`Update failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCoupon = async (e) => {
    e.preventDefault()
    if (!wallet.publicKey || !isAdminWallet(wallet.publicKey)) return

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const program = getStakingProgram(connection, wallet)
      const [stakingAccount] = await PublicKey.findProgramAddressSync([Buffer.from("staking_account")], program.programId)

      // Convert form values
      const bonusValue = Number.parseFloat(couponForm.bonusValue)
      const duration = new anchor.BN(Number.parseInt(couponForm.duration) * 86400) // Convert days to seconds
      const minStakeAmount = new anchor.BN(Number.parseFloat(couponForm.minStakeAmount) * anchor.web3.LAMPORTS_PER_SOL)
      const maxUses = new anchor.BN(Number.parseInt(couponForm.maxUses))

      // Convert bonus type
      let bonusTypeObj
      switch (couponForm.bonusType) {
        case "Percentage":
          bonusTypeObj = { percentage: {} }
          break
        case "FixedAmount":
          bonusTypeObj = { fixedAmount: {} }
          break
        case "SpinBonus":
          bonusTypeObj = { spinBonus: {} }
          break
        default:
          throw new Error("Invalid bonus type")
      }

      // Convert coupon category
      let couponCategoryObj
      switch (couponForm.couponCategory) {
        case "NewUser":
          couponCategoryObj = { newUser: {} }
          break
        case "Referral":
          couponCategoryObj = { referral: {} }
          break
        case "LoyaltyReward":
          couponCategoryObj = { loyaltyReward: {} }
          break
        case "SeasonalPromo":
          couponCategoryObj = { seasonalPromo: {} }
          break
        case "Exclusive":
          couponCategoryObj = { exclusive: {} }
          break
        default:
          throw new Error("Invalid coupon category")
      }

      console.log("Creating coupon with parameters:", {
        code: couponForm.code,
        bonusType: couponForm.bonusType,
        bonusValue,
        duration: duration.toString(),
        minStakeAmount: minStakeAmount.toString(),
        maxUses: maxUses.toString(),
        couponCategory: couponForm.couponCategory,
      })

      // Create coupon
      const tx = await program.methods
        .createCoupon(couponForm.code, bonusTypeObj, bonusValue, duration, minStakeAmount, maxUses, couponCategoryObj)
        .accounts({
          stakingAccount,
          admin: wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc()

      console.log("Transaction signature:", tx)
      setSuccess(`Coupon created successfully! Transaction ID: ${tx}`)

      // Reset form
      setCreateCouponForm({
        code: "",
        bonusType: "Percentage",
        bonusValue: "",
        duration: "",
        minStakeAmount: "",
        maxUses: "",
        couponCategory: "NewUser",
      })

      await fetchStakingData() // Refresh staking data
    } catch (err) {
      console.error("Error creating coupon:", err)
      setError(`Coupon creation failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateFormChange = (e) => {
    const { name, value } = e.target
    setUpdateForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCouponFormChange = (e) => {
    const { name, value } = e.target
    setCreateCouponForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name, value) => {
    setCreateCouponForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  if (!wallet.publicKey || !isAdminWallet(wallet.publicKey)) {
    return (
      <AdminLayout>
        <Card>
          <CardHeader>
            <CardTitle>Staking Administration</CardTitle>
            <CardDescription>You do not have permission to access this page.</CardDescription>
          </CardHeader>
        </Card>
      </AdminLayout>
    )
  }

  if (fetchingData) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Loading staking data...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <Card>
        <CardHeader>
          <CardTitle>Staking Administration</CardTitle>
          <CardDescription>Manage staking parameters and coupons</CardDescription>
        </CardHeader>
        <CardContent>
          {!stakingData ? (
            <div className="space-y-4">
              <Alert className="bg-amber-50 text-amber-800 border-amber-200">
                <AlertDescription>Staking has not been initialized yet. Please initialize it first.</AlertDescription>
              </Alert>

              <form onSubmit={handleInitializeStaking} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="lockupPeriod">Lockup Period (seconds):</Label>
                  <Input
                    type="number"
                    id="lockupPeriod"
                    name="lockupPeriod"
                    value={updateForm.lockupPeriod}
                    onChange={handleUpdateFormChange}
                    required
                    min="0"
                    placeholder="e.g. 2592000 (30 days)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lowTierFee">Low Tier Fee (%):</Label>
                  <Input
                    type="number"
                    id="lowTierFee"
                    name="lowTierFee"
                    value={updateForm.lowTierFee}
                    onChange={handleUpdateFormChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="e.g. 5.0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="midTierFee">Mid Tier Fee (%):</Label>
                  <Input
                    type="number"
                    id="midTierFee"
                    name="midTierFee"
                    value={updateForm.midTierFee}
                    onChange={handleUpdateFormChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="e.g. 7.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="highTierFee">High Tier Fee (%):</Label>
                  <Input
                    type="number"
                    id="highTierFee"
                    name="highTierFee"
                    value={updateForm.highTierFee}
                    onChange={handleUpdateFormChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="e.g. 10.0"
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Initializing...
                    </>
                  ) : (
                    "Initialize Staking"
                  )}
                </Button>
              </form>
            </div>
          ) : (
            <Tabs defaultValue="update" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="update">Update Parameters</TabsTrigger>
                <TabsTrigger value="coupons">Create Coupon</TabsTrigger>
              </TabsList>

              <TabsContent value="update">
                <form onSubmit={handleUpdateStakingParams} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="lockupPeriod">Lockup Period (seconds):</Label>
                    <Input
                      type="number"
                      id="lockupPeriod"
                      name="lockupPeriod"
                      value={updateForm.lockupPeriod}
                      onChange={handleUpdateFormChange}
                      required
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lowTierFee">Low Tier Fee (%):</Label>
                    <Input
                      type="number"
                      id="lowTierFee"
                      name="lowTierFee"
                      value={updateForm.lowTierFee}
                      onChange={handleUpdateFormChange}
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="midTierFee">Mid Tier Fee (%):</Label>
                    <Input
                      type="number"
                      id="midTierFee"
                      name="midTierFee"
                      value={updateForm.midTierFee}
                      onChange={handleUpdateFormChange}
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="highTierFee">High Tier Fee (%):</Label>
                    <Input
                      type="number"
                      id="highTierFee"
                      name="highTierFee"
                      value={updateForm.highTierFee}
                      onChange={handleUpdateFormChange}
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Parameters"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="coupons">
                <form onSubmit={handleCreateCoupon} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Coupon Code:</Label>
                    <Input
                      type="text"
                      id="code"
                      name="code"
                      value={couponForm.code}
                      onChange={handleCouponFormChange}
                      required
                      placeholder="e.g. WELCOME10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bonusType">Bonus Type:</Label>
                    <Select
                      value={couponForm.bonusType}
                      onValueChange={(value) => handleSelectChange("bonusType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select bonus type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Percentage">Percentage</SelectItem>
                        <SelectItem value="FixedAmount">Fixed Amount</SelectItem>
                        <SelectItem value="SpinBonus">Spin Bonus</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bonusValue">Bonus Value:</Label>
                    <Input
                      type="number"
                      id="bonusValue"
                      name="bonusValue"
                      value={couponForm.bonusValue}
                      onChange={handleCouponFormChange}
                      required
                      min="0"
                      step="0.01"
                      placeholder={
                        couponForm.bonusType === "Percentage" ? "e.g. 10.0 (for 10%)" : "e.g. 5.0 (for 5 SOL)"
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (days):</Label>
                    <Input
                      type="number"
                      id="duration"
                      name="duration"
                      value={couponForm.duration}
                      onChange={handleCouponFormChange}
                      required
                      min="1"
                      placeholder="e.g. 30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minStakeAmount">Minimum Stake Amount (SOL):</Label>
                    <Input
                      type="number"
                      id="minStakeAmount"
                      name="minStakeAmount"
                      value={couponForm.minStakeAmount}
                      onChange={handleCouponFormChange}
                      required
                      min="0"
                      step="0.000000001"
                      placeholder="e.g. 10.0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxUses">Maximum Uses:</Label>
                    <Input
                      type="number"
                      id="maxUses"
                      name="maxUses"
                      value={couponForm.maxUses}
                      onChange={handleCouponFormChange}
                      required
                      min="1"
                      placeholder="e.g. 100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="couponCategory">Coupon Category:</Label>
                    <Select
                      value={couponForm.couponCategory}
                      onValueChange={(value) => handleSelectChange("couponCategory", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NewUser">New User</SelectItem>
                        <SelectItem value="Referral">Referral</SelectItem>
                        <SelectItem value="LoyaltyReward">Loyalty Reward</SelectItem>
                        <SelectItem value="SeasonalPromo">Seasonal Promo</SelectItem>
                        <SelectItem value="Exclusive">Exclusive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Coupon"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}

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
        </CardContent>
      </Card>
    </AdminLayout>
  )
}

export default StakingAdmin





































// "use client"

// import { useState, useEffect } from "react"
// import { useConnection, useWallet } from "@solana/wallet-adapter-react"
// import { PublicKey } from "@solana/web3.js"
// import { getStakingProgram } from "../utils/anchor-connection"
// import * as anchor from "@project-serum/anchor"
// import { isAdminWallet } from "../utils/admin-check"
// import AdminLayout from "../components/AdminLayout"
// import { Label } from "../components/ui/label"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
// import { Input } from "../components/ui/input"
// import { Button } from "../components/ui/button"
// import { Alert, AlertDescription } from "../components/ui/alert"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
// import { Loader2 } from "lucide-react"

// const StakingAdmin = () => {
//   const { connection } = useConnection()
//   const wallet = useWallet()
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState("")
//   const [success, setSuccess] = useState("")
//   const [stakingData, setStakingData] = useState(null)
//   const [activeTab, setActiveTab] = useState("update")
//   const [fetchingData, setFetchingData] = useState(true)

//   // Update staking parameters form
//   const [updateForm, setUpdateForm] = useState({
//     lockupPeriod: "",
//     lowTierFee: "",
//     midTierFee: "",
//     highTierFee: "",
//   })

//   // Create coupon form
//   const [couponForm, setCreateCouponForm] = useState({
//     code: "",
//     bonusType: "Percentage",
//     bonusValue: "",
//     duration: "",
//     minStakeAmount: "",
//     maxUses: "",
//     couponCategory: "NewUser",
//   })

//   useEffect(() => {
//     if (wallet.publicKey && isAdminWallet(wallet.publicKey)) {
//       fetchStakingData()
//     } else {
//       setFetchingData(false)
//     }
//   }, [connection, wallet.publicKey])

//   const fetchStakingData = async () => {
//     if (!wallet.publicKey) return

//     try {
//       setFetchingData(true)
//       const program = getStakingProgram(connection, wallet)

//       // Fetch staking account
//       const [stakingAccount] = await PublicKey.findProgramAddressSync([Buffer.from("staking_account")], program.programId)

//       try {
//         const data = await program.account.stakingAccount.fetch(stakingAccount)
//         console.log("Staking data:", data)
//         setStakingData(data)

//         // Set form values
//         setUpdateForm({
//           lockupPeriod: data.lockupPeriod.toString(),
//           lowTierFee: data.lowTierFee.toString(),
//           midTierFee: data.midTierFee.toString(),
//           highTierFee: data.highTierFee.toString(),
//         })
//       } catch (err) {
//         console.error("Error fetching staking account:", err)
//         setError("Staking not initialized yet. Please initialize staking first.")
//       }
//     } catch (err) {
//       console.error("Error fetching staking data:", err)
//       setError("Failed to fetch staking data. Please try again later.")
//     } finally {
//       setFetchingData(false)
//     }
//   }

//   const handleInitializeStaking = async (e) => {
//     e.preventDefault()
//     if (!wallet.publicKey || !isAdminWallet(wallet.publicKey)) return

//     setLoading(true)
//     setError("")
//     setSuccess("")

//     try {
//       const program = getStakingProgram(connection, wallet)

//       // Find staking account PDA
//       const [stakingAccount] = await PublicKey.findProgramAddressSync([Buffer.from("staking_account")], program.programId)

//       // Get token mint from environment
//       const tokenMint = new PublicKey(process.env.REACT_APP_TOKEN_MINT_ADDRESS)

//       // Convert form values
//       const lockupPeriod = new anchor.BN(Number.parseInt(updateForm.lockupPeriod))
//       const lowTierFee = Number.parseFloat(updateForm.lowTierFee)
//       const midTierFee = Number.parseFloat(updateForm.midTierFee)
//       const highTierFee = Number.parseFloat(updateForm.highTierFee)

//       console.log("Initializing staking with parameters:", {
//         lockupPeriod: lockupPeriod.toString(),
//         lowTierFee,
//         midTierFee,
//         highTierFee,
//         tokenMint: tokenMint.toString(),
//       })

//       // Initialize staking
//       const tx = await program.methods
//         .initialize(lockupPeriod, lowTierFee, midTierFee, highTierFee)
//         .accounts({
//           stakingAccount,
//           admin: wallet.publicKey,
//           tokenMint,
//           systemProgram: anchor.web3.SystemProgram.programId,
//         })
//         .rpc()

//       setSuccess(`Staking initialized successfully! Transaction ID: ${tx}`)
//       await fetchStakingData() // Refresh staking data
//     } catch (err) {
//       console.error("Error initializing staking:", err)
//       setError(`Initialization failed: ${err.message}`)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleUpdateStakingParams = async (e) => {
//     e.preventDefault()
//     if (!wallet.publicKey || !isAdminWallet(wallet.publicKey)) return

//     setLoading(true)
//     setError("")
//     setSuccess("")

//     try {
//       const program = getStakingProgram(connection, wallet)
//       const [stakingAccount] = await PublicKey.findProgramAddressSync([Buffer.from("staking_account")], program.programId)

//       // Convert form values
//       const lockupPeriod = new anchor.BN(Number.parseInt(updateForm.lockupPeriod))
//       const lowTierFee = Number.parseFloat(updateForm.lowTierFee)
//       const midTierFee = Number.parseFloat(updateForm.midTierFee)
//       const highTierFee = Number.parseFloat(updateForm.highTierFee)

//       // Call the update instruction
//       const tx = await program.methods
//         .update(lockupPeriod, lowTierFee, midTierFee, highTierFee)
//         .accounts({
//           stakingAccount,
//           admin: wallet.publicKey,
//           systemProgram: anchor.web3.SystemProgram.programId,
//         })
//         .rpc()

//       setSuccess(`Staking parameters updated successfully! Transaction ID: ${tx}`)
//       await fetchStakingData() // Refresh staking data
//     } catch (err) {
//       console.error("Error updating staking parameters:", err)
//       setError(`Update failed: ${err.message}`)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleCreateCoupon = async (e) => {
//     e.preventDefault()
//     if (!wallet.publicKey || !isAdminWallet(wallet.publicKey)) return

//     setLoading(true)
//     setError("")
//     setSuccess("")

//     try {
//       const program = getStakingProgram(connection, wallet)
//       const [stakingAccount] = await PublicKey.findProgramAddressSync([Buffer.from("staking_account")], program.programId)

//       // Convert form values
//       const bonusValue = Number.parseFloat(couponForm.bonusValue)
//       const duration = new anchor.BN(Number.parseInt(couponForm.duration) * 86400) // Convert days to seconds
//       const minStakeAmount = new anchor.BN(Number.parseFloat(couponForm.minStakeAmount) * anchor.web3.LAMPORTS_PER_SOL)
//       const maxUses = new anchor.BN(Number.parseInt(couponForm.maxUses))

//       // Convert bonus type
//       let bonusTypeObj
//       switch (couponForm.bonusType) {
//         case "Percentage":
//           bonusTypeObj = { percentage: {} }
//           break
//         case "FixedAmount":
//           bonusTypeObj = { fixedAmount: {} }
//           break
//         case "SpinBonus":
//           bonusTypeObj = { spinBonus: {} }
//           break
//         default:
//           throw new Error("Invalid bonus type")
//       }

//       // Convert coupon category
//       let couponCategoryObj
//       switch (couponForm.couponCategory) {
//         case "NewUser":
//           couponCategoryObj = { newUser: {} }
//           break
//         case "Referral":
//           couponCategoryObj = { referral: {} }
//           break
//         case "LoyaltyReward":
//           couponCategoryObj = { loyaltyReward: {} }
//           break
//         case "SeasonalPromo":
//           couponCategoryObj = { seasonalPromo: {} }
//           break
//         case "Exclusive":
//           couponCategoryObj = { exclusive: {} }
//           break
//         default:
//           throw new Error("Invalid coupon category")
//       }

//       console.log("Creating coupon with parameters:", {
//         code: couponForm.code,
//         bonusType: couponForm.bonusType,
//         bonusValue,
//         duration: duration.toString(),
//         minStakeAmount: minStakeAmount.toString(),
//         maxUses: maxUses.toString(),
//         couponCategory: couponForm.couponCategory,
//       })

//       // Create coupon
//       const tx = await program.methods
//         .createCoupon(couponForm.code, bonusTypeObj, bonusValue, duration, minStakeAmount, maxUses, couponCategoryObj)
//         .accounts({
//           stakingAccount,
//           admin: wallet.publicKey,
//           systemProgram: anchor.web3.SystemProgram.programId,
//         })
//         .rpc()

//       setSuccess(`Coupon created successfully! Transaction ID: ${tx}`)

//       // Reset form
//       setCreateCouponForm({
//         code: "",
//         bonusType: "Percentage",
//         bonusValue: "",
//         duration: "",
//         minStakeAmount: "",
//         maxUses: "",
//         couponCategory: "NewUser",
//       })

//       await fetchStakingData() // Refresh staking data
//     } catch (err) {
//       console.error("Error creating coupon:", err)
//       setError(`Coupon creation failed: ${err.message}`)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleUpdateFormChange = (e) => {
//     const { name, value } = e.target
//     setUpdateForm((prev) => ({
//       ...prev,
//       [name]: value,
//     }))
//   }

//   const handleCouponFormChange = (e) => {
//     const { name, value } = e.target
//     setCreateCouponForm((prev) => ({
//       ...prev,
//       [name]: value,
//     }))
//   }

//   const handleSelectChange = (name, value) => {
//     setCreateCouponForm((prev) => ({
//       ...prev,
//       [name]: value,
//     }))
//   }

//   if (!wallet.publicKey || !isAdminWallet(wallet.publicKey)) {
//     return (
//       <AdminLayout>
//         <Card>
//           <CardHeader>
//             <CardTitle>Staking Administration</CardTitle>
//             <CardDescription>You do not have permission to access this page.</CardDescription>
//           </CardHeader>
//         </Card>
//       </AdminLayout>
//     )
//   }

//   if (fetchingData) {
//     return (
//       <AdminLayout>
//         <div className="flex flex-col items-center justify-center min-h-[400px]">
//           <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
//           <p className="text-lg text-muted-foreground">Loading staking data...</p>
//         </div>
//       </AdminLayout>
//     )
//   }

//   return (
//     <AdminLayout>
//       <Card>
//         <CardHeader>
//           <CardTitle>Staking Administration</CardTitle>
//           <CardDescription>Manage staking parameters and coupons</CardDescription>
//         </CardHeader>
//         <CardContent>
//           {!stakingData ? (
//             <div className="space-y-4">
//               <Alert className="bg-amber-50 text-amber-800 border-amber-200">
//                 <AlertDescription>Staking has not been initialized yet. Please initialize it first.</AlertDescription>
//               </Alert>

//               <form onSubmit={handleInitializeStaking} className="space-y-4 pt-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="lockupPeriod">Lockup Period (seconds):</Label>
//                   <Input
//                     type="number"
//                     id="lockupPeriod"
//                     name="lockupPeriod"
//                     value={updateForm.lockupPeriod}
//                     onChange={handleUpdateFormChange}
//                     required
//                     min="0"
//                     placeholder="e.g. 2592000 (30 days)"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="lowTierFee">Low Tier Fee (%):</Label>
//                   <Input
//                     type="number"
//                     id="lowTierFee"
//                     name="lowTierFee"
//                     value={updateForm.lowTierFee}
//                     onChange={handleUpdateFormChange}
//                     required
//                     min="0"
//                     step="0.01"
//                     placeholder="e.g. 5.0"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="midTierFee">Mid Tier Fee (%):</Label>
//                   <Input
//                     type="number"
//                     id="midTierFee"
//                     name="midTierFee"
//                     value={updateForm.midTierFee}
//                     onChange={handleUpdateFormChange}
//                     required
//                     min="0"
//                     step="0.01"
//                     placeholder="e.g. 7.5"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="highTierFee">High Tier Fee (%):</Label>
//                   <Input
//                     type="number"
//                     id="highTierFee"
//                     name="highTierFee"
//                     value={updateForm.highTierFee}
//                     onChange={handleUpdateFormChange}
//                     required
//                     min="0"
//                     step="0.01"
//                     placeholder="e.g. 10.0"
//                   />
//                 </div>
//                 <Button type="submit" disabled={loading} className="w-full">
//                   {loading ? (
//                     <>
//                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                       Initializing...
//                     </>
//                   ) : (
//                     "Initialize Staking"
//                   )}
//                 </Button>
//               </form>
//             </div>
//           ) : (
//             <Tabs defaultValue="update" value={activeTab} onValueChange={setActiveTab} className="w-full">
//               <TabsList className="grid w-full grid-cols-2">
//                 <TabsTrigger value="update">Update Parameters</TabsTrigger>
//                 <TabsTrigger value="coupons">Create Coupon</TabsTrigger>
//               </TabsList>

//               <TabsContent value="update">
//                 <form onSubmit={handleUpdateStakingParams} className="space-y-4 pt-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="lockupPeriod">Lockup Period (seconds):</Label>
//                     <Input
//                       type="number"
//                       id="lockupPeriod"
//                       name="lockupPeriod"
//                       value={updateForm.lockupPeriod}
//                       onChange={handleUpdateFormChange}
//                       required
//                       min="0"
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="lowTierFee">Low Tier Fee (%):</Label>
//                     <Input
//                       type="number"
//                       id="lowTierFee"
//                       name="lowTierFee"
//                       value={updateForm.lowTierFee}
//                       onChange={handleUpdateFormChange}
//                       required
//                       min="0"
//                       step="0.01"
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="midTierFee">Mid Tier Fee (%):</Label>
//                     <Input
//                       type="number"
//                       id="midTierFee"
//                       name="midTierFee"
//                       value={updateForm.midTierFee}
//                       onChange={handleUpdateFormChange}
//                       required
//                       min="0"
//                       step="0.01"
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="highTierFee">High Tier Fee (%):</Label>
//                     <Input
//                       type="number"
//                       id="highTierFee"
//                       name="highTierFee"
//                       value={updateForm.highTierFee}
//                       onChange={handleUpdateFormChange}
//                       required
//                       min="0"
//                       step="0.01"
//                     />
//                   </div>
//                   <Button type="submit" disabled={loading} className="w-full">
//                     {loading ? (
//                       <>
//                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                         Updating...
//                       </>
//                     ) : (
//                       "Update Parameters"
//                     )}
//                   </Button>
//                 </form>
//               </TabsContent>

//               <TabsContent value="coupons">
//                 <form onSubmit={handleCreateCoupon} className="space-y-4 pt-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="code">Coupon Code:</Label>
//                     <Input
//                       type="text"
//                       id="code"
//                       name="code"
//                       value={couponForm.code}
//                       onChange={handleCouponFormChange}
//                       required
//                       placeholder="e.g. WELCOME10"
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="bonusType">Bonus Type:</Label>
//                     <Select
//                       value={couponForm.bonusType}
//                       onValueChange={(value) => handleSelectChange("bonusType", value)}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select bonus type" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="Percentage">Percentage</SelectItem>
//                         <SelectItem value="FixedAmount">Fixed Amount</SelectItem>
//                         <SelectItem value="SpinBonus">Spin Bonus</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="bonusValue">Bonus Value:</Label>
//                     <Input
//                       type="number"
//                       id="bonusValue"
//                       name="bonusValue"
//                       value={couponForm.bonusValue}
//                       onChange={handleCouponFormChange}
//                       required
//                       min="0"
//                       step="0.01"
//                       placeholder={
//                         couponForm.bonusType === "Percentage" ? "e.g. 10.0 (for 10%)" : "e.g. 5.0 (for 5 SOL)"
//                       }
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="duration">Duration (days):</Label>
//                     <Input
//                       type="number"
//                       id="duration"
//                       name="duration"
//                       value={couponForm.duration}
//                       onChange={handleCouponFormChange}
//                       required
//                       min="1"
//                       placeholder="e.g. 30"
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="minStakeAmount">Minimum Stake Amount (SOL):</Label>
//                     <Input
//                       type="number"
//                       id="minStakeAmount"
//                       name="minStakeAmount"
//                       value={couponForm.minStakeAmount}
//                       onChange={handleCouponFormChange}
//                       required
//                       min="0"
//                       step="0.000000001"
//                       placeholder="e.g. 10.0"
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="maxUses">Maximum Uses:</Label>
//                     <Input
//                       type="number"
//                       id="maxUses"
//                       name="maxUses"
//                       value={couponForm.maxUses}
//                       onChange={handleCouponFormChange}
//                       required
//                       min="1"
//                       placeholder="e.g. 100"
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="couponCategory">Coupon Category:</Label>
//                     <Select
//                       value={couponForm.couponCategory}
//                       onValueChange={(value) => handleSelectChange("couponCategory", value)}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select category" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="NewUser">New User</SelectItem>
//                         <SelectItem value="Referral">Referral</SelectItem>
//                         <SelectItem value="LoyaltyReward">Loyalty Reward</SelectItem>
//                         <SelectItem value="SeasonalPromo">Seasonal Promo</SelectItem>
//                         <SelectItem value="Exclusive">Exclusive</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                   <Button type="submit" disabled={loading} className="w-full">
//                     {loading ? (
//                       <>
//                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                         Creating...
//                       </>
//                     ) : (
//                       "Create Coupon"
//                     )}
//                   </Button>
//                 </form>
//               </TabsContent>
//             </Tabs>
//           )}

//           {error && (
//             <Alert variant="destructive" className="mt-4">
//               <AlertDescription>{error}</AlertDescription>
//             </Alert>
//           )}
//           {success && (
//             <Alert className="mt-4 bg-green-50 text-green-800 border-green-500">
//               <AlertDescription>{success}</AlertDescription>
//             </Alert>
//           )}
//         </CardContent>
//       </Card>
//     </AdminLayout>
//   )
// }

// export default StakingAdmin

