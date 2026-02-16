import React, { useState } from 'react';
import axios from 'axios';
import Input from '../components/Input';
import Button from '../components/Button';
import { login } from '../services/auth.service';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { validateEmail, validatePassword } from '../../validation/validation';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        newErrors.email = validateEmail(formData.email);
        newErrors.password = validatePassword(formData.password);

        Object.keys(newErrors).forEach(key => {
            if (!newErrors[key]) delete newErrors[key];
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            const data = await login({
                email: formData.email,
                password: formData.password
            });
            localStorage.setItem('token', data.accessToken);
            localStorage.setItem('user', JSON.stringify(data)); // Store full response which includes user details
            toast.success('Login Successful!');
            navigate('/dashboard');
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                const errorMessage = (err.response?.data as any)?.message || err.message || 'Login failed';
                toast.error(errorMessage);
            } else if (err instanceof Error) {
                const errorMessage = err.message || 'Login failed';
                toast.error(errorMessage);
            } else {
                toast.error('An unknown error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-container">
            <form onSubmit={handleSubmit} className="signup-form">
                <h2>Login</h2>

                <Input
                    label="Email"
                    name="email"
                    // type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    id="email"
                />

                <Input
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                    id="password"
                />

                <Button type="submit" isLoading={loading}>
                    Login
                </Button>

                <p style={{ textAlign: 'center', color: '#82a729ff', fontSize: '0.9rem' }}>
                    Don't have an account? <a style={{ color: "#aef705ff" }} href="/signup">Sign up</a>
                </p>
            </form>
        </div>
    );
};

export default Login;
