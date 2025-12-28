import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { hash } from 'bcryptjs';

// Define users table inline untuk avoid import issues
const users = pgTable('users', {
	id: serial('id').primaryKey(),
	username: text('username').notNull().unique(),
	password: text('password').notNull(),
	name: text('name').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
	console.error('DATABASE_URL is not set');
	process.exit(1);
}

const client = neon(DATABASE_URL);
const db = drizzle(client);

async function seed() {
	console.log('Seeding database...');

	// Check if admin already exists
	const existingUsers = await db.select().from(users);

	if (existingUsers.length > 0) {
		console.log('Admin user already exists. Skipping seed.');
		return;
	}

	// Create admin user
	const hashedPassword = await hash('laziza24434', 12);

	await db.insert(users).values({
		username: 'laziza',
		password: hashedPassword,
		name: 'Laziza Iklima Khairatun'
	});

	console.log('Admin user created successfully!');
}

seed()
	.then(() => {
		console.log('Seed completed!');
		process.exit(0);
	})
	.catch((error) => {
		console.error('Seed failed:', error);
		process.exit(1);
	});
