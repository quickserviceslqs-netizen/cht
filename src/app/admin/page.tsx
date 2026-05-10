'use client';

import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-3 gap-6">
          {/* User Management */}
          <Link
            href="/admin/users"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">User Management</h2>
            <p className="text-gray-600">Create, update, and manage system users and roles</p>
            <div className="mt-4 inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-semibold">
              Manage →
            </div>
          </Link>

          {/* System Configuration */}
          <div className="bg-white p-6 rounded-lg shadow opacity-50 cursor-not-allowed">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">System Configuration</h2>
            <p className="text-gray-600">Configure system settings and preferences</p>
            <div className="mt-4 inline-block px-4 py-2 bg-gray-100 text-gray-800 rounded-lg text-sm font-semibold">
              Coming Soon
            </div>
          </div>

          {/* Audit Logs */}
          <div className="bg-white p-6 rounded-lg shadow opacity-50 cursor-not-allowed">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Audit Logs</h2>
            <p className="text-gray-600">View system activity and compliance logs</p>
            <div className="mt-4 inline-block px-4 py-2 bg-gray-100 text-gray-800 rounded-lg text-sm font-semibold">
              Coming Soon
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-12 bg-blue-50 border border-blue-200 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Admin Features</h3>
          <ul className="text-blue-800 space-y-1">
            <li>✓ Create and manage users with different roles</li>
            <li>✓ Assign users to organizational structure (Company, Region, Branch, Department)</li>
            <li>✓ Control user access and permissions</li>
            <li>✓ Deactivate users when needed</li>
            <li>✓ Full role-based access control (RBAC)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
