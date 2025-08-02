export function showToast(message, type = 'info') {
  // For now, use browser alert
  alert(`${type.toUpperCase()}: ${message}`);

  // Later, replace with actual toast library like react-toastify or sonner:
  /*
  import { toast } from 'sonner';
  if (type === 'success') toast.success(message);
  else if (type === 'error') toast.error(message);
  else toast(message);
  */
}
