import React, { useEffect } from 'react';

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const SidePanel: React.FC<SidePanelProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden transition-opacity ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-labelledby="slide-over-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-60 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`} 
        aria-hidden="true"
        onClick={onClose}
      ></div>

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className={`relative w-screen max-w-3xl transform transition ease-in-out duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          {/* Panel content */}
          <div className="flex h-full flex-col bg-white shadow-xl">
            {/* Header */}
            <div className="bg-gray-50 px-4 sm:px-6 py-4 flex-shrink-0 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-semibold text-gray-900" id="slide-over-title">
                  {title}
                </h2>
                <div className="ml-3 flex h-7 items-center">
                  <button
                    type="button"
                    className="p-1 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close panel</span>
                    <i className="fas fa-times h-5 w-5"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="relative flex-1 overflow-y-auto">
                <div className="px-4 sm:px-6 py-6">
                    {children}
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidePanel;
