import { Router } from "express";
import { db } from "../db";
import { communityPost, communityReaction, users } from "@shared/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export const community = Router();

// Admin middleware
const requireAdmin = async (req: any, res: any, next: any) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const [user] = await db
      .select({ isAdmin: users.isAdmin })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (!user?.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    next();
  } catch (error) {
    console.error('Error checking admin status:', error);
    res.status(500).json({ error: 'Failed to verify admin status' });
  }
};

// GET /api/community - fetch community posts with pagination
community.get("/api/community", async (req: any, res) => {
  try {
    const { limit = 20, cursor } = req.query;
    const limitNum = Math.min(Number(limit), 50);
    
    const whereClause = cursor 
      ? and(
          eq(communityPost.isPublished, true),
          sql`${communityPost.createdAt} < ${cursor}`
        )
      : eq(communityPost.isPublished, true);
    
    const rows = await db
      .select({
        id: communityPost.id,
        kind: communityPost.kind,
        title: communityPost.title,
        body: communityPost.body,
        createdAt: communityPost.createdAt,
      })
      .from(communityPost)
      .where(whereClause)
      .orderBy(desc(communityPost.createdAt))
      .limit(limitNum);
    
    const nextCursor = rows.length > 0 ? rows[rows.length - 1].createdAt : null;
    
    res.json({ 
      items: rows, 
      nextCursor 
    });
  } catch (error) {
    console.error('Error fetching community posts:', error);
    res.status(500).json({ error: 'Failed to fetch community posts' });
  }
});

// POST /api/community - create new community post
community.post("/api/community", async (req: any, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Premium-only feature check: Only Premium users can post in community hub
    const userPlan = req.user?.subscriptionTier || req.user?.plan || 'free';
    if (userPlan !== 'premium') {
      return res.status(403).json({ 
        error: 'PREMIUM_REQUIRED',
        message: 'Community posting is a Premium-only feature. Upgrade to Premium to share posts with the community!' 
      });
    }
    
    const { kind, title, body } = req.body;
    
    if (!kind || !title?.trim() || !body?.trim()) {
      return res.status(400).json({ error: 'Kind, title, and body are required' });
    }
    
    if (!['tip', 'win', 'question'].includes(kind)) {
      return res.status(400).json({ error: 'Invalid post kind' });
    }
    
    // Wellness guardrails
    if (title.length > 200) {
      return res.status(400).json({ error: 'Title must be 200 characters or less' });
    }
    
    if (body.length > 2000) {
      return res.status(400).json({ error: 'Content must be 2000 characters or less' });
    }
    
    // Medical advice filtering
    const medicalTerms = /\b(diagnose|diagnosis|prescribed?|medication|cure|treatment|doctor said|medical advice)\b/i;
    if (medicalTerms.test(title) || medicalTerms.test(body)) {
      return res.status(400).json({ 
        error: 'Posts should focus on personal experiences and wellness tips, not medical advice. Please consult healthcare professionals for medical guidance.' 
      });
    }
    
    const [post] = await db
      .insert(communityPost)
      .values({
        userId,
        kind,
        title,
        body,
        isPublished: false
      })
      .returning({ id: communityPost.id });
    
    res.status(201).json({ 
      id: post.id, 
      status: "PENDING_REVIEW" 
    });
  } catch (error) {
    console.error('Error creating community post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// POST /api/community/:id/publish - publish post (ownership check)
community.post("/api/community/:id/publish", async (req: any, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const postId = req.params.id;
    
    // Check ownership
    const [post] = await db
      .select()
      .from(communityPost)
      .where(eq(communityPost.id, postId))
      .limit(1);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    if (post.userId !== userId) {
      return res.status(403).json({ error: 'You can only publish your own posts' });
    }
    
    await db
      .update(communityPost)
      .set({ isPublished: true })
      .where(eq(communityPost.id, postId));
    
    res.json({ ok: true });
  } catch (error) {
    console.error('Error publishing community post:', error);
    res.status(500).json({ error: 'Failed to publish post' });
  }
});

// POST /api/community/:id/react - add reaction to post
community.post("/api/community/:id/react", async (req: any, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const postId = req.params.id;
    const { kind } = req.body;
    
    if (!['like', 'helpful'].includes(kind)) {
      return res.status(400).json({ error: 'Invalid reaction type' });
    }
    
    await db
      .insert(communityReaction)
      .values({
        postId,
        userId,
        kind,
      })
      .onConflictDoNothing();
    
    res.json({ ok: true });
  } catch (error) {
    console.error('Error adding reaction:', error);
    res.status(500).json({ error: 'Failed to add reaction' });
  }
});

// MODERATOR ENDPOINTS

// GET /api/community/mod/queue/count - get count of pending posts for admin badge
community.get("/api/community/mod/queue/count", requireAdmin, async (req: any, res) => {
  try {
    const result = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(communityPost)
      .where(eq(communityPost.isPublished, false));
    
    const count = result[0]?.count || 0;
    
    res.json({ count });
  } catch (error) {
    console.error('Error fetching mod queue count:', error);
    res.status(500).json({ error: 'Failed to fetch mod queue count' });
  }
});

// GET /api/community/mod/queue - fetch unpublished posts for moderation
community.get("/api/community/mod/queue", requireAdmin, async (req: any, res) => {
  try {
    const { limit = 20, cursor } = req.query;
    const limitNum = Math.min(Number(limit), 50);
    
    const whereClause = cursor 
      ? and(
          eq(communityPost.isPublished, false),
          sql`${communityPost.createdAt} < ${cursor}`
        )
      : eq(communityPost.isPublished, false);
    
    const rows = await db
      .select({
        id: communityPost.id,
        userId: communityPost.userId,
        kind: communityPost.kind,
        title: communityPost.title,
        body: communityPost.body,
        createdAt: communityPost.createdAt,
      })
      .from(communityPost)
      .where(whereClause)
      .orderBy(desc(communityPost.createdAt))
      .limit(limitNum);
    
    const nextCursor = rows.length > 0 ? rows[rows.length - 1].createdAt : null;
    
    res.json({ 
      items: rows, 
      nextCursor 
    });
  } catch (error) {
    console.error('Error fetching moderation queue:', error);
    res.status(500).json({ error: 'Failed to fetch moderation queue' });
  }
});

// POST /api/community/mod/:id/publish - admin publish post
community.post("/api/community/mod/:id/publish", requireAdmin, async (req: any, res) => {
  try {
    const postId = req.params.id;
    
    // Check if post exists
    const [post] = await db
      .select()
      .from(communityPost)
      .where(eq(communityPost.id, postId))
      .limit(1);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    await db
      .update(communityPost)
      .set({ isPublished: true })
      .where(eq(communityPost.id, postId));
    
    res.json({ ok: true });
  } catch (error) {
    console.error('Error publishing post:', error);
    res.status(500).json({ error: 'Failed to publish post' });
  }
});

// POST /api/community/mod/:id/unpublish - admin unpublish post
community.post("/api/community/mod/:id/unpublish", requireAdmin, async (req: any, res) => {
  try {
    const postId = req.params.id;
    
    // Check if post exists
    const [post] = await db
      .select()
      .from(communityPost)
      .where(eq(communityPost.id, postId))
      .limit(1);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    await db
      .update(communityPost)
      .set({ isPublished: false })
      .where(eq(communityPost.id, postId));
    
    res.json({ ok: true });
  } catch (error) {
    console.error('Error unpublishing post:', error);
    res.status(500).json({ error: 'Failed to unpublish post' });
  }
});

// DELETE /api/community/mod/:id - admin delete post
community.delete("/api/community/mod/:id", requireAdmin, async (req: any, res) => {
  try {
    const postId = req.params.id;
    
    // Check if post exists
    const [post] = await db
      .select()
      .from(communityPost)
      .where(eq(communityPost.id, postId))
      .limit(1);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Delete associated reactions first (cascade)
    await db
      .delete(communityReaction)
      .where(eq(communityReaction.postId, postId));
    
    // Delete the post
    await db
      .delete(communityPost)
      .where(eq(communityPost.id, postId));
    
    res.json({ ok: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});