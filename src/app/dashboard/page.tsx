'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    pendingRequisitions: 3,
    approvals: 2,
    treasuryFunds: 500000,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🚀</span>
            <h1 className="text-3xl font-bold text-gray-900">CHT Dashboard</h1>
          </div>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Pending Requisitions"
            value={stats.pendingRequisitions}
            icon="📋"
            color="bg-blue-50"
          />
          <StatCard
            title="Awaiting Approval"
            value={stats.approvals}
            icon="⏳"
            color="bg-yellow-50"
          />
          <StatCard
            title="Available Funds (KES)"
            value={`${stats.treasuryFunds.toLocaleString()}`}
            icon="💰"
            color="bg-green-50"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <ActionButton
              href="/dashboard/requisitions/new"
              icon="➕"
              label="New Requisition"
            />
            <ActionButton
              href="/dashboard/requisitions"
              icon="📊"
              label="View Requisitions"
            />
            <ActionButton
              href="/dashboard/approvals"
              icon="✅"
              label="Approvals"
            />
            <ActionButton
              href="/dashboard/treasury"
              icon="🏦"
              label="Treasury"
            />
          </div>
        </div>

        {/* Recent Requisitions */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Requisitions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Reference
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">REQ-001</td>
                  <td className="px-6 py-4 text-sm text-gray-900">KES 5,000</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date().toLocaleDateString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}) {
  return (
    <div className={`${color} rounded-lg p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );
}

function ActionButton({
  href,
  icon,
  label,
}: {
  href: string;
  icon: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
      <div className="text-3xl mb-2">{icon}</div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </Link>
  );
}
