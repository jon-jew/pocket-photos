import jwt, { JwtPayload } from 'jsonwebtoken';

const GOOGLE_KEY_URL = process.env.NEXT_PUBLIC_GOOGLE_KEY_URL || '';

/**
 * Validates a JWT and returns its payload.
 *
 * @param token The JWT string to validate.
 * @param secret The secret or public key to verify the signature.
 * @returns The decoded payload if the token is valid, otherwise null.
 */
export const validateJwt = async <T extends object = JwtPayload>(
  token: string,
): Promise<T | null> => {
  try {
    const res = await fetch(GOOGLE_KEY_URL);
    if (!res.ok) {
      console.error('Failed to fetch public keys:', res.statusText);
      return null;
    }
    const keys = await res.json();
    const header = jwt.decode(token, { complete: true })?.header;
    if (!header || typeof header === 'string' || !header.kid || !keys[header.kid]) {
      console.error('Invalid token header or key ID not found');
      return null;
    }

    const decoded = jwt.verify(token, keys[header.kid]) as T;
    return decoded;
  } catch (error) {
    // Token is invalid (e.g., expired, malformed, signature mismatch)
    console.error('JWT validation error:', error);
    return null;
  }
};