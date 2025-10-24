import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import imageCompression from 'browser-image-compression';
import apiClient from '@/services/apiClient';
import useAuth from '@/hooks/useAuth';
import DefaultAvatar from '@/assets/images/user/avatar-11.png';

const ProfilePage = () => {
    const { user, setUser } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarData, setAvatarData] = useState({ file: null, name: '' }); // Changed state
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                password: '',
                password_confirmation: '',
            });
            setAvatarPreview(user.photo_url || DefaultAvatar);
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 800,
            useWebWorker: true,
        };

        try {
            const compressedFile = await imageCompression(file, options);
            // CRITICAL FIX: Wrap the compressed file in a new Blob with the correct type
            const blob = new Blob([compressedFile], { type: file.type });
            setAvatarData({ file: blob, name: file.name });
            setAvatarPreview(URL.createObjectURL(blob));
        } catch (error) {
            console.error('Error compressing image:', error);
            toast.error('Gagal memproses gambar.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const submissionData = new FormData();
        submissionData.append('name', formData.name);
        submissionData.append('email', formData.email);
        if (formData.password) {
            submissionData.append('password', formData.password);
            submissionData.append('password_confirmation', formData.password_confirmation);
        }
        if (avatarData.file) {
            submissionData.append('avatar', avatarData.file, avatarData.name);
        }

        try {
            const response = await apiClient.post('/profile', submissionData);
            setUser(response.data); // Update user context with new data
            toast.success('Profil berhasil diperbarui.');
        } catch (error) {
            console.error('Profile update failed:', error.response || error);
            if (error.response && error.response.data && error.response.data.errors) {
                console.error('Validation Errors:', error.response.data.errors);
                const validationErrors = Object.values(error.response.data.errors).flat().join('\n');
                toast.error(validationErrors);
            } else {
                const message = error.response?.data?.message || 'Gagal memperbarui profil.';
                toast.error(message);
            }
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Profil Saya</h1>
            <div className="bg-white shadow-md rounded-lg p-6">
                <form onSubmit={handleSubmit}>
                    <div className="flex items-center mb-6">
                        <img src={avatarPreview} alt="Avatar" className="w-24 h-24 rounded-full object-cover mr-6" />
                        <div>
                            <label htmlFor="avatar" className="cursor-pointer bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                Ganti Avatar
                            </label>
                            <input
                                type="file"
                                id="avatar"
                                name="avatar"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                            <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF hingga 2MB.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-700">Nama</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full mt-1 p-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full mt-1 p-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700">Password Baru</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="w-full mt-1 p-2 border rounded"
                                placeholder="Kosongkan jika tidak ingin mengubah"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700">Konfirmasi Password Baru</label>
                            <input
                                type="password"
                                name="password_confirmation"
                                value={formData.password_confirmation}
                                onChange={handleInputChange}
                                className="w-full mt-1 p-2 border rounded"
                            />
                        </div>
                    </div>

                    <div className="mt-6">
                        <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" disabled={loading}>
                            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;
