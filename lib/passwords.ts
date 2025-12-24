// Password configuration
// IMPORTANT: Change these passwords in production!
// Store actual passwords in environment variables for security

export const PASSWORDS = {
  // Admin password (for site owner)
  ADMIN: process.env.SITE_ADMIN_PASSWORD || "admin123",
  
  // Temporary passwords (comma-separated list)
  TEMP: (process.env.SITE_TEMP_PASSWORDS || "temp123,temp456").split(",").map(p => p.trim()),
  
  // Redirect URL for unauthorized users
  REDIRECT_URL: "https://readyaimgo.biz"
}

// Cookie name for password authentication
export const PASSWORD_COOKIE_NAME = "site_access_token"

// Check if a password is valid
export function isValidPassword(password: string): boolean {
  if (!password) return false
  
  // Check admin password
  if (password === PASSWORDS.ADMIN) return true
  
  // Check temporary passwords
  return PASSWORDS.TEMP.includes(password)
}

