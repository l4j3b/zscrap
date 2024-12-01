/* eslint-disable no-unused-vars */
import { relations } from 'drizzle-orm';
import {
  pgTable,
  pgEnum,
  timestamp,
  varchar,
  uuid,
  boolean,
  text,
  jsonb,
  doublePrecision,
  primaryKey,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';

import { PLAN_IDS } from '~/lib/stripe/products';

export const planEnum = pgEnum('plan_id', PLAN_IDS);

/* Users */

export const usersTable = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 256 }).unique().notNull(),
  username: varchar('username', { length: 60 }).unique().notNull(),
  displayName: varchar('display_name', { length: 60 }).unique().notNull(),
  isAdmin: boolean('is_admin').notNull().default(false),
  whitelisted: boolean('whitelisted').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const userRelations = relations(usersTable, ({ many }) => ({
  usersToOrganizations: many(usersToOrganizations),
}));

/* Subscriptions */

export const subscriptionsTable = pgTable(
  'subscriptions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    stripeSubscriptionId: varchar('subscription_id', { length: 256 }).unique(),
    planId: planEnum('plan_id'),
    endsAt: timestamp('ends_at'),
    renewsAt: timestamp('renews_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),

    // FK
    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
  },
  (table) => {
    return {
      userIdIdx: uniqueIndex('subscriptions_user_idx').on(table.userId),
    };
  },
);

export const subscriptionRelations = relations(subscriptionsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [subscriptionsTable.userId],
    references: [usersTable.id],
  }),
}));

/* Organizations */

export enum OrganizationRoles {
  Owner = 'owner',
  Admin = 'admin',
  Member = 'member',
}

const OrganizationRolesArray = Object.values(OrganizationRoles);

export function isOrganizationRole(role?: unknown): role is OrganizationRoles {
  return OrganizationRolesArray.includes(role as OrganizationRoles);
}

export const organizationRolesEnum = pgEnum('organization_role', [
  OrganizationRoles.Owner,
  OrganizationRoles.Admin,
  OrganizationRoles.Member,
]);

export const organizationsTable = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 256 }).unique().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  apiCredits: doublePrecision('api_credits').notNull().default(10),
  stripeCustomerId: varchar('stripe_customer_id', { length: 256 }),
});

export const organizationRelations = relations(organizationsTable, ({ many, one }) => ({
  usersToOrganizations: many(usersToOrganizations),
  apiKey: one(apiKeysTable),
}));

/* API keys */

export const apiKeysTable = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: varchar('key', { length: 64 }).unique().notNull(),
  keySuffix: varchar('key_suffix', { length: 4 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),

  // FK
  organizationId: uuid('organization_id')
    .notNull()
    .unique()
    .references(() => organizationsTable.id, { onDelete: 'cascade' }),
});

export const apiKeyRelations = relations(apiKeysTable, ({ one }) => ({
  organization: one(organizationsTable, {
    fields: [apiKeysTable.organizationId],
    references: [organizationsTable.id],
  }),
}));

/* Users to Organizations */

export const usersToOrganizations = pgTable(
  'users_to_organizations',
  {
    // FK
    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),

    // FK
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizationsTable.id, { onDelete: 'cascade' }),

    role: organizationRolesEnum('role').notNull().default(OrganizationRoles.Member),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.userId, table.organizationId] }),
      userIdIdx: index('users_to_organizations_user_idx').on(table.userId),
      orgIdIdx: index('users_to_organizations_org_idx').on(table.organizationId),
    };
  },
);

export const usersToOrganizationsRelations = relations(usersToOrganizations, ({ one }) => ({
  organization: one(organizationsTable, {
    fields: [usersToOrganizations.organizationId],
    references: [organizationsTable.id],
  }),
  user: one(usersTable, {
    fields: [usersToOrganizations.userId],
    references: [usersTable.id],
  }),
}));

/* Scrapers */

export const scrapersTable = pgTable('scrapers', {
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  name: varchar('name', { length: 256 }).notNull(),
  prompt: text('prompt').notNull(),
  jsonSchema: text('json_schema').notNull(),

  // FK
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizationsTable.id, { onDelete: 'cascade' }),

  createdById: uuid('created_by_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
});

export const scraperRelations = relations(scrapersTable, ({ one, many }) => ({
  scraperUrls: many(scraperUrlsTable),
  organization: one(organizationsTable, {
    fields: [scrapersTable.organizationId],
    references: [organizationsTable.id],
  }),
  createdBy: one(usersTable, {
    fields: [scrapersTable.createdById],
    references: [usersTable.id],
  }),
}));

/* Scraper urls */
export enum ScraperUrlStatus {
  Pending = 'pending',
  Processing = 'processing',
  Completed = 'completed',
  Failed = 'failed',
}

export const scraperUrlStatusEnum = pgEnum('scraper_url_status', [
  ScraperUrlStatus.Pending,
  ScraperUrlStatus.Processing,
  ScraperUrlStatus.Completed,
  ScraperUrlStatus.Failed,
]);

export const scraperUrlsTable = pgTable('scraper_urls', {
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  url: varchar('url', { length: 2048 }).notNull(),
  title: varchar('title', { length: 256 }),
  html: text('html'),
  text: text('text'),
  rawResult: text('raw_result'),
  suggestion: text('suggestion'),
  usageInfo: jsonb('usage_info').$type<Record<string, unknown>>(),
  jsonResult: jsonb('json_result').$type<Record<string, unknown>>(),
  error: text('error'),
  status: scraperUrlStatusEnum('status').notNull().default(ScraperUrlStatus.Pending),

  // FK
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizationsTable.id, { onDelete: 'cascade' }),

  scraperId: uuid('scraper_id')
    .notNull()
    .references(() => scrapersTable.id, { onDelete: 'cascade' }),
});

export const scraperUrlRelations = relations(scraperUrlsTable, ({ one }) => ({
  organization: one(organizationsTable, {
    fields: [scraperUrlsTable.organizationId],
    references: [organizationsTable.id],
  }),
  scraper: one(scrapersTable, {
    fields: [scraperUrlsTable.scraperId],
    references: [scrapersTable.id],
  }),
}));

/* Stripe API credits charges, FK organization */

export const stripeApiCreditsChargesTable = pgTable('stripe_api_credits_charges', {
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  quantity: doublePrecision('quantity').notNull(),

  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizationsTable.id, { onDelete: 'cascade' }),
});
