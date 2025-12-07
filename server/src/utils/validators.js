// Validate password
export const isValidPassword = (password) => {
  // Minimum 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return regex.test(password);
};

// Validate full name
export const isValidFullName = (fullName) => {
  if (!fullName || typeof fullName !== "string") return false;
  return fullName.trim().length >= 2; // at least 2 characters
};

// Validate email format
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};
