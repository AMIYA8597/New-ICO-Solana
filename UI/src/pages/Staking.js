"use client"

import { useState, useEffect } from "react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { getStakingProgram } from "../utils/anchor-connection"
import * as anchor from "@project-serum/anchor"
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from "@solana/spl-token"
import { formatSol } from "../utils/formatters"
import { Label } from "../components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { Alert, AlertDescription } from "../components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Loader2, Clock, Award, Coins } from "lucide-react"

const Staking = () => {
  const { connection } = useConnection()
  const wallet = useWallet()
  const [stakeAmount, setStakeAmount] = useState("")
  const [unstakeAmount, setUnstakeAmount] = useState("")
  const [couponCode, setCouponCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [stakingData, setStakingData] = useState(null)
  const [stakerInfo, setStakerInfo] = useState(null)
  const [stakeRecords, setStakeRecords] = useState([])
  const [activeTab, setActiveTab] = useState("stake")
  const [selectedStakeRecord, setSelectedStakeRecord] = useState(null)

  useEffect(() => {
    if (wallet.publicKey) {
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
      const [stakingAccount] = await PublicKey.findProgramAddress([Buffer.from("staking_account")], program.programId)

      try {
        const stakingData = await program.account.stakingAccount.fetch(stakingAccount)
        console.log("Staking data:", stakingData)
        setStakingData(stakingData)
      } catch (err) {
        console.error("Error fetching staking account:", err)
        setError("Staking not initialized yet. Please contact the administrator.")
        setFetchingData(false)
        return
      }

      // Fetch staker info
      try {
        const [stakerInfoAccount] = await PublicKey.findProgramAddress(
          [Buffer.from("staker_info"), stakingAccount.toBuffer(), wallet.publicKey.toBuffer()],
          program.programId,
        )

        const stakerInfo = await program.account.stakerInfo.fetch(stakerInfoAccount)
        console.log("Staker info:", stakerInfo)
        setStakerInfo(stakerInfo)
      } catch (err) {
        console.log("No staker info found, user has not staked yet")
      }

      // Fetch stake records
      try {
        const stakeAccountsFilters = [
          { dataSize: program.account.stakeRecord.size },
          { memcmp: { offset: 8, bytes: wallet.publicKey.toBase58() } }, // owner field
        ]

        const stakeAccounts = await connection.getProgramAccounts(program.programId, {
          filters: stakeAccountsFilters,
        })

        console.log("Stake accounts found:", stakeAccounts.length)

        const records = await Promise.all(
          stakeAccounts.map(async (account) => {
            const stakeRecord = await program.account.stakeRecord.fetch(account.pubkey)
            return {
              pubkey: account.pubkey,
              ...stakeRecord,
            }
          }),
        )

        setStakeRecords(records.filter((record) => record.amount.toNumber() > 0))

        // Set the first record as selected if available
        if (records.length > 0 && records[0].amount.toNumber() > 0) {
          setSelectedStakeRecord(records[0])
        }
      } catch (err) {
        console.error("Error fetching stake records:", err)
      }
    } catch (err) {
      console.error("Error fetching staking data:", err)
      setError("Failed to fetch staking data. Please try again later.")
    } finally {
      setFetchingData(false)
    }
  }

  const handleStake = async (e) => {
    e.preventDefault()
    if (!wallet.publicKey || !wallet.signTransaction || !stakingData) return

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const program = getStakingProgram(connection, wallet)
      const [stakingAccount] = await PublicKey.findProgramAddress([Buffer.from("staking_account")], program.programId)

      // Get token accounts
      const tokenMint = stakingData.tokenMint

      // Find the user's token account for this mint
      const userTokenAccount = await getAssociatedTokenAddress(tokenMint, wallet.publicKey)

      // Find the admin's staking wallet
      const adminTokenAccount = await getAssociatedTokenAddress(tokenMint, stakingData.admin)

      // Create a new stake record account
      const stakeRecord = anchor.web3.Keypair.generate()

      // Convert amount to lamports
      const amountLamports = new anchor.BN(Number.parseFloat(stakeAmount) * LAMPORTS_PER_SOL)

      // Find staker info PDA
      const [stakerInfoAccount] = await PublicKey.findProgramAddress(
        [Buffer.from("staker_info"), stakingAccount.toBuffer(), wallet.publicKey.toBuffer()],
        program.programId,
      )

      console.log("Staking with accounts:", {
        stakingAccount: stakingAccount.toString(),
        stakeRecord: stakeRecord.publicKey.toString(),
        stakerInfo: stakerInfoAccount.toString(),
        stakerTokenAccount: userTokenAccount.toString(),
        adminStakingWallet: adminTokenAccount.toString(),
        staker: wallet.publicKey.toString(),
      })

      // Call the stakeTokens instruction
      const tx = await program.methods
        .stakeTokens(amountLamports, couponCode ? couponCode : null)
        .accounts({
          stakingAccount,
          stakeRecord: stakeRecord.publicKey,
          stakerInfo: stakerInfoAccount,
          stakerTokenAccount: userTokenAccount,
          adminStakingWallet: adminTokenAccount,
          staker: wallet.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([stakeRecord])
        .rpc()

      setSuccess(`Tokens staked successfully! Transaction ID: ${tx}`)
      setStakeAmount("")
      setCouponCode("")
      await fetchStakingData() // Refresh staking data
    } catch (err) {
      console.error("Error staking tokens:", err)
      setError(`Staking failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleUnstake = async (e) => {
    e.preventDefault()
    if (!wallet.publicKey || !wallet.signTransaction || !selectedStakeRecord) return

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const program = getStakingProgram(connection, wallet)
      const [stakingAccount] = await PublicKey.findProgramAddress([Buffer.from("staking_account")], program.programId)

      // Get token accounts
      const tokenMint = stakingData.tokenMint

      // Find the user's token account for this mint
      const userTokenAccount = await getAssociatedTokenAddress(tokenMint, wallet.publicKey)

      // Find the admin's staking wallet
      const adminTokenAccount = await getAssociatedTokenAddress(tokenMint, stakingData.admin)

      // Find staker info PDA
      const [stakerInfoAccount] = await PublicKey.findProgramAddress(
        [Buffer.from("staker_info"), stakingAccount.toBuffer(), wallet.publicKey.toBuffer()],
        program.programId,
      )

      // Convert amount to lamports
      const amountLamports = new anchor.BN(Number.parseFloat(unstakeAmount) * LAMPORTS_PER_SOL)

      console.log("Unstaking with accounts:", {
        stakingAccount: stakingAccount.toString(),
        stakeRecord: selectedStakeRecord.pubkey.toString(),
        stakerInfo: stakerInfoAccount.toString(),
        stakerTokenAccount: userTokenAccount.toString(),
        adminStakingWallet: adminTokenAccount.toString(),
        tokenMint: tokenMint.toString(),
        staker: wallet.publicKey.toString(),
        owner: stakingData.admin.toString(),
      })

      // Call the unstakeCombined instruction
      const tx = await program.methods
        .unstakeCombined(amountLamports)
        .accounts({
          stakingAccount,
          stakeRecord: selectedStakeRecord.pubkey,
          stakerInfo: stakerInfoAccount,
          stakerTokenAccount: userTokenAccount,
          adminStakingWallet: adminTokenAccount,
          tokenMint,
          staker: wallet.publicKey,
          owner: stakingData.admin, // This is the admin who can sign for token transfers
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc()

      setSuccess(`Tokens unstaked successfully! Transaction ID: ${tx}`)
      setUnstakeAmount("")
      await fetchStakingData() // Refresh staking data
    } catch (err) {
      console.error("Error unstaking tokens:", err)
      setError(`Unstaking failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const calculateRewardRate = () => {
    if (!stakingData) return "0%"

    if (stakerInfo && stakerInfo.totalStaked.toNumber() >= 1000 * LAMPORTS_PER_SOL) {
      return `${stakingData.highTierFee}%`
    } else if (stakerInfo && stakerInfo.totalStaked.toNumber() >= 500 * LAMPORTS_PER_SOL) {
      return `${stakingData.midTierFee}%`
    } else {
      return `${stakingData.lowTierFee}%`
    }
  }

  const calculateLockupPeriod = (tier) => {
    switch (tier) {
      case 3:
        return "180 days"
      case 2:
        return "90 days"
      case 1:
        return "30 days"
      default:
        return "No lockup"
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A"
    return new Date(timestamp * 1000).toLocaleDateString()
  }

  const getTimeRemaining = (endTimestamp) => {
    if (!endTimestamp) return "N/A"

    const now = Math.floor(Date.now() / 1000)
    const remaining = endTimestamp - now

    if (remaining <= 0) return "Unlocked"

    const days = Math.floor(remaining / 86400)
    const hours = Math.floor((remaining % 86400) / 3600)

    return `${days}d ${hours}h`
  }

  if (fetchingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading staking data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Staking Dashboard</CardTitle>
          <CardDescription>Stake your tokens to earn rewards</CardDescription>
        </CardHeader>
        <CardContent>
          {stakerInfo ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-muted/50 border-none">
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <Coins className="h-8 w-8 text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">Total Staked</p>
                  <p className="text-2xl font-bold">{formatSol(stakerInfo.totalStaked)} SOL</p>
                </CardContent>
              </Card>
              <Card className="bg-muted/50 border-none">
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <Award className="h-8 w-8 text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">Reward Rate</p>
                  <p className="text-2xl font-bold">{calculateRewardRate()}</p>
                </CardContent>
              </Card>
              <Card className="bg-muted/50 border-none">
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <Clock className="h-8 w-8 text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">Spin Count</p>
                  <p className="text-2xl font-bold">{stakerInfo.spinCount}</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="bg-muted/50 p-4 rounded-lg mb-6 text-center">
              <p className="text-muted-foreground">You haven't staked any tokens yet. Start staking to earn rewards!</p>
            </div>
          )}

          <Tabs defaultValue="stake" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="stake">Stake</TabsTrigger>
              <TabsTrigger value="unstake" disabled={stakeRecords.length === 0}>
                Unstake
              </TabsTrigger>
            </TabsList>
            <TabsContent value="stake">
              <form onSubmit={handleStake} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="stakeAmount">Amount to Stake (SOL):</Label>
                  <Input
                    type="number"
                    id="stakeAmount"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    required
                    min="0"
                    step="0.000000001"
                    placeholder="Enter amount to stake"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="couponCode">Coupon Code (Optional):</Label>
                  <Input
                    type="text"
                    id="couponCode"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code if you have one"
                  />
                </div>
                <Button type="submit" disabled={loading || !wallet.publicKey || !stakingData} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Stake Tokens"
                  )}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="unstake">
              {stakeRecords.length > 0 ? (
                <form onSubmit={handleUnstake} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="stakeRecord">Select Stake Record:</Label>
                    <select
                      id="stakeRecord"
                      className="w-full p-2 border rounded-md"
                      value={selectedStakeRecord ? selectedStakeRecord.pubkey.toString() : ""}
                      onChange={(e) => {
                        const selected = stakeRecords.find((record) => record.pubkey.toString() === e.target.value)
                        setSelectedStakeRecord(selected)
                        setUnstakeAmount((selected.amount.toNumber() / LAMPORTS_PER_SOL).toString())
                      }}
                    >
                      {stakeRecords.map((record, index) => (
                        <option key={index} value={record.pubkey.toString()}>
                          {formatSol(record.amount)} SOL - Staked on {formatDate(record.stakeTimestamp)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedStakeRecord && (
                    <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-medium">{formatSol(selectedStakeRecord.amount)} SOL</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Staked On:</span>
                        <span className="font-medium">{formatDate(selectedStakeRecord.stakeTimestamp)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Unlock Date:</span>
                        <span className="font-medium">{formatDate(selectedStakeRecord.endTimestamp)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Time Remaining:</span>
                        <span className="font-medium">{getTimeRemaining(selectedStakeRecord.endTimestamp)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tier:</span>
                        <span className="font-medium">Tier {selectedStakeRecord.tier}</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="unstakeAmount">Amount to Unstake (SOL):</Label>
                    <Input
                      type="number"
                      id="unstakeAmount"
                      value={unstakeAmount}
                      onChange={(e) => setUnstakeAmount(e.target.value)}
                      required
                      min="0"
                      max={selectedStakeRecord ? selectedStakeRecord.amount.toNumber() / LAMPORTS_PER_SOL : 0}
                      step="0.000000001"
                      placeholder="Enter amount to unstake"
                    />
                  </div>

                  {selectedStakeRecord && selectedStakeRecord.endTimestamp > Math.floor(Date.now() / 1000) && (
                    <Alert className="bg-amber-50 text-amber-800 border-amber-200">
                      <AlertDescription>
                        Early unstaking will incur a penalty on your rewards. The exact penalty depends on your tier.
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" disabled={loading || !selectedStakeRecord} className="w-full">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Unstake Tokens"
                    )}
                  </Button>
                </form>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">You don't have any staked tokens to unstake.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>

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

      {stakeRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Stake Records</CardTitle>
            <CardDescription>View your active stake records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stakeRecords.map((record, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Amount Staked</p>
                      <p className="font-medium">{formatSol(record.amount)} SOL</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tier</p>
                      <p className="font-medium">Tier {record.tier}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Staked On</p>
                      <p className="font-medium">{formatDate(record.stakeTimestamp)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Lockup Period</p>
                      <p className="font-medium">{calculateLockupPeriod(record.tier)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Unlock Date</p>
                      <p className="font-medium">{formatDate(record.endTimestamp)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Time Remaining</p>
                      <p className="font-medium">{getTimeRemaining(record.endTimestamp)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Staking

