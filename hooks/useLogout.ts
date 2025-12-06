
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { logoutUser } from '../store/authSlice';

export const useLogout = () => {
  const dispatch = useDispatch<AppDispatch>();

  const logout = async () => {
    try {
      console.log('🔄 Starting logout process...');
      
      const result = await dispatch(logoutUser());
      
      if (logoutUser.fulfilled.match(result)) {
        console.log('✅ Logout successful');
      }
      
      // Redirect handled by router/auth state
      window.location.href = '/login';
      
      return { success: true };
    } catch (error) {
      console.error('❌ Logout error:', error);
      window.location.href = '/login';
      return { success: false, error };
    }
  };

  return logout;
};
