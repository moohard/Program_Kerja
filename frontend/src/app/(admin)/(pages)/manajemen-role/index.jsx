import React, { useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';
import { toast } from 'react-toastify';

const RolePermissionPage = () => {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [rolesRes, permissionsRes] = await Promise.all([
                    apiClient.get('/roles'),
                    apiClient.get('/permissions'),
                ]);
                setRoles(rolesRes.data);
                setPermissions(permissionsRes.data);
            } catch (error) {
                toast.error('Gagal memuat data role dan permission.');
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleRoleSelect = (role) => {
        // Buat salinan agar tidak mengubah state asli secara langsung
        const roleWithPermissionSet = {
            ...role,
            permissionsSet: new Set(role.permissions.map(p => p.name)),
        };
        setSelectedRole(roleWithPermissionSet);
    };

    const handlePermissionChange = (permissionName) => {
        if (!selectedRole) return;

        const newPermissionsSet = new Set(selectedRole.permissionsSet);
        if (newPermissionsSet.has(permissionName)) {
            newPermissionsSet.delete(permissionName);
        } else {
            newPermissionsSet.add(permissionName);
        }

        setSelectedRole({ ...selectedRole, permissionsSet: newPermissionsSet });
    };

    const handleSaveChanges = async () => {
        if (!selectedRole) return;

        setIsSaving(true);
        try {
            const payload = { permissions: Array.from(selectedRole.permissionsSet) };
            await apiClient.post(`/roles/${selectedRole.id}/permissions`, payload);
            toast.success(`Hak akses untuk role ${selectedRole.name} berhasil diperbarui.`);
            
            // Refresh data roles setelah menyimpan
            const rolesRes = await apiClient.get('/roles');
            setRoles(rolesRes.data);

        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menyimpan perubahan.');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="text-center py-10">Loading...</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Manajemen Role & Hak Akses</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Kolom Daftar Role */}
                <div className="md:col-span-1 bg-white p-4 rounded-lg shadow">
                    <h2 className="text-lg font-semibold border-b pb-2 mb-2">Daftar Role</h2>
                    <ul>
                        {roles.map(role => (
                            <li key={role.id}>
                                <button
                                    onClick={() => handleRoleSelect(role)}
                                    className={`w-full text-left p-2 rounded ${selectedRole?.id === role.id ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
                                >
                                    {role.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Kolom Daftar Permission */}
                <div className="md:col-span-2 bg-white p-4 rounded-lg shadow">
                    <h2 className="text-lg font-semibold border-b pb-2 mb-2">
                        Hak Akses untuk: {selectedRole ? <span className="font-bold text-blue-600">{selectedRole.name}</span> : 'Pilih Role'}
                    </h2>
                    {selectedRole ? (
                        <div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-1">
                                {permissions.map(permission => (
                                    <label key={permission.name} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 border">
                                        <input
                                            type="checkbox"
                                            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5"
                                            checked={selectedRole.permissionsSet.has(permission.name)}
                                            onChange={() => handlePermissionChange(permission.name)}
                                        />
                                        <div>
                                            <span className="font-medium text-gray-800">{permission.name}</span>
                                            <p className="text-xs text-gray-500">{permission.description}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            <div className="mt-6 text-right">
                                <button
                                    onClick={handleSaveChanges}
                                    disabled={isSaving}
                                    className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 disabled:bg-blue-300"
                                >
                                    {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-gray-500 pt-10 text-center">
                            Pilih salah satu role dari daftar di sebelah kiri untuk melihat dan mengubah hak aksesnya.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RolePermissionPage;
