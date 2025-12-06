
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch } from '../store';
import { logoutUser } from '../store/authSlice';

export const useLogout = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const logout = async () => {
    try {
      console.log('🔄 Starting logout process...');
      
      const result = await dispatch(logoutUser());
      
      if (logoutUser.fulfilled.match(result)) {
        console.log('✅ Logout successful');
      }
      
      // Redirect handled by router
      navigate('/login');
      
      return { success: true };
    } catch (error) {
      console.error('❌ Logout error:', error);
      navigate('/login');
      return { success: false, error };
    }
  };

  return logout;
};
