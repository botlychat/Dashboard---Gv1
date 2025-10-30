import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Toast from '../../components/Toast';

describe('Toast Component', () => {
  it('renders toast message correctly', () => {
    render(
      <Toast 
        message="Test message" 
        type="success" 
        onClose={() => {}} 
      />
    );
    
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('applies correct styling for success type', () => {
    const { container } = render(
      <Toast 
        message="Success!" 
        type="success" 
        onClose={() => {}} 
      />
    );
    
    const toastElement = container.querySelector('.border-green-500');
    expect(toastElement).toBeInTheDocument();
  });

  it('applies correct styling for error type', () => {
    const { container } = render(
      <Toast 
        message="Error!" 
        type="error" 
        onClose={() => {}} 
      />
    );
    
    const toastElement = container.querySelector('.border-red-500');
    expect(toastElement).toBeInTheDocument();
  });
});
