import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getProgram } from '../utils/anchor-connection';
import { formatSol } from '../utils/formatters';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/cardTitle";
import { Skeleton } from "../components/ui/skeleton";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const IcoAnalytics = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    if (wallet.publicKey) {
      fetchAnalyticsData();
    }
  }, [connection, wallet.publicKey]);

  const fetchAnalyticsData = async () => {
    try {
      const program = getProgram(connection, wallet);
      const [icoAccount] = await PublicKey.findProgramAddress(
        [Buffer.from('ico')],
        program.programId
      );
      const icoData = await program.account.icoAccount.fetch(icoAccount);

      // Get all purchase accounts
      const purchaseAccounts = await connection.getProgramAccounts(program.programId, {
        filters: [
          { dataSize: program.account.purchaseAccount.size },
          { memcmp: { offset: 8, bytes: icoAccount.toBase58() } },
        ],
      });

      const purchases = await Promise.all(
        purchaseAccounts.map(async (account) => {
          const purchaseData = await program.account.purchaseAccount.fetch(account.pubkey);
          return {
            amount: purchaseData.amount.toNumber() / 1e9,
            timestamp: purchaseData.timestamp.toNumber() * 1000,
            buyer: purchaseData.buyer.toString(),
          };
        })
      );

      // Sort purchases by timestamp
      purchases.sort((a, b) => a.timestamp - b.timestamp);

      // Calculate cumulative amounts
      let cumulative = 0;
      const timeSeriesData = purchases.map(p => {
        cumulative += p.amount;
        return {
          timestamp: new Date(p.timestamp).toLocaleDateString(),
          amount: p.amount,
          cumulative
        };
      });

      // Calculate distribution data
      const uniqueBuyers = [...new Set(purchases.map(p => p.buyer))];
      const distributionData = uniqueBuyers.map(buyer => {
        const totalAmount = purchases
          .filter(p => p.buyer === buyer)
          .reduce((sum, p) => sum + p.amount, 0);
        return {
          buyer: buyer.slice(0, 4) + '...' + buyer.slice(-4),
          amount: totalAmount
        };
      });

      setAnalyticsData({
        totalSupply: icoData.totalSupply.toNumber() / 1e9,
        tokensSold: icoData.tokensSold.toNumber() / 1e9,
        timeSeriesData,
        distributionData,
        roundType: Object.keys(icoData.roundType)[0],
      });
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[400px] w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Token Sales Over Time</CardTitle>
            <CardDescription>Cumulative token sales progression</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData.timeSeriesData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0088FE" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  stroke="#0088FE"
                  fillOpacity={1}
                  fill="url(#colorAmount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Token Distribution</CardTitle>
              <CardDescription>Distribution among investors</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.distributionData}
                    dataKey="amount"
                    nameKey="buyer"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {analyticsData.distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Sales Summary</CardTitle>
              <CardDescription>Current ICO round: {analyticsData.roundType}</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    {
                      name: 'Token Supply',
                      total: analyticsData.totalSupply,
                      sold: analyticsData.tokensSold,
                      remaining: analyticsData.totalSupply - analyticsData.tokensSold
                    }
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sold" stackId="a" fill="#0088FE" name="Sold" />
                  <Bar dataKey="remaining" stackId="a" fill="#00C49F" name="Remaining" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default IcoAnalytics;

