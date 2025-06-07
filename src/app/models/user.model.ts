export interface User {
  // Properties required for registration
  userId: string;
  email: string;
  username: string;
  password?: string;
  token?: string;
}

// You might also define an interface specifically for login credentials if they are different
export interface LoginCredentials {
  email: string;
  password: string;
}

// And for registration data sent to the backend (excluding confirmPassword usually)
export interface RegistrationData {
  email: string;
  username: string;
  password: string;
}