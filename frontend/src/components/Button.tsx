
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary';
    isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', isLoading, ...props }) => {
    return (
        <button className={`btn btn-${variant}`} disabled={isLoading || props.disabled} {...props}>
            {isLoading ? 'Loading...' : children}
        </button>
    );
};

export default Button;
