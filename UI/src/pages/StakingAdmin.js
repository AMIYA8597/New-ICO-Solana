"use client";

import { useState, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { getStakingProgram } from "../utils/anchor-connection";
import * as anchor from "@project-serum/anchor";
import { isAdminWallet } from "../utils/admin-check";
import AdminLayout from "../components/AdminLayout";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Loader2 } from "lucide-react";

const StakingAdmin = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [stakingData, setStakingData] = useState(null);
  const [activeTab, setActiveTab] = useState("update");

  // Update staking parameters form
  const [updateForm, setUpdateForm] = useState({
    lockupPeriod: "",
    lowTierFee: "",
    midTierFee: "",
    highTierFee: "",
  });

  // Create coupon form
  const [couponForm, setCreateCouponForm] = useState({
    code: "",
    bonusType: "Percentage",
    bonusValue: "",
    duration: "",
    minStakeAmount: "",
    maxUses: "",
    couponCategory: "NewUser",
  });

  useEffect(() => {
    if (wallet.publicKey && isAdminWallet(wallet.publicKey)) {
      fetchStakingData();
    }
  }, [connection, wallet.publicKey]);

  const fetchStakingData = async () => {
    if (!wallet.publicKey) return;

    try {
      setLoading(true);
      const program = getStakingProgram(connection, wallet);

      // Fetch staking account
      const [stakingAccount] = await PublicKey.findProgramAddress(
        [Buffer.from("staking_account")],
        program.programId
      );
      const data = await program.account.stakingAccount.fetch(stakingAccount);
      setStakingData(data);

      // Set form values
      setUpdateForm({
        lockupPeriod: data.lockupPeriod.toString(),
        lowTierFee: data.lowTierFee.toString(),
        midTierFee: data.midTierFee.toString(),
        highTierFee: data.highTierFee.toString(),
      });

      setLoading(false);
    } catch (err) {
      console.error("Error fetching staking data:", err);
      setError("Failed to fetch staking data. Please try again later.");
      setLoading(false);
    }
  };

  const handleUpdateStakingParams = async (e) => {
    e.preventDefault();
    if (!wallet.publicKey || !isAdminWallet(wallet.publicKey)) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const program = getStakingProgram(connection, wallet);
      const [stakingAccount] = await PublicKey.findProgramAddress(
        [Buffer.from("staking_account")],
        program.programId
      );

      // Convert form values
      const lockupPeriod = new anchor.BN(
        Number.parseInt(updateForm.lockupPeriod)
      );
      const lowTierFee = Number.parseFloat(updateForm.lowTierFee);
      const midTierFee = Number.parseFloat(updateForm.midTierFee);
      const highTierFee = Number.parseFloat(updateForm.highTierFee);

      // Call the update instruction
      const tx = await program.methods
        .update(lockupPeriod, lowTierFee, midTierFee, highTierFee)
        .accounts({
          stakingAccount,
          admin: wallet.publicKey,
        })
        .rpc();

      setSuccess(
        `Staking parameters updated successfully! Transaction ID: ${tx}`
      );
      await fetchStakingData(); // Refresh staking data
    } catch (err) {
      console.error("Error updating staking parameters:", err);
      setError(`Update failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!wallet.publicKey || !isAdminWallet(wallet.publicKey)) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const program = getStakingProgram(connection, wallet);
      const [stakingAccount] = await PublicKey.findProgramAddress(
        [Buffer.from("staking_account")],
        program.programId
      );

      // Convert form values
      const bonusType = { [couponForm.bonusType.toLowerCase()]: {} };
      const bonusValue = Number.parseFloat(couponForm.bonusValue);
      const duration = new anchor.BN(Number.parseInt(couponForm.duration));
      const minStakeAmount = new anchor.BN(
        Number.parseFloat(couponForm.minStakeAmount) *
          anchor.web3.LAMPORTS_PER_SOL
      );
      const maxUses = new anchor.BN(Number.parseInt(couponForm.maxUses));
      const couponCategory = { [couponForm.couponCategory]: {} };

      // Call the createCoupon instruction
      const tx = await program.methods
        .createCoupon(
          couponForm.code,
          bonusType,
          bonusValue,
          duration,
          minStakeAmount,
          maxUses,
          couponCategory
        )
        .accounts({
          stakingAccount,
          admin: wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      setSuccess(`Coupon created successfully! Transaction ID: ${tx}`);

      // Reset form
      setCreateCouponForm({
        code: "",
        bonusType: "Percentage",
        bonusValue: "",
        duration: "",
        minStakeAmount: "",
        maxUses: "",
        couponCategory: "NewUser",
      });

      await fetchStakingData(); // Refresh staking data
    } catch (err) {
      console.error("Error creating coupon:", err);
      setError(`Coupon creation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFormChange = (e) => {
    const { name, value } = e.target;
    setUpdateForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCouponFormChange = (e) => {
    const { name, value } = e.target;
    setCreateCouponForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setCreateCouponForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!wallet.publicKey || !isAdminWallet(wallet.publicKey)) {
    return (
      <AdminLayout>
        <Card>
          <CardHeader>
            <CardTitle>Staking Administration</CardTitle>
            <CardDescription>
              You do not have permission to access this page.
            </CardDescription>
          </CardHeader>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Card>
        <CardHeader>
          <CardTitle>Staking Administration</CardTitle>
          <CardDescription>
            Manage staking parameters and coupons
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && !stakingData ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <Tabs
              defaultValue="update"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="update">Update Parameters</TabsTrigger>
                <TabsTrigger value="coupons">Create Coupon</TabsTrigger>
              </TabsList>

              <TabsContent value="update">
                <form
                  onSubmit={handleUpdateStakingParams}
                  className="space-y-4 pt-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="lockupPeriod">
                      Lockup Period (seconds):
                    </Label>
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
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bonusType">Bonus Type:</Label>
                    <Select
                      value={couponForm.bonusType}
                      onValueChange={(value) =>
                        handleSelectChange("bonusType", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select bonus type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Percentage">Percentage</SelectItem>
                        <SelectItem value="FixedAmount">
                          Fixed Amount
                        </SelectItem>
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
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (seconds):</Label>
                    <Input
                      type="number"
                      id="duration"
                      name="duration"
                      value={couponForm.duration}
                      onChange={handleCouponFormChange}
                      required
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minStakeAmount">
                      Minimum Stake Amount (SOL):
                    </Label>
                    <Input
                      type="number"
                      id="minStakeAmount"
                      name="minStakeAmount"
                      value={couponForm.minStakeAmount}
                      onChange={handleCouponFormChange}
                      required
                      min="0"
                      step="0.000000001"
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
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="couponCategory">Coupon Category:</Label>
                    <Select
                      value={couponForm.couponCategory}
                      onValueChange={(value) =>
                        handleSelectChange("couponCategory", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NewUser">New User</SelectItem>
                        <SelectItem value="Referral">Referral</SelectItem>
                        <SelectItem value="LoyaltyReward">
                          Loyalty Reward
                        </SelectItem>
                        <SelectItem value="SeasonalPromo">
                          Seasonal Promo
                        </SelectItem>
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
  );
};

export default StakingAdmin;
