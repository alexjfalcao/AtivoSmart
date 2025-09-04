import { 
  users, 
  operations, 
  type User, 
  type UpsertUser, 
  type Operation, 
  type InsertOperation 
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Operation methods
  getAllOperations(userId: string): Promise<Operation[]>;
  getOperation(id: string, userId: string): Promise<Operation | undefined>;
  createOperation(operation: InsertOperation & { userId: string }): Promise<Operation>;
  updateOperation(id: string, userId: string, operation: Partial<InsertOperation>): Promise<Operation | undefined>;
  deleteOperation(id: string, userId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Operation methods
  async getAllOperations(userId: string): Promise<Operation[]> {
    return await db
      .select()
      .from(operations)
      .where(eq(operations.userId, userId))
      .orderBy(operations.createdAt);
  }

  async getOperation(id: string, userId: string): Promise<Operation | undefined> {
    const [operation] = await db
      .select()
      .from(operations)
      .where(eq(operations.id, id) && eq(operations.userId, userId));
    return operation;
  }

  async createOperation(insertOperation: InsertOperation & { userId: string }): Promise<Operation> {
    const [operation] = await db
      .insert(operations)
      .values({
        ...insertOperation,
        quantity: insertOperation.quantity.toString(),
        unitPrice: insertOperation.unitPrice.toString(),
        fees: insertOperation.fees ? insertOperation.fees.toString() : "0",
        brokerage: insertOperation.brokerage || null,
        notes: insertOperation.notes || null,
      })
      .returning();
    return operation;
  }

  async updateOperation(id: string, userId: string, updateData: Partial<InsertOperation>): Promise<Operation | undefined> {
    const [operation] = await db
      .update(operations)
      .set({
        ...updateData,
        quantity: updateData.quantity ? updateData.quantity.toString() : undefined,
        unitPrice: updateData.unitPrice ? updateData.unitPrice.toString() : undefined,
        fees: updateData.fees !== undefined ? updateData.fees.toString() : undefined,
        brokerage: updateData.brokerage !== undefined ? updateData.brokerage : undefined,
      })
      .where(eq(operations.id, id) && eq(operations.userId, userId))
      .returning();
    return operation;
  }

  async deleteOperation(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(operations)
      .where(eq(operations.id, id) && eq(operations.userId, userId));
    return result.rowCount !== null && result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();
