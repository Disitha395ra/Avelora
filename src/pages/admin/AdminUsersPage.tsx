import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Search, Users, Shield, User, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/Input';

import toast from 'react-hot-toast';

const ROLE_COLORS: Record<string, string> = {
  platform_admin: 'bg-red-100 text-red-700',
  event_organizer: 'bg-brand-100 text-brand-700',
  customer: 'bg-blue-100 text-blue-700',
  staff: 'bg-neutral-100 text-neutral-600',
};

const ROLES = ['customer', 'event_organizer', 'staff', 'platform_admin'];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      setUsers(data || []);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const filtered = users.filter((u) => {
    const matchSearch =
      !search ||
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const updateRole = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);
    if (error) {
      toast.error('Failed to update role');
    } else {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
      );
      toast.success('Role updated');
    }
    setUpdatingId(null);
  };

  const roleCount = (role: string) => users.filter((u) => u.role === role).length;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Users</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Manage all registered users and their roles.</p>
      </div>

      {/* Role summary chips */}
      <div className="flex flex-wrap gap-3 mb-6">
        {[
          { label: 'All', value: 'all', count: users.length, icon: Users },
          { label: 'Customers', value: 'customer', count: roleCount('customer'), icon: User },
          { label: 'Organizers', value: 'event_organizer', count: roleCount('event_organizer'), icon: Users },
          { label: 'Admins', value: 'platform_admin', count: roleCount('platform_admin'), icon: Shield },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setRoleFilter(f.value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
              roleFilter === f.value
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300'
            }`}
          >
            <f.icon className="w-3.5 h-3.5" />
            {f.label}
            <span
              className={`ml-1 px-1.5 py-0.5 rounded-md text-xs font-bold ${
                roleFilter === f.value
                  ? 'bg-white/20 text-white'
                  : 'bg-neutral-100 text-neutral-500'
              }`}
            >
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4">
        <Input
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="w-4 h-4" />}
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50">
              {['User', 'Email', 'Role', 'Joined', 'Country', 'Actions'].map((h) => (
                <th
                  key={h}
                  className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-5 py-3"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center">
                  <RefreshCw className="w-5 h-5 animate-spin text-neutral-300 mx-auto" />
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-sm text-neutral-400">
                  No users found
                </td>
              </tr>
            ) : (
              filtered.map((u) => (
                <tr key={u.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs shrink-0">
                        {u.full_name
                          ? u.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                          : u.email?.[0]?.toUpperCase() || '?'}
                      </div>
                      <span className="text-sm font-medium text-neutral-900">
                        {u.full_name || '—'}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-neutral-500">{u.email}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        ROLE_COLORS[u.role] || 'bg-neutral-100 text-neutral-500'
                      }`}
                    >
                      {u.role?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-neutral-400">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 text-sm text-neutral-500">{u.country || '—'}</td>
                  <td className="px-5 py-3">
                    <select
                      value={u.role}
                      disabled={updatingId === u.id}
                      onChange={(e) => updateRole(u.id, e.target.value)}
                      className="text-xs border border-neutral-200 rounded-lg px-2 py-1.5 bg-white text-neutral-700 hover:border-neutral-300 transition-colors disabled:opacity-50"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {!loading && (
          <div className="px-5 py-3 border-t border-neutral-100 bg-neutral-50 text-xs text-neutral-400">
            Showing {filtered.length} of {users.length} users
          </div>
        )}
      </div>
    </div>
  );
}
