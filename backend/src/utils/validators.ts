const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

export function isValidUsername(username: string): boolean {
  const clean = username.startsWith('@') ? username.slice(1) : username;
  return clean.length >= 3 && clean.length <= 11 && USERNAME_REGEX.test(clean);
}

export function isValidPassword(password: string): boolean {
  return password.length >= 6 && password.length <= 64;
}

export function isValidBio(bio: string): boolean {
  return bio.length <= 200;
}

export function isValidMessage(content: string): boolean {
  return content.trim().length > 0 && content.length <= 4000;
}
