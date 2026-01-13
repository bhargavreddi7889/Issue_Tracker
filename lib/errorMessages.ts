export const getAuthErrorMessage = (error: any): string => {
  const errorCode = error?.code || '';
  const errorMessage = error?.message || '';

  switch (errorCode) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password';
    
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in instead.';
    
    case 'auth/weak-password':
      return 'Password is too weak. Please use a stronger password.';
    
    case 'auth/invalid-email':
      return 'Invalid email address. Please check and try again.';
    
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.';
    
    default:
      // If it's a Firebase error but we don't have a specific message, show generic
      if (errorMessage.includes('Firebase')) {
        return 'An error occurred. Please try again.';
      }
      return errorMessage || 'An error occurred. Please try again.';
  }
};

