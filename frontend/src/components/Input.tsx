import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, type, ...props }) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="input-group">
            <label htmlFor={props.id || props.name}>{label}</label>
            <div style={{ position: 'relative' }}>
                <input
                    {...props}
                    type={isPassword ? (showPassword ? 'text' : 'password') : type}
                    className={error ? 'input-error' : ''}
                    style={{ width: '100%', paddingRight: isPassword ? '2.5rem' : '0.75rem' }}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        style={{
                            position: 'absolute',
                            right: '0.75rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            color: '#ccc'
                        }}
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                )}
            </div>
            <div style={{ minHeight: '1.2rem', color: '#ff4444', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                {error}
            </div>
        </div>
    );
};

export default Input;
