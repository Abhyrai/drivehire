import { useState, useEffect } from 'react';
import { getAdminUsers, toggleBlockUser } from '../../services/api';
import { toast } from 'react-toastify';

export default function ManageUsers() {
    const [users, setUsers] = useState([]);

    const load = async () => {
        try { const { data } = await getAdminUsers(); setUsers(data.users); }
        catch (err) { console.error(err); }
    };

    useEffect(() => { load(); }, []);

    const handleToggleBlock = async (id) => {
        try { await toggleBlockUser(id); toast.success('User status updated'); load(); }
        catch (err) { toast.error('Error'); }
    };

    return (
        <div>
            <div className="page-header"><h1>Manage Users 👥</h1><p>View and manage all platform users</p></div>
            <div className="glass-card">
                {users.length === 0 ? (
                    <div className="empty-state"><h3>No users found</h3></div>
                ) : (
                    <table className="data-table">
                        <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>City</th><th>Status</th><th>Action</th></tr></thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u._id}>
                                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                                    <td>{u.email}</td>
                                    <td>{u.phone}</td>
                                    <td><span className="badge badge-primary">{u.role}</span></td>
                                    <td>{u.city || '—'}</td>
                                    <td>
                                        <span className={`badge ${u.isBlocked ? 'badge-danger' : 'badge-success'}`}>
                                            {u.isBlocked ? 'Blocked' : 'Active'}
                                        </span>
                                    </td>
                                    <td>
                                        <button className={`btn btn-sm ${u.isBlocked ? 'btn-primary' : 'btn-danger'}`}
                                            onClick={() => handleToggleBlock(u._id)}>
                                            {u.isBlocked ? 'Unblock' : 'Block'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
