"use client"

import { useState, useEffect } from "react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { PublicKey } from "@solana/web3.js"
import { getStakingProgram } from "../utils/anchor-connection"
import * as anchor from "@project-serum/anchor"
import { TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { formatSol } from "../utils/formatters"
import { Label } from "../components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { Alert, AlertDescription } from "../components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Loader2 } from "lucide-react"

const Staking = () => {
  const { connection } = useConnection()
  const wallet = useWallet()
  const [stakeAmount, setStakeAmount] = useState("")
  const [unstakeAmount, setUnstakeAmount] = useState("")
  const [couponCode, setCouponCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [stakingData, setStakingData] = useState(null)
  const [stakerInfo, setStakerInfo] = useState(null)
  const [stakeRecords, setStakeRecords] = useState([])
  const [activeTab, setActiveTab] = useState("stake")

  useEffect(() => {
    if (wallet.publicKey) {
      fetchStakingData()
    }
  }, [connection, wallet.publicKey])

  const fetchStakingData = async () => {
    if (!wallet.publicKey) return

    try {
      setLoading(true)
      const program = getStakingProgram(connection, wallet)

      // Fetch staking account
      const [stakingAccount] = await PublicKey.findProgramAddress([Buffer.from("staking_account")], program.programId)
      const stakingData = await program.account.stakingAccount.fetch(stakingAccount)
      setStakingData(stakingData)

      // Fetch staker info
      try {
        const [stakerInfoAccount] = await PublicKey.findProgramAddress(
          [Buffer.from("staker_info"), stakingAccount.toBuffer(), wallet.publicKey.toBuffer()],
          program.programId,
        )
        const stakerInfo = await program.account.stakerInfo.fetch(stakerInfoAccount)
        setStakerInfo(stakerInfo)
      } catch (err) {
        console.log("No staker info found, user has not staked yet")
      }

      // Fetch stake records
      const stakeAccountsFilters = [
        { dataSize: program.account.stakeRecord.size },
        { memcmp: { offset: 8, bytes: wallet.publicKey.toBase58() } }, // owner field
      ]

      const stakeAccounts = await connection.getProgramAccounts(program.programId, {
        filters: stakeAccountsFilters,
      })

      const records = await Promise.all(
        stakeAccounts.map(async (account) => {
          const stakeRecord = await program.account.stakeRecord.fetch(account.pubkey)
          return {
            pubkey: account.pubkey,
            ...stakeRecord,
          }
        }),
      )

      setStakeRecords(records)
      setLoading(false)
    } catch (err) {
      console.error("Error fetching staking data:", err)
      setError("Failed to fetch staking data. Please try again later.")
      setLoading(false)
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
      const userTokenAccounts = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, { mint: tokenMint })

      if (userTokenAccounts.value.length === 0) {
        throw new Error("No token account found for this mint. Please make sure you have the token.")
      }

      const userTokenAccount = userTokenAccounts.value[0].pubkey

      // Find the admin's staking wallet
      const adminTokenAccounts = await connection.getParsedTokenAccountsByOwner(stakingData.admin, { mint: tokenMint })

      if (adminTokenAccounts.value.length === 0) {
        throw new Error("Admin staking wallet not found.")
      }

      const adminStakingWallet = adminTokenAccounts.value[0].pubkey

      // Create a new stake record account
      const stakeRecord = anchor.web3.Keypair.generate()

      // Convert amount to lamports
      const amountLamports = new anchor.BN(Number.parseFloat(stakeAmount) * anchor.web3.LAMPORTS_PER_SOL)

      // Find staker info PDA
      const [stakerInfoAccount] = await PublicKey.findProgramAddress(
        [Buffer.from("staker_info"), stakingAccount.toBuffer(), wallet.publicKey.toBuffer()],
        program.programId,
      )

      // Call the stakeTokens instruction
      const tx = await program.methods
        .stakeTokens(amountLamports, couponCode ? couponCode : null)
        .accounts({
          stakingAccount,
          stakeRecord: stakeRecord.publicKey,
          stakerInfo: stakerInfoAccount,
          stakerTokenAccount: userTokenAccount,
          adminStakingWallet,
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
    if (!wallet.publicKey || !wallet.signTransaction || stakeRecords.length === 0) return

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const program = getStakingProgram(connection, wallet)
      const [stakingAccount] = await PublicKey.findProgramAddress([Buffer.from("staking_account")], program.programId)

      // Get the selected stake record
      const stakeRecord = stakeRecords[0] // For simplicity, using the first record

      // Get token accounts
      const tokenMint = stakingData.tokenMint

      // Find the user's token account for this mint
      const userTokenAccounts = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, { mint: tokenMint })

      if (userTokenAccounts.value.length === 0) {
        throw new Error("No token account found for this mint.")
      }

      const userTokenAccount = userTokenAccounts.value[0].pubkey

      // Find the admin's staking wallet
      const adminTokenAccounts = await connection.getParsedTokenAccountsByOwner(stakingData.admin, { mint: tokenMint })

      if (adminTokenAccounts.value.length === 0) {
        throw new Error("Admin staking wallet not found.")
      }

      const adminStakingWallet = adminTokenAccounts.value[0].pubkey

      // Find staker info PDA
      const [stakerInfoAccount] = await PublicKey.findProgramAddress(
        [Buffer.from("staker_info"), stakingAccount.toBuffer(), wallet.publicKey.toBuffer()],
        program.programId,
      )

      // Convert amount to lamports
      const amountLamports = new anchor.BN(Number.parseFloat(unstakeAmount) * anchor.web3.LAMPORTS_PER_SOL)

      // Call the unstakeCombined instruction
      const tx = await program.methods
        .unstakeCombined(amountLamports)
        .accounts({
          stakingAccount,
          stakeRecord: stakeRecord.pubkey,
          stakerInfo: stakerInfoAccount,
          stakerTokenAccount: userTokenAccount,
          adminStakingWallet,
          tokenMint: stakingData.tokenMint,
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

    if (stakerInfo && stakerInfo.totalStaked.toNumber() >= 1000) {
      return `${stakingData.highTierFee}%`
    } else if (stakerInfo && stakerInfo.totalStaked.toNumber() >= 500) {
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Staking Dashboard</CardTitle>
          <CardDescription>Stake your tokens to earn rewards</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && !stakingData ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <>
              {stakerInfo && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Total Staked</p>
                    <p className="text-2xl font-bold">{formatSol(stakerInfo.totalStaked)} SOL</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Reward Rate</p>
                    <p className="text-2xl font-bold">{calculateRewardRate()}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Spin Count</p>
                    <p className="text-2xl font-bold">{stakerInfo.spinCount}</p>
                  </div>
                </div>
              )}

              <Tabs defaultValue="stake" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="stake">Stake</TabsTrigger>
                  <TabsTrigger value="unstake">Unstake</TabsTrigger>
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
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="couponCode">Coupon Code (Optional):</Label>
                      <Input
                        type="text"
                        id="couponCode"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                      />
                    </div>
                    <Button type="submit" disabled={loading || !wallet.publicKey} className="w-full">
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
                        <Label htmlFor="unstakeAmount">Amount to Unstake (SOL):</Label>
                        <Input
                          type="number"
                          id="unstakeAmount"
                          value={unstakeAmount}
                          onChange={(e) => setUnstakeAmount(e.target.value)}
                          required
                          min="0"
                          max={stakeRecords[0].amount.toNumber() / anchor.web3.LAMPORTS_PER_SOL}
                          step="0.000000001"
                        />
                      </div>
                      <Button type="submit" disabled={loading || !wallet.publicKey} className="w-full">
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
                      <p className="text-gray-500">You don't have any staked tokens to unstake.</p>
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
            </>
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
                <div key={index} className="border rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Amount Staked</p>
                      <p className="font-medium">{formatSol(record.amount)} SOL</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Tier</p>
                      <p className="font-medium">Tier {record.tier}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Staked On</p>
                      <p className="font-medium">{new Date(record.stakeTimestamp * 1000).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Lockup Period</p>
                      <p className="font-medium">{calculateLockupPeriod(record.tier)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Unlock Date</p>
                      <p className="font-medium">{new Date(record.endTimestamp * 1000).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Spin Count</p>
                      <p className="font-medium">{record.spinCount}</p>
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

