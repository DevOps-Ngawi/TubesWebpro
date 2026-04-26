import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './styles/login.css'; 
import mascotImg from '../assets/pose-hai.png';

const LoginAdmin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        const isUsernameEmpty = !username.trim();
        const isPasswordEmpty = !password.trim();

        if (isUsernameEmpty && isPasswordEmpty) {
            setError('Username dan Kata Sandi harus diisi');
            return;
        } else if (isUsernameEmpty) {
            setError('Username harus diisi');
            return;
        } else if (isPasswordEmpty) {
            setError('Kata sandi harus diisi');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post('http://localhost:3030/api/auth/login-admin', {
                username: username,
                password: password
            });

            const { token, admin } = response.data.payload.datas;

            if (token) {
                localStorage.setItem('token', token);
                localStorage.setItem('role', 'ADMIN');
                localStorage.setItem('user_name', admin.nama);
                localStorage.setItem('id', admin.id);
                navigate('/homepage');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.payload?.message || 'Gagal terhubung ke server';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const showUsernameAlert = error.toLowerCase().includes('username') && !username.trim();
    const showPasswordAlert = error.toLowerCase().includes('password') && !password.trim();

    return (
        <div className="login-body d-flex align-items-center justify-content-center min-vh-100">
            <div className="card border-0 shadow-lg p-4" style={{ maxWidth: '400px', width: '100%', borderRadius: '20px' }}>
                <div className="text-center mb-4">
                    <img src={mascotImg} alt="Mascot" className="mb-3" style={{ width: '100px' }} />
                    <h2 className="h4 fw-bold text-primary">Admin LogiLearn</h2>
                    <p className="text-muted small">Silakan masuk untuk mengelola sistem</p>
                </div>

                {error && (
                    <div className="alert alert-danger py-2 small border-0 text-center mb-3 shadow-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} noValidate>
                    <div className="mb-3">
                        <label className="form-label fw-bold small text-secondary">Username Admin</label>
                        <div className="input-group has-validation">
                            <input 
                                type="text" 
                                className={`form-control bg-light ${showUsernameAlert ? 'is-invalid' : ''}`} 
                                placeholder="Username"
                                value={username}
                                onChange={(e) => {
                                    setUsername(e.target.value);
                                    if(error.toLowerCase().includes('username')) setError('');
                                }}
                            />
                            {showUsernameAlert}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="form-label fw-bold small text-secondary">Kata Sandi</label>
                        <div className="input-group has-validation">
                            <input 
                                type="password" 
                                className={`form-control bg-light ${showPasswordAlert ? 'is-invalid' : ''}`} 
                                placeholder="Kata Sandi"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if(error.toLowerCase().includes('password')) setError('');
                                }}
                            />
                            {showPasswordAlert}
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-primary w-100 fw-bold rounded-pill py-2 shadow-sm"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="spinner-border spinner-border-sm me-2"></span>
                        ) : 'MASUK SEBAGAI ADMIN'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginAdmin;