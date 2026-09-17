import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRealtime } from '../../context/RealtimeContext';
import { Header } from '../../components/layout/Header';
import { Sidebar } from '../../components/layout/Sidebar';
import {
  Users,
  Plus,
  ShieldCheck,
  UserCheck,
  UserX,
  Mail,
  Building,
  Clock,
  Lock,
  ShieldAlert,
  CheckCircle2,
  Trash2,
  Shield
} from 'lucide-react';
import type { UserRole, UserAccountStatus } from '../../types';
import { toast } from 'sonner';

export const AdminUsersPage: React.FC = () => {
  const { users, addUser, updateUserStatus, approveUser, rejectUser } = useRealtime();
  const { user: currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusTab, setStatusTab] = useState<'ALL' | 'PENDING' | 'ACTIVE' | 'FROZEN' | 'RESTRICTED'>('ALL');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('doctor');
  const [department, setDepartment] = useState('Intensive Care Unit (ICU)');

  const pendingUsers = users.filter((u) => u.approvalStatus === 'PENDING' || u.status === 'PENDING');
  const activeUsers = users.filter((u) => (u.status || 'ACTIVE') === 'ACTIVE' && u.approvalStatus !== 'PENDING');
  const frozenUsers = users.filter((u) => u.status === 'FROZEN');
  const restrictedUsers = users.filter((u) => u.status === 'RESTRICTED');

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;

    let matchesStatus = true;
    if (statusTab === 'PENDING') matchesStatus = u.approvalStatus === 'PENDING' || u.status === 'PENDING';
    else if (statusTab === 'ACTIVE') matchesStatus = (u.status || 'ACTIVE') === 'ACTIVE' && u.approvalStatus !== 'PENDING';
    else if (statusTab === 'FROZEN') matchesStatus = u.status === 'FROZEN';
    else if (statusTab === 'RESTRICTED') matchesStatus = u.status === 'RESTRICTED';

    return matchesSearch && matchesRole && matchesStatus;
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
      status: 'ACTIVE',
      approvalStatus: 'APPROVED'
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
        <Header title="User Administration & Access Control" />

        <main className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto w-full">
          {/* Pending Registrations Notification Alert Banner */}
          {pendingUsers.length > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0 shadow-sm animate-pulse">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-amber-950 text-sm flex items-center space-x-2">
                    <span>{pendingUsers.length} Staff Registration{pendingUsers.length > 1 ? 's' : ''} Awaiting Approval</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold uppercase tracking-wider">
                      Pending Action
                    </span>
                  </div>
                  <div className="text-xs text-amber-800 font-medium mt-0.5">
                    Newly registered staff accounts are blocked from login until an Administrator approves access.
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStatusTab('PENDING')}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-xs transition-all shrink-0"
              >
                Review Pending Registrations ({pendingUsers.length})
              </button>
            </div>
          )}

          {/* Header Summary & Provision Action */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center">
                <Users className="w-5 h-5 mr-2 text-teal-700" />
                Authorized Hospital Staff Directory
              </h2>
              <p className="text-xs text-gray-500">
                Manage user access approval, account freeze/unfreeze, and role permissions
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
              <div className="text-xs text-gray-500 font-semibold font-sans">Pending Approvals</div>
              <div className="text-2xl font-black text-amber-600 mt-1">{pendingUsers.length}</div>
            </div>
          </div>

          {/* Status Tabs & Search Filter */}
          <div className="card-clinical p-4 bg-white space-y-3">
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto text-xs font-bold">
              <button
                onClick={() => setStatusTab('ALL')}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  statusTab === 'ALL' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Staff ({users.length})
              </button>
              <button
                onClick={() => setStatusTab('PENDING')}
                className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
                  statusTab === 'PENDING' ? 'bg-white text-amber-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Pending Approvals</span>
                {pendingUsers.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
                    {pendingUsers.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setStatusTab('ACTIVE')}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  statusTab === 'ACTIVE' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Active Staff ({activeUsers.length})
              </button>
              <button
                onClick={() => setStatusTab('FROZEN')}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  statusTab === 'FROZEN' ? 'bg-white text-cyan-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Frozen Accounts ({frozenUsers.length})
              </button>
              <button
                onClick={() => setStatusTab('RESTRICTED')}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  statusTab === 'RESTRICTED' ? 'bg-white text-purple-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Restricted ({restrictedUsers.length})
              </button>
            </div>

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
              <table className="w-full min-w-[780px] text-left text-xs text-gray-600">
                <thead className="bg-gray-100/70 text-gray-700 uppercase font-semibold text-[10px] tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="p-3.5">User Name</th>
                    <th className="p-3.5">Email Credentials</th>
                    <th className="p-3.5">Hospital Role</th>
                    <th className="p-3.5">Department</th>
                    <th className="p-3.5">Access Status</th>
                    <th className="p-3.5 text-right">Access Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-400 font-semibold">
                        No hospital staff accounts found matching your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isPending = u.approvalStatus === 'PENDING' || u.status === 'PENDING';
                      const isFrozen = u.status === 'FROZEN';
                      const isRestricted = u.status === 'RESTRICTED';
                      const isRevoked = u.status === 'REVOKED' || u.status === 'INACTIVE';
                      const isActive = (u.status || 'ACTIVE') === 'ACTIVE' && !isPending;

                      return (
                        <tr key={u.id} className="hover:bg-teal-50/30 transition-colors">
                          <td className="p-3.5">
                            <div className="font-bold text-slate-900 flex items-center">
                              <div className="w-7 h-7 rounded-full bg-teal-800 text-white flex items-center justify-center font-bold text-xs mr-2 shrink-0">
                                {u.name[0]}
                              </div>
                              <div>
                                <div>{u.name}</div>
                                {u.employeeId && <div className="text-[10px] text-gray-400 font-mono">ID: {u.employeeId}</div>}
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5 font-mono text-gray-700">{u.email}</td>
                          <td className="p-3.5">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${
                                u.role === 'doctor'
                                  ? 'bg-teal-100 text-teal-800'
                                  : u.role === 'nurse'
                                  ? 'bg-cyan-100 text-cyan-800'
                                  : u.role === 'laboratory'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="p-3.5 text-gray-700">{u.department || 'Clinical Staff'}</td>
                          <td className="p-3.5">
                            {isPending && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 inline-flex items-center">
                                <Clock className="w-3 h-3 mr-1 text-amber-600" /> Pending Approval
                              </span>
                            )}
                            {isActive && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center">
                                <UserCheck className="w-3 h-3 mr-1 text-emerald-600" /> Active Access
                              </span>
                            )}
                            {isFrozen && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-900 border border-cyan-300 inline-flex items-center">
                                <Lock className="w-3 h-3 mr-1 text-cyan-700" /> Account Frozen
                              </span>
                            )}
                            {isRestricted && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-300 inline-flex items-center">
                                <ShieldAlert className="w-3 h-3 mr-1 text-purple-700" /> Access Restricted
                              </span>
                            )}
                            {isRevoked && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-300 inline-flex items-center">
                                <UserX className="w-3 h-3 mr-1 text-red-600" /> Access Revoked
                              </span>
                            )}
                          </td>

                          {/* Access Control Action Buttons */}
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              {/* Pending Approval Actions */}
                              {isPending && (
                                <>
                                  <button
                                    onClick={() => {
                                      approveUser(u.id, currentUser?.name);
                                      toast.success(`Approved account access for ${u.name} (${u.role.toUpperCase()})`);
                                    }}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] flex items-center shadow-2xs transition-all"
                                  >
                                    <CheckCircle2 className="w-3 h-3 mr-1" /> Approve Access
                                  </button>
                                  <button
                                    onClick={() => {
                                      rejectUser(u.id);
                                      toast.error(`Rejected registration for ${u.name}`);
                                    }}
                                    className="px-2.5 py-1 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold rounded-lg text-[11px] flex items-center transition-all"
                                  >
                                    <Trash2 className="w-3 h-3 mr-1" /> Reject
                                  </button>
                                </>
                              )}

                              {/* Active User Actions: Freeze, Restrict, Revoke */}
                              {isActive && (
                                <>
                                  <button
                                    onClick={() => {
                                      updateUserStatus(u.id, 'FROZEN', 'Account frozen by admin');
                                      toast.warning(`Account frozen for ${u.name}. Login access blocked.`);
                                    }}
                                    disabled={u.email === currentUser?.email}
                                    title="Freeze user login access"
                                    className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold rounded-lg text-[11px] disabled:opacity-30"
                                  >
                                    <Lock className="w-3 h-3 inline mr-1" /> Freeze
                                  </button>

                                  <button
                                    onClick={() => {
                                      updateUserStatus(u.id, 'RESTRICTED', 'Access restricted by admin');
                                      toast.info(`Restricted portal access for ${u.name}`);
                                    }}
                                    disabled={u.email === currentUser?.email}
                                    title="Restrict user access privileges"
                                    className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 font-bold rounded-lg text-[11px] disabled:opacity-30"
                                  >
                                    <ShieldAlert className="w-3 h-3 inline mr-1" /> Restrict
                                  </button>

                                  <button
                                    onClick={() => {
                                      updateUserStatus(u.id, 'REVOKED', 'Access revoked by admin');
                                      toast.error(`Revoked access for ${u.name}`);
                                    }}
                                    disabled={u.email === currentUser?.email}
                                    title="Revoke user access credentials"
                                    className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold rounded-lg text-[11px] disabled:opacity-30"
                                  >
                                    <UserX className="w-3 h-3 inline mr-1" /> Revoke
                                  </button>
                                </>
                              )}

                              {/* Frozen, Restricted, or Revoked Actions: Restore Access */}
                              {(isFrozen || isRestricted || isRevoked) && (
                                <button
                                  onClick={() => {
                                    approveUser(u.id, currentUser?.name);
                                    toast.success(`Restored active portal access for ${u.name}`);
                                  }}
                                  className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-[11px] flex items-center shadow-2xs transition-all"
                                >
                                  <Shield className="w-3 h-3 mr-1" /> Restore Access
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
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
