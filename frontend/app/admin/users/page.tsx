'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { admin } from '@/lib/api';
import { useAuth } from '@/context/auth-context';

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => admin.users(),
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => admin.updateUser(id, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });

  if (isLoading) return <p>Loading users…</p>;
  if (error) return <p className="form-error">Failed to load users. {error instanceof Error ? error.message : ''}</p>;

  const raw = Array.isArray(users) ? users : [];
  const list = currentUser?.id ? raw.filter((u: Record<string, unknown>) => String(u.id) !== currentUser.id) : raw;

  return (
    <>
      <h1 className="title-page">Users</h1>
      <p className="subtitle">Registered customers (you are not shown in this list). Deactivated users cannot log in.</p>
      {list.length === 0 ? (
        <p className="empty-state">No other users yet.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Orders</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((u: Record<string, unknown>) => (
                <tr key={String(u.id)}>
                  <td>{String(u.email)}</td>
                  <td>{String(u.name ?? '—')}</td>
                  <td><span style={{ textTransform: 'capitalize' }}>{String(u.role).toLowerCase()}</span></td>
                  <td>{u.isActive === false ? 'Inactive' : 'Active'}</td>
                  <td>{u._count && typeof u._count === 'object' && 'orders' in u._count ? String((u._count as { orders: number }).orders) : '—'}</td>
                  <td>{u.createdAt ? new Date(String(u.createdAt)).toLocaleDateString() : '—'}</td>
                  <td>
                    <button
                      type="button"
                      className={u.isActive === false ? 'btn btn-secondary btn-sm' : 'btn btn-ghost btn-sm'}
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.9rem' }}
                      disabled={updateUserMutation.isPending}
                      onClick={() => updateUserMutation.mutate({ id: String(u.id), isActive: u.isActive === false })}
                    >
                      {u.isActive === false ? 'Activate' : 'Deactivate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
