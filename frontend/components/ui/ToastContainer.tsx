'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import ToastItem from './ToastItem';

const ToastContainer: React.FC = () => {
  const toasts = useSelector((state: RootState) => state.toast.toasts);

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

export default ToastContainer;

