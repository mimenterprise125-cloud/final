import { useAdmin } from '@/lib/AdminContext';
import { useAuth } from '@/lib/AuthProvider';

export const useErrorReporting = () => {
  const { addErrorLog } = useAdmin();
  const { user } = useAuth();

  const reportError = async (
    message: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    page?: string,
    stackTrace?: string
  ) => {
    try {
      await addErrorLog({
        message,
        severity,
        page: page || window.location.pathname,
        stack_trace: stackTrace,
        user_id: user?.id,
      });
    } catch (err) {
      console.error('Failed to report error:', err);
    }
  };

  return { reportError };
};
