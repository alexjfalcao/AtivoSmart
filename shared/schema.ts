import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, integer, index, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const operations = pgTable("operations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  assetName: text("asset_name").notNull(),
  assetType: text("asset_type").notNull(), // acao, fii, fundo, renda-fixa, cripto
  operationType: text("operation_type").notNull(), // compra, venda, rendimento
  operationDate: text("operation_date").notNull(), // ISO date string
  quantity: decimal("quantity", { precision: 18, scale: 6 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 18, scale: 2 }).notNull(),
  fees: decimal("fees", { precision: 18, scale: 2 }).default("0"),
  brokerage: text("brokerage"), // corretora
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOperationSchema = createInsertSchema(operations).omit({
  id: true,
  createdAt: true,
}).extend({
  quantity: z.coerce.number().positive("Quantidade deve ser maior que zero"),
  unitPrice: z.coerce.number().positive("Preço unitário deve ser maior que zero"),
  fees: z.coerce.number().min(0, "Taxas não podem ser negativas").optional(),
  operationDate: z.string().min(1, "Data da operação é obrigatória"),
  assetName: z.string().min(1, "Nome do ativo é obrigatório"),
  assetType: z.enum(["acao", "fii", "fundo", "renda-fixa", "cripto"], {
    errorMap: () => ({ message: "Tipo de ativo inválido" })
  }),
  operationType: z.enum(["compra", "venda", "rendimento"], {
    errorMap: () => ({ message: "Tipo de operação inválido" })
  }),
  brokerage: z.string().optional(),
});

export type InsertOperation = z.infer<typeof insertOperationSchema>;
export type Operation = typeof operations.$inferSelect;


export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  operations: many(operations),
}));

export const operationsRelations = relations(operations, ({ one }) => ({
  user: one(users, {
    fields: [operations.userId],
    references: [users.id],
  }),
}));
