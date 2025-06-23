import { useState, useEffect } from 'react';
import { VM, VMStatus, VMOperation } from '../types/vm';

interface UseVMsReturn {
  vms: VM[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  performOperation: (operation: VMOperation) => Promise<boolean>;
}

export default function useVMs(): UseVMsReturn {
  const [vms, setVms] = useState<VM[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVMs = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('http://127.0.0.1:8000/vms/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch VMs');
      }

      const data = await response.json();
      setVms(data);
    } catch (err: any) {
      console.error('Error fetching VMs:', err);
      setError(err.message || 'Failed to load virtual machines');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVMs();
  }, []);

  const performOperation = async (operation: VMOperation): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('http://127.0.0.1:8000/vms/operations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(operation),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to ${operation.operation} VM`);
      }

      // Update local state based on the operation
      setVms(prevVms =>
        prevVms.map(vm => {
          if (vm.id === operation.vm_id) {
            let newStatus: VMStatus;

            switch (operation.operation) {
              case 'start':
                newStatus = VMStatus.RUNNING;
                break;
              case 'stop':
                newStatus = VMStatus.STOPPED;
                break;
              case 'suspend':
                newStatus = VMStatus.SUSPENDED;
                break;
              case 'resume':
                newStatus = VMStatus.RUNNING;
                break;
              default:
                return vm;
            }

            return { ...vm, status: newStatus };
          }
          return vm;
        })
      );

      return true;
    } catch (err: any) {
      console.error(`Error performing VM operation (${operation.operation}):`, err);
      setError(err.message || `Failed to ${operation.operation} VM`);
      return false;
    }
  };

  return {
    vms,
    isLoading,
    error,
    refetch: fetchVMs,
    performOperation,
  };
}
