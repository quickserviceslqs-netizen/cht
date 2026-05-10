'use client';

import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">System administration and configuration management</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-3 gap-6 mb-12">
          {/* User Management */}
          <Link
            href="/admin/users"
            className="bg-white p-8 rounded-lg shadow hover:shadow-xl transition cursor-pointer border border-gray-200"
          >
            <div className="text-3xl mb-4">👥</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">User Management</h2>
            <p className="text-gray-600 mb-4">Create, update, and manage system users and their roles</p>
            <div className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-semibold">
              Manage →
            </div>
          </Link>

          {/* System Configuration */}
          <Link
            href="/admin/settings"
            className="bg-white p-8 rounded-lg shadow hover:shadow-xl transition cursor-pointer border border-gray-200"
          >
            <div className="text-3xl mb-4">⚙️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">System Configuration</h2>
            <p className="text-gray-600 mb-4">Manage settings, thresholds, organization structure, and treasury</p>
            <div className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-semibold">
              Configure →
            </div>
          </Link>

          {/* API Documentation */}
          <a
            href="https://github.com/quickserviceslqs-netizen/cht"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white p-8 rounded-lg shadow hover:shadow-xl transition cursor-pointer border border-gray-200"
          >
            <div className="text-3xl mb-4">📚</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">API Documentation</h2>
            <p className="text-gray-600 mb-4">View integration guide and API endpoints documentation</p>
            <div className="inline-block px-4 py-2 bg-purple-100 text-purple-800 rounded-lg text-sm font-semibold">
              View Docs →
            </div>
          </a>
        </div>

        {/* Quick Stats */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Admin Features</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-blue-900 mb-3">User Management</h4>
              <ul className="text-blue-800 space-y-2">
                <li>✓ Create and manage users with different roles</li>
                <li>✓ 7 roles: staff, manager, department_head, treasury, cfo, ceo, admin</li>
                <li>✓ Assign users to organizational structure</li>
                <li>✓ Deactivate users when needed</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-3">System Configuration</h4>
              <ul className="text-blue-800 space-y-2">
                <li>✓ View organization structure (Companies, Regions, Branches)</li>
                <li>✓ Manage approval thresholds and workflow tiers</li>
                <li>✓ Monitor treasury fund balances</li>
                <li>✓ Review audit logs and compliance tracking</li>
              </ul>
            </div>
          </div>
        </div>

        {/* System Overview */}
        <div className="mt-12 grid grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
            <div className="text-gray-600 text-sm font-medium">Role-Based Access</div>
            <div className="text-2xl font-bold text-gray-900 mt-2">7 Roles</div>
            <p className="text-gray-600 text-xs mt-2">Full RBAC system for all operations</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
            <div className="text-gray-600 text-sm font-medium">Workflow Automation</div>
            <div className="text-2xl font-bold text-gray-900 mt-2">4 Tiers</div>
            <p className="text-gray-600 text-xs mt-2">Dynamic approval routing by amount</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
            <div className="text-gray-600 text-sm font-medium">Security Features</div>
            <div className="text-2xl font-bold text-gray-900 mt-2">2FA + Audit</div>
            <p className="text-gray-600 text-xs mt-2">OTP payments + comprehensive logging</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-orange-500">
            <div className="text-gray-600 text-sm font-medium">Organization</div>
            <div className="text-2xl font-bold text-gray-900 mt-2">Multi-level</div>
            <p className="text-gray-600 text-xs mt-2">Company → Region → Branch → Dept</p>
          </div>
        </div>
      </div>
    </div>
  );
}
