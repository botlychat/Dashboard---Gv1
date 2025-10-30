import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
    duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <i className="fas fa-check-circle text-green-500 text-xl"></i>;
            case 'error':
                return <i className="fas fa-exclamation-circle text-red-500 text-xl"></i>;
            case 'warning':
                return <i className="fas fa-exclamation-triangle text-yellow-500 text-xl"></i>;
            case 'info':
                return <i className="fas fa-info-circle text-blue-500 text-xl"></i>;
        }
    };

    const getBorderColor = () => {
        switch (type) {
            case 'success':
                return 'border-green-500';
            case 'error':
                return 'border-red-500';
            case 'warning':
                return 'border-yellow-500';
            case 'info':
                return 'border-blue-500';
        }
    };

    return (
        <div 
            className={`fixed top-20 end-6 z-[9999] bg-white shadow-lg rounded-lg border-s-4 ${getBorderColor()} p-4 min-w-[300px] max-w-[500px] animate-slide-in-right`}
            style={{
                animation: 'slideInRight 0.3s ease-out'
            }}
        >
            <style>
                {`
                    @keyframes slideInRight {
                        from {
                            transform: translateX(100%);
                            opacity: 0;
                        }
                        to {
                            transform: translateX(0);
                            opacity: 1;
                        }
                    }
                `}
            </style>
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                    {getIcon()}
                </div>
                <div className="flex-1">
                    <p className="text-gray-900 text-sm font-medium whitespace-pre-line">{message}</p>
                </div>
                <button
                    onClick={onClose}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <i className="fas fa-times"></i>
                </button>
            </div>
        </div>
    );
};

export default Toast;
