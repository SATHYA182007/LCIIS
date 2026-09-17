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
  Shield,
  Edit2,
  CheckSquare,
  Square,
  X,
  Search,
  Filter
} from 'lucide-react';
import type { UserRole, UserAccountStatus, UserProfile } from '../../types';
import { toast } from 'sonner';

export const AdminUsersPage: React.FC = () => {
  const {
    users,
    addUser,
    updateUser,
    updateUserStatus,
    approveUser,
    removeUser,
    bulkRemoveUsers,
    bulkUpdateUsers
  } = useRealtime();
  const { user: currentUser } = useAuth();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusTab, setStatusTab] = useState<'ALL' | 'PENDING' | 'ACTIVE' | 'FROZEN' | 'RESTRICTED'>('ALL');

  // Selection State for Mass Actions
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Modal State
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // Form State (Add / Edit User)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('DOCTOR');
  const [department, setDepartment] = useState('Intensive Care Unit (ICU)');
  const [status, setStatus] = useState<UserAccountStatus>('ACTIVE');

  const pendingUsers = users.filter((u) => u.approvalStatus === 'PENDING' || u.status === 'PENDING');

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === 'ALL' || u.role.toLowerCase() === roleFilter.toLowerCase();

    let matchesStatus = true;
    if (statusTab === 'PENDING') matchesStatus = u.approvalStatus === 'PENDING' || u.status === 'PENDING';
    else if (statusTab === 'ACTIVE') matchesStatus = (u.status || 'ACTIVE') === 'ACTIVE' && u.approvalStatus !== 'PENDING';
    else if (statusTab === 'FROZEN') matchesStatus = u.status === 'FROZEN';
    else if (statusTab === 'RESTRICTED') matchesStatus = u.status === 'RESTRICTED';

    return matchesSearch && matchesRole && matchesStatus;
  });

  const doctorsCount = users.filter((u) => u.role === 'DOCTOR' || (u.role as string) === 'doctor').length;
  const nursesCount = users.filter((u) => u.role === 'NURSE' || (u.role as string) === 'nurse').length;
  const labCount = users.filter((u) => u.role === 'LAB_TECHNICIAN' || (u.role as string) === 'laboratory').length;

  // Checkbox Selection Logic
  const isAllSelected =
    filteredUsers.length > 0 &&
    filteredUsers.every((u) => selectedUserIds.includes(u.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map((u) => u.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Add User Handler
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
    resetForm();
    toast.success(`User ${name} (${role}) provisioned successfully in Firebase.`);
  };

  // Edit User Handler
  const handleOpenEdit = (u: UserProfile) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setRole(u.role);
    setDepartment(u.department || 'General Medicine');
    setStatus(u.status || 'ACTIVE');
  };

  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    await updateUser(editingUser.id, {
      name,
      email,
      role,
      department,
      status
    });

    toast.success(`User ${name} updated successfully in Firebase.`);
    setEditingUser(null);
    resetForm();
  };

  // Single User Delete Handler
  const handleDeleteUser = async (u: UserProfile) => {
    if (u.email === currentUser?.email) {
      toast.error("You cannot delete your own logged-in admin account!");
      return;
    }
    if (window.confirm(`Are you sure you want to PERMANENTLY remove user "${u.name}" (${u.email}) from Firebase?`)) {
      await removeUser(u.id);
      setSelectedUserIds((prev) => prev.filter((id) => id !== u.id));
      toast.success(`User "${u.name}" deleted successfully.`);
    }
  };

  // Bulk Handlers
  const handleBulkApprove = async () => {
    if (selectedUserIds.length === 0) return;
    await bulkUpdateUsers(selectedUserIds, { status: 'ACTIVE', approvalStatus: 'APPROVED' });
    toast.success(`Approved access for ${selectedUserIds.length} staff users.`);
    setSelectedUserIds([]);
  };

  const handleBulkFreeze = async () => {
    if (selectedUserIds.length === 0) return;
    await bulkUpdateUsers(selectedUserIds, { status: 'FROZEN' });
    toast.warning(`Frozen ${selectedUserIds.length} staff user accounts.`);
    setSelectedUserIds([]);
  };

  const handleBulkRestrict = async () => {
    if (selectedUserIds.length === 0) return;
    await bulkUpdateUsers(selectedUserIds, { status: 'RESTRICTED' });
    toast.info(`Restricted access for ${selectedUserIds.length} staff user accounts.`);
    setSelectedUserIds([]);
  };

  const handleBulkDelete = async () => {
    if (selectedUserIds.length === 0) return;
    // Filter out current logged in user from deletion list
    const validIds = selectedUserIds.filter((id) => {
      const target = users.find((u) => u.id === id);
      return target?.email !== currentUser?.email;
    });

    if (validIds.length === 0) {
      toast.error("Cannot delete your own active admin account.");
      return;
    }

    if (window.confirm(`Are you sure you want to PERMANENTLY delete ${validIds.length} selected user account(s) from Firebase RTDB?`)) {
      await bulkRemoveUsers(validIds);
      toast.success(`Deleted ${validIds.length} user account(s).`);
      setSelectedUserIds([]);
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setRole('DOCTOR');
    setDepartment('Intensive Care Unit (ICU)');
    setStatus('ACTIVE');
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans select-none">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header title="User Administration & Access Control" />

        <main className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto w-full">
          {/* Pending Registrations Notification Banner */}
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
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-xs transition-all shrink-0 cursor-pointer"
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
                Manage user access approval, account edit/freeze, mass permissions, and live RTDB syncing
              </p>
            </div>

            <button
              onClick={() => {
                resetForm();
                setIsAddUserModalOpen(true);
              }}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
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
                <span>Pending</span>
                {pendingUsers.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px]">
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
                Active
              </button>
              <button
                onClick={() => setStatusTab('FROZEN')}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  statusTab === 'FROZEN' ? 'bg-white text-cyan-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Frozen
              </button>
              <button
                onClick={() => setStatusTab('RESTRICTED')}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  statusTab === 'RESTRICTED' ? 'bg-white text-purple-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Restricted
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative col-span-2">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search staff name, email, or department..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500"
                >
                  <option value="ALL">All Roles</option>
                  <option value="DOCTOR">Doctors</option>
                  <option value="NURSE">Nurses</option>
                  <option value="LAB_TECHNICIAN">Laboratory Technicians</option>
                  <option value="RECEPTIONIST">Receptionists</option>
                  <option value="ADMIN">Administrators</option>
                </select>
              </div>
            </div>
          </div>

          {/* Mass Selection Toolbar Banner */}
          {selectedUserIds.length > 0 && (
            <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-lg flex flex-wrap items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-teal-800 flex items-center justify-center font-black text-xs text-teal-200">
                  {selectedUserIds.length}
                </div>
                <span className="text-xs font-bold">Staff Accounts Selected</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                <button
                  onClick={handleBulkApprove}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center space-x-1 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mass Approve</span>
                </button>

                <button
                  onClick={handleBulkFreeze}
                  className="px-3 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg flex items-center space-x-1 transition-all cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Mass Freeze</span>
                </button>

                <button
                  onClick={handleBulkRestrict}
                  className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg flex items-center space-x-1 transition-all cursor-pointer"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Mass Restrict</span>
                </button>

                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center space-x-1 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Accounts</span>
                </button>

                <button
                  onClick={() => setSelectedUserIds([])}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-black text-gray-300 rounded-lg transition-all cursor-pointer"
                  title="Clear Selection"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* User Directory Table */}
          <div className="card-clinical overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-xs text-gray-600">
                <thead className="bg-gray-100/70 text-gray-700 uppercase font-semibold text-[10px] tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="p-3.5 w-10 text-center">
                      <button type="button" onClick={toggleSelectAll} className="cursor-pointer text-gray-500 hover:text-teal-700">
                        {isAllSelected ? (
                          <CheckSquare className="w-4 h-4 text-teal-700 mx-auto" />
                        ) : (
                          <Square className="w-4 h-4 mx-auto" />
                        )}
                      </button>
                    </th>
                    <th className="p-3.5">Staff Member</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">Hospital Role</th>
                    <th className="p-3.5">Department</th>
                    <th className="p-3.5">Access Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-400 font-semibold">
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
                      const isChecked = selectedUserIds.includes(u.id);

                      return (
                        <tr
                          key={u.id}
                          className={`transition-colors ${
                            isChecked ? 'bg-teal-50/70 border-l-4 border-l-teal-700' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="p-3.5 text-center">
                            <button type="button" onClick={() => toggleSelectOne(u.id)} className="cursor-pointer text-gray-400 hover:text-teal-700">
                              {isChecked ? (
                                <CheckSquare className="w-4 h-4 text-teal-700 mx-auto" />
                              ) : (
                                <Square className="w-4 h-4 mx-auto" />
                              )}
                            </button>
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold text-slate-900 flex items-center">
                              <div className="w-7 h-7 rounded-full bg-teal-800 text-white flex items-center justify-center font-bold text-xs mr-2 shrink-0">
                                {u.name ? u.name[0] : 'U'}
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
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                u.role?.toLowerCase() === 'doctor'
                                  ? 'bg-teal-100 text-teal-800'
                                  : u.role?.toLowerCase() === 'nurse'
                                  ? 'bg-cyan-100 text-cyan-800'
                                  : u.role?.toLowerCase() === 'laboratory' || u.role === 'LAB_TECHNICIAN'
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

                          {/* Actions: Edit, Delete, Quick Status Controls */}
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              {/* Edit User Button */}
                              <button
                                onClick={() => handleOpenEdit(u)}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] border border-slate-300 flex items-center cursor-pointer transition-all"
                                title="Edit User Account"
                              >
                                <Edit2 className="w-3 h-3 mr-1" /> Edit
                              </button>

                              {/* Pending Approval Actions */}
                              {isPending && (
                                <button
                                  onClick={() => {
                                    approveUser(u.id, currentUser?.name);
                                    toast.success(`Approved account access for ${u.name}`);
                                  }}
                                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] flex items-center cursor-pointer transition-all"
                                >
                                  <CheckCircle2 className="w-3 h-3 mr-1" /> Approve
                                </button>
                              )}

                              {/* Active User Actions: Freeze / Restrict */}
                              {isActive && (
                                <button
                                  onClick={() => {
                                    updateUserStatus(u.id, 'FROZEN', 'Account frozen by admin');
                                    toast.warning(`Account frozen for ${u.name}.`);
                                  }}
                                  disabled={u.email === currentUser?.email}
                                  title="Freeze user login access"
                                  className="px-2 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-900 border border-cyan-200 font-bold rounded-lg text-[11px] disabled:opacity-30 cursor-pointer"
                                >
                                  <Lock className="w-3 h-3 inline mr-1" /> Freeze
                                </button>
                              )}

                              {/* Restore Access button if frozen/restricted */}
                              {(isFrozen || isRestricted || isRevoked) && (
                                <button
                                  onClick={() => {
                                    approveUser(u.id, currentUser?.name);
                                    toast.success(`Restored active portal access for ${u.name}`);
                                  }}
                                  className="px-2 py-1 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-[11px] flex items-center cursor-pointer transition-all"
                                >
                                  <Shield className="w-3 h-3 mr-1" /> Restore
                                </button>
                              )}

                              {/* Single Delete User Button */}
                              <button
                                onClick={() => handleDeleteUser(u)}
                                disabled={u.email === currentUser?.email}
                                className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold rounded-lg text-[11px] disabled:opacity-30 cursor-pointer transition-all"
                                title="Delete User Account"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
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

      {/* Add / Edit User Account Modal */}
      {(isAddUserModalOpen || editingUser) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center">
                <ShieldCheck className="w-5 h-5 mr-2 text-teal-700" />
                {editingUser ? `Edit Account — ${editingUser.name}` : 'Provision Hospital User Account'}
              </h3>
              <button
                onClick={() => {
                  setIsAddUserModalOpen(false);
                  setEditingUser(null);
                  resetForm();
                }}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingUser ? handleEditUserSubmit : handleAddUserSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Full Name & Title *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Alexander Hayes"
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Hospital Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hayes@hospital.demo"
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Hospital Role *</label>
                  <select
                    value={role}
                    onChange={(e: any) => setRole(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="DOCTOR">Doctor</option>
                    <option value="NURSE">Nurse</option>
                    <option value="LAB_TECHNICIAN">Laboratory Technician</option>
                    <option value="RECEPTIONIST">Receptionist</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Account Access Status</label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="PENDING">PENDING</option>
                    <option value="FROZEN">FROZEN</option>
                    <option value="RESTRICTED">RESTRICTED</option>
                    <option value="REVOKED">REVOKED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Assigned Department</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Cardiology Unit"
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddUserModalOpen(false);
                    setEditingUser(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-teal-700 text-white font-bold rounded-xl hover:bg-teal-800 shadow-xs">
                  {editingUser ? 'Save User Changes' : 'Provision Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
