"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import { fetchUserExpenses } from "@/lib/firebaseUtils";
import NavBar from "@/components/navBar";
import Footer from "@/components/footer";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export default function AnalyticsPage() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userReceipts = await fetchUserExpenses(currentUser.uid);
          setReceipts(userReceipts);
        } catch (error) {
          console.error("Error fetching receipts:", error);
        }
      } else {
        router.push("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // Process receipt data for analytics
  const processReceiptData = () => {
    if (!receipts || receipts.length === 0) {
      return {
        totalSpent: 0,
        totalReceipts: 0,
        avgReceiptAmount: 0,
        monthlySpending: {},
        categorySpending: {},
        groupMemberStats: {},
      };
    }

    let totalSpent = 0;
    const monthlySpending: Record<string, number> = {};
    const categorySpending: Record<string, number> = {};
    const groupMemberStats: Record<string, { count: number; totalSpent: number }> = {};

    receipts.forEach((receipt) => {
      const amount = receipt.total || 0;
      totalSpent += amount;

      // Monthly spending
      const date = receipt.timestamp?.toDate?.() || new Date();
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlySpending[monthKey] = (monthlySpending[monthKey] || 0) + amount;

      // Category spending (you can enhance this with actual categories)
      const category = receipt.category || 'Dining';
      categorySpending[category] = (categorySpending[category] || 0) + amount;

      // Group member stats
      if (receipt.splitDetails) {
        receipt.splitDetails.forEach((split: any) => {
          const memberName = split.name;
          if (!groupMemberStats[memberName]) {
            groupMemberStats[memberName] = { count: 0, totalSpent: 0 };
          }
          groupMemberStats[memberName].count += 1;
          groupMemberStats[memberName].totalSpent += split.amount || 0;
        });
      }
    });

    return {
      totalSpent,
      totalReceipts: receipts.length,
      avgReceiptAmount: totalSpent / receipts.length,
      monthlySpending,
      categorySpending,
      groupMemberStats,
    };
  };

  const stats = processReceiptData();

  // Use the same color scheme as the rest of the app
  const colors = [
    "#f3e79b", "#fac484", "#f8a07e", "#eb7f86", "#ce6693",
    "#a059a0", "#5c53a5", "#4b8bbd", "#3c97b8", "#2d879f", "#1b658e"
  ];

  // Chart data with consistent color scheme
  const monthlyChartData = {
    labels: Object.keys(stats.monthlySpending),
    datasets: [
      {
        label: 'Monthly Spending',
        data: Object.values(stats.monthlySpending),
        backgroundColor: colors[0],
        borderColor: colors[1],
        borderWidth: 2,
      },
    ],
  };

  const categoryChartData = {
    labels: Object.keys(stats.categorySpending),
    datasets: [
      {
        data: Object.values(stats.categorySpending),
        backgroundColor: colors.slice(0, Object.keys(stats.categorySpending).length),
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const groupMemberChartData = {
    labels: Object.keys(stats.groupMemberStats),
    datasets: [
      {
        label: 'Total Spent',
        data: Object.values(stats.groupMemberStats).map(stat => stat.totalSpent),
        backgroundColor: colors.slice(0, Object.keys(stats.groupMemberStats).length),
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#ffffff',
          font: {
            family: 'system-ui, -apple-system, sans-serif',
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#ffffff',
          font: {
            family: 'system-ui, -apple-system, sans-serif',
          },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      y: {
        ticks: {
          color: '#ffffff',
          font: {
            family: 'system-ui, -apple-system, sans-serif',
          },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#ffffff',
          padding: 20,
          font: {
            family: 'system-ui, -apple-system, sans-serif',
          },
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <NavBar />
      
      <main className="container mx-auto px-4 pt-24 pb-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-white/80 text-lg">Insights into your spending and splitting patterns</p>
        </div>

        {receipts.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 shadow-lg text-center">
            <h2 className="text-2xl font-bold text-white mb-4">No Data Available</h2>
            <p className="text-white/80">Upload some receipts to see your analytics!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-lg">
                <h3 className="text-white/80 text-sm font-medium">Total Spent</h3>
                <p className="text-3xl font-bold text-white">${stats.totalSpent.toFixed(2)}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-lg">
                <h3 className="text-white/80 text-sm font-medium">Total Receipts</h3>
                <p className="text-3xl font-bold text-white">{stats.totalReceipts}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-lg">
                <h3 className="text-white/80 text-sm font-medium">Avg Receipt Amount</h3>
                <p className="text-3xl font-bold text-white">${stats.avgReceiptAmount.toFixed(2)}</p>
              </div>
            </div>

            {/* Monthly Spending Data */}
                        {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Monthly Spending Chart */}
              {Object.keys(stats.monthlySpending).length > 0 && (
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-lg">
                  <h3 className="text-xl font-bold text-white mb-4">Monthly Spending</h3>
                  <div className="h-64">
                    <Bar data={monthlyChartData} options={chartOptions} />
                  </div>
                </div>
              )}

              {/* Category Spending Chart */}
              {Object.keys(stats.categorySpending).length > 0 && (
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-lg">
                  <h3 className="text-xl font-bold text-white mb-4">Spending by Category</h3>
                  <div className="h-64">
                    <Pie data={categoryChartData} options={pieOptions} />
                  </div>
                </div>
              )}

              {/* Group Member Spending */}
              {Object.keys(stats.groupMemberStats).length > 0 && (
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-lg lg:col-span-2">
                  <h3 className="text-xl font-bold text-white mb-4">Group Member Spending</h3>
                  <div className="h-64">
                    <Bar data={groupMemberChartData} options={chartOptions} />
                  </div>
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-4">Recent Receipts</h3>
              <div className="space-y-3">
                {receipts.slice(0, 5).map((receipt, index) => (
                  <div key={index} className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors duration-200">
                    <div>
                      <p className="text-white font-medium">Receipt #{index + 1}</p>
                      <p className="text-white/60 text-sm">
                        {receipt.timestamp?.toDate?.()?.toLocaleDateString() || 'Unknown date'}
                      </p>
                    </div>
                    <p className="text-white font-semibold text-lg">${receipt.total?.toFixed(2) || '0.00'}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Spending Data */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-4">Spending by Category</h3>
              <div className="space-y-2">
                {Object.entries(stats.categorySpending).map(([category, amount]) => (
                  <div key={category} className="flex justify-between items-center p-2 bg-white/5 rounded">
                    <span className="text-white">{category}</span>
                    <span className="text-white font-semibold">${amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Group Member Stats */}
            {Object.keys(stats.groupMemberStats).length > 0 && (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-lg">
                <h3 className="text-xl font-bold text-white mb-4">Group Member Spending</h3>
                <div className="space-y-2">
                  {Object.entries(stats.groupMemberStats).map(([member, stat]) => (
                    <div key={member} className="flex justify-between items-center p-2 bg-white/5 rounded">
                      <span className="text-white">{member}</span>
                      <div className="text-right">
                        <span className="text-white font-semibold">${stat.totalSpent.toFixed(2)}</span>
                        <span className="text-white/60 text-sm ml-2">({stat.count} receipts)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-4">Recent Receipts</h3>
              <div className="space-y-3">
                {receipts.slice(0, 5).map((receipt, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Receipt #{index + 1}</p>
                      <p className="text-white/60 text-sm">
                        {receipt.timestamp?.toDate?.()?.toLocaleDateString() || 'Unknown date'}
                      </p>
                    </div>
                    <p className="text-white font-semibold">${receipt.total?.toFixed(2) || '0.00'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
