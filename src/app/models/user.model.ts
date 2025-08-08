export interface User {
  // Properties required for registration
  userid: string;
  name: string;
  username: string;
  password?: string;
  token?: string;
}

// You might also define an interface specifically for login credentials if they are different
export interface LoginCredentials {
  username: string;
  password: string;
}

// And for registration data sent to the backend (excluding confirmPassword usually)
export interface RegistrationData {
  name: string;
  username: string;
  password: string;
}