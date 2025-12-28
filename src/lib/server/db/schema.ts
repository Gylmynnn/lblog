import { pgTable, serial, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
	id: serial('id').primaryKey(),
	username: text('username').notNull().unique(),
	password: text('password').notNull(),
	name: text('name').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const posts = pgTable('posts', {
	id: serial('id').primaryKey(),
	title: text('title').notNull(),
	slug: text('slug').notNull().unique(),
	excerpt: text('excerpt'),
	content: text('content').notNull(),
	coverImage: text('cover_image'),
	published: boolean('published').default(false).notNull(),
	authorId: integer('author_id').references(() => users.id),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const files = pgTable('files', {
	id: serial('id').primaryKey(),
	filename: text('filename').notNull(),
	originalName: text('original_name').notNull(),
	mimeType: text('mime_type').notNull(),
	size: integer('size').notNull(),
	path: text('path').notNull(),
	postId: integer('post_id').references(() => posts.id),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;
