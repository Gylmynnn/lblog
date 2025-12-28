import { SignJWT, jwtVerify } from 'jose';
import { compare, hash } from 'bcryptjs';
import { env } from '$env/dynamic/private';

const JWT_SECRET = new TextEncoder().encode(
	env.JWT_SECRET || 'your-secret-key-min-32-characters!!'
);
const JWT_EXPIRES_IN = '7d';

export interface JWTPayload {
	userId: number;
	username: string;
	name: string;
}

export async function hashPassword(password: string): Promise<string> {
	return hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
	return compare(password, hashedPassword);
}

export async function createToken(payload: JWTPayload): Promise<string> {
	return new SignJWT({ ...payload })
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime(JWT_EXPIRES_IN)
		.sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
	try {
		const { payload } = await jwtVerify(token, JWT_SECRET);
		return payload as unknown as JWTPayload;
	} catch {
		return null;
	}
}
