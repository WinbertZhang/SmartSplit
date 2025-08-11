"use client";

import React from "react";
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

interface AnalyticsDashboardProps {
  receipts: any[];
  user: any;
}

export default function AnalyticsDashboard({ receipts, user }: AnalyticsDashboardProps) {
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

  // Chart data
  const monthlyChartData = {
    labels: Object.keys(stats.monthlySpending),
    datasets: [
      {
        label: 'Monthly Spending',
        data: Object.values(stats.monthlySpending),
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const categoryChartData = {
    labels: Object.keys(stats.categorySpending),
    datasets: [
      {
        data: Object.values(stats.categorySpending),
        backgroundColor: [
          '#f3e79b',
          '#fac484',
          '#f8a07e',
          '#eb7f86',
          '#ce6693',
          '#a059a0',
          '#5c53a5',
        ],
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
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: '#ffffff',
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#ffffff',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      y: {
        ticks: {
          color: '#ffffff',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#ffffff',
          padding: 20,
        },
      },
    },
  };

  if (receipts.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 shadow-lg text-center">
        <h2 className="text-2xl font-bold text-white mb-4">No Data Available</h2>
        <p className="text-white/80">Upload some receipts to see your analytics!</p>
      </div>
    );
  }

  return (
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Spending Chart */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-lg">
          <h3 className="text-xl font-bold text-white mb-4">Monthly Spending</h3>
          <div className="h-64">
            <Bar data={monthlyChartData} options={chartOptions} />
          </div>
        </div>

        {/* Category Spending Chart */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-lg">
          <h3 className="text-xl font-bold text-white mb-4">Spending by Category</h3>
          <div className="h-64">
            <Pie data={categoryChartData} options={pieOptions} />
          </div>
        </div>

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
  );
}
