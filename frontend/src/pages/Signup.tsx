
import React, { useState } from 'react';
import axios from 'axios';
import Input from '../components/Input';
import Button from '../components/Button';
import { signup } from '../services/auth.service';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { validateName, validateEmail, validatePassword, validateConfirmPassword } from '../../validation/validation';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear error when user types
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        newErrors.name = validateName(formData.name);
        newErrors.email = validateEmail(formData.email);
        newErrors.password = validatePassword(formData.password);
        newErrors.confirmPassword = validateConfirmPassword(formData.password, formData.confirmPassword);

        // Remove empty error strings
        Object.keys(newErrors).forEach(key => {
            if (!newErrors[key]) delete newErrors[key];
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const data = await signup({
                name: formData.name,
                email: formData.email,
                password: formData.password
            });
            localStorage.setItem('token', data.accessToken);
            localStorage.setItem('user', JSON.stringify(data));
            toast.success('Signup Successful!');
            navigate('/login');
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                const errorMessage = (err.response?.data as any)?.message || err.message || 'Signup failed';
                toast.error(errorMessage);
            } else if (err instanceof Error) {
                const errorMessage = err.message || 'Signup failed';
                toast.error(errorMessage);
            } else {
                toast.error('An unknown error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-container" >
            <form onSubmit={handleSubmit} className="signup-form">
                <h2>Sign Up</h2>

                <Input
                    label="Name"
                    name="name"
                    // type="text"
                    value={formData.name}
                    onChange={handleChange}
                    error={errors.name}
                    id="name"
                />

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

                <Input
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={errors.confirmPassword}
                    id="confirmPassword"
                />

                <Button type="submit" isLoading={loading}>
                    Sign Up
                </Button>

                <p style={{ textAlign: 'center', color: '#82a729ff', fontSize: '0.9rem', margin: "0px 0px" }}>
                    Already have an account? <a style={{ color: "#aef705ff" }} href="/login">Login</a>
                </p>
            </form>
        </div>
    );
};

export default Signup;
