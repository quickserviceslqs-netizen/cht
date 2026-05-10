'use client';

import { useEffect, useState } from 'react';

interface SettingsData {
  companies: any[];
  regions: any[];
  branches: any[];
  departments: any[];
  approvalThresholds: any[];
  treasuryFunds: any[];
  auditLogCount: number;
}

type Tab = 'overview' | 'organization' | 'thresholds' | 'treasury' | 'logs';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings');
      if (!response.ok) throw new Error('Failed to fetch settings');
      const result = await response.json();
      setSettings(result.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: any) => {
    const num = typeof value === 'object' ? value.toNumber?.() : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'KES',
    }).format(num || 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">System Settings & Configuration</h1>
          <p className="text-gray-600 mt-2">Manage all system configurations, thresholds, and organization structure</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-8 mt-8">
        <div className="flex space-x-4 border-b">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'organization', label: 'Organization Structure' },
            { id: 'thresholds', label: 'Approval Thresholds' },
            { id: 'treasury', label: 'Treasury Funds' },
            { id: 'logs', label: 'Audit Logs' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`px-4 py-3 font-medium text-sm border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="max-w-7xl mx-auto px-8 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="max-w-7xl mx-auto px-8 mt-8 text-center py-12">
          <p className="text-gray-600">Loading settings...</p>
        </div>
      ) : settings ? (
        <div className="max-w-7xl mx-auto px-8 py-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-gray-600 text-sm font-medium">Total Companies</div>
                <div className="text-3xl font-bold text-gray-900 mt-2">{settings.companies.length}</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-gray-600 text-sm font-medium">Total Regions</div>
                <div className="text-3xl font-bold text-gray-900 mt-2">{settings.regions.length}</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-gray-600 text-sm font-medium">Total Branches</div>
                <div className="text-3xl font-bold text-gray-900 mt-2">{settings.branches.length}</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-gray-600 text-sm font-medium">Audit Logs</div>
                <div className="text-3xl font-bold text-gray-900 mt-2">{settings.auditLogCount}</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-gray-600 text-sm font-medium">Departments</div>
                <div className="text-3xl font-bold text-gray-900 mt-2">{settings.departments.length}</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-gray-600 text-sm font-medium">Approval Thresholds</div>
                <div className="text-3xl font-bold text-gray-900 mt-2">{settings.approvalThresholds.length}</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-gray-600 text-sm font-medium">Treasury Funds</div>
                <div className="text-3xl font-bold text-gray-900 mt-2">{settings.treasuryFunds.length}</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-gray-600 text-sm font-medium">Total Fund Balance</div>
                <div className="text-2xl font-bold text-green-600 mt-2">
                  {formatCurrency(
                    settings.treasuryFunds.reduce((sum: number, fund: any) => {
                      const balance = typeof fund.currentBalance === 'object' 
                        ? fund.currentBalance.toNumber?.() || 0 
                        : fund.currentBalance || 0;
                      return sum + balance;
                    }, 0)
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Organization Structure Tab */}
          {activeTab === 'organization' && (
            <div className="space-y-8">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b font-semibold">Companies</div>
                <table className="w-full">
                  <tbody>
                    {settings.companies.map((company) => (
                      <tr key={company.id} className="border-t hover:bg-gray-50">
                        <td className="px-6 py-3">{company.name}</td>
                        <td className="px-6 py-3 text-gray-600">{company.code}</td>
                        <td className="px-6 py-3 text-gray-500 text-sm">{new Date(company.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b font-semibold">Regions</div>
                <table className="w-full">
                  <tbody>
                    {settings.regions.map((region) => (
                      <tr key={region.id} className="border-t hover:bg-gray-50">
                        <td className="px-6 py-3">{region.name}</td>
                        <td className="px-6 py-3 text-gray-600">{region.code}</td>
                        <td className="px-6 py-3 text-gray-600 text-sm">{region.company.name}</td>
                        <td className="px-6 py-3 text-gray-500 text-sm">{new Date(region.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b font-semibold">Branches</div>
                <table className="w-full">
                  <tbody>
                    {settings.branches.map((branch) => (
                      <tr key={branch.id} className="border-t hover:bg-gray-50">
                        <td className="px-6 py-3">{branch.name}</td>
                        <td className="px-6 py-3 text-gray-600">{branch.code}</td>
                        <td className="px-6 py-3 text-gray-600 text-sm">{branch.company.name}</td>
                        <td className="px-6 py-3 text-gray-500 text-sm">{new Date(branch.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b font-semibold">Departments</div>
                <table className="w-full">
                  <tbody>
                    {settings.departments.map((dept) => (
                      <tr key={dept.id} className="border-t hover:bg-gray-50">
                        <td className="px-6 py-3">{dept.name}</td>
                        <td className="px-6 py-3 text-gray-600">{dept.code}</td>
                        <td className="px-6 py-3 text-gray-600 text-sm">{dept.company.name}</td>
                        <td className="px-6 py-3 text-gray-500 text-sm">{new Date(dept.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Approval Thresholds Tab */}
          {activeTab === 'thresholds' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b font-semibold">Approval Thresholds (Workflow Configuration)</div>
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Range</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Roles</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {settings.approvalThresholds.map((threshold) => (
                    <tr key={threshold.id} className="border-t hover:bg-gray-50">
                      <td className="px-6 py-3 font-medium">{threshold.name}</td>
                      <td className="px-6 py-3 text-sm">
                        {formatCurrency(threshold.minAmount)} - {formatCurrency(threshold.maxAmount)}
                      </td>
                      <td className="px-6 py-3 text-sm">
                        {Array.isArray(threshold.rolesSequence)
                          ? threshold.rolesSequence.join(' → ')
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            threshold.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {threshold.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-3">{threshold.priority}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Treasury Funds Tab */}
          {activeTab === 'treasury' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b font-semibold">Treasury Funds</div>
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-6 py-3 text-left text-sm font-semibold">Company</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Current Balance</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {settings.treasuryFunds.map((fund) => (
                    <tr key={fund.id} className="border-t hover:bg-gray-50">
                      <td className="px-6 py-3">{fund.company.name}</td>
                      <td className="px-6 py-3 font-semibold text-green-600">
                        {formatCurrency(fund.currentBalance)}
                      </td>
                      <td className="px-6 py-3 text-gray-600 text-sm">{new Date(fund.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Audit Logs Tab */}
          {activeTab === 'logs' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Audit Logs ({settings.auditLogCount} total)</h2>
              <p className="text-gray-600">
                Full audit trail available via <code className="bg-gray-100 px-2 py-1 rounded">/api/approvals?limit=100</code> endpoint.
                Each log includes user, action, timestamp, and IP address.
              </p>
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Logged Events:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✓ Requisition creation and changes</li>
                  <li>✓ Approval/rejection actions</li>
                  <li>✓ Change requests</li>
                  <li>✓ Payment executions</li>
                  <li>✓ User login attempts</li>
                  <li>✓ Role and permission changes</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
