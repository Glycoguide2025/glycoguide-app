import { sql, relations } from 'drizzle-orm';
import {
  index,
  uniqueIndex,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (supports both Replit Auth and custom email/password auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  password: varchar("password"), // for custom email/password auth
  resetToken: varchar("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  displayName: varchar("display_name"),
  // Step 2: User preferences and goals
  goals: jsonb("goals").default(sql`'{"carb_target_g": 180}'::jsonb`), // { carb_target_g: 180 }
  reminders: jsonb("reminders").default(sql`'{"breakfast": "08:00", "lunch": "12:30", "dinner": "18:30", "reflection": "21:30"}'::jsonb`), // time reminders
  prefs: jsonb("prefs").default(sql`'{"dietary_tags": [], "dislikes": []}'::jsonb`), // { dietary_tags:["veg"], dislikes:["shellfish"] }
  // Phase 5: Emotion-Aware Reminders
  emailOptIn: boolean("email_opt_in").default(false),
  reminderFrequency: varchar("reminder_frequency").default('paused'), // 'daily', 'weekly', 'paused'
  timezone: varchar("timezone").default('America/New_York'),
  // Region & Blood Sugar Unit Preferences
  region: varchar("region").default('Other'), // 'Canada', 'United States', 'Other'
  bloodSugarUnit: varchar("blood_sugar_unit").default('mmol/L'), // 'mmol/L' or 'mg/dL'
  // Subscription fields
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  subscriptionTier: varchar("subscription_tier").default('free'), // free, premium, pro (maps to plan)
  subscriptionStatus: varchar("subscription_status").default('active'), // active, canceled, past_due
  subscriptionEndDate: timestamp("subscription_end_date"),
  // Stage 4: Onboarding & Retention (will add enums later)
  onboardingCompleted: boolean("onboarding_completed").default(false),
  onboardingStep: varchar("onboarding_step").default('welcome'), // 'welcome', 'goals', 'preferences', 'reminders', 'completed'
  lastReflectionDate: timestamp("last_reflection_date"),
  // Admin permissions
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enums
export const mealCategoryEnum = pgEnum('meal_category', ['breakfast', 'lunch', 'dinner', 'snack', 'soup', 'dessert', 'pizza', 'beverage']);
export const glycemicIndexEnum = pgEnum('glycemic_index', ['low', 'medium', 'high']);
export const moodEnum = pgEnum('mood', ['very_low', 'low', 'neutral', 'good', 'excellent']);
export const stressLevelEnum = pgEnum('stress_level', ['very_low', 'low', 'moderate', 'high', 'very_high']);
export const energyLevelEnum = pgEnum('energy_level', ['very_low', 'low', 'moderate', 'high', 'very_high']);
export const sleepQualityEnum = pgEnum('sleep_quality', ['poor', 'fair', 'good', 'excellent']);
export const mindfulnessTypeEnum = pgEnum('mindfulness_type', ['meditation', 'breathwork', 'body_scan', 'mindful_walking', 'gratitude']);
export const exerciseTypeEnum = pgEnum('exercise_type', ['walking', 'running', 'cycling', 'swimming', 'yoga', 'strength_training', 'stretching', 'other']);
export const intensityEnum = pgEnum('intensity', ['light', 'moderate', 'vigorous']);
export const communityPostTypeEnum = pgEnum('community_post_type', ['general', 'discussion', 'question', 'success_story', 'tip', 'support']);
// CGM Enums
export const glucoseSourceEnum = pgEnum('glucose_source', ['manual', 'cgm', 'imported']);
export const glucoseTrendEnum = pgEnum('glucose_trend', ['stable', 'rising_slowly', 'rising', 'rising_rapidly', 'falling_slowly', 'falling', 'falling_rapidly']);
export const glucoseAlertTypeEnum = pgEnum('glucose_alert_type', ['none', 'low', 'high', 'urgent_low', 'urgent_high']);
// Health Planning Enums
export const preventiveCareTypeEnum = pgEnum('preventive_care_type', ['screening', 'lab', 'vaccine', 'exam', 'checkup']);
export const taskStatusEnum = pgEnum('task_status', ['due', 'scheduled', 'completed', 'overdue']);
export const goalCategoryEnum = pgEnum('goal_category', ['glucose', 'a1c', 'weight', 'steps', 'exercise', 'sleep', 'mindfulness', 'nutrition']);
export const goalStatusEnum = pgEnum('goal_status', ['active', 'achieved', 'paused', 'abandoned']);
export const nudgeTypeEnum = pgEnum('nudge_type', ['hydration', 'movement', 'glucose_check', 'meal_timing', 'mindfulness', 'sleep', 'medication']);
export const dashboardSectionEnum = pgEnum('dashboard_section', ['meals', 'glucose', 'exercise', 'sleep', 'hydration', 'mood', 'mindfulness', 'goals', 'community']);
export const medicationDoseUnitEnum = pgEnum('medication_dose_unit', ['mg', 'units', 'mL', 'tablet', 'capsule', 'drop', 'puff', 'patch']);
export const medicationRouteEnum = pgEnum('medication_route', ['oral', 'injection', 'transdermal', 'inhalation', 'topical']);
export const appointmentTypeEnum = pgEnum('appointment_type', ['endocrinology', 'primary_care', 'nutrition', 'ophthalmology', 'podiatry', 'lab', 'cardiology', 'other']);
export const appointmentStatusEnum = pgEnum('appointment_status', ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show']);
export const wellnessTaskTypeEnum = pgEnum('wellness_task_type', ['habit', 'task', 'education', 'reminder']);
export const taskCadenceEnum = pgEnum('task_cadence', ['once', 'daily', 'weekly', 'monthly']);

// Phase 5: Insight History
export const insightCategoryEnum = pgEnum('insight_category', ['pattern', 'mood', 'energy', 'wellness', 'sleep', 'exercise', 'hydration']);
export const riskAssessmentTypeEnum = pgEnum('risk_assessment_type', ['hypoglycemia', 'dka', 'complication', 'foot_ulcer', 'cvd']);
export const riskLevelEnum = pgEnum('risk_level', ['low', 'moderate', 'high']);

// Community Hub enums (MVP version)
export const communityPostKindEnum = pgEnum('community_post_kind', ['tip', 'win', 'question']);
export const communityReactionKindEnum = pgEnum('community_reaction_kind', ['like', 'helpful']);

// CGM Import Enums (for manual import feature)
export const cgmImportSourceEnum = pgEnum('cgm_import_source', ['csv', 'json', 'dexcom_csv', 'libre_csv']);
export const cgmTrendEnum = pgEnum('cgm_trend', ['rising', 'falling', 'steady']);

// Wearables Import Enums (Stage 17 - Manual Import)
export const wearableImportSourceEnum = pgEnum('wearable_import_source', ['csv', 'json', 'fitbit_export', 'garmin_export', 'apple_health', 'google_fit']);
export const wearableDeviceEnum = pgEnum('wearable_device', ['fitbit', 'garmin', 'apple_health', 'google_fit', 'other']);
export const wearableMetricEnum = pgEnum('wearable_metric', ['steps', 'heart_rate', 'sleep_duration', 'calories']);
export const wearableImportStatusEnum = pgEnum('wearable_import_status', ['completed', 'failed']);

// Secure Healthcare Messaging Enums
export const conversationTypeEnum = pgEnum('conversation_type', ['patient_provider', 'patient_care_team', 'group_consultation']);
export const conversationStatusEnum = pgEnum('conversation_status', ['active', 'archived', 'closed']);
export const messageTypeEnum = pgEnum('message_type', ['text', 'image', 'document', 'voice', 'system_notification']);
export const messageStatusEnum = pgEnum('message_status', ['sent', 'delivered', 'read']);
export const attachmentTypeEnum = pgEnum('attachment_type', ['image', 'document', 'lab_result', 'prescription', 'other']);

// Educational Library Enums
export const educationContentTypeEnum = pgEnum('education_content_type', ['article', 'video', 'audio', 'course', 'quiz', 'worksheet']);
export const educationCategoryEnum = pgEnum('education_category', ['mindful_eating', 'sleep_hygiene', 'movement', 'prediabetes', 'blood_sugar', 'nutrition', 'stress_management']);
export const difficultyLevelEnum = pgEnum('difficulty_level', ['beginner', 'intermediate', 'advanced']);
export const progressStatusEnum = pgEnum('progress_status', ['not_started', 'in_progress', 'completed']);

// Gamification Enums  
export const badgeTypeEnum = pgEnum('badge_type', ['daily_streak', 'weekly_goal', 'monthly_milestone', 'special_achievement']);
export const challengeTypeEnum = pgEnum('challenge_type', ['daily', 'weekly', 'monthly', 'custom']);
export const challengeStatusEnum = pgEnum('challenge_status', ['active', 'completed', 'failed', 'expired']);

// Enhanced Community Building Enums
export const communityRoleEnum = pgEnum('community_role', ['member', 'ambassador', 'moderator', 'admin']);
export const reportReasonEnum = pgEnum('report_reason', ['inappropriate', 'spam', 'harassment', 'safety_concern', 'misinformation', 'other']);
export const reportStatusEnum = pgEnum('report_status', ['pending', 'reviewed', 'resolved', 'dismissed']);
export const feedbackTypeEnum = pgEnum('feedback_type', ['suggestion', 'feature_request', 'bug_report', 'content_request', 'partnership_inquiry']);
export const crisisLevelEnum = pgEnum('crisis_level', ['low', 'medium', 'high', 'emergency']);
export const workshopStatusEnum = pgEnum('workshop_status', ['draft', 'active', 'completed', 'cancelled']);
export const partnershipStatusEnum = pgEnum('partnership_status', ['pending', 'active', 'paused', 'ended']);

// Stage 4: Reflection & Onboarding Enums
export const onboardingStepEnum = pgEnum('onboarding_step', ['welcome', 'goals', 'preferences', 'reminders', 'completed']);
export const reflectionCategoryEnum = pgEnum('reflection_category', ['mood', 'stress', 'sleep', 'energy', 'gratitude']);
export const exportFormatEnum = pgEnum('export_format', ['csv', 'pdf']);
export const exportStatusEnum = pgEnum('export_status', ['pending', 'processing', 'completed', 'failed']);

// Step 3: Insights Enums (Part 2 specifications)
export const insightTypeEnum = pgEnum('insight_type', ['post_meal_rise', 'carb_budget_trend', 'evening_pattern', 'exercise_consistency', 'exercise_glucose_impact', 'cgm_time_in_range', 'cgm_trend_patterns', 'cgm_alert_frequency', 'sleep_quality_glucose_correlation', 'energy_level_glucose_correlation', 'sleep_duration_patterns']);
export const insightSeverityEnum = pgEnum('insight_severity', ['info', 'warn']);

// Meals table
export const meals = pgTable("meals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  category: mealCategoryEnum("category").notNull(),
  glycemicIndex: glycemicIndexEnum("glycemic_index").notNull(),
  glycemicValue: integer("glycemic_value"),
  carbohydrates: decimal("carbohydrates", { precision: 5, scale: 2 }),
  calories: integer("calories"),
  protein: decimal("protein", { precision: 5, scale: 2 }),
  fat: decimal("fat", { precision: 5, scale: 2 }),
  fiber: decimal("fiber", { precision: 5, scale: 2 }),
  imageUrl: text("image_url"),
  imageLocked: boolean("image_locked").default(false),
  imageVersion: integer("image_version").default(1),
  ingredients: text("ingredients").array(),
  instructions: text("instructions"),
  prepTime: integer("prep_time_minutes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Stage 4: Daily reflections for retention 
export const dailyReflections = pgTable("daily_reflections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  date: varchar("date").notNull(), // YYYY-MM-DD format
  mood: varchar("mood"), // Will map to moodEnum values
  stress: varchar("stress"), // Will map to stressLevelEnum values  
  sleep: varchar("sleep"), // Will map to sleepQualityEnum values
  energy: varchar("energy"), // Will map to energyLevelEnum values
  gratitude: text("gratitude"),
  notes: text("notes"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Stage 4: Data exports for premium features
export const dataExports = pgTable("data_exports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  format: exportFormatEnum("format").notNull(),
  status: exportStatusEnum("status").default('pending'),
  dateRange: jsonb("date_range"), // { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' }
  fileUrl: text("file_url"),
  expiresAt: timestamp("expires_at"), // For 24h caching
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Stage 5: Analytics events (privacy-first) - TEMPORARILY COMMENTED OUT
// export const analyticsEvents = pgTable("analytics_events", {
//   id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
//   userId: varchar("user_id").references(() => users.id), // nullable for anonymous events
//   sessionId: varchar("session_id"),
//   event: varchar("event").notNull(), // 'page_view', 'feature_used', etc.
//   properties: jsonb("properties"), // event-specific data
//   timestamp: timestamp("timestamp").defaultNow(),
// });

// Phase 5: Insight History - Track all wellness insights shown to users
export const insightHistory = pgTable("insight_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  insightText: text("insight_text").notNull(),
  insightCategory: insightCategoryEnum("insight_category").notNull(),
  shownAt: timestamp("shown_at").notNull().defaultNow(),
  dismissedAt: timestamp("dismissed_at"),
}, (table) => ({
  userIdIdx: index("insight_history_user_id_idx").on(table.userId),
  shownAtIdx: index("insight_history_shown_at_idx").on(table.shownAt),
}));

// User meal logs
export const mealLogs = pgTable("meal_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  mealId: varchar("meal_id").references(() => meals.id),
  customMealName: text("custom_meal_name"),
  customCarbs: decimal("custom_carbs", { precision: 5, scale: 2 }),
  customCalories: integer("custom_calories"),
  category: mealCategoryEnum("category").notNull(),
  loggedAt: timestamp("logged_at").defaultNow(),
  notes: text("notes"),
}, (table) => ({
  // Performance indices for insights processing <800ms target
  userIdIdx: index("meal_logs_user_id_idx").on(table.userId),
  userTimeIdx: index("meal_logs_user_time_idx").on(table.userId, table.loggedAt),
  loggedAtIdx: index("meal_logs_logged_at_idx").on(table.loggedAt),
}));

// Glucose readings (enhanced for CGM support, aligned with Prisma CGMReading model)
export const glucoseReadings = pgTable("glucose_readings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  value: decimal("value", { precision: 5, scale: 2 }).notNull(), // Aligned with Prisma Float type
  unit: varchar("unit").default('mg/dL'),
  readingType: varchar("reading_type"), // fasting, post_meal, random, etc.
  relatedMealLogId: varchar("related_meal_log_id").references(() => mealLogs.id),
  takenAt: timestamp("taken_at").defaultNow(), // Renamed from recordedAt to match Prisma takenAt
  notes: text("notes"),
  // CGM-specific fields
  source: glucoseSourceEnum("source").default('manual'), // manual, cgm, imported
  cgmDeviceId: varchar("cgm_device_id"), // for tracking CGM sensor/device
  trend: glucoseTrendEnum("trend"), // CGM trend arrows
  alertType: glucoseAlertTypeEnum("alert_type").default('none'), // glucose alerts
  isLive: boolean("is_live").default(false), // true for real-time CGM data
  createdAt: timestamp("created_at").defaultNow(), // Added to match Prisma model
}, (table) => ({
  // Performance indices for CGM timeline queries
  userIdIdx: index("glucose_readings_user_id_idx").on(table.userId),
  userTimeIdx: index("glucose_readings_user_time_idx").on(table.userId, table.takenAt), // Updated index reference
  cgmDeviceIdx: index("glucose_readings_cgm_device_idx").on(table.cgmDeviceId),
  takenAtIdx: index("glucose_readings_taken_at_idx").on(table.takenAt), // Updated index name and reference
}));

// Exercise logs (enhanced with holistic approach)
export const exerciseLogs = pgTable("exercise_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  exerciseType: text("exercise_type").notNull(),
  duration: integer("duration_minutes"),
  intensity: varchar("intensity"), // light, moderate, vigorous
  caloriesBurned: integer("calories_burned"),
  heartRate: integer("heart_rate"),
  loggedAt: timestamp("logged_at").defaultNow(),
  notes: text("notes"),
});

// Healthcare providers
export const healthcareProviders = pgTable("healthcare_providers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  specialization: text("specialization"),
  email: varchar("email").unique(),
  profileImageUrl: text("profile_image_url"),
  bio: text("bio"),
  available: boolean("available").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Consultation bookings
export const consultations = pgTable("consultations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  providerId: varchar("provider_id").notNull().references(() => healthcareProviders.id),
  scheduledAt: timestamp("scheduled_at").notNull(),
  duration: integer("duration_minutes").default(30),
  status: varchar("status").default('scheduled'), // scheduled, completed, cancelled
  notes: text("notes"),
  meetingUrl: text("meeting_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User meal plans
export const mealPlans = pgTable("meal_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat messages (Legacy AI chat)
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  response: text("response"),
  isFromUser: boolean("is_from_user").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Secure Healthcare Messaging Tables

// Conversations between patients and healthcare providers
export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: conversationTypeEnum("type").default('patient_provider'),
  status: conversationStatusEnum("status").default('active'),
  subject: text("subject"), // Optional conversation subject/title
  patientId: varchar("patient_id").notNull().references(() => users.id),
  providerId: varchar("provider_id").references(() => healthcareProviders.id),
  consultationId: varchar("consultation_id").references(() => consultations.id), // Link to consultation if applicable
  lastMessageAt: timestamp("last_message_at"),
  lastMessagePreview: text("last_message_preview"), // For conversation list
  isEncrypted: boolean("is_encrypted").default(true),
  metadata: jsonb("metadata"), // For storing conversation settings, participant roles, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  // Performance indices for conversation queries
  patientIdIdx: index("conversations_patient_id_idx").on(table.patientId),
  providerIdIdx: index("conversations_provider_id_idx").on(table.providerId),
  statusIdx: index("conversations_status_idx").on(table.status),
  lastMessageIdx: index("conversations_last_message_idx").on(table.lastMessageAt),
  consultationIdx: index("conversations_consultation_idx").on(table.consultationId),
}));

// Individual messages within conversations
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id),
  senderId: varchar("sender_id").notNull(), // Either user.id or healthcareProvider.id
  senderType: varchar("sender_type").notNull(), // 'patient' or 'provider'
  messageType: messageTypeEnum("message_type").default('text'),
  content: text("content").notNull(), // Encrypted message content
  originalContent: text("original_content"), // Unencrypted content for search (if enabled)
  status: messageStatusEnum("status").default('sent'),
  isEdited: boolean("is_edited").default(false),
  editedAt: timestamp("edited_at"),
  replyToMessageId: varchar("reply_to_message_id").references((): any => messages.id), // For threaded replies
  priority: varchar("priority").default('normal'), // 'low', 'normal', 'high', 'urgent'
  metadata: jsonb("metadata"), // For storing read receipts, delivery info, etc.
  sentAt: timestamp("sent_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  // Performance indices for message queries
  conversationIdIdx: index("messages_conversation_id_idx").on(table.conversationId),
  senderIdIdx: index("messages_sender_id_idx").on(table.senderId),
  sentAtIdx: index("messages_sent_at_idx").on(table.sentAt),
  conversationTimeIdx: index("messages_conversation_time_idx").on(table.conversationId, table.sentAt),
  statusIdx: index("messages_status_idx").on(table.status),
}));

// Message attachments for medical documents, images, etc.
export const messageAttachments = pgTable("message_attachments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  messageId: varchar("message_id").notNull().references(() => messages.id),
  fileName: text("file_name").notNull(),
  originalFileName: text("original_file_name").notNull(),
  fileSize: integer("file_size").notNull(), // in bytes
  mimeType: varchar("mime_type").notNull(),
  attachmentType: attachmentTypeEnum("attachment_type").default('document'),
  filePath: text("file_path").notNull(), // Secure file storage path
  isEncrypted: boolean("is_encrypted").default(true),
  encryptionKey: text("encryption_key"), // For file-level encryption
  thumbnailPath: text("thumbnail_path"), // For images
  metadata: jsonb("metadata"), // File metadata, EXIF data (if safe), etc.
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  expiresAt: timestamp("expires_at"), // For automatic cleanup of sensitive files
}, (table) => ({
  messageIdIdx: index("message_attachments_message_id_idx").on(table.messageId),
  expiresAtIdx: index("message_attachments_expires_at_idx").on(table.expiresAt),
}));

// Message read status tracking for participants
export const messageRecipients = pgTable("message_recipients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  messageId: varchar("message_id").notNull().references(() => messages.id),
  recipientId: varchar("recipient_id").notNull(), // user.id or healthcareProvider.id
  recipientType: varchar("recipient_type").notNull(), // 'patient' or 'provider'
  status: messageStatusEnum("status").default('sent'),
  readAt: timestamp("read_at"),
  deliveredAt: timestamp("delivered_at"),
  isNotificationSent: boolean("is_notification_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  messageIdIdx: index("message_recipients_message_id_idx").on(table.messageId),
  recipientIdIdx: index("message_recipients_recipient_id_idx").on(table.recipientId),
  statusIdx: index("message_recipients_status_idx").on(table.status),
  compositeIdx: index("message_recipients_composite_idx").on(table.messageId, table.recipientId),
}));

// Conversation participants (for group conversations)
export const conversationParticipants = pgTable("conversation_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id),
  participantId: varchar("participant_id").notNull(), // user.id or healthcareProvider.id
  participantType: varchar("participant_type").notNull(), // 'patient' or 'provider'
  role: varchar("role").default('member'), // 'admin', 'moderator', 'member'
  joinedAt: timestamp("joined_at").defaultNow(),
  leftAt: timestamp("left_at"),
  isActive: boolean("is_active").default(true),
  lastReadMessageId: varchar("last_read_message_id").references(() => messages.id),
  notificationPreferences: jsonb("notification_preferences"), // Email, push, etc.
}, (table) => ({
  conversationIdIdx: index("conversation_participants_conversation_id_idx").on(table.conversationId),
  participantIdIdx: index("conversation_participants_participant_id_idx").on(table.participantId),
  activeIdx: index("conversation_participants_active_idx").on(table.isActive),
  compositeIdx: index("conversation_participants_composite_idx").on(table.conversationId, table.participantId),
}));

// Security and Audit Tables for HIPAA Compliance

// Audit log for security monitoring and compliance
export const securityAuditLog = pgTable("security_audit_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  action: varchar("action").notNull(), // 'message_sent', 'message_read', 'file_accessed', 'login', etc.
  resourceType: varchar("resource_type").notNull(), // 'message', 'conversation', 'file', 'user'
  resourceId: varchar("resource_id"), // ID of the resource being accessed
  details: jsonb("details"), // Additional context about the action
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow(),
  severity: varchar("severity").default('info'), // 'info', 'warning', 'error', 'critical'
}, (table) => ({
  userIdIdx: index("audit_user_id_idx").on(table.userId),
  actionIdx: index("audit_action_idx").on(table.action),
  timestampIdx: index("audit_timestamp_idx").on(table.timestamp),
  resourceIdx: index("audit_resource_idx").on(table.resourceType, table.resourceId),
  severityIdx: index("audit_severity_idx").on(table.severity),
}));

// Message encryption key management
export const encryptionKeys = pgTable("encryption_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  keyHash: varchar("key_hash").notNull(), // Hashed version of encryption key
  algorithm: varchar("algorithm").default('AES-256-GCM'),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  activeIdx: index("encryption_keys_active_idx").on(table.isActive),
  expiryIdx: index("encryption_keys_expiry_idx").on(table.expiresAt),
}));

// Session security tracking for enhanced monitoring
export const securitySessions = pgTable("security_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  sessionToken: varchar("session_token").notNull(),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  deviceFingerprint: varchar("device_fingerprint"),
  isActive: boolean("is_active").default(true),
  lastActivity: timestamp("last_activity").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
}, (table) => ({
  userIdIdx: index("security_sessions_user_id_idx").on(table.userId),
  tokenIdx: index("security_sessions_token_idx").on(table.sessionToken),
  activeIdx: index("security_sessions_active_idx").on(table.isActive),
  activityIdx: index("security_sessions_activity_idx").on(table.lastActivity),
}));

// Step 3: User insights with exact Part 2 specification
export const userInsights = pgTable("user_insights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: insightTypeEnum("type").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  severity: insightSeverityEnum("severity").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  // Links to related data
  mealId: varchar("meal_id").references(() => mealLogs.id),
  readingId: varchar("reading_id").references(() => glucoseReadings.id),
  // Internal fields for caching and management
  priority: integer("priority").default(0), // Higher = more important
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at").notNull(), // TTL for caching
  category: varchar("category").default('7d'), // Store range for cache key
}, (table) => ({
  // Performance indices for <800ms recompute, <200ms cache hit
  userIdIdx: index("user_insights_user_id_idx").on(table.userId),
  userTimeIdx: index("user_insights_user_time_idx").on(table.userId, table.createdAt),
  userActiveIdx: index("user_insights_user_active_idx").on(table.userId, table.isActive),
  userPriorityIdx: index("user_insights_user_priority_idx").on(table.userId, table.priority),
  expiresIdx: index("user_insights_expires_idx").on(table.expiresAt),
  // Composite index for insights API queries (user + active + time range)
  queryOptimizedIdx: index("user_insights_query_opt_idx").on(table.userId, table.isActive, table.createdAt, table.priority)
}));

// Holistic Wellness Features

// Mood & wellbeing tracking
export const moodLogs = pgTable("mood_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  mood: moodEnum("mood").notNull(),
  stressLevel: stressLevelEnum("stress_level").notNull(),
  energyLevel: energyLevelEnum("energy_level").notNull(),
  relatedGlucoseReadingId: varchar("related_glucose_reading_id").references(() => glucoseReadings.id),
  loggedAt: timestamp("logged_at").defaultNow(),
  notes: text("notes"),
});

// Simplified Mood & Energy Insights tracking
export const userMoodLog = pgTable("user_mood_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  mood: text("mood").notNull(),
  energy: integer("energy").notNull(),
  timeOfDay: text("time_of_day").notNull(),
  supportiveMessage: text("supportive_message"),
  supportiveAction: text("supportive_action"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Sleep tracking
export const sleepLogs = pgTable("sleep_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  sleepDuration: decimal("sleep_duration", { precision: 4, scale: 2 }), // hours
  sleepQuality: sleepQualityEnum("sleep_quality").notNull(),
  bedtime: timestamp("bedtime"),
  wakeTime: timestamp("wake_time"),
  deepSleepDuration: decimal("deep_sleep_duration", { precision: 4, scale: 2 }),
  remSleepDuration: decimal("rem_sleep_duration", { precision: 4, scale: 2 }),
  loggedAt: timestamp("logged_at").defaultNow(),
  notes: text("notes"),
});

// Daily energy check-ins (separate from detailed sleep logs)
export const energyLogs = pgTable("energy_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  energyLevel: energyLevelEnum("energy_level").notNull(), // very_low, low, moderate, high, very_high
  date: varchar("date").notNull(), // YYYY-MM-DD format for daily check-ins
  loggedAt: timestamp("logged_at").defaultNow(),
  notes: text("notes"),
});

// Mindfulness & meditation sessions
export const mindfulnessSessions = pgTable("mindfulness_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: mindfulnessTypeEnum("type").notNull(),
  duration: integer("duration_minutes").notNull(),
  title: text("title"),
  description: text("description"),
  completedAt: timestamp("completed_at").defaultNow(),
  moodBefore: moodEnum("mood_before"),
  moodAfter: moodEnum("mood_after"),
  stressLevelBefore: stressLevelEnum("stress_level_before"),
  stressLevelAfter: stressLevelEnum("stress_level_after"),
  notes: text("notes"),
});

// Meditation library - available sessions for users to access
export const meditationLibrary = pgTable("meditation_library", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: mindfulnessTypeEnum("type").notNull(),
  duration: integer("duration_minutes").notNull(), // 2-10 minutes as specified
  audioUrl: text("audio_url").notNull(), // static file path for cost efficiency
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Journal entries
export const journalEntries = pgTable("journal_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title"),
  content: text("content").notNull(),
  gratitude: text("gratitude").array(),
  goals: text("goals").array(),
  reflections: text("reflections"),
  isPrivate: boolean("is_private").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Daily affirmations
export const dailyAffirmations = pgTable("daily_affirmations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  category: text("category"), // health, confidence, gratitude, resilience, etc.
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// User affirmation interactions
export const userAffirmations = pgTable("user_affirmations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  affirmationId: varchar("affirmation_id").notNull().references(() => dailyAffirmations.id),
  viewedAt: timestamp("viewed_at").defaultNow(),
  isFavorite: boolean("is_favorite").default(false),
  personalNote: text("personal_note"),
});

// Community support features (aligned with Prisma CommunityPost model)
export const communityPosts = pgTable("community_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: communityPostTypeEnum("type").notNull().default('general'), // Aligned with Prisma default
  title: text("title"), // Made optional to align better with simplified Prisma model
  content: text("content").notNull(), // Changed from varchar(280) to text to match Prisma String
  mealId: varchar("meal_id").references(() => meals.id), // Stage 10: Optional recipe linking
  tags: text("tags").array(),
  isAnonymous: boolean("is_anonymous").default(false),
  likesCount: integer("likes_count").default(0),
  commentsCount: integer("comments_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const communityComments: any = pgTable("community_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => communityPosts.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isAnonymous: boolean("is_anonymous").default(false),
  parentCommentId: varchar("parent_comment_id").references((): any => communityComments.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const communityLikes = pgTable("community_likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  postId: varchar("post_id").references(() => communityPosts.id),
  commentId: varchar("comment_id").references(() => communityComments.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Anonymous community reflections (Phase 4: Community Reflection Feed)
export const communityReflections = pgTable("community_reflections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(), // Max 200 chars enforced in validation
  mood: varchar("mood"), // Optional mood emoji/type
  encouragementCount: integer("encouragement_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(), // 48h auto-expire
});

export const communityReflectionEncouragements = pgTable("community_reflection_encouragements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reflectionId: varchar("reflection_id").notNull().references(() => communityReflections.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Community groups
export const communityGroups = pgTable("community_groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // diabetes, mindfulness, nutrition, movement, general
  isPrivate: boolean("is_private").default(false),
  maxMembers: integer("max_members").default(100),
  memberCount: integer("member_count").default(0),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  imageUrl: text("image_url"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Community group memberships
export const communityGroupMembers = pgTable("community_group_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").notNull().references(() => communityGroups.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: varchar("role").default('member'), // admin, moderator, member
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Phase 5: Guided Community Circles - Weekly discussion prompts
export const communityCircles = pgTable("community_circles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  prompt: text("prompt").notNull(),
  theme: text("theme").notNull(), // mindfulness, nutrition, challenges, gratitude, wellness
  weekStart: timestamp("week_start").notNull(),
  weekEnd: timestamp("week_end").notNull(),
  isActive: boolean("is_active").default(true),
  participantCount: integer("participant_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// User participation in circles
export const circleParticipations = pgTable("circle_participations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  circleId: varchar("circle_id").notNull().references(() => communityCircles.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  response: text("response").notNull(),
  isAnonymous: boolean("is_anonymous").default(false),
  likeCount: integer("like_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Expert Q&A sessions
export const expertQASessions = pgTable("expert_qa_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  expertName: text("expert_name").notNull(),
  expertTitle: text("expert_title").notNull(),
  expertBio: text("expert_bio"),
  expertImageUrl: text("expert_image_url"),
  scheduledAt: timestamp("scheduled_at").notNull(),
  duration: integer("duration_minutes").default(60),
  maxParticipants: integer("max_participants").default(100),
  currentParticipants: integer("current_participants").default(0),
  isLive: boolean("is_live").default(false),
  meetingUrl: text("meeting_url"),
  tags: text("tags").array(),
  isPremiumOnly: boolean("is_premium_only").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Expert Q&A session registrations
export const qaSessionRegistrations = pgTable("qa_session_registrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => expertQASessions.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  registeredAt: timestamp("registered_at").defaultNow(),
  attended: boolean("attended").default(false),
});

// Peer partnerships
export const peerPartnerships = pgTable("peer_partnerships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  initiatorId: varchar("initiator_id").notNull().references(() => users.id),
  partnerId: varchar("partner_id").notNull().references(() => users.id),
  status: varchar("status").default('pending'), // pending, active, completed, cancelled
  goals: text("goals").array(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  isAnonymous: boolean("is_anonymous").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Partnership check-ins
export const partnershipCheckIns = pgTable("partnership_check_ins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partnershipId: varchar("partnership_id").notNull().references(() => peerPartnerships.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  mood: moodEnum("mood"),
  progress: integer("progress"), // 1-10 scale
  createdAt: timestamp("created_at").defaultNow(),
});

// Health challenges
export const healthChallenges = pgTable("health_challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // mindfulness, nutrition, movement, glucose, sleep
  type: varchar("type").notNull(), // daily, weekly, monthly
  duration: integer("duration_days").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  goal: text("goal").notNull(),
  unit: text("unit"), // steps, minutes, servings, etc.
  targetValue: decimal("target_value", { precision: 10, scale: 2 }),
  participantCount: integer("participant_count").default(0),
  maxParticipants: integer("max_participants"),
  isPremiumOnly: boolean("is_premium_only").default(false),
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  imageUrl: text("image_url"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Challenge participations
export const challengeParticipations = pgTable("challenge_participations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  challengeId: varchar("challenge_id").notNull().references(() => healthChallenges.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  currentValue: decimal("current_value", { precision: 10, scale: 2 }).default('0'),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Challenge progress logs
export const challengeProgressLogs = pgTable("challenge_progress_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  participationId: varchar("participation_id").notNull().references(() => challengeParticipations.id),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  loggedAt: timestamp("logged_at").defaultNow(),
});

// Enhanced Community Building Features

// Community Mission & Guidelines
export const communityGuidelines = pgTable("community_guidelines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: varchar("type").notNull(), // mission, safety, ground_rules, confidentiality
  isActive: boolean("is_active").default(true),
  order: integer("order").default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Community Ambassador System
export const communityAmbassadors = pgTable("community_ambassadors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: communityRoleEnum("role").default('ambassador'),
  specialties: text("specialties").array(), // mindfulness, nutrition, movement, glucose_management
  bio: text("bio"),
  postsSeeded: integer("posts_seeded").default(0),
  membersHelped: integer("members_helped").default(0),
  isActive: boolean("is_active").default(true),
  appointedAt: timestamp("appointed_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Discussion Thread Templates
export const threadTemplates = pgTable("thread_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  promptQuestions: text("prompt_questions").array(),
  isActive: boolean("is_active").default(true),
  usageCount: integer("usage_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Crisis Response & Moderation
export const communityReports = pgTable("community_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reporterId: varchar("reporter_id").notNull().references(() => users.id),
  reportedUserId: varchar("reported_user_id").references(() => users.id),
  postId: varchar("post_id").references(() => communityPosts.id),
  commentId: varchar("comment_id").references(() => communityComments.id),
  reason: reportReasonEnum("reason").notNull(),
  description: text("description"),
  status: reportStatusEnum("status").default('pending'),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  resolution: text("resolution"),
  crisisLevel: crisisLevelEnum("crisis_level").default('low'),
  createdAt: timestamp("created_at").defaultNow(),
});

export const crisisSupports = pgTable("crisis_supports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  contactInfo: text("contact_info").notNull(),
  category: text("category").notNull(), // emergency, mental_health, diabetes, general
  isEmergency: boolean("is_emergency").default(false),
  region: text("region"), // for location-specific resources
  isActive: boolean("is_active").default(true),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Educational Workshops Integration
export const communityWorkshops = pgTable("community_workshops", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  educationContentId: varchar("education_content_id").references(() => educationContent.id),
  facilitatorId: varchar("facilitator_id").notNull().references(() => users.id),
  scheduledAt: timestamp("scheduled_at").notNull(),
  duration: integer("duration_minutes").default(60),
  maxParticipants: integer("max_participants").default(50),
  currentParticipants: integer("current_participants").default(0),
  status: workshopStatusEnum("status").default('draft'),
  meetingUrl: text("meeting_url"),
  materials: text("materials").array(),
  tags: text("tags").array(),
  isPremiumOnly: boolean("is_premium_only").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workshopParticipations = pgTable("workshop_participations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workshopId: varchar("workshop_id").notNull().references(() => communityWorkshops.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  registeredAt: timestamp("registered_at").defaultNow(),
  attended: boolean("attended").default(false),
  completedMaterials: text("completed_materials").array(),
  feedback: text("feedback"),
  rating: integer("rating"), // 1-5
});

// Feedback Collection & Adaptation System
export const communityFeedback = pgTable("community_feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: feedbackTypeEnum("type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category"), // community, content, features, partnerships
  priority: varchar("priority").default('medium'), // low, medium, high
  status: varchar("status").default('submitted'), // submitted, reviewed, in_progress, completed, declined
  assignedTo: varchar("assigned_to").references(() => users.id),
  response: text("response"),
  implementedAt: timestamp("implemented_at"),
  upvotes: integer("upvotes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const communityPolls = pgTable("community_polls", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  question: text("question").notNull(),
  options: text("options").array().notNull(),
  allowMultiple: boolean("allow_multiple").default(false),
  isAnonymous: boolean("is_anonymous").default(true),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const pollVotes = pgTable("poll_votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pollId: varchar("poll_id").notNull().references(() => communityPolls.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  selectedOptions: text("selected_options").array().notNull(),
  votedAt: timestamp("voted_at").defaultNow(),
});

// Partnership & Promotion Framework
export const communityPartnerships = pgTable("community_partnerships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationName: text("organization_name").notNull(),
  contactPerson: text("contact_person").notNull(),
  contactEmail: text("contact_email").notNull(),
  partnershipType: text("partnership_type").notNull(), // wellness_center, healthcare, nonprofit, education
  description: text("description").notNull(),
  website: text("website"),
  logoUrl: text("logo_url"),
  status: partnershipStatusEnum("status").default('pending'),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  benefits: text("benefits").array(),
  activities: text("activities").array(), // workshops, guest_posts, events, resources
  region: text("region"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const guestPosts = pgTable("guest_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partnershipId: varchar("partnership_id").references(() => communityPartnerships.id),
  authorName: text("author_name").notNull(),
  authorTitle: text("author_title"),
  authorBio: text("author_bio"),
  title: text("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  featuredImage: text("featured_image"),
  tags: text("tags").array(),
  isPublished: boolean("is_published").default(false),
  publishedAt: timestamp("published_at"),
  viewCount: integer("view_count").default(0),
  likesCount: integer("likes_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Community Invitations & Discovery
export const communityInvitations = pgTable("community_invitations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  inviterId: varchar("inviter_id").notNull().references(() => users.id),
  invitedEmail: text("invited_email").notNull(),
  invitedName: text("invited_name"),
  message: text("message"),
  groupId: varchar("group_id").references(() => communityGroups.id),
  challengeId: varchar("challenge_id").references(() => healthChallenges.id),
  token: text("token").notNull().unique(),
  isUsed: boolean("is_used").default(false),
  usedAt: timestamp("used_at"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});


// Meal plan items
export const mealPlanItems = pgTable("meal_plan_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mealPlanId: varchar("meal_plan_id").notNull().references(() => mealPlans.id),
  mealId: varchar("meal_id").notNull().references(() => meals.id),
  date: timestamp("date").notNull(),
  category: mealCategoryEnum("category").notNull(),
  order: integer("order").default(0),
});

// Health Planning Tables

// Preventive care tasks
export const preventiveCareTasks = pgTable("preventive_care_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: preventiveCareTypeEnum("type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date").notNull(),
  recurrenceMonths: integer("recurrence_months"), // null for one-time tasks
  status: taskStatusEnum("status").default('due'),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Health goals
export const goals = pgTable("goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  category: goalCategoryEnum("category").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  targetValue: decimal("target_value", { precision: 10, scale: 2 }).notNull(),
  unit: text("unit").notNull(), // mg/dL, %, lbs, steps, minutes, etc.
  currentValue: decimal("current_value", { precision: 10, scale: 2 }),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  status: goalStatusEnum("status").default('active'),
  createdAt: timestamp("created_at").defaultNow(),
});

// Goal progress logs
export const goalLogs = pgTable("goal_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  goalId: varchar("goal_id").notNull().references(() => goals.id),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  loggedAt: timestamp("logged_at").defaultNow(),
  notes: text("notes"),
});

// Medications
export const medications = pgTable("medications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  doseAmount: decimal("dose_amount", { precision: 10, scale: 2 }).notNull(),
  doseUnit: medicationDoseUnitEnum("dose_unit").notNull(),
  route: medicationRouteEnum("route").notNull(),
  prescribedBy: text("prescribed_by"), // Doctor name
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Medication schedules
export const medicationSchedules = pgTable("medication_schedules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  medicationId: varchar("medication_id").notNull().references(() => medications.id),
  times: text("times").array().notNull(), // ["08:00", "12:00", "18:00"]
  weekdays: integer("weekdays").array().notNull(), // [1,2,3,4,5,6,7] (1=Monday)
  timezone: text("timezone").default('UTC'),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Medication intake logs
export const medicationIntakes = pgTable("medication_intakes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  medicationId: varchar("medication_id").notNull().references(() => medications.id),
  scheduleId: varchar("schedule_id").references(() => medicationSchedules.id),
  takenAt: timestamp("taken_at").notNull(),
  status: varchar("status").default('taken'), // taken, skipped, delayed
  actualAmount: decimal("actual_amount", { precision: 10, scale: 2 }),
  notes: text("notes"),
});

// External appointments (different from consultations which are in-app)
export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  type: appointmentTypeEnum("type").notNull(),
  providerName: text("provider_name"), // External provider
  scheduledAt: timestamp("scheduled_at").notNull(),
  duration: integer("duration_minutes").default(30),
  location: text("location"),
  meetingUrl: text("meeting_url"),
  status: appointmentStatusEnum("status").default('scheduled'),
  notes: text("notes"),
  reminderMinutes: integer("reminder_minutes").default(60), // remind before appointment
  createdAt: timestamp("created_at").defaultNow(),
});

// Wellness plan templates
export const wellnessPlanTemplates = pgTable("wellness_plan_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  tags: text("tags").array(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// User wellness plans
export const userWellnessPlans = pgTable("user_wellness_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  templateId: varchar("template_id").references(() => wellnessPlanTemplates.id),
  name: text("name").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  status: varchar("status").default('active'), // active, completed, paused
  createdAt: timestamp("created_at").defaultNow(),
});

// Wellness plan tasks
export const wellnessPlanTasks = pgTable("wellness_plan_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  planId: varchar("plan_id").notNull().references(() => userWellnessPlans.id),
  title: text("title").notNull(),
  description: text("description"),
  type: wellnessTaskTypeEnum("type").notNull(),
  cadence: taskCadenceEnum("cadence").notNull(),
  weekdays: integer("weekdays").array(), // for weekly tasks
  dueTime: text("due_time"), // "09:00" for daily habits
  completedAt: timestamp("completed_at"),
  isCompleted: boolean("is_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Risk assessments
export const riskAssessments = pgTable("risk_assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: riskAssessmentTypeEnum("type").notNull(),
  input: jsonb("input").notNull(), // Store assessment questions/answers
  score: integer("score").notNull(),
  level: riskLevelEnum("level").notNull(),
  recommendations: text("recommendations").array(),
  assessedAt: timestamp("assessed_at").defaultNow(),
});

// Educational Library Tables
export const educationContent = pgTable("education_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content"), // Main content (HTML/markdown)
  type: educationContentTypeEnum("type").notNull(),
  category: educationCategoryEnum("category").notNull(),
  difficulty: difficultyLevelEnum("difficulty").notNull(),
  estimatedDuration: integer("estimated_duration_minutes"), // reading/watching time
  imageUrl: text("image_url"),
  videoUrl: text("video_url"),
  audioUrl: text("audio_url"),
  isPro: boolean("is_pro").default(false), // Pro subscription required
  tags: text("tags").array(),
  prerequisites: text("prerequisites").array(), // Required content IDs
  learningObjectives: text("learning_objectives").array(),
  author: text("author"),
  quizQuestions: jsonb("quiz_questions"), // Inline quiz questions: [{question, answers[], correctAnswer}]
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const educationProgress = pgTable("education_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  contentId: varchar("content_id").notNull().references(() => educationContent.id),
  status: progressStatusEnum("status").default('not_started'),
  progressPercentage: integer("progress_percentage").default(0),
  timeSpent: integer("time_spent_minutes").default(0),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  rating: integer("rating"), // 1-5 stars
  quizScore: integer("quiz_score"), // Points earned on quiz
  quizTotal: integer("quiz_total"), // Total possible points
  quizAttempts: integer("quiz_attempts").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const educationQuizzes = pgTable("education_quizzes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contentId: varchar("content_id").notNull().references(() => educationContent.id),
  title: text("title").notNull(),
  questions: jsonb("questions").notNull(), // Array of quiz questions
  passingScore: integer("passing_score").default(80),
  createdAt: timestamp("created_at").defaultNow(),
});

export const educationQuizAttempts = pgTable("education_quiz_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  quizId: varchar("quiz_id").notNull().references(() => educationQuizzes.id),
  answers: jsonb("answers").notNull(),
  score: integer("score").notNull(),
  passed: boolean("passed").default(false),
  completedAt: timestamp("completed_at").defaultNow(),
});

// Learning Paths Tables
export const learningPaths = pgTable("learning_paths", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  difficulty: varchar("difficulty").notNull(),
  estimatedDuration: text("estimated_duration"), // "4-6 weeks"
  isPro: boolean("is_pro").default(false),
  category: varchar("category").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const learningPathModules = pgTable("learning_path_modules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pathId: varchar("path_id").notNull().references(() => learningPaths.id),
  contentId: varchar("content_id").notNull().references(() => educationContent.id),
  moduleOrder: integer("module_order").notNull(), // 1, 2, 3...
  isRequired: boolean("is_required").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const learningPathProgress = pgTable("learning_path_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  pathId: varchar("path_id").notNull().references(() => learningPaths.id),
  status: progressStatusEnum("status").default('not_started'),
  currentModuleOrder: integer("current_module_order").default(1),
  completedModules: jsonb("completed_modules").default(sql`'[]'::jsonb`),
  totalModules: integer("total_modules").notNull(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Gamification Tables
export const userPoints = pgTable("user_points", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  totalPoints: integer("total_points").default(0),
  weeklyPoints: integer("weekly_points").default(0),
  monthlyPoints: integer("monthly_points").default(0),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastActivityDate: timestamp("last_activity_date"),
  level: integer("level").default(1),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const badges = pgTable("badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: badgeTypeEnum("type").notNull(),
  iconUrl: text("icon_url"),
  criteria: jsonb("criteria").notNull(), // Requirements to earn badge
  pointsAwarded: integer("points_awarded").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userBadges = pgTable("user_badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  badgeId: varchar("badge_id").notNull().references(() => badges.id),
  earnedAt: timestamp("earned_at").defaultNow(),
});

export const pointTransactions = pgTable("point_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  action: text("action").notNull(), // activity that earned points
  points: integer("points").notNull(),
  description: text("description"),
  referenceId: text("reference_id"), // reference to related record
  createdAt: timestamp("created_at").defaultNow(),
});

// Workout Library Tables
export const workoutCategories = pgTable("workout_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  iconUrl: text("icon_url"),
  order: integer("order").default(0),
});

export const workouts = pgTable("workouts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  categoryId: varchar("category_id").notNull().references(() => workoutCategories.id),
  difficulty: difficultyLevelEnum("difficulty").notNull(),
  duration: integer("duration_minutes").notNull(),
  caloriesBurned: integer("calories_burned_estimate"),
  equipmentNeeded: text("equipment_needed").array(),
  instructions: text("instructions").array(),
  videoUrl: text("video_url"),
  thumbnailUrl: text("thumbnail_url"),
  isPro: boolean("is_pro").default(false),
  tags: text("tags").array(),
  targetAudience: text("target_audience").array(), // seniors, beginners, etc
  createdAt: timestamp("created_at").defaultNow(),
});

export const workoutProgress = pgTable("workout_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  workoutId: varchar("workout_id").notNull().references(() => workouts.id),
  completedAt: timestamp("completed_at").defaultNow(),
  duration: integer("actual_duration_minutes"),
  caloriesBurned: integer("calories_burned"),
  difficulty: integer("user_difficulty_rating"), // 1-5
  notes: text("notes"),
});

// Community Hub Tables (MVP - wellness-safe, moderated)
export const communityPost = pgTable("community_post", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  kind: communityPostKindEnum("kind").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  isPublished: boolean("is_published").default(false),
}, (table) => ({
  publishedIdx: index("community_post_published_idx").on(table.isPublished, table.createdAt),
}));

export const communityReaction = pgTable("community_reaction", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => communityPost.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id),
  kind: communityReactionKindEnum("kind").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueReaction: index("community_reaction_unique_idx").on(table.postId, table.userId, table.kind),
}));

// Pre-diabetes Risk Assessment Tables
export const riskAssessmentTemplates = pgTable("risk_assessment_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  questions: jsonb("questions").notNull(), // Array of assessment questions
  scoringRules: jsonb("scoring_rules").notNull(),
  riskLevels: jsonb("risk_levels").notNull(), // Define risk level thresholds
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userRiskAssessments = pgTable("user_risk_assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  templateId: varchar("template_id").notNull().references(() => riskAssessmentTemplates.id),
  responses: jsonb("responses").notNull(),
  score: integer("score").notNull(),
  riskLevel: riskLevelEnum("risk_level").notNull(),
  recommendations: text("recommendations").array(),
  completedAt: timestamp("completed_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  mealLogs: many(mealLogs),
  glucoseReadings: many(glucoseReadings),
  exerciseLogs: many(exerciseLogs),
  consultations: many(consultations),
  mealPlans: many(mealPlans),
  chatMessages: many(chatMessages),
  userInsights: many(userInsights),
  // Holistic wellness relations
  moodLogs: many(moodLogs),
  sleepLogs: many(sleepLogs),
  hydrationLogs: many(hydrationLogs),
  bmLogs: many(bmLogs),
  mindfulnessSessions: many(mindfulnessSessions),
  journalEntries: many(journalEntries),
  userAffirmations: many(userAffirmations),
  communityPosts: many(communityPosts),
  communityComments: many(communityComments),
  communityLikes: many(communityLikes),
  // Community features relations
  createdGroups: many(communityGroups),
  groupMemberships: many(communityGroupMembers),
  qaRegistrations: many(qaSessionRegistrations),
  initiatedPartnerships: many(peerPartnerships),
  partnershipCheckIns: many(partnershipCheckIns),
  createdChallenges: many(healthChallenges),
  challengeParticipations: many(challengeParticipations),
  // Health planning relations
  preventiveCareTasks: many(preventiveCareTasks),
  goals: many(goals),
  medications: many(medications),
  medicationIntakes: many(medicationIntakes),
  appointments: many(appointments),
  userWellnessPlans: many(userWellnessPlans),
  riskAssessments: many(riskAssessments),
}));

export const mealsRelations = relations(meals, ({ many }) => ({
  mealLogs: many(mealLogs),
  mealPlanItems: many(mealPlanItems),
}));

export const mealLogsRelations = relations(mealLogs, ({ one, many }) => ({
  user: one(users, { fields: [mealLogs.userId], references: [users.id] }),
  meal: one(meals, { fields: [mealLogs.mealId], references: [meals.id] }),
  glucoseReadings: many(glucoseReadings),
}));

export const glucoseReadingsRelations = relations(glucoseReadings, ({ one }) => ({
  user: one(users, { fields: [glucoseReadings.userId], references: [users.id] }),
  relatedMealLog: one(mealLogs, { fields: [glucoseReadings.relatedMealLogId], references: [mealLogs.id] }),
}));

export const exerciseLogsRelations = relations(exerciseLogs, ({ one }) => ({
  user: one(users, { fields: [exerciseLogs.userId], references: [users.id] }),
}));

export const consultationsRelations = relations(consultations, ({ one }) => ({
  user: one(users, { fields: [consultations.userId], references: [users.id] }),
  provider: one(healthcareProviders, { fields: [consultations.providerId], references: [healthcareProviders.id] }),
}));

export const mealPlansRelations = relations(mealPlans, ({ one, many }) => ({
  user: one(users, { fields: [mealPlans.userId], references: [users.id] }),
  mealPlanItems: many(mealPlanItems),
}));

export const mealPlanItemsRelations = relations(mealPlanItems, ({ one }) => ({
  mealPlan: one(mealPlans, { fields: [mealPlanItems.mealPlanId], references: [mealPlans.id] }),
  meal: one(meals, { fields: [mealPlanItems.mealId], references: [meals.id] }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  user: one(users, { fields: [chatMessages.userId], references: [users.id] }),
}));

export const userInsightsRelations = relations(userInsights, ({ one }) => ({
  user: one(users, { fields: [userInsights.userId], references: [users.id] }),
}));

// Holistic Wellness Relations
export const moodLogsRelations = relations(moodLogs, ({ one }) => ({
  user: one(users, { fields: [moodLogs.userId], references: [users.id] }),
  relatedGlucoseReading: one(glucoseReadings, { fields: [moodLogs.relatedGlucoseReadingId], references: [glucoseReadings.id] }),
}));

export const userMoodLogRelations = relations(userMoodLog, ({ one }) => ({
  user: one(users, { fields: [userMoodLog.userId], references: [users.id] }),
}));

export const sleepLogsRelations = relations(sleepLogs, ({ one }) => ({
  user: one(users, { fields: [sleepLogs.userId], references: [users.id] }),
}));

export const energyLogsRelations = relations(energyLogs, ({ one }) => ({
  user: one(users, { fields: [energyLogs.userId], references: [users.id] }),
}));

export const mindfulnessSessionsRelations = relations(mindfulnessSessions, ({ one }) => ({
  user: one(users, { fields: [mindfulnessSessions.userId], references: [users.id] }),
}));

export const journalEntriesRelations = relations(journalEntries, ({ one }) => ({
  user: one(users, { fields: [journalEntries.userId], references: [users.id] }),
}));

export const userAffirmationsRelations = relations(userAffirmations, ({ one }) => ({
  user: one(users, { fields: [userAffirmations.userId], references: [users.id] }),
  affirmation: one(dailyAffirmations, { fields: [userAffirmations.affirmationId], references: [dailyAffirmations.id] }),
}));

export const dailyAffirmationsRelations = relations(dailyAffirmations, ({ many }) => ({
  userAffirmations: many(userAffirmations),
}));

export const communityPostsRelations = relations(communityPosts, ({ one, many }) => ({
  user: one(users, { fields: [communityPosts.userId], references: [users.id] }),
  meal: one(meals, { fields: [communityPosts.mealId], references: [meals.id] }),
  comments: many(communityComments),
  likes: many(communityLikes),
}));

export const communityCommentsRelations = relations(communityComments, ({ one, many }) => ({
  post: one(communityPosts, { fields: [communityComments.postId], references: [communityPosts.id] }),
  user: one(users, { fields: [communityComments.userId], references: [users.id] }),
  parentComment: one(communityComments, { fields: [communityComments.parentCommentId], references: [communityComments.id] }),
  replies: many(communityComments),
  likes: many(communityLikes),
}));

export const communityLikesRelations = relations(communityLikes, ({ one }) => ({
  user: one(users, { fields: [communityLikes.userId], references: [users.id] }),
  post: one(communityPosts, { fields: [communityLikes.postId], references: [communityPosts.id] }),
  comment: one(communityComments, { fields: [communityLikes.commentId], references: [communityComments.id] }),
}));

export const communityGroupsRelations = relations(communityGroups, ({ one, many }) => ({
  createdByUser: one(users, { fields: [communityGroups.createdBy], references: [users.id] }),
  members: many(communityGroupMembers),
}));

export const communityGroupMembersRelations = relations(communityGroupMembers, ({ one }) => ({
  group: one(communityGroups, { fields: [communityGroupMembers.groupId], references: [communityGroups.id] }),
  user: one(users, { fields: [communityGroupMembers.userId], references: [users.id] }),
}));

export const expertQASessionsRelations = relations(expertQASessions, ({ many }) => ({
  registrations: many(qaSessionRegistrations),
}));

export const qaSessionRegistrationsRelations = relations(qaSessionRegistrations, ({ one }) => ({
  session: one(expertQASessions, { fields: [qaSessionRegistrations.sessionId], references: [expertQASessions.id] }),
  user: one(users, { fields: [qaSessionRegistrations.userId], references: [users.id] }),
}));

export const peerPartnershipsRelations = relations(peerPartnerships, ({ one, many }) => ({
  initiator: one(users, { fields: [peerPartnerships.initiatorId], references: [users.id] }),
  partner: one(users, { fields: [peerPartnerships.partnerId], references: [users.id] }),
  checkIns: many(partnershipCheckIns),
}));

export const partnershipCheckInsRelations = relations(partnershipCheckIns, ({ one }) => ({
  partnership: one(peerPartnerships, { fields: [partnershipCheckIns.partnershipId], references: [peerPartnerships.id] }),
  user: one(users, { fields: [partnershipCheckIns.userId], references: [users.id] }),
}));

export const healthChallengesRelations = relations(healthChallenges, ({ one, many }) => ({
  createdByUser: one(users, { fields: [healthChallenges.createdBy], references: [users.id] }),
  participations: many(challengeParticipations),
}));

export const challengeParticipationsRelations = relations(challengeParticipations, ({ one, many }) => ({
  challenge: one(healthChallenges, { fields: [challengeParticipations.challengeId], references: [healthChallenges.id] }),
  user: one(users, { fields: [challengeParticipations.userId], references: [users.id] }),
  progressLogs: many(challengeProgressLogs),
}));

export const challengeProgressLogsRelations = relations(challengeProgressLogs, ({ one }) => ({
  participation: one(challengeParticipations, { fields: [challengeProgressLogs.participationId], references: [challengeParticipations.id] }),
}));

// Health Planning Relations
export const preventiveCareTasksRelations = relations(preventiveCareTasks, ({ one }) => ({
  user: one(users, { fields: [preventiveCareTasks.userId], references: [users.id] }),
}));

export const goalsRelations = relations(goals, ({ one, many }) => ({
  user: one(users, { fields: [goals.userId], references: [users.id] }),
  goalLogs: many(goalLogs),
}));

export const goalLogsRelations = relations(goalLogs, ({ one }) => ({
  goal: one(goals, { fields: [goalLogs.goalId], references: [goals.id] }),
}));

export const medicationsRelations = relations(medications, ({ one, many }) => ({
  user: one(users, { fields: [medications.userId], references: [users.id] }),
  schedules: many(medicationSchedules),
  intakes: many(medicationIntakes),
}));

export const medicationSchedulesRelations = relations(medicationSchedules, ({ one }) => ({
  medication: one(medications, { fields: [medicationSchedules.medicationId], references: [medications.id] }),
}));

export const medicationIntakesRelations = relations(medicationIntakes, ({ one }) => ({
  medication: one(medications, { fields: [medicationIntakes.medicationId], references: [medications.id] }),
  schedule: one(medicationSchedules, { fields: [medicationIntakes.scheduleId], references: [medicationSchedules.id] }),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  user: one(users, { fields: [appointments.userId], references: [users.id] }),
}));

export const wellnessPlanTemplatesRelations = relations(wellnessPlanTemplates, ({ many }) => ({
  userPlans: many(userWellnessPlans),
}));

export const userWellnessPlansRelations = relations(userWellnessPlans, ({ one, many }) => ({
  user: one(users, { fields: [userWellnessPlans.userId], references: [users.id] }),
  template: one(wellnessPlanTemplates, { fields: [userWellnessPlans.templateId], references: [wellnessPlanTemplates.id] }),
  tasks: many(wellnessPlanTasks),
}));

export const wellnessPlanTasksRelations = relations(wellnessPlanTasks, ({ one }) => ({
  plan: one(userWellnessPlans, { fields: [wellnessPlanTasks.planId], references: [userWellnessPlans.id] }),
}));

export const riskAssessmentsRelations = relations(riskAssessments, ({ one }) => ({
  user: one(users, { fields: [riskAssessments.userId], references: [users.id] }),
}));

// Community Hub Relations
export const communityPostRelations = relations(communityPost, ({ one, many }) => ({
  user: one(users, { fields: [communityPost.userId], references: [users.id] }),
  reactions: many(communityReaction),
}));

export const communityReactionRelations = relations(communityReaction, ({ one }) => ({
  post: one(communityPost, { fields: [communityReaction.postId], references: [communityPost.id] }),
  user: one(users, { fields: [communityReaction.userId], references: [users.id] }),
}));

// Insert schemas
export const insertMealSchema = createInsertSchema(meals).omit({ id: true, createdAt: true });
export const insertMealLogSchema = createInsertSchema(mealLogs).omit({ id: true, loggedAt: true });
export const insertGlucoseReadingSchema = createInsertSchema(glucoseReadings).omit({ id: true, takenAt: true, createdAt: true });
export const insertExerciseLogSchema = createInsertSchema(exerciseLogs).omit({ id: true, loggedAt: true });
export const insertConsultationSchema = createInsertSchema(consultations).omit({ id: true, createdAt: true });
export const insertMealPlanSchema = createInsertSchema(mealPlans).omit({ id: true, createdAt: true });
export const insertHealthcareProviderSchema = createInsertSchema(healthcareProviders).omit({ id: true, createdAt: true });
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, createdAt: true });
export const insertUserInsightSchema = createInsertSchema(userInsights).omit({ id: true, createdAt: true });

// Holistic Wellness Insert Schemas
export const insertMoodLogSchema = createInsertSchema(moodLogs).omit({ id: true, loggedAt: true });
export const insertUserMoodLogSchema = createInsertSchema(userMoodLog).omit({ id: true, createdAt: true });
export const insertSleepLogSchema = createInsertSchema(sleepLogs).omit({ id: true, loggedAt: true });
export const insertEnergyLogSchema = createInsertSchema(energyLogs).omit({ id: true, loggedAt: true });
export const insertMindfulnessSessionSchema = createInsertSchema(mindfulnessSessions).omit({ id: true, completedAt: true });
export const insertMeditationLibrarySchema = createInsertSchema(meditationLibrary).omit({ id: true, createdAt: true });
export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDailyAffirmationSchema = createInsertSchema(dailyAffirmations).omit({ id: true, createdAt: true });
export const insertUserAffirmationSchema = createInsertSchema(userAffirmations).omit({ id: true, viewedAt: true });
export const insertCommunityPostSchema = createInsertSchema(communityPosts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCommunityReflectionSchema = createInsertSchema(communityReflections).omit({ id: true, createdAt: true });
export const insertCommunityReflectionEncouragementSchema = createInsertSchema(communityReflectionEncouragements).omit({ id: true, createdAt: true });

// Community Hub Insert Schemas (MVP)
export const insertCommunityPostHubSchema = createInsertSchema(communityPost).omit({ id: true, createdAt: true });
export const insertCommunityReactionSchema = createInsertSchema(communityReaction).omit({ id: true, createdAt: true });
export const insertCommunityCommentSchema = createInsertSchema(communityComments).omit({ id: true, createdAt: true });
export const insertCommunityLikeSchema = createInsertSchema(communityLikes).omit({ id: true, createdAt: true });

// Community Features Insert Schemas
export const insertCommunityGroupSchema = createInsertSchema(communityGroups).omit({ id: true, createdAt: true });
export const insertCommunityGroupMemberSchema = createInsertSchema(communityGroupMembers).omit({ id: true, joinedAt: true });

// Phase 5: Guided Community Circles Insert Schemas
export const insertCommunityCircleSchema = createInsertSchema(communityCircles).omit({ id: true, createdAt: true });
export const insertCircleParticipationSchema = createInsertSchema(circleParticipations).omit({ id: true, createdAt: true });

export const insertExpertQASessionSchema = createInsertSchema(expertQASessions).omit({ id: true, createdAt: true });
export const insertQASessionRegistrationSchema = createInsertSchema(qaSessionRegistrations).omit({ id: true, registeredAt: true });
export const insertPeerPartnershipSchema = createInsertSchema(peerPartnerships).omit({ id: true, createdAt: true });
export const insertPartnershipCheckInSchema = createInsertSchema(partnershipCheckIns).omit({ id: true, createdAt: true });
export const insertHealthChallengeSchema = createInsertSchema(healthChallenges).omit({ id: true, createdAt: true });
export const insertChallengeParticipationSchema = createInsertSchema(challengeParticipations).omit({ id: true, joinedAt: true });
export const insertChallengeProgressLogSchema = createInsertSchema(challengeProgressLogs).omit({ id: true, loggedAt: true });

// Health Planning Insert Schemas
export const insertPreventiveCareTaskSchema = createInsertSchema(preventiveCareTasks).omit({ id: true, createdAt: true });
export const insertGoalSchema = createInsertSchema(goals).omit({ id: true, createdAt: true });
export const insertGoalLogSchema = createInsertSchema(goalLogs).omit({ id: true, loggedAt: true });
export const insertMedicationSchema = createInsertSchema(medications).omit({ id: true, createdAt: true });
export const insertMedicationScheduleSchema = createInsertSchema(medicationSchedules).omit({ id: true, createdAt: true });
export const insertMedicationIntakeSchema = createInsertSchema(medicationIntakes).omit({ id: true });
export const insertAppointmentSchema = createInsertSchema(appointments).omit({ id: true, createdAt: true });
export const insertWellnessPlanTemplateSchema = createInsertSchema(wellnessPlanTemplates).omit({ id: true, createdAt: true });
export const insertUserWellnessPlanSchema = createInsertSchema(userWellnessPlans).omit({ id: true, createdAt: true });
export const insertWellnessPlanTaskSchema = createInsertSchema(wellnessPlanTasks).omit({ id: true, createdAt: true });
export const insertRiskAssessmentSchema = createInsertSchema(riskAssessments).omit({ id: true, assessedAt: true });

// Educational Library Insert Schemas
export const insertEducationContentSchema = createInsertSchema(educationContent).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEducationProgressSchema = createInsertSchema(educationProgress).omit({ id: true, completedAt: true, createdAt: true, updatedAt: true });
export const insertEducationQuizSchema = createInsertSchema(educationQuizzes).omit({ id: true, createdAt: true });
export const insertEducationQuizAttemptSchema = createInsertSchema(educationQuizAttempts).omit({ id: true, completedAt: true });

// Learning Paths Insert Schemas
export const insertLearningPathSchema = createInsertSchema(learningPaths).omit({ id: true, createdAt: true, updatedAt: true });
export const insertLearningPathModuleSchema = createInsertSchema(learningPathModules).omit({ id: true, createdAt: true });
export const insertLearningPathProgressSchema = createInsertSchema(learningPathProgress).omit({ id: true, startedAt: true, completedAt: true, updatedAt: true });

// Gamification Insert Schemas
export const insertUserPointsSchema = createInsertSchema(userPoints).omit({ id: true, updatedAt: true });
export const insertBadgeSchema = createInsertSchema(badges).omit({ id: true, createdAt: true });
export const insertUserBadgeSchema = createInsertSchema(userBadges).omit({ id: true, earnedAt: true });
export const insertPointTransactionSchema = createInsertSchema(pointTransactions).omit({ id: true, createdAt: true });

// Workout Library Insert Schemas
export const insertWorkoutCategorySchema = createInsertSchema(workoutCategories).omit({ id: true });
export const insertWorkoutSchema = createInsertSchema(workouts).omit({ id: true, createdAt: true });
export const insertWorkoutProgressSchema = createInsertSchema(workoutProgress).omit({ id: true, completedAt: true });

// Risk Assessment Insert Schemas
export const insertRiskAssessmentTemplateSchema = createInsertSchema(riskAssessmentTemplates).omit({ id: true, createdAt: true });
export const insertUserRiskAssessmentSchema = createInsertSchema(userRiskAssessments).omit({ id: true, completedAt: true });

// Security and Audit Insert Schemas
export const insertSecurityAuditLogSchema = createInsertSchema(securityAuditLog).omit({ id: true, timestamp: true });
export const insertEncryptionKeySchema = createInsertSchema(encryptionKeys).omit({ id: true, createdAt: true });
export const insertSecuritySessionSchema = createInsertSchema(securitySessions).omit({ id: true, createdAt: true, lastActivity: true });

// User insert schema
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });

// Types
export type UpsertUser = typeof users.$inferInsert;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Meal = typeof meals.$inferSelect;
export type InsertMeal = z.infer<typeof insertMealSchema>;
export type MealLog = typeof mealLogs.$inferSelect;
export type InsertMealLog = z.infer<typeof insertMealLogSchema>;
export type GlucoseReading = typeof glucoseReadings.$inferSelect;
export type InsertGlucoseReading = z.infer<typeof insertGlucoseReadingSchema>;
export type ExerciseLog = typeof exerciseLogs.$inferSelect;
export type InsertExerciseLog = z.infer<typeof insertExerciseLogSchema>;
export type Consultation = typeof consultations.$inferSelect;
export type InsertConsultation = z.infer<typeof insertConsultationSchema>;
export type HealthcareProvider = typeof healthcareProviders.$inferSelect;
export type InsertHealthcareProvider = z.infer<typeof insertHealthcareProviderSchema>;
export type MealPlan = typeof mealPlans.$inferSelect;
export type InsertMealPlan = z.infer<typeof insertMealPlanSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type UserInsight = typeof userInsights.$inferSelect;
export type InsertUserInsight = z.infer<typeof insertUserInsightSchema>;

// Holistic Wellness Types
export type MoodLog = typeof moodLogs.$inferSelect;
export type InsertMoodLog = z.infer<typeof insertMoodLogSchema>;
export type UserMoodLog = typeof userMoodLog.$inferSelect;
export type InsertUserMoodLog = z.infer<typeof insertUserMoodLogSchema>;
export type SleepLog = typeof sleepLogs.$inferSelect;
export type InsertSleepLog = z.infer<typeof insertSleepLogSchema>;
export type EnergyLog = typeof energyLogs.$inferSelect;
export type InsertEnergyLog = z.infer<typeof insertEnergyLogSchema>;
export type MindfulnessSession = typeof mindfulnessSessions.$inferSelect;
export type InsertMindfulnessSession = z.infer<typeof insertMindfulnessSessionSchema>;
export type MeditationLibrary = typeof meditationLibrary.$inferSelect;
export type InsertMeditationLibrary = z.infer<typeof insertMeditationLibrarySchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type DailyAffirmation = typeof dailyAffirmations.$inferSelect;
export type InsertDailyAffirmation = z.infer<typeof insertDailyAffirmationSchema>;
export type UserAffirmation = typeof userAffirmations.$inferSelect;
export type InsertUserAffirmation = z.infer<typeof insertUserAffirmationSchema>;
export type CommunityPost = typeof communityPosts.$inferSelect;
// Community Hub Types (MVP)
export type CommunityPostHub = typeof communityPost.$inferSelect;
export type InsertCommunityPostHub = z.infer<typeof insertCommunityPostHubSchema>;
export type CommunityReaction = typeof communityReaction.$inferSelect;
export type InsertCommunityReaction = z.infer<typeof insertCommunityReactionSchema>;
export type InsertCommunityPost = z.infer<typeof insertCommunityPostSchema>;
export type CommunityReflection = typeof communityReflections.$inferSelect;
export type InsertCommunityReflection = z.infer<typeof insertCommunityReflectionSchema>;
export type CommunityReflectionEncouragement = typeof communityReflectionEncouragements.$inferSelect;
export type InsertCommunityReflectionEncouragement = z.infer<typeof insertCommunityReflectionEncouragementSchema>;
export type CommunityComment = typeof communityComments.$inferSelect;
export type InsertCommunityComment = z.infer<typeof insertCommunityCommentSchema>;
export type CommunityLike = typeof communityLikes.$inferSelect;
export type InsertCommunityLike = z.infer<typeof insertCommunityLikeSchema>;

// Community Features Types
export type CommunityGroup = typeof communityGroups.$inferSelect;
export type InsertCommunityGroup = z.infer<typeof insertCommunityGroupSchema>;
export type CommunityGroupMember = typeof communityGroupMembers.$inferSelect;
export type InsertCommunityGroupMember = z.infer<typeof insertCommunityGroupMemberSchema>;

// Phase 5: Guided Community Circles Types
export type CommunityCircle = typeof communityCircles.$inferSelect;
export type InsertCommunityCircle = z.infer<typeof insertCommunityCircleSchema>;
export type CircleParticipation = typeof circleParticipations.$inferSelect;
export type InsertCircleParticipation = z.infer<typeof insertCircleParticipationSchema>;

export type ExpertQASession = typeof expertQASessions.$inferSelect;
export type InsertExpertQASession = z.infer<typeof insertExpertQASessionSchema>;
export type QASessionRegistration = typeof qaSessionRegistrations.$inferSelect;
export type InsertQASessionRegistration = z.infer<typeof insertQASessionRegistrationSchema>;
export type PeerPartnership = typeof peerPartnerships.$inferSelect;
export type InsertPeerPartnership = z.infer<typeof insertPeerPartnershipSchema>;
export type PartnershipCheckIn = typeof partnershipCheckIns.$inferSelect;
export type InsertPartnershipCheckIn = z.infer<typeof insertPartnershipCheckInSchema>;
export type HealthChallenge = typeof healthChallenges.$inferSelect;
export type InsertHealthChallenge = z.infer<typeof insertHealthChallengeSchema>;
export type ChallengeParticipation = typeof challengeParticipations.$inferSelect;
export type InsertChallengeParticipation = z.infer<typeof insertChallengeParticipationSchema>;
export type ChallengeProgressLog = typeof challengeProgressLogs.$inferSelect;
export type InsertChallengeProgressLog = z.infer<typeof insertChallengeProgressLogSchema>;

// Health Planning Types
export type PreventiveCareTask = typeof preventiveCareTasks.$inferSelect;
export type InsertPreventiveCareTask = z.infer<typeof insertPreventiveCareTaskSchema>;
export type Goal = typeof goals.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type GoalLog = typeof goalLogs.$inferSelect;
export type InsertGoalLog = z.infer<typeof insertGoalLogSchema>;
export type Medication = typeof medications.$inferSelect;
export type InsertMedication = z.infer<typeof insertMedicationSchema>;
export type MedicationSchedule = typeof medicationSchedules.$inferSelect;
export type InsertMedicationSchedule = z.infer<typeof insertMedicationScheduleSchema>;
export type MedicationIntake = typeof medicationIntakes.$inferSelect;
export type InsertMedicationIntake = z.infer<typeof insertMedicationIntakeSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type WellnessPlanTemplate = typeof wellnessPlanTemplates.$inferSelect;
export type InsertWellnessPlanTemplate = z.infer<typeof insertWellnessPlanTemplateSchema>;
export type UserWellnessPlan = typeof userWellnessPlans.$inferSelect;
export type InsertUserWellnessPlan = z.infer<typeof insertUserWellnessPlanSchema>;
export type WellnessPlanTask = typeof wellnessPlanTasks.$inferSelect;
export type InsertWellnessPlanTask = z.infer<typeof insertWellnessPlanTaskSchema>;
export type RiskAssessment = typeof riskAssessments.$inferSelect;
export type InsertRiskAssessment = z.infer<typeof insertRiskAssessmentSchema>;

// Educational Library Types
export type EducationContent = typeof educationContent.$inferSelect;
export type InsertEducationContent = z.infer<typeof insertEducationContentSchema>;
export type EducationProgress = typeof educationProgress.$inferSelect;
export type InsertEducationProgress = z.infer<typeof insertEducationProgressSchema>;
export type EducationQuiz = typeof educationQuizzes.$inferSelect;
export type InsertEducationQuiz = z.infer<typeof insertEducationQuizSchema>;
export type EducationQuizAttempt = typeof educationQuizAttempts.$inferSelect;
export type InsertEducationQuizAttempt = z.infer<typeof insertEducationQuizAttemptSchema>;

// Learning Paths Types
export type LearningPath = typeof learningPaths.$inferSelect;
export type InsertLearningPath = z.infer<typeof insertLearningPathSchema>;
export type LearningPathModule = typeof learningPathModules.$inferSelect;
export type InsertLearningPathModule = z.infer<typeof insertLearningPathModuleSchema>;
export type LearningPathProgress = typeof learningPathProgress.$inferSelect;
export type InsertLearningPathProgress = z.infer<typeof insertLearningPathProgressSchema>;

// Gamification Types
export type UserPoints = typeof userPoints.$inferSelect;
export type InsertUserPoints = z.infer<typeof insertUserPointsSchema>;
export type Badge = typeof badges.$inferSelect;
export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;
export type PointTransaction = typeof pointTransactions.$inferSelect;
export type InsertPointTransaction = z.infer<typeof insertPointTransactionSchema>;

// Workout Library Types
export type WorkoutCategory = typeof workoutCategories.$inferSelect;
export type InsertWorkoutCategory = z.infer<typeof insertWorkoutCategorySchema>;
export type Workout = typeof workouts.$inferSelect;
export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;
export type WorkoutProgress = typeof workoutProgress.$inferSelect;
export type InsertWorkoutProgress = z.infer<typeof insertWorkoutProgressSchema>;

// Risk Assessment Types
export type RiskAssessmentTemplate = typeof riskAssessmentTemplates.$inferSelect;
export type InsertRiskAssessmentTemplate = z.infer<typeof insertRiskAssessmentTemplateSchema>;
export type UserRiskAssessment = typeof userRiskAssessments.$inferSelect;
export type InsertUserRiskAssessment = z.infer<typeof insertUserRiskAssessmentSchema>;

// Security and Audit Types
export type SecurityAuditLog = typeof securityAuditLog.$inferSelect;
export type InsertSecurityAuditLog = z.infer<typeof insertSecurityAuditLogSchema>;
export type EncryptionKey = typeof encryptionKeys.$inferSelect;
export type InsertEncryptionKey = z.infer<typeof insertEncryptionKeySchema>;
export type SecuritySession = typeof securitySessions.$inferSelect;
export type InsertSecuritySession = z.infer<typeof insertSecuritySessionSchema>;

// Enhanced Community Building Insert Schemas
export const insertCommunityGuidelinesSchema = createInsertSchema(communityGuidelines).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCommunityAmbassadorSchema = createInsertSchema(communityAmbassadors).omit({ id: true, appointedAt: true, createdAt: true });
export const insertThreadTemplateSchema = createInsertSchema(threadTemplates).omit({ id: true, createdAt: true });
export const insertCommunityReportSchema = createInsertSchema(communityReports).omit({ id: true, createdAt: true });
export const insertCrisisSupportSchema = createInsertSchema(crisisSupports).omit({ id: true, createdAt: true });
export const insertCommunityWorkshopSchema = createInsertSchema(communityWorkshops).omit({ id: true, createdAt: true });
export const insertWorkshopParticipationSchema = createInsertSchema(workshopParticipations).omit({ id: true, registeredAt: true });
export const insertCommunityFeedbackSchema = createInsertSchema(communityFeedback).omit({ id: true, createdAt: true });
export const insertCommunityPollSchema = createInsertSchema(communityPolls).omit({ id: true, createdAt: true });
export const insertPollVoteSchema = createInsertSchema(pollVotes).omit({ id: true, votedAt: true });
export const insertCommunityPartnershipSchema = createInsertSchema(communityPartnerships).omit({ id: true, createdAt: true });
export const insertGuestPostSchema = createInsertSchema(guestPosts).omit({ id: true, createdAt: true });
export const insertCommunityInvitationSchema = createInsertSchema(communityInvitations).omit({ id: true, createdAt: true });

// Stage 4: Retention & Delight Insert Schemas
export const insertDailyReflectionSchema = createInsertSchema(dailyReflections).omit({ id: true, submittedAt: true, createdAt: true });
export const insertDataExportSchema = createInsertSchema(dataExports).omit({ id: true, createdAt: true, completedAt: true });
// export const insertAnalyticsEventSchema = createInsertSchema(analyticsEvents).omit({ id: true, timestamp: true });

// Phase 5: Insight History Insert Schema
export const insertInsightHistorySchema = createInsertSchema(insightHistory).omit({ id: true, shownAt: true });

// Secure Healthcare Messaging Insert Schemas
export const insertConversationSchema = createInsertSchema(conversations).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, sentAt: true, createdAt: true });
export const insertMessageAttachmentSchema = createInsertSchema(messageAttachments).omit({ id: true, uploadedAt: true });
export const insertMessageRecipientSchema = createInsertSchema(messageRecipients).omit({ id: true, createdAt: true });
export const insertConversationParticipantSchema = createInsertSchema(conversationParticipants).omit({ id: true, joinedAt: true });

// Enhanced Community Building Types
export type CommunityGuideline = typeof communityGuidelines.$inferSelect;
export type InsertCommunityGuideline = z.infer<typeof insertCommunityGuidelinesSchema>;
export type CommunityAmbassador = typeof communityAmbassadors.$inferSelect;
export type InsertCommunityAmbassador = z.infer<typeof insertCommunityAmbassadorSchema>;
export type ThreadTemplate = typeof threadTemplates.$inferSelect;
export type InsertThreadTemplate = z.infer<typeof insertThreadTemplateSchema>;
export type CommunityReport = typeof communityReports.$inferSelect;
export type InsertCommunityReport = z.infer<typeof insertCommunityReportSchema>;
export type CrisisSupport = typeof crisisSupports.$inferSelect;
export type InsertCrisisSupport = z.infer<typeof insertCrisisSupportSchema>;
export type CommunityWorkshop = typeof communityWorkshops.$inferSelect;
export type InsertCommunityWorkshop = z.infer<typeof insertCommunityWorkshopSchema>;
export type WorkshopParticipation = typeof workshopParticipations.$inferSelect;
export type InsertWorkshopParticipation = z.infer<typeof insertWorkshopParticipationSchema>;
export type CommunityFeedback = typeof communityFeedback.$inferSelect;
export type InsertCommunityFeedback = z.infer<typeof insertCommunityFeedbackSchema>;
export type CommunityPoll = typeof communityPolls.$inferSelect;
export type InsertCommunityPoll = z.infer<typeof insertCommunityPollSchema>;
export type PollVote = typeof pollVotes.$inferSelect;
export type InsertPollVote = z.infer<typeof insertPollVoteSchema>;
export type CommunityPartnership = typeof communityPartnerships.$inferSelect;
export type InsertCommunityPartnership = z.infer<typeof insertCommunityPartnershipSchema>;
export type GuestPost = typeof guestPosts.$inferSelect;
export type InsertGuestPost = z.infer<typeof insertGuestPostSchema>;
export type CommunityInvitation = typeof communityInvitations.$inferSelect;
export type InsertCommunityInvitation = z.infer<typeof insertCommunityInvitationSchema>;

// Stage 4: Retention & Delight Types
export type DailyReflection = typeof dailyReflections.$inferSelect;
export type InsertDailyReflection = z.infer<typeof insertDailyReflectionSchema>;
export type DataExport = typeof dataExports.$inferSelect;
export type InsertDataExport = z.infer<typeof insertDataExportSchema>;
// export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
// export type InsertAnalyticsEvent = z.infer<typeof insertAnalyticsEventSchema>;

// Phase 5: Insight History Types
export type InsightHistory = typeof insightHistory.$inferSelect;
export type InsertInsightHistory = z.infer<typeof insertInsightHistorySchema>;

// Secure Healthcare Messaging Types
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type MessageAttachment = typeof messageAttachments.$inferSelect;
export type InsertMessageAttachment = z.infer<typeof insertMessageAttachmentSchema>;
export type MessageRecipient = typeof messageRecipients.$inferSelect;
export type InsertMessageRecipient = z.infer<typeof insertMessageRecipientSchema>;
export type ConversationParticipant = typeof conversationParticipants.$inferSelect;
export type InsertConversationParticipant = z.infer<typeof insertConversationParticipantSchema>;

// Stage 7: Beta access and feedback schemas
export const betaAllowlist = pgTable('beta_allowlist', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  email: varchar('email', { length: 255 }).notNull().unique(),
  addedAt: timestamp('added_at').defaultNow().notNull(),
});

// Stage 17: Weekly Activity Checklist tracking
export const activityWeekly = pgTable("activity_weekly", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  isoYear: integer("iso_year").notNull(),
  isoWeek: integer("iso_week").notNull(),
  payload: jsonb("payload").notNull(), // Record<DayKey, Record<CategoryKey, boolean>>
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  uniqUserWeek: uniqueIndex("uniq_user_week").on(table.userId, table.isoYear, table.isoWeek),
  idxRecentWeeks: index("idx_activity_weekly_user_recent").on(table.userId, table.isoYear, table.isoWeek),
}));

export const feedback = pgTable('feedback', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar('user_id', { length: 255 }),
  kind: varchar('kind', { length: 20 }).notNull(), // 'bug', 'suggestion', 'tone'
  message: text('message').notNull(),
  screenshotPath: varchar('screenshot_path', { length: 500 }),
  context: jsonb('context'), // Additional context data
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Stage 8: Referral tracking
export const referrals = pgTable('referrals', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  ref: varchar('ref', { length: 100 }).notNull(), // The referral code (e.g., "partner1")
  userId: varchar('user_id', { length: 255 }), // Connected user (if signed up)
  path: varchar('path', { length: 500 }), // Landing page path
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// CGM Manual Import Tables
export const cgmSamples = pgTable('cgm_samples', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar('user_id').notNull().references(() => users.id),
  source: cgmImportSourceEnum('source').notNull(), // csv, json, dexcom_csv, libre_csv
  value_mgdl: integer('value_mgdl').notNull(), // glucose value in mg/dL
  takenAt: timestamp('taken_at').notNull(), // when the reading was taken
  trend: cgmTrendEnum('trend'), // optional trend data
}, (table) => ({
  // Covering index for efficient range queries
  userTimeIdx: index('cgm_samples_user_time_idx').on(table.userId, table.takenAt),
}));

export const cgmImportBatches = pgTable('cgm_import_batches', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar('user_id').notNull().references(() => users.id),
  source: varchar('source').notNull(), // file hint (dexcom/libre/custom)
  count: integer('count').notNull(), // number of samples imported
  importedAt: timestamp('imported_at').defaultNow().notNull(), // when the import occurred
}, (table) => ({
  userIdx: index('cgm_import_batches_user_idx').on(table.userId),
}));

// Stage 16: Hydration tracking table
export const hydrationLogs = pgTable('hydration_logs', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar('user_id').notNull().references(() => users.id),
  date: varchar('date').notNull(), // YYYY-MM-DD format
  cups: integer('cups').notNull().default(0), // number of 250ml cups (or similar unit)
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  // Unique constraint on userId + date to prevent duplicates
  userDateIdx: index('hydration_logs_user_date_idx').on(table.userId, table.date),
}));

// Stage 23.1: Bowel Movement tracking table
export const bmLogs = pgTable('bm_logs', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar('user_id').notNull().references(() => users.id),
  date: varchar('date').notNull(), // YYYY-MM-DD format
  hasMovement: boolean('has_movement').notNull(), // Did you have a bowel movement today?
  comfortLevel: integer('comfort_level'), // 1-5 scale, only if hasMovement is true
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  // Unique constraint on userId + date to prevent duplicates
  userDateUnique: uniqueIndex('bm_logs_user_date_unique').on(table.userId, table.date),
}));

// Blood Pressure tracking table
export const bloodPressureLogs = pgTable('blood_pressure_logs', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar('user_id').notNull().references(() => users.id),
  systolic: integer('systolic').notNull(), // mmHg
  diastolic: integer('diastolic').notNull(), // mmHg
  pulse: integer('pulse'), // bpm (optional)
  notes: text('notes'), // Optional notes
  loggedAt: timestamp('logged_at').defaultNow().notNull(),
}, (table) => ({
  // Index for efficient user queries sorted by time
  userTimeIdx: index('blood_pressure_logs_user_time_idx').on(table.userId, table.loggedAt),
}));

// Blood Sugar tracking table
export const bloodSugarLogs = pgTable('blood_sugar_logs', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar('user_id').notNull().references(() => users.id),
  glucose: decimal('glucose', { precision: 5, scale: 2 }).notNull(), // Always stored as mmol/L
  readingType: varchar('reading_type'), // fasting, pre-meal, post-meal, random
  notes: text('notes'),
  loggedAt: timestamp('logged_at').defaultNow().notNull(),
}, (table) => ({
  // Index for efficient user queries sorted by time
  userTimeIdx: index('blood_sugar_logs_user_time_idx').on(table.userId, table.loggedAt),
}));

// Stage 17: Wearables Manual Import Tables
export const wearableImportBatches = pgTable('wearable_import_batches', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar('user_id').notNull().references(() => users.id),
  source: wearableImportSourceEnum('source').notNull(),
  device: wearableDeviceEnum('device').notNull(),
  status: wearableImportStatusEnum('status').default('completed'),
  filename: varchar('filename'),
  rowCount: integer('row_count').default(0),
  skippedCount: integer('skipped_count').default(0),
  error: text('error'),
  processedAt: timestamp('processed_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdx: index('wearable_import_batches_user_idx').on(table.userId),
}));

export const wearableSamples = pgTable('wearable_samples', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar('user_id').notNull().references(() => users.id),
  batchId: varchar('batch_id').notNull().references(() => wearableImportBatches.id),
  metric: wearableMetricEnum('metric').notNull(),
  ts: timestamp('ts').notNull(), // when the measurement was taken
  value: decimal('value', { precision: 10, scale: 2 }).notNull(), // measurement value
  unit: varchar('unit'), // bpm, steps, minutes, calories
  meta: jsonb('meta'), // additional metadata
}, (table) => ({
  // Covering index for efficient range queries
  userMetricTimeIdx: index('wearable_samples_user_metric_time_idx').on(table.userId, table.metric, table.ts),
  // Unique constraint to prevent duplicates
  uniqueReadingIdx: uniqueIndex('wearable_samples_unique_idx').on(table.userId, table.metric, table.ts),
  // Index for efficient batch operations
  batchIdx: index('wearable_samples_batch_idx').on(table.batchId),
}));

// Schemas for validation
export const insertFeedbackSchema = createInsertSchema(feedback).omit({ 
  id: true, 
  createdAt: true 
});
export type FeedbackInsert = z.infer<typeof insertFeedbackSchema>;
export type Feedback = typeof feedback.$inferSelect;

export const insertReferralSchema = createInsertSchema(referrals).omit({ 
  id: true, 
  createdAt: true 
});
export type ReferralInsert = z.infer<typeof insertReferralSchema>;
export type Referral = typeof referrals.$inferSelect;

// CGM Import schemas and types
export const insertCgmSampleSchema = createInsertSchema(cgmSamples).omit({ 
  id: true 
});
export type CgmSampleInsert = z.infer<typeof insertCgmSampleSchema>;
export type CgmSample = typeof cgmSamples.$inferSelect;

export const insertCgmImportBatchSchema = createInsertSchema(cgmImportBatches).omit({ 
  id: true,
  importedAt: true 
});
export type CgmImportBatchInsert = z.infer<typeof insertCgmImportBatchSchema>;
export type CgmImportBatch = typeof cgmImportBatches.$inferSelect;

// Stage 16: Hydration tracking schemas and types
export const insertHydrationLogSchema = createInsertSchema(hydrationLogs).omit({ 
  id: true,
  createdAt: true 
});
export type HydrationLogInsert = z.infer<typeof insertHydrationLogSchema>;
export type HydrationLog = typeof hydrationLogs.$inferSelect;

// Stage 23.1: BM tracking schemas and types
export const insertBmLogSchema = createInsertSchema(bmLogs).omit({ 
  id: true,
  createdAt: true 
});
export type BmLogInsert = z.infer<typeof insertBmLogSchema>;
export type BmLog = typeof bmLogs.$inferSelect;

// Blood Pressure tracking schemas and types
export const insertBloodPressureLogSchema = createInsertSchema(bloodPressureLogs).omit({ 
  id: true,
  loggedAt: true 
});
export type BloodPressureLogInsert = z.infer<typeof insertBloodPressureLogSchema>;
export type BloodPressureLog = typeof bloodPressureLogs.$inferSelect;

// Blood Sugar tracking schemas and types
export const insertBloodSugarLogSchema = createInsertSchema(bloodSugarLogs).omit({ 
  id: true,
  loggedAt: true 
});
export type BloodSugarLogInsert = z.infer<typeof insertBloodSugarLogSchema>;
export type BloodSugarLog = typeof bloodSugarLogs.$inferSelect;

// Stage 17: Wearables Import schemas and types
export const insertWearableImportBatchSchema = createInsertSchema(wearableImportBatches).omit({ 
  id: true,
  processedAt: true,
  createdAt: true 
});
export type WearableImportBatchInsert = z.infer<typeof insertWearableImportBatchSchema>;
export type WearableImportBatch = typeof wearableImportBatches.$inferSelect;

export const insertWearableSampleSchema = createInsertSchema(wearableSamples).omit({ 
  id: true 
});
export type WearableSampleInsert = z.infer<typeof insertWearableSampleSchema>;
export type WearableSample = typeof wearableSamples.$inferSelect;

export const insertBetaAllowlistSchema = createInsertSchema(betaAllowlist).omit({ 
  id: true, 
  addedAt: true 
});
export type BetaAllowlistInsert = z.infer<typeof insertBetaAllowlistSchema>;
export type BetaAllowlist = typeof betaAllowlist.$inferSelect;

// Weekly Activity Checklist schemas and types
export const insertActivityWeeklySchema = createInsertSchema(activityWeekly).omit({ 
  id: true,
  updatedAt: true 
});
export type ActivityWeeklyInsert = z.infer<typeof insertActivityWeeklySchema>;
export type ActivityWeekly = typeof activityWeekly.$inferSelect;

// Survey schemas (client-only, no database)
export const toneSurveySchema = z.object({
  value: z.enum(['happy', 'neutral', 'confused']),
  context: z.string().optional(),
});
export type ToneSurvey = z.infer<typeof toneSurveySchema>;

export const npsSurveySchema = z.object({
  score: z.number().min(0).max(10),
  comment: z.string().optional(),
});
export type NpsSurvey = z.infer<typeof npsSurveySchema>;

// Stage 22: Personalization & Smart Nudges Tables

// User Dashboard Preferences
export const userPreferences = pgTable('user_preferences', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar('user_id').notNull().references(() => users.id),
  dashboardSections: dashboardSectionEnum('dashboard_sections').array().notNull().default(sql`ARRAY['meals', 'glucose', 'exercise', 'sleep']::dashboard_section[]`),
  showWeeklyGoals: boolean('show_weekly_goals').default(true),
  showDailyTips: boolean('show_daily_tips').default(true),
  showProgressCharts: boolean('show_progress_charts').default(true),
  compactView: boolean('compact_view').default(false),
  reminderTime: varchar('reminder_time').default('09:00'), // HH:MM format
  timezone: varchar('timezone').default('UTC'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdx: index('user_preferences_user_idx').on(table.userId),
}));

// Smart Daily Nudges
export const smartNudges = pgTable('smart_nudges', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar('user_id').notNull().references(() => users.id),
  type: nudgeTypeEnum('type').notNull(),
  title: varchar('title').notNull(),
  message: text('message').notNull(),
  actionText: varchar('action_text'), // "Log water intake", "Record glucose", etc.
  priority: integer('priority').default(1), // 1=low, 2=medium, 3=high
  isCompleted: boolean('is_completed').default(false),
  completedAt: timestamp('completed_at'),
  scheduledFor: timestamp('scheduled_for').notNull(),
  expiresAt: timestamp('expires_at'), // when nudge becomes irrelevant
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userScheduledIdx: index('smart_nudges_user_scheduled_idx').on(table.userId, table.scheduledFor),
  userCompletedIdx: index('smart_nudges_user_completed_idx').on(table.userId, table.isCompleted),
}));

// Stage 22 Schemas and Types
export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true 
});
export type UserPreferencesInsert = z.infer<typeof insertUserPreferencesSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;

export const insertSmartNudgeSchema = createInsertSchema(smartNudges).omit({ 
  id: true,
  createdAt: true 
});
export type SmartNudgeInsert = z.infer<typeof insertSmartNudgeSchema>;
export type SmartNudge = typeof smartNudges.$inferSelect;

// Stage 23.1: BM Tracking Relations (Added after all table definitions)
export const hydrationLogsRelations = relations(hydrationLogs, ({ one }) => ({
  user: one(users, { fields: [hydrationLogs.userId], references: [users.id] }),
}));

export const bmLogsRelations = relations(bmLogs, ({ one }) => ({
  user: one(users, { fields: [bmLogs.userId], references: [users.id] }),
}));

export const bloodPressureLogsRelations = relations(bloodPressureLogs, ({ one }) => ({
  user: one(users, { fields: [bloodPressureLogs.userId], references: [users.id] }),
}));

export const bloodSugarLogsRelations = relations(bloodSugarLogs, ({ one }) => ({
  user: one(users, { fields: [bloodSugarLogs.userId], references: [users.id] }),
}));

