import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '@/context/AuthContext';
import logoDark from '@/assets/images/logo-dark.png';
import logoLight from '@/assets/images/logo-light.png';
import { Link } from 'react-router-dom';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const auth = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await auth.login(email, password);
            navigate('/index'); // Redirect to main dashboard
        } catch (err) {
            setError(err.response?.data?.message || 'Login gagal.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full flex justify-center items-center py-16 md:py-10">
            <div className="card md:w-lg w-screen z-10">
                <div className="text-center px-10 py-12">
                    <Link to="/index" className="flex justify-center">
                        <img src={logoDark} alt="logo dark" className="h-6 flex dark:hidden" width={111} />
                        <img src={logoLight} alt="logo light" className="h-6 hidden dark:flex" width={111} />
                    </Link>

                    <div className="mt-8 text-center">
                        <h4 className="mb-2.5 text-xl font-semibold text-primary">Selamat Datang!</h4>
                        <p className="text-base text-default-500">Silakan login untuk melanjutkan.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="text-left w-full mt-10">
                        {error && <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-md">{error}</div>}
                        <div className="mb-4">
                            <label htmlFor="email" className="block font-medium text-default-900 text-sm mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                className="form-input"
                                placeholder="Masukkan email"
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="Password"
                                   className="block font-medium text-default-900 text-sm mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                id="Password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                className="form-input"
                                placeholder="Masukkan password"
                            />
                        </div>

                        <div className="mt-10 text-center">
                            <button type="submit" disabled={loading} className="btn bg-primary text-white w-full">
                                {loading ? 'Memproses...' : 'Login'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
