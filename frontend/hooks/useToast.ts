import { useDispatch } from 'react-redux';
import { addToast, ToastType } from '../store/slices/toastSlice';
import { AppDispatch } from '../store/store';

export const useToast = () => {
  const dispatch = useDispatch<AppDispatch>();

  const showToast = (
    type: ToastType,
    title: string,
    message?: string,
    duration?: number
  ) => {
    dispatch(addToast({ type, title, message, duration }));
  };

  return {
    success: (title: string, message?: string, duration?: number) =>
      showToast('success', title, message, duration),
    error: (title: string, message?: string, duration?: number) =>
      showToast('error', title, message, duration),
    warning: (title: string, message?: string, duration?: number) =>
      showToast('warning', title, message, duration),
    info: (title: string, message?: string, duration?: number) =>
      showToast('info', title, message, duration),
  };
};
