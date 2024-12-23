import { eq, and } from "drizzle-orm";
import { SubscriptionStatus } from "~/server/services/payment/types";
import { tables, useDB } from "~/server/utils/db";

class UserActions {
  async findUserByEmail(email) {
    try {
      const [existingUser] = await useDB()
        .select()
        .from(tables.users)
        .where(eq(tables.users.email, email));
      return existingUser || null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async findUserByUserId(userId) {
    try {
      const [existingUser] = await useDB()
        .select()
        .from(tables.users)
        .where(eq(tables.users.id, userId));
      return existingUser || null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async deleteUser(userId) {
    try {
      const record = await useDB()
        .delete(tables.users)
        .where(eq(tables.users.id, userId))
        .returning()
        .get();
      return record;
    } catch (error) {
      console.error(error);
      throw new Error(`Failed to delete user: ${error}`);
    }
  }

  async updateUserPassword(userId, hashedPassword) {
    try {
      const record = await useDB()
        .update(tables.users)
        .set({ hashedPassword })
        .where(eq(tables.users.id, userId))
        .returning()
        .get();
      return record;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to update user password");
    }
  }

  async updateUser(userId, payload) {
    try {
      const record = await useDB()
        .update(tables.users)
        .set(payload)
        .where(eq(tables.users.id, userId))
        .returning()
        .get();
      return record;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to update user");
    }
  }

  async createUserWithPassword(payload) {
    try {
      const record = await useDB()
        .insert(tables.users)
        .values(payload)
        .onConflictDoUpdate({
          target: tables.users.email,
          set: {
            name: payload.name,
            password: payload.password,
          },
        })
        .returning()
        .get();
      return record;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to upsert user");
    }
  }

  async createUserWithOAuthAccount(payload) {
    try {
      const record = await useDB()
        .insert(tables.users)
        .values(payload)
        .onConflictDoUpdate({
          target: tables.users.email,
          set: {
            name: payload.name,
            avatarUrl: payload.avatarUrl,
            emailVerified: true,
          },
        })
        .returning()
        .get();
      return record;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to upsert user");
    }
  }

  async updateLastActive(userId) {
    try {
      const record = await useDB()
        .update(tables.users)
        .set({ lastActive: new Date() })
        .where(eq(tables.users.id, userId))
        .returning()
        .get();
      return record;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to update last active");
    }
  }

  async verifyUser(userId) {
    try {
      const record = await useDB()
        .update(tables.users)
        .set({ emailVerified: true })
        .where(eq(tables.users.id, userId))
        .returning()
        .get();
      return record;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to verify user");
    }
  }

  async findSubscriptionByUserId(userId) {
    try {
      const [subscription] = await useDB()
        .select()
        .from(tables.subscriptions)
        .where(eq(tables.subscriptions.userId, userId));
      return subscription || null;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to find subscription by user ID");
    }
  }

  async findStripeCustomerByUserId(userId) {
    try {
      const [subscription] = await useDB()
        .select()
        .from(tables.subscriptions)
        .where(eq(tables.subscriptions.userId, userId));
      return subscription?.customerId || null;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to find Stripe customer by user ID");
    }
  }

  async findOauthAccountByUserId(userId) {
    try {
      const [oauthAccount] = await useDB()
        .select()
        .from(tables.oauthAccounts)
        .where(eq(tables.oauthAccounts.userId, userId));
      return oauthAccount || null;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to find OAuth account by user ID");
    }
  }

  async saveStripeCustomerId(userId, customerId) {
    try {
      await useDB()
        .insert(tables.subscriptions)
        .values({
          userId,
          customerId,
          status: SubscriptionStatus.TRIALING,
          planId: "",
          variantId: "",
          nextPaymentDate: Date.now(),
        })
        .onConflictDoUpdate({
          target: tables.subscriptions.userId,
          set: { customerId },
        })
        .returning()
        .get();
    } catch (error) {
      console.error(error);
      throw new Error("Failed to save Stripe customer ID");
    }
  }

  async findLinkedAccountsByUserId(userId) {
    try {
      const linkedAccounts = await useDB()
        .select()
        .from(tables.oauthAccounts)
        .where(eq(tables.oauthAccounts.userId, userId));
      return linkedAccounts;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to find linked accounts by user ID");
    }
  }

  async unlinkAccount(userId, accountId) {
    try {
      const result = await useDB()
        .delete(tables.oauthAccounts)
        .where(
          and(
            eq(tables.oauthAccounts.userId, userId),
            eq(tables.oauthAccounts.id, accountId),
          ),
        )
        .returning();
      return result.length > 0;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to unlink account");
    }
  }
}

export const userActions = new UserActions();
