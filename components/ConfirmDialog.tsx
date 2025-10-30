import React from 'react';

interface ConfirmDialogProps {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    type?: 'danger' | 'warning' | 'info';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    type = 'danger'
}) => {
    const getIconAndColor = () => {
        switch (type) {
            case 'danger':
                return { icon: 'fa-exclamation-triangle', color: 'text-red-500', bgColor: 'bg-red-50' };
            case 'warning':
                return { icon: 'fa-exclamation-circle', color: 'text-yellow-500', bgColor: 'bg-yellow-50' };
            case 'info':
                return { icon: 'fa-info-circle', color: 'text-blue-500', bgColor: 'bg-blue-50' };
        }
    };

    const { icon, color, bgColor } = getIconAndColor();

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4" style={{ animation: 'fadeIn 0.2s ease-out' }}>
            <style>
                {`
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    @keyframes scaleIn {
                        from { 
                            transform: scale(0.9);
                            opacity: 0;
                        }
                        to { 
                            transform: scale(1);
                            opacity: 1;
                        }
                    }
                `}
            </style>
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={onCancel}
            ></div>

            {/* Dialog */}
            <div 
                className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6"
                style={{ animation: 'scaleIn 0.2s ease-out' }}
            >
                <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full ${bgColor} flex items-center justify-center`}>
                        <i className={`fas ${icon} ${color} text-xl`}></i>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                        <p className="text-sm text-gray-600 whitespace-pre-line">{message}</p>
                    </div>
                </div>

                <div className="flex gap-3 mt-6 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onCancel();
                        }}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                            type === 'danger' 
                                ? 'bg-red-500 hover:bg-red-600' 
                                : type === 'warning'
                                ? 'bg-yellow-500 hover:bg-yellow-600'
                                : 'bg-blue-500 hover:bg-blue-600'
                        }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
