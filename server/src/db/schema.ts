import { pgTable, text, timestamp, decimal, integer, boolean, uuid, jsonb, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  phone: text('phone'),
  avatar: text('avatar'),
  role: text('role').notNull().default('customer'), // 'customer', 'provider', 'admin'
  isEmailVerified: boolean('is_email_verified').default(false),
  isPhoneVerified: boolean('is_phone_verified').default(false),
  language: text('language').default('en'),
  location: text('location'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
  roleIdx: index('users_role_idx').on(table.role),
}));

// Service Providers table
export const providers = pgTable('providers', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  description: text('description').notNull(),
  location: text('location').notNull(),
  latitude: decimal('latitude', { precision: 10, scale: 8 }),
  longitude: decimal('longitude', { precision: 11, scale: 8 }),
  rating: decimal('rating', { precision: 3, scale: 2 }).default('0'),
  reviewCount: integer('review_count').default(0),
  pricing: jsonb('pricing').$type<{
    min: number;
    max: number;
    currency: string;
    type: string;
  }>().notNull(),
  isVerified: boolean('is_verified').default(false),
  isActive: boolean('is_active').default(true),
  languages: text('languages').array().default([]),
  serviceArea: text('service_area'), // JSON string for polygon/radius
  availability: jsonb('availability').$type<{
    [key: string]: { start: string; end: string; available: boolean }[];
  }>(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('providers_user_id_idx').on(table.userId),
  categoryIdx: index('providers_category_idx').on(table.category),
  locationIdx: index('providers_location_idx').on(table.location),
  ratingIdx: index('providers_rating_idx').on(table.rating),
}));

// Bookings table
export const bookings = pgTable('bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id').references(() => users.id).notNull(),
  providerId: uuid('provider_id').references(() => providers.id).notNull(),
  serviceDate: timestamp('service_date'),
  status: text('status').notNull().default('pending'), // 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'
  notes: text('notes'),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }),
  currency: text('currency').default('USD'),
  paymentStatus: text('payment_status').default('pending'), // 'pending', 'paid', 'refunded'
  paymentIntentId: text('payment_intent_id'),
  customerLocation: text('customer_location'),
  estimatedDuration: integer('estimated_duration'), // in minutes
  actualDuration: integer('actual_duration'), // in minutes
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  customerIdIdx: index('bookings_customer_id_idx').on(table.customerId),
  providerIdIdx: index('bookings_provider_id_idx').on(table.providerId),
  statusIdx: index('bookings_status_idx').on(table.status),
  serviceDateIdx: index('bookings_service_date_idx').on(table.serviceDate),
}));

// Messages table
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  bookingId: uuid('booking_id').references(() => bookings.id),
  fromId: uuid('from_id').references(() => users.id).notNull(),
  toId: uuid('to_id').references(() => users.id).notNull(),
  message: text('message').notNull(),
  messageType: text('message_type').default('text'), // 'text', 'image', 'location', 'system'
  isRead: boolean('is_read').default(false),
  readAt: timestamp('read_at'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  bookingIdIdx: index('messages_booking_id_idx').on(table.bookingId),
  fromIdIdx: index('messages_from_id_idx').on(table.fromId),
  toIdIdx: index('messages_to_id_idx').on(table.toId),
  createdAtIdx: index('messages_created_at_idx').on(table.createdAt),
}));

// Reviews table
export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  bookingId: uuid('booking_id').references(() => bookings.id).notNull(),
  customerId: uuid('customer_id').references(() => users.id).notNull(),
  providerId: uuid('provider_id').references(() => providers.id).notNull(),
  rating: integer('rating').notNull(), // 1-5
  comment: text('comment'),
  isVerified: boolean('is_verified').default(false),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  bookingIdIdx: index('reviews_booking_id_idx').on(table.bookingId),
  providerIdIdx: index('reviews_provider_id_idx').on(table.providerId),
  ratingIdx: index('reviews_rating_idx').on(table.rating),
}));

// Provider Images table
export const providerImages = pgTable('provider_images', {
  id: uuid('id').primaryKey().defaultRandom(),
  providerId: uuid('provider_id').references(() => providers.id).notNull(),
  imageUrl: text('image_url').notNull(),
  imageType: text('image_type').notNull(), // 'profile', 'portfolio', 'certificate'
  caption: text('caption'),
  isMain: boolean('is_main').default(false),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  providerIdIdx: index('provider_images_provider_id_idx').on(table.providerId),
  imageTypeIdx: index('provider_images_type_idx').on(table.imageType),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  providers: many(providers),
  customerBookings: many(bookings, { relationName: 'customerBookings' }),
  sentMessages: many(messages, { relationName: 'sentMessages' }),
  receivedMessages: many(messages, { relationName: 'receivedMessages' }),
  reviews: many(reviews),
}));

export const providersRelations = relations(providers, ({ one, many }) => ({
  user: one(users, {
    fields: [providers.userId],
    references: [users.id],
  }),
  bookings: many(bookings),
  reviews: many(reviews),
  images: many(providerImages),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  customer: one(users, {
    fields: [bookings.customerId],
    references: [users.id],
    relationName: 'customerBookings',
  }),
  provider: one(providers, {
    fields: [bookings.providerId],
    references: [providers.id],
  }),
  messages: many(messages),
  review: one(reviews),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  booking: one(bookings, {
    fields: [messages.bookingId],
    references: [bookings.id],
  }),
  from: one(users, {
    fields: [messages.fromId],
    references: [users.id],
    relationName: 'sentMessages',
  }),
  to: one(users, {
    fields: [messages.toId],
    references: [users.id],
    relationName: 'receivedMessages',
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  booking: one(bookings, {
    fields: [reviews.bookingId],
    references: [bookings.id],
  }),
  customer: one(users, {
    fields: [reviews.customerId],
    references: [users.id],
  }),
  provider: one(providers, {
    fields: [reviews.providerId],
    references: [providers.id],
  }),
}));

export const providerImagesRelations = relations(providerImages, ({ one }) => ({
  provider: one(providers, {
    fields: [providerImages.providerId],
    references: [providers.id],
  }),
}));

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Provider = typeof providers.$inferSelect;
export type NewProvider = typeof providers.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
export type ProviderImage = typeof providerImages.$inferSelect;
export type NewProviderImage = typeof providerImages.$inferInsert;
