import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRealtime } from '../../context/RealtimeContext';
import { Header } from '../../components/layout/Header';
import { Sidebar } from '../../components/layout/Sidebar';
import { Users, Plus, ShieldCheck, UserCheck, UserX, Mail, Building } from 'lucide-react';
import type { UserRole } from '../../types';
import { toast } from 'sonner';

export const AdminUsersPage: React.FC = () => {
  const { users, addUser, updateUserStatus } = useRealtime();
  const { user: currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('doctor');
  const [department, setDepartment] = useState('Intensive Care Unit (ICU)');

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const doctorsCount = users.filter((u) => u.role === 'doctor').length;
  const nursesCount = users.filter((u) => u.role === 'nurse').length;
  const labCount = users.filter((u) => u.role === 'laboratory').length;
  const adminCount = users.filter((u) => u.role === 'admin').length;

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error('Please enter complete user details.');
      return;
    }

    addUser({
      name,
      email,
      role,
      department,
    });

    setIsAddUserModalOpen(false);
    setName('');
    setEmail('');
    toast.success(`User ${name} (${role}) provisioned successfully.`);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans select-none">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header title="User Administration & Role Management" />

        <main className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header Summary & Provision Action */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center">
                <Users className="w-5 h-5 mr-2 text-teal-700" />
                Authorized Hospital Staff Directory
              </h2>
              <p className="text-xs text-gray-500">
                Secure role-based access control (RBAC) and user credentials management
              </p>
            </div>

            <button
              onClick={() => setIsAddUserModalOpen(true)}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs shadow-xs flex items-center space-x-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Provision Staff Account</span>
            </button>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="card-clinical p-4 bg-white border-l-4 border-l-teal-600">
              <div className="text-xs text-gray-500 font-semibold">Doctors</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{doctorsCount}</div>
            </div>
            <div className="card-clinical p-4 bg-white border-l-4 border-l-cyan-600">
              <div className="text-xs text-gray-500 font-semibold">Nurses</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{nursesCount}</div>
            </div>
            <div className="card-clinical p-4 bg-white border-l-4 border-l-purple-600">
              <div className="text-xs text-gray-500 font-semibold">Laboratory Technicians</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{labCount}</div>
            </div>
            <div className="card-clinical p-4 bg-white border-l-4 border-l-amber-600">
              <div className="text-xs text-gray-500 font-semibold">System Administrators</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{adminCount}</div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="card-clinical p-4 bg-white space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search staff name, email, or department..."
                className="w-full p-2.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full p-2.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              >
                <option value="ALL">All Hospital Roles ({users.length})</option>
                <option value="doctor">Doctors</option>
                <option value="nurse">Nurses</option>
                <option value="laboratory">Laboratory</option>
                <option value="admin">Administrators</option>
              </select>

              <div className="flex items-center justify-end text-xs font-bold text-gray-500">
                Showing {filteredUsers.length} Users
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="card-clinical overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-xs text-gray-600">
                <thead className="bg-gray-100/70 text-gray-700 uppercase font-semibold text-[10px] tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="p-3.5">User Name</th>
                    <th className="p-3.5">Email Credentials</th>
                    <th className="p-3.5">Hospital Role</th>
                    <th className="p-3.5">Department</th>
                    <th className="p-3.5">Account Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-teal-50/30 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 flex items-center">
                          <div className="w-7 h-7 rounded-full bg-teal-800 text-white flex items-center justify-center font-bold text-xs mr-2 shrink-0">
                            {u.name[0]}
                          </div>
                          {u.name}
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-gray-700">{u.email}</td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${
                          u.role === 'doctor' ? 'bg-teal-100 text-teal-800' :
                          u.role === 'nurse' ? 'bg-cyan-100 text-cyan-800' :
                          u.role === 'laboratory' ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3.5 text-gray-700">{u.department || 'Clinical Staff'}</td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center ${
                          (u.status || 'ACTIVE') === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {(u.status || 'ACTIVE') === 'ACTIVE' ? (
                            <>
                              <UserCheck className="w-3 h-3 mr-1 text-emerald-600" /> Active
                            </>
                          ) : (
                            <>
                              <UserX className="w-3 h-3 mr-1 text-red-600" /> Deactivated
                            </>
                          )}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => {
                            const newStatus = (u.status || 'ACTIVE') === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
                            updateUserStatus(u.id, newStatus);
                            toast.success(`Updated ${u.name} status to ${newStatus}`);
                          }}
                          disabled={u.email === currentUser?.email}
                          className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-slate-800 font-bold rounded text-[11px] disabled:opacity-40"
                        >
                          {(u.status || 'ACTIVE') === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Provision New User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <ShieldCheck className="w-5 h-5 mr-2 text-teal-700" /> Provision Hospital User Account
            </h3>
            <form onSubmit={handleAddUserSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Full Name & Title</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Alexander Hayes"
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Hospital Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hayes@hospital.demo"
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Assign Role</label>
                  <select
                    value={role}
                    onChange={(e: any) => setRole(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm font-bold capitalize text-slate-900"
                  >
                    <option value="doctor">Doctor</option>
                    <option value="nurse">Nurse</option>
                    <option value="laboratory">Laboratory</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Department</label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-gray-400 absolute left-2.5 top-3" />
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Intensive Care Unit"
                      className="w-full pl-8 pr-2.5 py-2.5 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-bold text-gray-600"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-teal-700 text-white font-bold rounded-lg">
                  Provision User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
