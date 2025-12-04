import { Router } from "express";
import { db } from "../db";
import { communityPosts, communityLikes, communityComments } from "@shared/schema";
import { eq, desc, sql, and } from "drizzle-orm";

export const social = Router();

/** --- Likes --- **/

// Like a post
social.post("/api/community/:id/like", async (req: any, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;
    
    // Check if post exists
    const [post] = await db
      .select()
      .from(communityPosts)
      .where(eq(communityPosts.id, id))
      .limit(1);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Insert like (will ignore if already exists due to unique constraint)
    await db
      .insert(communityLikes)
      .values({ postId: id, userId })
      .onConflictDoNothing();

    // Update likes count
    await db
      .update(communityPosts)
      .set({ 
        likesCount: sql`${communityPosts.likesCount} + 1`
      })
      .where(eq(communityPosts.id, id));

    res.json({ ok: true });
  } catch (error) {
    console.error('Error adding like:', error);
    res.status(500).json({ error: 'Failed to add like' });
  }
});

// Unlike a post
social.delete("/api/community/:id/like", async (req: any, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;
    
    // Remove like
    const result = await db
      .delete(communityLikes)
      .where(and(
        eq(communityLikes.postId, id),
        eq(communityLikes.userId, userId)
      ));

    // Update likes count (only if like was actually removed)
    if (result.rowCount && result.rowCount > 0) {
      await db
        .update(communityPosts)
        .set({ 
          likesCount: sql`GREATEST(${communityPosts.likesCount} - 1, 0)`
        })
        .where(eq(communityPosts.id, id));
    }

    res.json({ ok: true });
  } catch (error) {
    console.error('Error removing like:', error);
    res.status(500).json({ error: 'Failed to remove like' });
  }
});

// Get like count
social.get("/api/community/:id/likes", async (req: any, res) => {
  try {
    const { id } = req.params;
    
    const result = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(communityLikes)
      .where(eq(communityLikes.postId, id));
    
    const count = result[0]?.count || 0;
    res.json({ count });
  } catch (error) {
    console.error('Error fetching like count:', error);
    res.status(500).json({ error: 'Failed to fetch like count' });
  }
});

/** --- Comments --- **/

// Add comment
social.post("/api/community/:id/comments", async (req: any, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;
    const { content } = req.body;
    
    if (!content?.trim()) {
      return res.status(400).json({ error: 'Comment content is required' });
    }
    
    if (content.length > 500) {
      return res.status(400).json({ error: 'Comment must be 500 characters or less' });
    }

    // Check if post exists
    const [post] = await db
      .select()
      .from(communityPosts)
      .where(eq(communityPosts.id, id))
      .limit(1);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Insert comment
    const [comment] = await db
      .insert(communityComments)
      .values({ postId: id, userId, content: content.trim() })
      .returning({
        id: communityComments.id,
        userId: communityComments.userId,
        content: communityComments.content,
        createdAt: communityComments.createdAt
      });

    // Update comments count
    await db
      .update(communityPosts)
      .set({ 
        commentsCount: sql`${communityPosts.commentsCount} + 1`
      })
      .where(eq(communityPosts.id, id));

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Fetch comments
social.get("/api/community/:id/comments", async (req: any, res) => {
  try {
    const { id } = req.params;
    const { limit = 20, cursor } = req.query;
    const limitNum = Math.min(Number(limit), 50);
    
    const whereClause = cursor 
      ? and(
          eq(communityComments.postId, id),
          sql`${communityComments.createdAt} < ${cursor}`
        )
      : eq(communityComments.postId, id);
    
    const comments = await db
      .select({
        id: communityComments.id,
        userId: communityComments.userId,
        content: communityComments.content,
        isAnonymous: communityComments.isAnonymous,
        createdAt: communityComments.createdAt,
      })
      .from(communityComments)
      .where(whereClause)
      .orderBy(desc(communityComments.createdAt))
      .limit(limitNum);

    const nextCursor = comments.length > 0 ? comments[comments.length - 1].createdAt : null;
    
    res.json({ 
      items: comments,
      nextCursor 
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});