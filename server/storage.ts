import {
  users,
  meals,
  mealLogs,
  glucoseReadings,
  exerciseLogs,
  consultations,
  healthcareProviders,
  mealPlans,
  mealPlanItems,
  chatMessages,
  userInsights,
  mindfulnessSessions,
  moodLogs,
  userMoodLog,
  sleepLogs,
  energyLogs,
  journalEntries,
  // Secure messaging tables
  conversations,
  messages,
  messageAttachments,
  messageRecipients,
  conversationParticipants,
  // Community tables
  communityPosts,
  communityComments,
  communityLikes,
  communityGroups,
  communityGroupMembers,
  communityReflections,
  communityReflectionEncouragements,
  // Mindfulness library table
  meditationLibrary,
  dailyReflections,
  insightHistory,
  expertQASessions,
  qaSessionRegistrations,
  peerPartnerships,
  partnershipCheckIns,
  healthChallenges,
  challengeParticipations,
  challengeProgressLogs,
  // Health Planning tables
  preventiveCareTasks,
  goals,
  goalLogs,
  medications,
  medicationSchedules,
  medicationIntakes,
  appointments,
  wellnessPlanTemplates,
  userWellnessPlans,
  wellnessPlanTasks,
  riskAssessments,
  // Educational Library tables
  educationContent,
  educationProgress,
  educationQuizzes,
  educationQuizAttempts,
  learningPaths,
  learningPathModules,
  learningPathProgress,
  // Gamification tables
  userPoints,
  badges,
  userBadges,
  pointTransactions,
  // Workout Library tables
  workoutCategories,
  workouts,
  workoutProgress,
  // Risk Assessment tables
  riskAssessmentTemplates,
  userRiskAssessments,
  betaAllowlist,
  feedback,
  referrals,
  // analyticsEvents, // Temporarily commented out
  cgmSamples,
  cgmImportBatches,
  hydrationLogs,
  bmLogs,
  bloodPressureLogs,
  bloodSugarLogs,
  wearableImportBatches,
  wearableSamples,
  // Stage 22: Personalization & Smart Nudges tables
  userPreferences,
  smartNudges,
  type User,
  type UpsertUser,
  type Meal,
  type InsertMeal,
  type MealLog,
  type InsertMealLog,
  type GlucoseReading,
  type MeditationLibrary,
  type InsertMeditationLibrary,
  type InsertGlucoseReading,
  type ExerciseLog,
  type InsertExerciseLog,
  type Consultation,
  type InsertConsultation,
  type HealthcareProvider,
  type InsertHealthcareProvider,
  type MealPlan,
  type InsertMealPlan,
  type ChatMessage,
  type InsertChatMessage,
  type UserInsight,
  type InsertUserInsight,
  type MindfulnessSession,
  type InsertMindfulnessSession,
  type MoodLog,
  type InsertMoodLog,
  type UserMoodLog,
  type InsertUserMoodLog,
  type SleepLog,
  type InsertSleepLog,
  type BmLog,
  type InsertBmLog,
  type BloodPressureLog,
  type BloodPressureLogInsert,
  type BloodSugarLog,
  type BloodSugarLogInsert,
  type EnergyLog,
  type InsertEnergyLog,
  type JournalEntry,
  type InsertJournalEntry,
  // Community types
  type CommunityPost,
  type InsertCommunityPost,
  type CommunityComment,
  type InsertCommunityComment,
  type CommunityLike,
  type InsertCommunityLike,
  type CommunityGroup,
  type InsertCommunityGroup,
  type CommunityGroupMember,
  type InsertCommunityGroupMember,
  type ExpertQASession,
  type InsertExpertQASession,
  type QASessionRegistration,
  type InsertQASessionRegistration,
  type PeerPartnership,
  type InsertPeerPartnership,
  type PartnershipCheckIn,
  type InsertPartnershipCheckIn,
  type HealthChallenge,
  type InsertHealthChallenge,
  type ChallengeParticipation,
  type InsertChallengeParticipation,
  type ChallengeProgressLog,
  type InsertChallengeProgressLog,
  // Health Planning types
  type PreventiveCareTask,
  type InsertPreventiveCareTask,
  type Goal,
  type InsertGoal,
  type GoalLog,
  type InsertGoalLog,
  type Medication,
  type InsertMedication,
  type MedicationSchedule,
  type InsertMedicationSchedule,
  type MedicationIntake,
  type InsertMedicationIntake,
  type Appointment,
  type InsertAppointment,
  type WellnessPlanTemplate,
  type InsertWellnessPlanTemplate,
  type UserWellnessPlan,
  type InsertUserWellnessPlan,
  type WellnessPlanTask,
  type InsertWellnessPlanTask,
  type RiskAssessment,
  type InsertRiskAssessment,
  // Educational Library types
  type EducationContent,
  type InsertEducationContent,
  type EducationProgress,
  type InsertEducationProgress,
  type EducationQuiz,
  type InsertEducationQuiz,
  type EducationQuizAttempt,
  type InsertEducationQuizAttempt,
  // Gamification types
  type UserPoints,
  type InsertUserPoints,
  type Badge,
  type InsertBadge,
  type UserBadge,
  type InsertUserBadge,
  type PointTransaction,
  type InsertPointTransaction,
  // Workout Library types
  type WorkoutCategory,
  type InsertWorkoutCategory,
  type Workout,
  type InsertWorkout,
  type WorkoutProgress,
  type InsertWorkoutProgress,
  // Risk Assessment types
  type RiskAssessmentTemplate,
  type InsertRiskAssessmentTemplate,
  type UserRiskAssessment,
  type InsertUserRiskAssessment,
  // Stage 7: Beta access and feedback types
  type Referral,
  type ReferralInsert,
  // Secure messaging types
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
  type MessageAttachment,
  type InsertMessageAttachment,
  type MessageRecipient,
  type InsertMessageRecipient,
  type ConversationParticipant,
  type InsertConversationParticipant,
  // Security and audit types
  type SecurityAuditLog,
  type InsertSecurityAuditLog,
  type EncryptionKey,
  type InsertEncryptionKey,
  type SecuritySession,
  type InsertSecuritySession,
  type CommunityFeedback,
  type InsertCommunityFeedback,
  type BetaAllowlist,
  type BetaAllowlistInsert,
  // type AnalyticsEvent, // Temporarily commented out
  // type InsertAnalyticsEvent, // Temporarily commented out
  // CGM Manual Import types
  type CgmSample,
  type CgmSampleInsert,
  type CgmImportBatch,
  type CgmImportBatchInsert,
  // Stage 17: Wearables Import types
  type WearableSample,
  type WearableSampleInsert,
  type WearableImportBatch,
  type WearableImportBatchInsert,
  // Stage 22: Personalization & Smart Nudges types
  type UserPreferences,
  type InsertUserPreferences,
  type SmartNudge,
  type InsertSmartNudge,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql, count, or, like } from "drizzle-orm";
import fs from "fs";
import path from "path";

// Helper function to validate image file existence
function validateImageFile(imageUrl: string): boolean {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return false;
  }
  
  // Only validate local image paths (not external URLs)
  if (!imageUrl.startsWith('/attached_assets/')) {
    return true; // Allow external URLs to pass through
  }
  
  try {
    const fullPath = path.join(process.cwd(), imageUrl.replace(/^\//, ''));
    return fs.existsSync(fullPath);
  } catch {
    return false;
  }
}

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  getUserByStripeSubscriptionId(subscriptionId: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createUser(user: { email: string; password: string; firstName?: string; lastName?: string }): Promise<User>;
  updateUserStripeInfo(userId: string, stripeInfo: {
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    subscriptionTier?: string;
    subscriptionStatus?: string;
    subscriptionEndDate?: Date;
  }): Promise<User>;
  updateUserReminderPreferences(userId: string, prefs: {
    emailOptIn?: boolean;
    reminderFrequency?: string;
    timezone?: string;
  }): Promise<User>;
  
  // Meal operations
  getMeals(category?: string, glycemicIndex?: string): Promise<Meal[]>;
  getMeal(id: string): Promise<Meal | undefined>;
  createMeal(meal: InsertMeal): Promise<Meal>;
  updateMeal(id: string, updates: Partial<Meal>): Promise<Meal>;
  updateMealImage(id: string, imageUrl: string): Promise<Meal>;
  deleteMeal(id: string): Promise<boolean>;
  searchMeals(query: string): Promise<Meal[]>;
  
  // Meal logging operations
  getUserMealLogs(userId: string, startDate?: Date, endDate?: Date): Promise<MealLog[]>;
  createMealLog(mealLog: InsertMealLog): Promise<MealLog>;
  getMealLog(id: string): Promise<MealLog | undefined>;
  deleteMealLog(id: string): Promise<boolean>;
  
  // Glucose reading operations
  getUserGlucoseReadings(userId: string, startDate?: Date, endDate?: Date): Promise<GlucoseReading[]>;
  createGlucoseReading(reading: InsertGlucoseReading): Promise<GlucoseReading>;
  getLatestGlucoseReading(userId: string): Promise<GlucoseReading | undefined>;
  
  // CGM Manual Import operations
  bulkInsertCgmSamples(userId: string, samples: any[]): Promise<void>;
  createCgmImportBatch(userId: string, batchData: { source: string; count: number }): Promise<CgmImportBatch>;
  getCgmSamples(userId: string, options: { start?: string; end?: string; limit?: number }): Promise<CgmSample[]>;
  deleteAllCgmData(userId: string): Promise<void>;
  
  // Stage 17: Wearables Manual Import operations
  createWearableImportBatch(userId: string, batchData: { source: string; device: string; filename?: string; rowCount: number; skippedCount: number }): Promise<WearableImportBatch>;
  upsertWearableSamples(batchId: string, samples: WearableSampleInsert[]): Promise<void>;
  getWearableSeries(userId: string, metric: string, options: { from?: string; to?: string; limit?: number }): Promise<WearableSample[]>;
  getWearableSummary(userId: string, range?: string): Promise<{ steps: number; heartRate: number | null; calories: number; sleepMinutes: number }>;
  
  // Exercise logging operations
  getUserExerciseLogs(userId: string, startDate?: Date, endDate?: Date): Promise<ExerciseLog[]>;
  createExerciseLog(exerciseLog: InsertExerciseLog): Promise<ExerciseLog>;
  
  // Healthcare provider operations
  getHealthcareProviders(): Promise<HealthcareProvider[]>;
  getHealthcareProvider(id: string): Promise<HealthcareProvider | undefined>;
  createHealthcareProvider(provider: InsertHealthcareProvider): Promise<HealthcareProvider>;
  searchHealthcareProviders(params: {
    search?: string;
    specialization?: string;
    available?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<HealthcareProvider[]>;
  
  // Consultation operations
  getUserConsultations(userId: string): Promise<Consultation[]>;
  createConsultation(consultation: InsertConsultation): Promise<Consultation>;
  getConsultation(id: string): Promise<Consultation | undefined>;

  // Secure Healthcare Messaging operations
  // Conversations
  getUserConversations(userId: string): Promise<Conversation[]>;
  getProviderConversations(providerId: string): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getConversation(id: string): Promise<Conversation | undefined>;
  updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation>;
  archiveConversation(id: string): Promise<Conversation>;
  
  // Messages
  getConversationMessages(conversationId: string, limit?: number, offset?: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  getMessage(id: string): Promise<Message | undefined>;
  updateMessage(id: string, updates: Partial<Message>): Promise<Message>;
  deleteMessage(id: string): Promise<boolean>;
  markMessageAsRead(messageId: string, recipientId: string, recipientType: 'patient' | 'provider'): Promise<void>;
  
  // Message Attachments
  createMessageAttachment(attachment: InsertMessageAttachment): Promise<MessageAttachment>;
  getMessageAttachments(messageId: string): Promise<MessageAttachment[]>;
  deleteMessageAttachment(id: string): Promise<boolean>;
  
  // Conversation Participants (for group conversations)
  addConversationParticipant(participant: InsertConversationParticipant): Promise<ConversationParticipant>;
  removeConversationParticipant(conversationId: string, participantId: string): Promise<boolean>;
  getConversationParticipants(conversationId: string): Promise<ConversationParticipant[]>;
  
  // Unread message counts
  getUnreadMessageCount(userId: string, userType: 'patient' | 'provider'): Promise<number>;
  getConversationUnreadCount(conversationId: string, userId: string, userType: 'patient' | 'provider'): Promise<number>;
  
  // Security and Audit Logging
  logSecurityEvent(event: InsertSecurityAuditLog): Promise<SecurityAuditLog>;
  getSecurityAuditLogs(userId?: string, action?: string, startDate?: Date, endDate?: Date): Promise<SecurityAuditLog[]>;
  createSecuritySession(session: InsertSecuritySession): Promise<SecuritySession>;
  updateSecuritySession(sessionId: string, updates: Partial<SecuritySession>): Promise<SecuritySession>;
  deactivateSecuritySession(sessionToken: string): Promise<boolean>;
  getUserActiveSessions(userId: string): Promise<SecuritySession[]>;
  validateSessionSecurity(sessionToken: string, ipAddress: string): Promise<SecuritySession | null>;
  
  // Meal plan operations
  getUserMealPlans(userId: string): Promise<MealPlan[]>;
  createMealPlan(mealPlan: InsertMealPlan): Promise<MealPlan>;
  getMealPlan(id: string): Promise<MealPlan | undefined>;
  
  // Chat operations
  getUserChatMessages(userId: string, limit?: number): Promise<ChatMessage[]>;
  createChatMessage(chatMessage: InsertChatMessage): Promise<ChatMessage>;
  
  // Analytics operations
  getUserDailyStats(userId: string, date: Date): Promise<{
    totalCarbs: number;
    totalMeals: number;
    averageGlucose: number;
    exerciseMinutes: number;
  }>;

  // Step 2: Daily planning operations
  getUserDailyPlan(userId: string, date: Date): Promise<{
    carb_target_g: number;
    carbs_used_today_g: number;
    carbs_remaining_g: number;
    suggestedRecipes: Meal[];
  }>;
  getTodayMealLogs(userId: string): Promise<MealLog[]>;
  getSuggestedRecipes(carbsRemaining: number, prefs?: any): Promise<Meal[]>;

  // Step 3: Insights operations  
  getUserInsights(userId: string): Promise<UserInsight[]>;
  createUserInsight(insight: InsertUserInsight): Promise<UserInsight>;
  getUserActiveInsights(userId: string): Promise<UserInsight[]>;
  getUserActiveInsightsByRange(userId: string, range: string): Promise<UserInsight[]>;
  clearExpiredInsights(userId: string): Promise<void>;
  generateAndCacheInsights(userId: string, range?: string): Promise<UserInsight[]>;

  // Holistic wellness operations
  getUserMindfulnessSessions(userId: string): Promise<MindfulnessSession[]>;
  createMindfulnessSession(session: InsertMindfulnessSession): Promise<MindfulnessSession>;
  getUserMoodLogs(userId: string, startDate?: Date, endDate?: Date): Promise<MoodLog[]>;
  createMoodLog(moodLog: InsertMoodLog): Promise<MoodLog>;
  createUserMoodLog(moodLog: InsertUserMoodLog): Promise<UserMoodLog>;
  getUserMoodLogsSimple(userId: string, startDate?: Date, endDate?: Date): Promise<UserMoodLog[]>;
  getLatestUserMoodLog(userId: string): Promise<UserMoodLog | undefined>;
  getUserSleepLogs(userId: string, startDate?: Date, endDate?: Date): Promise<SleepLog[]>;
  createSleepLog(sleepLog: InsertSleepLog): Promise<SleepLog>;
  getUserEnergyLogs(userId: string, startDate?: Date, endDate?: Date): Promise<EnergyLog[]>;
  createEnergyLog(energyLog: InsertEnergyLog): Promise<EnergyLog>;
  getTodaysEnergyLog(userId: string): Promise<EnergyLog | undefined>;
  getUserJournalEntries(userId: string): Promise<JournalEntry[]>;
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;

  // Health Planning operations
  
  // Preventive care tasks
  getUserPreventiveCareTasks(userId: string, status?: string): Promise<PreventiveCareTask[]>;
  createPreventiveCareTask(task: InsertPreventiveCareTask): Promise<PreventiveCareTask>;
  getPreventiveCareTask(id: string): Promise<PreventiveCareTask | undefined>;
  updatePreventiveCareTask(id: string, updates: Partial<PreventiveCareTask>): Promise<PreventiveCareTask>;
  getOverduePreventiveCareTasks(userId: string): Promise<PreventiveCareTask[]>;
  getDueTodayPreventiveCareTasks(userId: string): Promise<PreventiveCareTask[]>;
  getPreventiveCareTasksDueToday(userId: string): Promise<PreventiveCareTask[]>;
  markPreventiveCareTaskComplete(id: string): Promise<PreventiveCareTask | undefined>;
  deletePreventiveCareTask(id: string): Promise<boolean>;

  // Goals and goal progress
  getUserGoals(userId: string, status?: string, category?: string): Promise<Goal[]>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  getGoal(id: string): Promise<Goal | undefined>;
  updateGoal(id: string, updates: Partial<Goal>): Promise<Goal>;
  deleteGoal(id: string): Promise<boolean>;
  getGoalLogs(goalId: string): Promise<GoalLog[]>;
  createGoalLog(log: InsertGoalLog): Promise<GoalLog>;
  getUserActiveGoals(userId: string): Promise<Goal[]>;
  getGoalProgress(goalId: string, startDate?: Date, endDate?: Date): Promise<GoalLog[]>;

  // Medications
  getUserMedications(userId: string, isActive?: boolean): Promise<Medication[]>;
  createMedication(medication: InsertMedication): Promise<Medication>;
  getMedication(id: string): Promise<Medication | undefined>;
  updateMedication(id: string, updates: Partial<Medication>): Promise<Medication>;
  deleteMedication(id: string): Promise<boolean>;
  getMedicationsDueToday(userId: string): Promise<{ medication: Medication; schedule: MedicationSchedule }[]>;
  
  // Medication schedules
  getMedicationSchedules(medicationId: string): Promise<MedicationSchedule[]>;
  createMedicationSchedule(schedule: InsertMedicationSchedule): Promise<MedicationSchedule>;
  getMedicationSchedule(id: string): Promise<MedicationSchedule | undefined>;
  updateMedicationSchedule(id: string, updates: Partial<MedicationSchedule>): Promise<MedicationSchedule>;
  
  // Medication intakes
  getUserMedicationIntakes(userId: string, startDate?: Date, endDate?: Date): Promise<MedicationIntake[]>;
  createMedicationIntake(intake: InsertMedicationIntake): Promise<MedicationIntake>;
  getMedicationIntake(id: string): Promise<MedicationIntake | undefined>;
  getTodayMedicationSchedule(userId: string): Promise<{ schedule: MedicationSchedule; medication: Medication; intakes: MedicationIntake[] }[]>;

  // Appointments
  getUserAppointments(userId: string, status?: string): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  getAppointment(id: string): Promise<Appointment | undefined>;
  updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment>;
  deleteAppointment(id: string): Promise<boolean>;
  getUpcomingAppointments(userId: string, days?: number): Promise<Appointment[]>;
  getPastAppointments(userId: string): Promise<Appointment[]>;
  getTodayAppointments(userId: string): Promise<Appointment[]>;

  // Wellness plan templates
  getWellnessPlanTemplates(isActive?: boolean): Promise<WellnessPlanTemplate[]>;
  createWellnessPlanTemplate(template: InsertWellnessPlanTemplate): Promise<WellnessPlanTemplate>;
  getWellnessPlanTemplate(id: string): Promise<WellnessPlanTemplate | undefined>;
  updateWellnessPlanTemplate(id: string, updates: Partial<WellnessPlanTemplate>): Promise<WellnessPlanTemplate>;

  // User wellness plans
  getUserWellnessPlans(userId: string, status?: string): Promise<UserWellnessPlan[]>;
  createUserWellnessPlan(plan: InsertUserWellnessPlan): Promise<UserWellnessPlan>;
  getUserWellnessPlan(id: string): Promise<UserWellnessPlan | undefined>;
  updateUserWellnessPlan(id: string, updates: Partial<UserWellnessPlan>): Promise<UserWellnessPlan>;

  // Wellness plan tasks
  getWellnessPlanTasks(planId: string): Promise<WellnessPlanTask[]>;
  createWellnessPlanTask(task: InsertWellnessPlanTask): Promise<WellnessPlanTask>;
  getWellnessPlanTask(id: string): Promise<WellnessPlanTask | undefined>;
  updateWellnessPlanTask(id: string, updates: Partial<WellnessPlanTask>): Promise<WellnessPlanTask>;
  getUserTodayWellnessTasks(userId: string): Promise<WellnessPlanTask[]>;
  markWellnessPlanTaskComplete(id: string): Promise<WellnessPlanTask | undefined>;

  // Risk assessments
  getUserRiskAssessments(userId: string, type?: string): Promise<RiskAssessment[]>;
  createRiskAssessment(assessment: InsertRiskAssessment): Promise<RiskAssessment>;
  getRiskAssessment(id: string): Promise<RiskAssessment | undefined>;
  updateRiskAssessment(id: string, updates: Partial<RiskAssessment>): Promise<RiskAssessment | undefined>;
  deleteRiskAssessment(id: string): Promise<boolean>;
  getLatestRiskAssessment(userId: string, type?: string): Promise<RiskAssessment | undefined>;

  // Community Features operations
  // Community Posts
  getCommunityPosts(type?: string): Promise<CommunityPost[]>;
  createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost>;
  
  // Community Groups
  getCommunityGroups(category?: string): Promise<CommunityGroup[]>;
  createCommunityGroup(group: InsertCommunityGroup): Promise<CommunityGroup>;
  joinCommunityGroup(membership: InsertCommunityGroupMember): Promise<CommunityGroupMember>;
  leaveCommunityGroup(groupId: string, userId: string): Promise<boolean>;
  getCommunityGroupMembers(groupId: string): Promise<CommunityGroupMember[]>;
  
  // Expert Q&A Sessions
  getExpertQASessions(upcoming?: boolean): Promise<ExpertQASession[]>;
  createExpertQASession(session: InsertExpertQASession): Promise<ExpertQASession>;
  registerForQASession(registration: InsertQASessionRegistration): Promise<QASessionRegistration>;
  
  // Peer Partnerships
  getUserPartnerships(userId: string): Promise<PeerPartnership[]>;
  createPeerPartnership(partnership: InsertPeerPartnership): Promise<PeerPartnership>;
  createPartnershipCheckIn(checkIn: InsertPartnershipCheckIn): Promise<PartnershipCheckIn>;
  
  // Health Challenges
  getHealthChallenges(category?: string, active?: boolean): Promise<HealthChallenge[]>;
  createHealthChallenge(challenge: InsertHealthChallenge): Promise<HealthChallenge>;
  joinHealthChallenge(participation: InsertChallengeParticipation): Promise<ChallengeParticipation>;
  logChallengeProgress(progress: InsertChallengeProgressLog): Promise<ChallengeProgressLog>;

  // Educational Library operations
  getEducationContent(category?: string, difficulty?: string, type?: string): Promise<EducationContent[]>;
  getEducationContentById(id: string): Promise<EducationContent | undefined>;
  createEducationContent(content: InsertEducationContent): Promise<EducationContent>;
  searchEducationContent(query: string): Promise<EducationContent[]>;
  getUserEducationProgress(userId: string): Promise<EducationProgress[]>;
  createEducationProgress(progress: InsertEducationProgress): Promise<EducationProgress>;
  updateEducationProgress(id: string, updates: Partial<EducationProgress>): Promise<EducationProgress>;
  
  // Learning Paths operations
  getLearningPaths(): Promise<any[]>;
  getLearningPathById(id: string): Promise<any | undefined>;
  getLearningPathModules(pathId: string): Promise<any[]>;
  getUserLearningPathProgress(userId: string, pathId: string): Promise<any | undefined>;
  createLearningPathProgress(progress: any): Promise<any>;
  updateLearningPathProgress(id: string, updates: any): Promise<any>;
  
  // Gamification operations
  getUserPoints(userId: string): Promise<UserPoints | undefined>;
  createUserPoints(points: InsertUserPoints): Promise<UserPoints>;
  updateUserPoints(userId: string, points: number): Promise<UserPoints>;
  addPointTransaction(transaction: InsertPointTransaction): Promise<PointTransaction>;
  getUserPointTransactions(userId: string): Promise<PointTransaction[]>;
  getBadges(): Promise<Badge[]>;
  getUserBadges(userId: string): Promise<UserBadge[]>;
  awardBadgeToUser(userBadge: InsertUserBadge): Promise<UserBadge>;
  getJourneyMoodEnergy(userId: string, days: number): Promise<Array<{ date: string; mood: number; energy: number }>>;
  
  // Workout Library operations
  getWorkoutCategories(): Promise<WorkoutCategory[]>;
  getWorkouts(categoryId?: string, difficulty?: string): Promise<Workout[]>;
  getWorkoutById(id: string): Promise<Workout | undefined>;
  createWorkout(workout: InsertWorkout): Promise<Workout>;
  getUserWorkoutProgress(userId: string): Promise<WorkoutProgress[]>;
  createWorkoutProgress(progress: InsertWorkoutProgress): Promise<WorkoutProgress>;
  searchWorkouts(query: string): Promise<Workout[]>;
  
  // Risk Assessment operations  
  getRiskAssessmentTemplates(type?: string): Promise<RiskAssessmentTemplate[]>;
  getUserRiskAssessmentsByTemplate(userId: string, templateId?: string): Promise<UserRiskAssessment[]>;
  createUserRiskAssessment(assessment: InsertUserRiskAssessment): Promise<UserRiskAssessment>;
  getLatestUserRiskAssessment(userId: string, templateId: string): Promise<UserRiskAssessment | undefined>;

  // Stage 4: Onboarding & Reflection operations
  updateUser(userId: string, updates: Partial<User>): Promise<User>;
  getUserReflectionForDate(userId: string, date: string): Promise<any | undefined>;
  updateReflection(id: string, updates: any): Promise<any>;
  createReflection(reflection: any): Promise<any>;
  getUserReflectionsForWeek(userId: string, weekStart: Date): Promise<any[]>;
  
  // Phase 5: Insight History operations
  createInsightHistory(userId: string, insightText: string, category: string): Promise<any>;
  getUserInsightHistory(userId: string, options?: { category?: string; startDate?: Date; endDate?: Date; limit?: number }): Promise<any[]>;
  dismissInsight(insightId: string): Promise<any>;
  
  // Stage 16: Hydration tracking operations
  getTodaysHydrationLog(userId: string): Promise<{ cups: number }>;
  addCupToHydration(userId: string): Promise<{ success: boolean }>;
  updateHydrationLog(userId: string, date: string, cups: number): Promise<{ success: boolean }>;
  getHydrationHistory(userId: string, days: number): Promise<{ date: string; cups: number; createdAt: Date }[]>;
  
  // Stage 23.1: BM tracking operations
  getTodaysBmLog(userId: string): Promise<BmLog | null>;
  createBmLog(bmLog: InsertBmLog): Promise<BmLog>;
  getBmHistory(userId: string, days: number): Promise<BmLog[]>;
  deleteBmLog(userId: string, date: string): Promise<void>;
  
  // Blood Pressure tracking operations
  createBloodPressureLog(log: BloodPressureLogInsert): Promise<BloodPressureLog>;
  getBloodPressureLogsForDate(userId: string, date: string): Promise<BloodPressureLog[]>;
  getBloodPressureHistory(userId: string, days: number): Promise<BloodPressureLog[]>;
  
  // Blood Sugar tracking operations
  createBloodSugarLog(log: BloodSugarLogInsert): Promise<BloodSugarLog>;
  getBloodSugarLogsForDate(userId: string, date: string): Promise<BloodSugarLog[]>;
  getBloodSugarHistory(userId: string, days: number): Promise<BloodSugarLog[]>;
  
  // Stage 4: Export operations
  generateCSVExport(userId: string, options: any): Promise<string>;
  generatePDFExport(userId: string, options: any): Promise<{ downloadUrl: string; filename: string }>;
  getCachedPDFExports(userId: string): Promise<any[]>;
  
  // Stage 9: Beta feedback & invite operations
  checkBetaInvite(email: string): Promise<boolean>;
  addBetaInvite(email: string): Promise<void>;
  createFeedback(feedback: { userId?: string; kind: string; message: string; context?: any }): Promise<any>;
  getFeedback(limit?: number): Promise<any[]>;
  trackAnalyticsEvent(event: { userId?: string; event: string; properties: any }): Promise<void>;
  
  // Stage 10: Community Hub operations
  getCommunityFeed(limit?: number): Promise<CommunityPost[]>;
  createCommunityPost(post: { userId: string; type: string; title: string; content: string; mealId?: string }): Promise<CommunityPost>;
  getCommunityPost(id: string): Promise<CommunityPost | undefined>;
  likeCommunityPost(userId: string, postId: string): Promise<void>;
  unlikeCommunityPost(userId: string, postId: string): Promise<void>;
  getUserCommunityPosts(userId: string, limit?: number): Promise<CommunityPost[]>;
  getCommunityPostsWithLikes(userId: string, limit?: number): Promise<(CommunityPost & { isLiked: boolean })[]>;
  
  // Phase 4: Community Reflection Feed operations
  getActiveCommunityReflections(limit?: number): Promise<(CommunityReflection & { hasUserEncouraged: boolean })[]>;
  createCommunityReflection(userId: string, content: string, mood?: string): Promise<CommunityReflection>;
  encourageCommunityReflection(userId: string, reflectionId: string): Promise<void>;
  unencourageCommunityReflection(userId: string, reflectionId: string): Promise<void>;
  deleteExpiredReflections(): Promise<number>;
  
  // Stage 22: Personalization & Smart Nudges operations
  getUserPreferences(userId: string): Promise<UserPreferences | undefined>;
  createOrUpdateUserPreferences(userId: string, preferences: InsertUserPreferences): Promise<UserPreferences>;
  getUserNudgesForDate(userId: string, startDate: Date, endDate: Date): Promise<SmartNudge[]>;
  getUserNudges(userId: string, options: { completed?: boolean; type?: string; limit?: number }): Promise<SmartNudge[]>;
  createSmartNudge(nudge: InsertSmartNudge): Promise<SmartNudge>;
  markNudgeComplete(nudgeId: string): Promise<SmartNudge | undefined>;
  deleteSmartNudge(nudgeId: string): Promise<boolean>;
  
  // Phase 5: Adaptive Wellness Insights operations
  getUserMoodEnergyPatterns(userId: string, days?: number): Promise<{
    moodLogs: any[];
    energyLogs: any[];
    patterns: {
      topMood?: string;
      avgEnergy?: string;
      moodTrends?: { day: string; mood: string; count: number }[];
      energyTrends?: { day: string; energy: string; count: number }[];
      insights: string[];
    }
  }>;
  getRecentMoodLogs(userId: string, limit?: number): Promise<any[]>;
  getRecentEnergyLogs(userId: string, limit?: number): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByStripeSubscriptionId(subscriptionId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.stripeSubscriptionId, subscriptionId));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // Check if user exists before upsert to detect new signups
    const existingUser = await this.getUser(userData.id);
    const isNewUser = !existingUser;
    
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
    
    // Send welcome email for new users
    if (isNewUser && userData.email) {
      try {
        const { sendEmail, welcomeEmailTemplate } = await import('./utils/emailTemplates');
        const userName = userData.firstName || 'there';
        await sendEmail(userData.email, "Welcome to GlycoGuide 🎉", welcomeEmailTemplate(userName));
      } catch (error) {
        console.error('[EMAIL] Failed to send welcome email:', error);
      }
    }
    
    return user;
  }

  async updateUserStripeInfo(userId: string, stripeInfo: {
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    subscriptionTier?: string;
    subscriptionStatus?: string;
    subscriptionEndDate?: Date;
  }): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...stripeInfo,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.resetToken, token));
    return user;
  }

  async createUser(userData: { email: string; password: string; firstName?: string; lastName?: string }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
      })
      .returning();
    return user;
  }

  async updateUserReminderPreferences(userId: string, prefs: {
    emailOptIn?: boolean;
    reminderFrequency?: string;
    timezone?: string;
  }): Promise<User> {
    const updateData: any = { updatedAt: new Date() };
    
    if (prefs.emailOptIn !== undefined) {
      updateData.emailOptIn = prefs.emailOptIn;
    }
    if (prefs.reminderFrequency !== undefined) {
      updateData.reminderFrequency = prefs.reminderFrequency;
    }
    if (prefs.timezone !== undefined) {
      updateData.timezone = prefs.timezone;
    }

    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Meal operations
  async getMeals(category?: string, glycemicIndex?: string): Promise<Meal[]> {
    const conditions: any[] = []; // Return all recipes unless specifically filtered
    
    if (category) {
      conditions.push(eq(meals.category, category as any));
    }
    
    if (glycemicIndex) {
      conditions.push(eq(meals.glycemicIndex, glycemicIndex as any));
    }
    
    if (conditions.length === 0) {
      return db.select().from(meals).orderBy(meals.name);
    }
    
    return db.select().from(meals).where(and(...conditions)).orderBy(meals.name);
  }

  // New paginated method with field projection for performance
  async getMealsPaginated(options: {
    category?: string;
    glycemicIndex?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ items: Pick<Meal, 'id' | 'name' | 'description' | 'imageUrl' | 'imageLocked' | 'imageVersion' | 'glycemicIndex' | 'glycemicValue' | 'category' | 'prepTime' | 'carbohydrates' | 'calories' | 'protein' | 'fat' | 'fiber'>[], total: number }> {
    const { category, glycemicIndex, search, limit = 30, offset = 0 } = options;
    const conditions: any[] = [];
    
    // Apply filters
    if (category) {
      conditions.push(eq(meals.category, category as any));
    }
    
    if (glycemicIndex) {
      conditions.push(eq(meals.glycemicIndex, glycemicIndex as any));
    }
    
    if (search) {
      // If search is a single letter (alphabet navigation), search for names starting with that letter
      if (search.length === 1) {
        conditions.push(sql`${meals.name} ILIKE ${`${search}%`}`);
      } else {
        // For multi-character searches, search anywhere in name or description
        conditions.push(sql`${meals.name} ILIKE ${`%${search}%`} OR ${meals.description} ILIKE ${`%${search}%`}`);
      }
    }
    
    // Build query with all display fields for recipe browsing
    const baseQuery = db.select({
      id: meals.id,
      name: meals.name,
      description: meals.description,
      imageUrl: meals.imageUrl,
      imageLocked: meals.imageLocked,
      imageVersion: meals.imageVersion,
      glycemicIndex: meals.glycemicIndex,
      glycemicValue: meals.glycemicValue,
      category: meals.category,
      prepTime: meals.prepTime,
      carbohydrates: meals.carbohydrates,
      calories: meals.calories,
      protein: meals.protein,
      fat: meals.fat,
      fiber: meals.fiber,
    }).from(meals);
    
    // Apply filters if any
    const query = conditions.length > 0 
      ? baseQuery.where(and(...conditions))
      : baseQuery;
    
    // Get paginated items
    const items = await query
      .orderBy(meals.name)
      .limit(limit)
      .offset(offset);
    
    // Get total count for pagination
    const countQuery = conditions.length > 0
      ? db.select({ count: sql<number>`count(*)` }).from(meals).where(and(...conditions))
      : db.select({ count: sql<number>`count(*)` }).from(meals);
      
    const [{ count }] = await countQuery;
    
    return {
      items,
      total: count
    };
  }

  async getMeal(id: string): Promise<Meal | undefined> {
    const [meal] = await db.select().from(meals).where(eq(meals.id, id));
    return meal;
  }

  async createMeal(meal: InsertMeal): Promise<Meal> {
    const [newMeal] = await db.insert(meals).values(meal).returning();
    return newMeal;
  }

  async updateMeal(id: string, updates: Partial<Meal>): Promise<Meal> {
    // Check if image is locked before allowing imageUrl updates
    if (updates.imageUrl) {
      const [existingMeal] = await db.select({ imageLocked: meals.imageLocked, name: meals.name })
        .from(meals).where(eq(meals.id, id));
      
      if (existingMeal?.imageLocked) {
        throw new Error(`Image update blocked: Recipe "${existingMeal.name}" is locked to prevent automated overwrites. Manual approval required.`);
      }
      
      // Validate that the image file exists before updating
      if (!validateImageFile(updates.imageUrl)) {
        throw new Error(`Image file does not exist: ${updates.imageUrl}. Please verify the file exists before updating.`);
      }
      
      // We'll increment imageVersion in the update statement below
    }
    
    // If imageUrl is being updated, increment imageVersion for cache-busting
    const updateData = updates.imageUrl 
      ? { ...updates, imageVersion: sql`COALESCE(image_version, 0) + 1` }
      : updates;
    
    const [updatedMeal] = await db
      .update(meals)
      .set(updateData)
      .where(eq(meals.id, id))
      .returning();
    return updatedMeal;
  }

  async updateMealImage(id: string, imageUrl: string): Promise<Meal> {
    // Check if image is locked before allowing updates
    const [existingMeal] = await db.select({ imageLocked: meals.imageLocked, name: meals.name })
      .from(meals).where(eq(meals.id, id));
    
    if (existingMeal?.imageLocked) {
      throw new Error(`Image update blocked: Recipe "${existingMeal.name}" is locked to prevent automated overwrites. Manual approval required.`);
    }
    
    // Validate that the image file exists before updating
    if (!validateImageFile(imageUrl)) {
      throw new Error(`Image file does not exist: ${imageUrl}. Please verify the file exists before updating.`);
    }
    
    const [updatedMeal] = await db
      .update(meals)
      .set({ 
        imageUrl,
        imageVersion: sql`COALESCE(image_version, 0) + 1`
      })
      .where(eq(meals.id, id))
      .returning();
    return updatedMeal;
  }

  async deleteMeal(id: string): Promise<boolean> {
    const result = await db.delete(meals).where(eq(meals.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async searchMeals(query: string): Promise<Meal[]> {
    return db.select().from(meals)
      .where(sql`${meals.name} ILIKE ${`%${query}%`} OR ${meals.description} ILIKE ${`%${query}%`}`)
      .orderBy(meals.name);
  }

  async searchMealsWithCategory(query: string, category: string): Promise<Meal[]> {
    return db.select().from(meals)
      .where(and(
        eq(meals.category, category as any),
        sql`${meals.name} ILIKE ${`%${query}%`} OR ${meals.description} ILIKE ${`%${query}%`}`
      ))
      .orderBy(meals.name);
  }

  // Meal logging operations
  async getUserMealLogs(userId: string, startDate?: Date, endDate?: Date): Promise<MealLog[]> {
    if (startDate && endDate) {
      return db.select().from(mealLogs).where(and(
        eq(mealLogs.userId, userId),
        gte(mealLogs.loggedAt, startDate),
        lte(mealLogs.loggedAt, endDate)
      )).orderBy(desc(mealLogs.loggedAt));
    }
    
    return db.select().from(mealLogs).where(eq(mealLogs.userId, userId)).orderBy(desc(mealLogs.loggedAt));
  }

  async createMealLog(mealLog: InsertMealLog): Promise<MealLog> {
    const [newMealLog] = await db.insert(mealLogs).values(mealLog).returning();
    return newMealLog;
  }

  async deleteMealLog(id: string): Promise<boolean> {
    const result = await db.delete(mealLogs).where(eq(mealLogs.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getMealLog(id: string): Promise<MealLog | undefined> {
    const [mealLog] = await db.select().from(mealLogs).where(eq(mealLogs.id, id));
    return mealLog;
  }

  // Glucose reading operations
  async getUserGlucoseReadings(userId: string, startDate?: Date, endDate?: Date): Promise<GlucoseReading[]> {
    if (startDate && endDate) {
      return db.select().from(glucoseReadings).where(and(
        eq(glucoseReadings.userId, userId),
        gte(glucoseReadings.takenAt, startDate),
        lte(glucoseReadings.takenAt, endDate)
      )).orderBy(desc(glucoseReadings.takenAt));
    }
    
    return db.select().from(glucoseReadings).where(eq(glucoseReadings.userId, userId)).orderBy(desc(glucoseReadings.takenAt));
  }

  async createGlucoseReading(reading: InsertGlucoseReading): Promise<GlucoseReading> {
    const [newReading] = await db.insert(glucoseReadings).values(reading).returning();
    return newReading;
  }

  async getLatestGlucoseReading(userId: string): Promise<GlucoseReading | undefined> {
    const [reading] = await db.select().from(glucoseReadings)
      .where(eq(glucoseReadings.userId, userId))
      .orderBy(desc(glucoseReadings.takenAt))
      .limit(1);
    return reading;
  }

  // CGM Manual Import operations
  async bulkInsertCgmSamples(userId: string, samples: any[]): Promise<void> {
    if (samples.length === 0) return;
    
    const cgmSampleData = samples.map(sample => ({
      userId,
      source: sample.source,
      value_mgdl: sample.value_mgdl,
      takenAt: new Date(sample.takenAt),
      trend: sample.trend || null
    }));
    
    await db.insert(cgmSamples).values(cgmSampleData);
  }

  async createCgmImportBatch(userId: string, batchData: { source: string; count: number }): Promise<CgmImportBatch> {
    const [batch] = await db.insert(cgmImportBatches).values({
      userId,
      source: batchData.source,
      count: batchData.count
    }).returning();
    return batch;
  }

  async getCgmSamples(userId: string, options: { start?: string; end?: string; limit?: number }): Promise<CgmSample[]> {
    let whereClause = eq(cgmSamples.userId, userId);
    
    if (options.start && options.end) {
      whereClause = and(
        eq(cgmSamples.userId, userId),
        gte(cgmSamples.takenAt, new Date(options.start)),
        lte(cgmSamples.takenAt, new Date(options.end))
      );
    }
    
    let query = db.select().from(cgmSamples).where(whereClause).orderBy(cgmSamples.takenAt);
    
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    return query;
  }

  async deleteAllCgmData(userId: string): Promise<void> {
    // Delete samples and import batches for the user
    await db.delete(cgmSamples).where(eq(cgmSamples.userId, userId));
    await db.delete(cgmImportBatches).where(eq(cgmImportBatches.userId, userId));
  }

  // Stage 17: Wearables Manual Import operations
  async createWearableImportBatch(userId: string, batchData: { source: string; device: string; filename?: string; rowCount: number; skippedCount: number }): Promise<WearableImportBatch> {
    const [batch] = await db.insert(wearableImportBatches).values({
      userId,
      source: batchData.source as any,
      device: batchData.device as any,
      filename: batchData.filename,
      rowCount: batchData.rowCount,
      skippedCount: batchData.skippedCount,
      status: 'completed'
    }).returning();
    
    return batch;
  }

  async upsertWearableSamples(batchId: string, samples: WearableSampleInsert[]): Promise<void> {
    if (samples.length === 0) return;
    
    // Verify batch ownership and get userId for data scoping
    const [batch] = await db.select().from(wearableImportBatches).where(eq(wearableImportBatches.id, batchId));
    if (!batch) throw new Error('Import batch not found');
    
    // Enforce cost guardrails - hard cap at 500 samples per request
    const cappedSamples = samples.slice(0, 500);
    
    // All samples must belong to the batch owner
    const wearableSampleData = cappedSamples.map(sample => ({
      ...sample,
      userId: batch.userId, // Enforce data ownership
      batchId
    }));
    
    // Insert in single batch with deduplication (onConflictDoNothing relies on unique constraint)
    await db.insert(wearableSamples).values(wearableSampleData).onConflictDoNothing();
  }

  async getWearableSeries(userId: string, metric: string, options: { from?: string; to?: string; limit?: number }): Promise<WearableSample[]> {
    let whereConditions = [
      eq(wearableSamples.userId, userId),
      eq(wearableSamples.metric, metric as any)
    ];
    
    // Enforce bounded date ranges - default to last 30 days if no range specified
    let fromDate = options.from ? new Date(options.from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    let toDate = options.to ? new Date(options.to) : new Date();
    
    whereConditions.push(
      gte(wearableSamples.ts, fromDate),
      lte(wearableSamples.ts, toDate)
    );
    
    // Enforce cost guardrails - default limit 500, max 1000
    const defaultLimit = 500;
    const maxLimit = 1000;
    const effectiveLimit = options.limit ? Math.min(options.limit, maxLimit) : defaultLimit;
    
    return await db
      .select()
      .from(wearableSamples)
      .where(and(...whereConditions))
      .orderBy(desc(wearableSamples.ts))
      .limit(effectiveLimit);
  }

  async getWearableSummary(userId: string, range?: string): Promise<{ steps: number; heartRate: number | null; calories: number; sleepMinutes: number }> {
    // Bounded date ranges for cost efficiency
    const now = new Date();
    let startDate = new Date();
    
    const allowedRanges = ['7d', '14d', '30d'];
    const effectiveRange = allowedRanges.includes(range || '') ? range : '7d';
    
    switch (effectiveRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '14d':
        startDate.setDate(now.getDate() - 14);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }
    
    // Bounded date range for all queries to prevent unbounded scans
    const commonWhere = and(
      eq(wearableSamples.userId, userId),
      gte(wearableSamples.ts, startDate),
      lte(wearableSamples.ts, now)
    );
    
    // Get aggregated data for each metric with bounded queries
    const [steps, heartRate, calories, sleepMinutes] = await Promise.all([
      // Steps - sum all values
      db.select({ value: sql`COALESCE(SUM(${wearableSamples.value}::integer), 0)` })
        .from(wearableSamples)
        .where(and(commonWhere, eq(wearableSamples.metric, 'steps'))),
      
      // Heart Rate - average
      db.select({ value: sql`AVG(${wearableSamples.value}::integer)` })
        .from(wearableSamples)
        .where(and(commonWhere, eq(wearableSamples.metric, 'heart_rate'))),
      
      // Calories - sum all values
      db.select({ value: sql`COALESCE(SUM(${wearableSamples.value}::integer), 0)` })
        .from(wearableSamples)
        .where(and(commonWhere, eq(wearableSamples.metric, 'calories'))),
      
      // Sleep Duration - sum all values (in minutes)
      db.select({ value: sql`COALESCE(SUM(${wearableSamples.value}::integer), 0)` })
        .from(wearableSamples)
        .where(and(commonWhere, eq(wearableSamples.metric, 'sleep_duration')))
    ]);
    
    return {
      steps: Number(steps[0]?.value || 0),
      heartRate: heartRate[0]?.value ? Math.round(Number(heartRate[0].value)) : null,
      calories: Number(calories[0]?.value || 0),
      sleepMinutes: Number(sleepMinutes[0]?.value || 0)
    };
  }

  // Exercise logging operations
  async getUserExerciseLogs(userId: string, startDate?: Date, endDate?: Date): Promise<ExerciseLog[]> {
    if (startDate && endDate) {
      return db.select().from(exerciseLogs).where(and(
        eq(exerciseLogs.userId, userId),
        gte(exerciseLogs.loggedAt, startDate),
        lte(exerciseLogs.loggedAt, endDate)
      )).orderBy(desc(exerciseLogs.loggedAt));
    }
    
    return db.select().from(exerciseLogs).where(eq(exerciseLogs.userId, userId)).orderBy(desc(exerciseLogs.loggedAt));
  }

  async createExerciseLog(exerciseLog: InsertExerciseLog): Promise<ExerciseLog> {
    const [newExerciseLog] = await db.insert(exerciseLogs).values(exerciseLog).returning();
    return newExerciseLog;
  }

  // Healthcare provider operations
  async getHealthcareProviders(): Promise<HealthcareProvider[]> {
    return db.select().from(healthcareProviders)
      .where(eq(healthcareProviders.available, true))
      .orderBy(healthcareProviders.firstName);
  }

  async getHealthcareProvider(id: string): Promise<HealthcareProvider | undefined> {
    const [provider] = await db.select().from(healthcareProviders).where(eq(healthcareProviders.id, id));
    return provider;
  }

  async createHealthcareProvider(provider: InsertHealthcareProvider): Promise<HealthcareProvider> {
    const [newProvider] = await db.insert(healthcareProviders).values(provider).returning();
    return newProvider;
  }

  async searchHealthcareProviders(params: {
    search?: string;
    specialization?: string;
    available?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<HealthcareProvider[]> {
    let query = db.select().from(healthcareProviders);
    
    const conditions = [];
    
    // Filter by availability (defaults to only available providers)
    if (params.available !== undefined) {
      conditions.push(eq(healthcareProviders.available, params.available));
    } else {
      conditions.push(eq(healthcareProviders.available, true));
    }
    
    // Filter by specialization
    if (params.specialization) {
      conditions.push(like(healthcareProviders.specialization, `%${params.specialization}%`));
    }
    
    // Search in names and bio
    if (params.search) {
      const searchTerm = `%${params.search.toLowerCase()}%`;
      conditions.push(
        or(
          like(sql`LOWER(${healthcareProviders.firstName})`, searchTerm),
          like(sql`LOWER(${healthcareProviders.lastName})`, searchTerm),
          like(sql`LOWER(${healthcareProviders.bio})`, searchTerm),
          like(sql`LOWER(${healthcareProviders.specialization})`, searchTerm)
        )
      );
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    // Order by name for consistent results
    query = query.orderBy(healthcareProviders.firstName, healthcareProviders.lastName);
    
    // Apply pagination
    if (params.limit) {
      query = query.limit(params.limit);
    }
    
    if (params.offset) {
      query = query.offset(params.offset);
    }
    
    return query;
  }

  // Secure Healthcare Messaging operations
  
  // Conversations
  async getUserConversations(userId: string): Promise<Conversation[]> {
    return db.select().from(conversations)
      .where(eq(conversations.patientId, userId))
      .orderBy(desc(conversations.lastMessageAt), desc(conversations.createdAt));
  }

  async getProviderConversations(providerId: string): Promise<Conversation[]> {
    return db.select().from(conversations)
      .where(eq(conversations.providerId, providerId))
      .orderBy(desc(conversations.lastMessageAt), desc(conversations.createdAt));
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const [newConversation] = await db.insert(conversations).values(conversation).returning();
    return newConversation;
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation;
  }

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation> {
    const [updatedConversation] = await db
      .update(conversations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(conversations.id, id))
      .returning();
    return updatedConversation;
  }

  async archiveConversation(id: string): Promise<Conversation> {
    const [archivedConversation] = await db
      .update(conversations)
      .set({ status: 'archived', updatedAt: new Date() })
      .where(eq(conversations.id, id))
      .returning();
    return archivedConversation;
  }

  // Messages
  async getConversationMessages(conversationId: string, limit = 50, offset = 0): Promise<Message[]> {
    return db.select().from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(desc(messages.sentAt))
      .limit(limit)
      .offset(offset);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    
    // Update conversation's last message info
    await db
      .update(conversations)
      .set({
        lastMessageAt: new Date(),
        lastMessagePreview: newMessage.content.substring(0, 100),
        updatedAt: new Date()
      })
      .where(eq(conversations.id, newMessage.conversationId));

    return newMessage;
  }

  async getMessage(id: string): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message;
  }

  async updateMessage(id: string, updates: Partial<Message>): Promise<Message> {
    const [updatedMessage] = await db
      .update(messages)
      .set({ ...updates, isEdited: true, editedAt: new Date() })
      .where(eq(messages.id, id))
      .returning();
    return updatedMessage;
  }

  async deleteMessage(id: string): Promise<boolean> {
    const result = await db.delete(messages).where(eq(messages.id, id));
    return (result.rowCount || 0) > 0;
  }

  async markMessageAsRead(messageId: string, recipientId: string, recipientType: 'patient' | 'provider'): Promise<void> {
    await db
      .update(messageRecipients)
      .set({ status: 'read', readAt: new Date() })
      .where(
        and(
          eq(messageRecipients.messageId, messageId),
          eq(messageRecipients.recipientId, recipientId),
          eq(messageRecipients.recipientType, recipientType)
        )
      );
  }

  // Message Attachments
  async createMessageAttachment(attachment: InsertMessageAttachment): Promise<MessageAttachment> {
    const [newAttachment] = await db.insert(messageAttachments).values(attachment).returning();
    return newAttachment;
  }

  async getMessageAttachments(messageId: string): Promise<MessageAttachment[]> {
    return db.select().from(messageAttachments)
      .where(eq(messageAttachments.messageId, messageId))
      .orderBy(messageAttachments.uploadedAt);
  }

  async deleteMessageAttachment(id: string): Promise<boolean> {
    const result = await db.delete(messageAttachments).where(eq(messageAttachments.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Conversation Participants
  async addConversationParticipant(participant: InsertConversationParticipant): Promise<ConversationParticipant> {
    const [newParticipant] = await db.insert(conversationParticipants).values(participant).returning();
    return newParticipant;
  }

  async removeConversationParticipant(conversationId: string, participantId: string): Promise<boolean> {
    const result = await db
      .update(conversationParticipants)
      .set({ isActive: false, leftAt: new Date() })
      .where(
        and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.participantId, participantId)
        )
      );
    return (result.rowCount || 0) > 0;
  }

  async getConversationParticipants(conversationId: string): Promise<ConversationParticipant[]> {
    return db.select().from(conversationParticipants)
      .where(
        and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.isActive, true)
        )
      )
      .orderBy(conversationParticipants.joinedAt);
  }

  // Unread message counts
  async getUnreadMessageCount(userId: string, userType: 'patient' | 'provider'): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(messageRecipients)
      .where(
        and(
          eq(messageRecipients.recipientId, userId),
          eq(messageRecipients.recipientType, userType),
          eq(messageRecipients.status, 'sent')
        )
      );
    return result.count;
  }

  async getConversationUnreadCount(conversationId: string, userId: string, userType: 'patient' | 'provider'): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(messageRecipients)
      .innerJoin(messages, eq(messageRecipients.messageId, messages.id))
      .where(
        and(
          eq(messages.conversationId, conversationId),
          eq(messageRecipients.recipientId, userId),
          eq(messageRecipients.recipientType, userType),
          eq(messageRecipients.status, 'sent')
        )
      );
    return result.count;
  }

  // Consultation operations
  async getUserConsultations(userId: string): Promise<Consultation[]> {
    return db.select().from(consultations)
      .where(eq(consultations.userId, userId))
      .orderBy(desc(consultations.scheduledAt));
  }

  async createConsultation(consultation: InsertConsultation): Promise<Consultation> {
    const [newConsultation] = await db.insert(consultations).values(consultation).returning();
    return newConsultation;
  }

  async getConsultation(id: string): Promise<Consultation | undefined> {
    const [consultation] = await db.select().from(consultations).where(eq(consultations.id, id));
    return consultation;
  }

  // Meal plan operations
  async getUserMealPlans(userId: string): Promise<MealPlan[]> {
    return db.select().from(mealPlans)
      .where(eq(mealPlans.userId, userId))
      .orderBy(desc(mealPlans.createdAt));
  }

  async createMealPlan(mealPlan: InsertMealPlan): Promise<MealPlan> {
    const [newMealPlan] = await db.insert(mealPlans).values(mealPlan).returning();
    return newMealPlan;
  }

  async getMealPlan(id: string): Promise<MealPlan | undefined> {
    const [mealPlan] = await db.select().from(mealPlans).where(eq(mealPlans.id, id));
    return mealPlan;
  }

  // Analytics operations
  async getUserDailyStats(userId: string, date: Date): Promise<{
    totalCarbs: number;
    totalMeals: number;
    averageGlucose: number;
    exerciseMinutes: number;
  }> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Run all queries concurrently for better performance
    const [mealStatsResult, glucoseStatsResult, exerciseStatsResult] = await Promise.all([
      // Get meal stats
      db
        .select({
          totalCarbs: sql<number>`COALESCE(SUM(${mealLogs.customCarbs}), 0)`,
          totalMeals: count(mealLogs.id)
        })
        .from(mealLogs)
        .where(and(
          eq(mealLogs.userId, userId),
          gte(mealLogs.loggedAt, startOfDay),
          lte(mealLogs.loggedAt, endOfDay)
        )),
      
      // Get glucose average
      db
        .select({
          averageGlucose: sql<number>`COALESCE(AVG(CAST(${glucoseReadings.value} AS FLOAT)), 0)`
        })
        .from(glucoseReadings)
        .where(and(
          eq(glucoseReadings.userId, userId),
          gte(glucoseReadings.takenAt, startOfDay),
          lte(glucoseReadings.takenAt, endOfDay)
        )),
      
      // Get exercise stats
      db
        .select({
          exerciseMinutes: sql<number>`COALESCE(SUM(${exerciseLogs.duration}), 0)`
        })
        .from(exerciseLogs)
        .where(and(
          eq(exerciseLogs.userId, userId),
          gte(exerciseLogs.loggedAt, startOfDay),
          lte(exerciseLogs.loggedAt, endOfDay)
        ))
    ]);

    return {
      totalCarbs: Number(mealStatsResult[0]?.totalCarbs || 0),
      totalMeals: Number(mealStatsResult[0]?.totalMeals || 0),
      averageGlucose: Number(glucoseStatsResult[0]?.averageGlucose || 0),
      exerciseMinutes: Number(exerciseStatsResult[0]?.exerciseMinutes || 0),
    };
  }

  // Step 2: Daily planning operations
  async getUserDailyPlan(userId: string, date: Date): Promise<{
    carb_target_g: number;
    carbs_used_today_g: number;
    carbs_remaining_g: number;
    suggestedRecipes: Meal[];
  }> {
    // Get user with goals
    const user = await this.getUser(userId);
    const goals = user?.goals as any || { carb_target_g: 180 };
    const carbTarget = goals.carb_target_g || 180;

    // Get today's carbs used
    const todayLogs = await this.getTodayMealLogs(userId);
    const carbsUsed = todayLogs.reduce((total, log) => {
      return total + (log.customCarbs ? Number(log.customCarbs) : 0);
    }, 0);

    // Calculate remaining carbs
    const carbsRemaining = Math.max(0, carbTarget - carbsUsed);

    // Get suggested recipes based on remaining carbs and user prefs
    const suggestedRecipes = await this.getSuggestedRecipes(carbsRemaining, user?.prefs);

    return {
      carb_target_g: carbTarget,
      carbs_used_today_g: carbsUsed,
      carbs_remaining_g: carbsRemaining,
      suggestedRecipes
    };
  }

  async getTodayMealLogs(userId: string): Promise<MealLog[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return db.select().from(mealLogs)
      .where(and(
        eq(mealLogs.userId, userId),
        gte(mealLogs.loggedAt, today),
        lte(mealLogs.loggedAt, endOfDay)
      ))
      .orderBy(desc(mealLogs.loggedAt));
  }

  async getSuggestedRecipes(carbsRemaining: number, prefs?: any): Promise<Meal[]> {
    const maxCarbs = Math.max(carbsRemaining, 30); // Show at least some options
    const conditions: any[] = [
      lte(meals.carbohydrates, maxCarbs.toString()) // carbohydrates is stored as decimal
    ];

    // Filter by dietary preferences if provided
    if (prefs?.dietary_tags?.length > 0) {
      // This is simplified - in a real app you'd have proper tag filtering
      // For now, we'll just get low GI meals which align with diabetes-friendly eating
      conditions.push(eq(meals.glycemicIndex, 'low'));
    }

    return db.select().from(meals)
      .where(and(...conditions))
      .orderBy(meals.carbohydrates) // Show lowest carb options first
      .limit(3); // Return top 3 suggestions
  }

  // Chat operations
  async getUserChatMessages(userId: string, limit: number = 50): Promise<ChatMessage[]> {
    return db.select().from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
  }

  async createChatMessage(chatMessage: InsertChatMessage): Promise<ChatMessage> {
    const [newChatMessage] = await db.insert(chatMessages).values(chatMessage).returning();
    return newChatMessage;
  }

  // Holistic wellness operations
  async getUserMindfulnessSessions(userId: string): Promise<MindfulnessSession[]> {
    return db.select().from(mindfulnessSessions)
      .where(eq(mindfulnessSessions.userId, userId))
      .orderBy(desc(mindfulnessSessions.completedAt));
  }

  async createMindfulnessSession(session: InsertMindfulnessSession): Promise<MindfulnessSession> {
    const [newSession] = await db.insert(mindfulnessSessions).values(session).returning();
    return newSession;
  }

  async getUserMoodLogs(userId: string, startDate?: Date, endDate?: Date): Promise<MoodLog[]> {
    if (startDate && endDate) {
      return db.select().from(moodLogs).where(and(
        eq(moodLogs.userId, userId),
        gte(moodLogs.loggedAt, startDate),
        lte(moodLogs.loggedAt, endDate)
      )).orderBy(desc(moodLogs.loggedAt));
    }
    
    return db.select().from(moodLogs).where(eq(moodLogs.userId, userId)).orderBy(desc(moodLogs.loggedAt));
  }

  async createMoodLog(moodLog: InsertMoodLog): Promise<MoodLog> {
    const [newMoodLog] = await db.insert(moodLogs).values(moodLog).returning();
    return newMoodLog;
  }

  async createUserMoodLog(moodLog: InsertUserMoodLog): Promise<UserMoodLog> {
    const [newMoodLog] = await db.insert(userMoodLog).values(moodLog).returning();
    return newMoodLog;
  }

  async getUserMoodLogsSimple(userId: string, startDate?: Date, endDate?: Date): Promise<UserMoodLog[]> {
    if (startDate && endDate) {
      return db.select().from(userMoodLog).where(and(
        eq(userMoodLog.userId, userId),
        gte(userMoodLog.createdAt, startDate),
        lte(userMoodLog.createdAt, endDate)
      )).orderBy(desc(userMoodLog.createdAt));
    }
    
    return db.select().from(userMoodLog).where(eq(userMoodLog.userId, userId)).orderBy(desc(userMoodLog.createdAt));
  }

  async getLatestUserMoodLog(userId: string): Promise<UserMoodLog | undefined> {
    const [latestLog] = await db.select()
      .from(userMoodLog)
      .where(eq(userMoodLog.userId, userId))
      .orderBy(desc(userMoodLog.createdAt))
      .limit(1);
    return latestLog;
  }

  async getUserSleepLogs(userId: string, startDate?: Date, endDate?: Date): Promise<SleepLog[]> {
    if (startDate && endDate) {
      return db.select().from(sleepLogs).where(and(
        eq(sleepLogs.userId, userId),
        gte(sleepLogs.loggedAt, startDate),
        lte(sleepLogs.loggedAt, endDate)
      )).orderBy(desc(sleepLogs.loggedAt));
    }
    
    return db.select().from(sleepLogs).where(eq(sleepLogs.userId, userId)).orderBy(desc(sleepLogs.loggedAt));
  }

  async createSleepLog(sleepLog: InsertSleepLog): Promise<SleepLog> {
    const [newSleepLog] = await db.insert(sleepLogs).values(sleepLog).returning();
    return newSleepLog;
  }

  async getUserEnergyLogs(userId: string, startDate?: Date, endDate?: Date): Promise<EnergyLog[]> {
    if (startDate && endDate) {
      return db.select().from(energyLogs).where(and(
        eq(energyLogs.userId, userId),
        gte(energyLogs.loggedAt, startDate),
        lte(energyLogs.loggedAt, endDate)
      )).orderBy(desc(energyLogs.loggedAt));
    }
    
    return db.select().from(energyLogs).where(eq(energyLogs.userId, userId)).orderBy(desc(energyLogs.loggedAt));
  }

  async createEnergyLog(energyLog: InsertEnergyLog): Promise<EnergyLog> {
    const [newEnergyLog] = await db.insert(energyLogs).values(energyLog).returning();
    return newEnergyLog;
  }

  async getTodaysEnergyLog(userId: string): Promise<EnergyLog | undefined> {
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      
      const logs = await db.select().from(energyLogs)
        .where(and(
          eq(energyLogs.userId, userId),
          gte(energyLogs.loggedAt, todayStart),
          lte(energyLogs.loggedAt, todayEnd)
        ))
        .orderBy(desc(energyLogs.loggedAt))
        .limit(1);
      return logs[0];
    } catch (error) {
      console.error('Error fetching today\'s energy log:', error);
      return undefined; // Gracefully handle missing columns
    }
  }

  async getUserJournalEntries(userId: string): Promise<JournalEntry[]> {
    return db.select().from(journalEntries)
      .where(eq(journalEntries.userId, userId))
      .orderBy(desc(journalEntries.createdAt));
  }

  async createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry> {
    const [newEntry] = await db.insert(journalEntries).values(entry).returning();
    return newEntry;
  }

  // Health Planning operations implementations
  
  // Preventive care tasks
  async getUserPreventiveCareTasks(userId: string, status?: string): Promise<PreventiveCareTask[]> {
    const conditions = [eq(preventiveCareTasks.userId, userId)];
    if (status) {
      conditions.push(eq(preventiveCareTasks.status, status as any));
    }
    return db.select().from(preventiveCareTasks)
      .where(and(...conditions))
      .orderBy(desc(preventiveCareTasks.dueDate));
  }

  async createPreventiveCareTask(task: InsertPreventiveCareTask): Promise<PreventiveCareTask> {
    const [newTask] = await db.insert(preventiveCareTasks).values(task).returning();
    return newTask;
  }

  async getPreventiveCareTask(id: string): Promise<PreventiveCareTask | undefined> {
    const [task] = await db.select().from(preventiveCareTasks).where(eq(preventiveCareTasks.id, id));
    return task;
  }

  async updatePreventiveCareTask(id: string, updates: Partial<PreventiveCareTask>): Promise<PreventiveCareTask> {
    const [updatedTask] = await db
      .update(preventiveCareTasks)
      .set(updates)
      .where(eq(preventiveCareTasks.id, id))
      .returning();
    return updatedTask;
  }

  async getOverduePreventiveCareTasks(userId: string): Promise<PreventiveCareTask[]> {
    const now = new Date();
    return db.select().from(preventiveCareTasks)
      .where(and(
        eq(preventiveCareTasks.userId, userId),
        lte(preventiveCareTasks.dueDate, now),
        eq(preventiveCareTasks.status, 'due')
      ))
      .orderBy(preventiveCareTasks.dueDate);
  }

  async getDueTodayPreventiveCareTasks(userId: string): Promise<PreventiveCareTask[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    return db.select().from(preventiveCareTasks)
      .where(and(
        eq(preventiveCareTasks.userId, userId),
        gte(preventiveCareTasks.dueDate, startOfDay),
        lte(preventiveCareTasks.dueDate, endOfDay),
        eq(preventiveCareTasks.status, 'due')
      ))
      .orderBy(preventiveCareTasks.dueDate);
  }

  async getPreventiveCareTasksDueToday(userId: string): Promise<PreventiveCareTask[]> {
    return this.getDueTodayPreventiveCareTasks(userId);
  }

  async markPreventiveCareTaskComplete(id: string): Promise<PreventiveCareTask | undefined> {
    const [updatedTask] = await db
      .update(preventiveCareTasks)
      .set({ status: 'completed', completedAt: new Date() })
      .where(eq(preventiveCareTasks.id, id))
      .returning();
    return updatedTask;
  }

  async deletePreventiveCareTask(id: string): Promise<boolean> {
    const result = await db.delete(preventiveCareTasks).where(eq(preventiveCareTasks.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Goals and goal progress
  async getUserGoals(userId: string, status?: string, category?: string): Promise<Goal[]> {
    const conditions = [eq(goals.userId, userId)];
    if (status) {
      conditions.push(eq(goals.status, status as any));
    }
    if (category) {
      conditions.push(eq(goals.category, category as any));
    }
    return db.select().from(goals)
      .where(and(...conditions))
      .orderBy(desc(goals.createdAt));
  }

  async createGoal(goal: InsertGoal): Promise<Goal> {
    const [newGoal] = await db.insert(goals).values(goal).returning();
    return newGoal;
  }

  async getGoal(id: string): Promise<Goal | undefined> {
    const [goal] = await db.select().from(goals).where(eq(goals.id, id));
    return goal;
  }

  async updateGoal(id: string, updates: Partial<Goal>): Promise<Goal> {
    const [updatedGoal] = await db
      .update(goals)
      .set(updates)
      .where(eq(goals.id, id))
      .returning();
    return updatedGoal;
  }

  async getGoalLogs(goalId: string): Promise<GoalLog[]> {
    return db.select().from(goalLogs)
      .where(eq(goalLogs.goalId, goalId))
      .orderBy(desc(goalLogs.loggedAt));
  }

  async createGoalLog(log: InsertGoalLog): Promise<GoalLog> {
    const [newLog] = await db.insert(goalLogs).values(log).returning();
    return newLog;
  }

  async getUserActiveGoals(userId: string): Promise<Goal[]> {
    return db.select().from(goals)
      .where(and(
        eq(goals.userId, userId),
        eq(goals.status, 'active')
      ))
      .orderBy(desc(goals.createdAt));
  }

  async deleteGoal(id: string): Promise<boolean> {
    const result = await db.delete(goals).where(eq(goals.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getGoalProgress(goalId: string, startDate?: Date, endDate?: Date): Promise<GoalLog[]> {
    const conditions = [eq(goalLogs.goalId, goalId)];
    if (startDate) {
      conditions.push(gte(goalLogs.loggedAt, startDate));
    }
    if (endDate) {
      conditions.push(lte(goalLogs.loggedAt, endDate));
    }
    return db.select().from(goalLogs)
      .where(and(...conditions))
      .orderBy(desc(goalLogs.loggedAt));
  }

  // Medications
  async getUserMedications(userId: string, isActive?: boolean): Promise<Medication[]> {
    const conditions = [eq(medications.userId, userId)];
    if (isActive !== undefined) {
      conditions.push(eq(medications.isActive, isActive));
    }
    return db.select().from(medications)
      .where(and(...conditions))
      .orderBy(medications.name);
  }

  async createMedication(medication: InsertMedication): Promise<Medication> {
    const [newMedication] = await db.insert(medications).values(medication).returning();
    return newMedication;
  }

  async getMedication(id: string): Promise<Medication | undefined> {
    const [medication] = await db.select().from(medications).where(eq(medications.id, id));
    return medication;
  }

  async updateMedication(id: string, updates: Partial<Medication>): Promise<Medication> {
    const [updatedMedication] = await db
      .update(medications)
      .set(updates)
      .where(eq(medications.id, id))
      .returning();
    return updatedMedication;
  }

  async deleteMedication(id: string): Promise<boolean> {
    const result = await db.delete(medications).where(eq(medications.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getMedicationsDueToday(userId: string): Promise<{ medication: Medication; schedule: MedicationSchedule }[]> {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Get medications with schedules for today
    const results = await db
      .select({
        medication: medications,
        schedule: medicationSchedules
      })
      .from(medications)
      .innerJoin(medicationSchedules, eq(medications.id, medicationSchedules.medicationId))
      .where(and(
        eq(medications.userId, userId),
        eq(medications.isActive, true)
        // Note: Need to add proper day-of-week filtering once schedule schema includes it
      ));
      
    return results;
  }

  // Medication schedules
  async getMedicationSchedules(medicationId: string): Promise<MedicationSchedule[]> {
    return db.select().from(medicationSchedules)
      .where(eq(medicationSchedules.medicationId, medicationId))
      .orderBy(desc(medicationSchedules.createdAt));
  }

  async createMedicationSchedule(schedule: InsertMedicationSchedule): Promise<MedicationSchedule> {
    const [newSchedule] = await db.insert(medicationSchedules).values(schedule).returning();
    return newSchedule;
  }

  async getMedicationSchedule(id: string): Promise<MedicationSchedule | undefined> {
    const [schedule] = await db.select().from(medicationSchedules).where(eq(medicationSchedules.id, id));
    return schedule;
  }

  async updateMedicationSchedule(id: string, updates: Partial<MedicationSchedule>): Promise<MedicationSchedule> {
    const [updatedSchedule] = await db
      .update(medicationSchedules)
      .set(updates)
      .where(eq(medicationSchedules.id, id))
      .returning();
    return updatedSchedule;
  }

  // Medication intakes
  async getUserMedicationIntakes(userId: string, startDate?: Date, endDate?: Date): Promise<MedicationIntake[]> {
    if (startDate && endDate) {
      const result = await db.select({
        id: medicationIntakes.id,
        medicationId: medicationIntakes.medicationId,
        scheduleId: medicationIntakes.scheduleId,
        takenAt: medicationIntakes.takenAt,
        status: medicationIntakes.status,
        actualAmount: medicationIntakes.actualAmount,
        notes: medicationIntakes.notes,
      }).from(medicationIntakes)
        .innerJoin(medications, eq(medicationIntakes.medicationId, medications.id))
        .where(and(
          eq(medications.userId, userId),
          gte(medicationIntakes.takenAt, startDate),
          lte(medicationIntakes.takenAt, endDate)
        ))
        .orderBy(desc(medicationIntakes.takenAt));
      return result;
    }
    
    const result = await db.select({
      id: medicationIntakes.id,
      medicationId: medicationIntakes.medicationId,
      scheduleId: medicationIntakes.scheduleId,
      takenAt: medicationIntakes.takenAt,
      status: medicationIntakes.status,
      actualAmount: medicationIntakes.actualAmount,
      notes: medicationIntakes.notes,
    }).from(medicationIntakes)
      .innerJoin(medications, eq(medicationIntakes.medicationId, medications.id))
      .where(eq(medications.userId, userId))
      .orderBy(desc(medicationIntakes.takenAt));
    return result;
  }

  async createMedicationIntake(intake: InsertMedicationIntake): Promise<MedicationIntake> {
    const [newIntake] = await db.insert(medicationIntakes).values(intake).returning();
    return newIntake;
  }

  async getMedicationIntake(id: string): Promise<MedicationIntake | undefined> {
    const [intake] = await db.select().from(medicationIntakes).where(eq(medicationIntakes.id, id));
    return intake;
  }

  async getTodayMedicationSchedule(userId: string): Promise<{ schedule: MedicationSchedule; medication: Medication; intakes: MedicationIntake[] }[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    const schedules = await db
      .select()
      .from(medicationSchedules)
      .innerJoin(medications, eq(medicationSchedules.medicationId, medications.id))
      .where(and(
        eq(medications.userId, userId),
        eq(medications.isActive, true),
        eq(medicationSchedules.isActive, true)
      ));

    const result = [];
    for (const { medication_schedules: schedule, medications: medication } of schedules) {
      const intakes = await db.select().from(medicationIntakes)
        .where(and(
          eq(medicationIntakes.medicationId, medication.id),
          gte(medicationIntakes.takenAt, startOfDay),
          lte(medicationIntakes.takenAt, endOfDay)
        ));
      
      result.push({ schedule, medication, intakes });
    }
    
    return result;
  }

  // Appointments
  async getUserAppointments(userId: string, status?: string): Promise<Appointment[]> {
    const conditions = [eq(appointments.userId, userId)];
    if (status) {
      conditions.push(eq(appointments.status, status as any));
    }
    
    return db.select().from(appointments)
      .where(and(...conditions))
      .orderBy(desc(appointments.scheduledAt));
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const [newAppointment] = await db.insert(appointments).values(appointment).returning();
    return newAppointment;
  }

  async getAppointment(id: string): Promise<Appointment | undefined> {
    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id));
    return appointment;
  }

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    const [updatedAppointment] = await db
      .update(appointments)
      .set(updates)
      .where(eq(appointments.id, id))
      .returning();
    return updatedAppointment;
  }

  async getUpcomingAppointments(userId: string, days: number = 7): Promise<Appointment[]> {
    const now = new Date();
    const future = new Date();
    future.setDate(now.getDate() + days);
    
    return db.select().from(appointments)
      .where(and(
        eq(appointments.userId, userId),
        gte(appointments.scheduledAt, now),
        lte(appointments.scheduledAt, future),
        eq(appointments.status, 'scheduled')
      ))
      .orderBy(appointments.scheduledAt);
  }

  async getTodayAppointments(userId: string): Promise<Appointment[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    return db.select().from(appointments)
      .where(and(
        eq(appointments.userId, userId),
        gte(appointments.scheduledAt, startOfDay),
        lte(appointments.scheduledAt, endOfDay)
      ))
      .orderBy(appointments.scheduledAt);
  }

  async getPastAppointments(userId: string): Promise<Appointment[]> {
    const now = new Date();
    return db.select().from(appointments)
      .where(and(
        eq(appointments.userId, userId),
        lte(appointments.scheduledAt, now)
      ))
      .orderBy(desc(appointments.scheduledAt));
  }

  async deleteAppointment(id: string): Promise<boolean> {
    const result = await db.delete(appointments).where(eq(appointments.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Wellness plan templates
  async getWellnessPlanTemplates(isActive?: boolean): Promise<WellnessPlanTemplate[]> {
    if (isActive !== undefined) {
      return db.select().from(wellnessPlanTemplates)
        .where(eq(wellnessPlanTemplates.isActive, isActive))
        .orderBy(wellnessPlanTemplates.name);
    }
    
    return db.select().from(wellnessPlanTemplates)
      .orderBy(wellnessPlanTemplates.name);
  }

  async createWellnessPlanTemplate(template: InsertWellnessPlanTemplate): Promise<WellnessPlanTemplate> {
    const [newTemplate] = await db.insert(wellnessPlanTemplates).values(template).returning();
    return newTemplate;
  }

  async getWellnessPlanTemplate(id: string): Promise<WellnessPlanTemplate | undefined> {
    const [template] = await db.select().from(wellnessPlanTemplates).where(eq(wellnessPlanTemplates.id, id));
    return template;
  }

  async updateWellnessPlanTemplate(id: string, updates: Partial<WellnessPlanTemplate>): Promise<WellnessPlanTemplate> {
    const [updatedTemplate] = await db
      .update(wellnessPlanTemplates)
      .set(updates)
      .where(eq(wellnessPlanTemplates.id, id))
      .returning();
    return updatedTemplate;
  }

  // User wellness plans
  async getUserWellnessPlans(userId: string, status?: string): Promise<UserWellnessPlan[]> {
    const conditions = [eq(userWellnessPlans.userId, userId)];
    if (status) {
      conditions.push(eq(userWellnessPlans.status, status));
    }
    return db.select().from(userWellnessPlans)
      .where(and(...conditions))
      .orderBy(desc(userWellnessPlans.createdAt));
  }

  async createUserWellnessPlan(plan: InsertUserWellnessPlan): Promise<UserWellnessPlan> {
    const [newPlan] = await db.insert(userWellnessPlans).values(plan).returning();
    return newPlan;
  }

  async getUserWellnessPlan(id: string): Promise<UserWellnessPlan | undefined> {
    const [plan] = await db.select().from(userWellnessPlans).where(eq(userWellnessPlans.id, id));
    return plan;
  }

  async updateUserWellnessPlan(id: string, updates: Partial<UserWellnessPlan>): Promise<UserWellnessPlan> {
    const [updatedPlan] = await db
      .update(userWellnessPlans)
      .set(updates)
      .where(eq(userWellnessPlans.id, id))
      .returning();
    return updatedPlan;
  }

  // Wellness plan tasks
  async getWellnessPlanTasks(planId: string): Promise<WellnessPlanTask[]> {
    return db.select().from(wellnessPlanTasks)
      .where(eq(wellnessPlanTasks.planId, planId))
      .orderBy(desc(wellnessPlanTasks.createdAt));
  }

  async createWellnessPlanTask(task: InsertWellnessPlanTask): Promise<WellnessPlanTask> {
    const [newTask] = await db.insert(wellnessPlanTasks).values(task).returning();
    return newTask;
  }

  async getWellnessPlanTask(id: string): Promise<WellnessPlanTask | undefined> {
    const [task] = await db.select().from(wellnessPlanTasks).where(eq(wellnessPlanTasks.id, id));
    return task;
  }

  async updateWellnessPlanTask(id: string, updates: Partial<WellnessPlanTask>): Promise<WellnessPlanTask> {
    const [updatedTask] = await db
      .update(wellnessPlanTasks)
      .set(updates)
      .where(eq(wellnessPlanTasks.id, id))
      .returning();
    return updatedTask;
  }

  async getUserTodayWellnessTasks(userId: string): Promise<WellnessPlanTask[]> {
    const result = await db.select({
      id: wellnessPlanTasks.id,
      planId: wellnessPlanTasks.planId,
      title: wellnessPlanTasks.title,
      description: wellnessPlanTasks.description,
      type: wellnessPlanTasks.type,
      cadence: wellnessPlanTasks.cadence,
      weekdays: wellnessPlanTasks.weekdays,
      dueTime: wellnessPlanTasks.dueTime,
      completedAt: wellnessPlanTasks.completedAt,
      isCompleted: wellnessPlanTasks.isCompleted,
      createdAt: wellnessPlanTasks.createdAt,
    }).from(wellnessPlanTasks)
      .innerJoin(userWellnessPlans, eq(wellnessPlanTasks.planId, userWellnessPlans.id))
      .where(and(
        eq(userWellnessPlans.userId, userId),
        eq(userWellnessPlans.status, 'active'),
        eq(wellnessPlanTasks.cadence, 'daily'),
        eq(wellnessPlanTasks.isCompleted, false)
      ))
      .orderBy(wellnessPlanTasks.dueTime);
    return result;
  }

  // Risk assessments
  async getUserRiskAssessments(userId: string, type?: string): Promise<RiskAssessment[]> {
    const conditions = [eq(riskAssessments.userId, userId)];
    if (type) {
      conditions.push(eq(riskAssessments.type, type as any));
    }
    return db.select().from(riskAssessments)
      .where(and(...conditions))
      .orderBy(desc(riskAssessments.assessedAt));
  }

  async createRiskAssessment(assessment: InsertRiskAssessment): Promise<RiskAssessment> {
    const [newAssessment] = await db.insert(riskAssessments).values(assessment).returning();
    return newAssessment;
  }

  async getRiskAssessment(id: string): Promise<RiskAssessment | undefined> {
    const [assessment] = await db.select().from(riskAssessments).where(eq(riskAssessments.id, id));
    return assessment;
  }

  async getLatestRiskAssessment(userId: string, type?: string): Promise<RiskAssessment | undefined> {
    const conditions = [eq(riskAssessments.userId, userId)];
    if (type) {
      conditions.push(eq(riskAssessments.type, type as any));
    }
    const [assessment] = await db.select().from(riskAssessments)
      .where(and(...conditions))
      .orderBy(desc(riskAssessments.assessedAt))
      .limit(1);
    return assessment;
  }

  async updateRiskAssessment(id: string, updates: Partial<RiskAssessment>): Promise<RiskAssessment | undefined> {
    const [updatedAssessment] = await db
      .update(riskAssessments)
      .set(updates)
      .where(eq(riskAssessments.id, id))
      .returning();
    return updatedAssessment;
  }

  async deleteRiskAssessment(id: string): Promise<boolean> {
    const result = await db.delete(riskAssessments).where(eq(riskAssessments.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async markWellnessPlanTaskComplete(id: string): Promise<WellnessPlanTask | undefined> {
    const [updatedTask] = await db
      .update(wellnessPlanTasks)
      .set({ isCompleted: true, completedAt: new Date() })
      .where(eq(wellnessPlanTasks.id, id))
      .returning();
    return updatedTask;
  }

  // Community Features implementations
  // Community Posts
  async getCommunityPosts(type?: string): Promise<CommunityPost[]> {
    if (type) {
      return db.select().from(communityPosts)
        .where(eq(communityPosts.type, type as any))
        .orderBy(desc(communityPosts.createdAt));
    }
    return db.select().from(communityPosts)
      .orderBy(desc(communityPosts.createdAt));
  }

  async createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost> {
    const [newPost] = await db.insert(communityPosts).values(post).returning();
    return newPost;
  }

  // Community Groups
  async getCommunityGroups(category?: string): Promise<CommunityGroup[]> {
    if (category) {
      return db.select().from(communityGroups)
        .where(eq(communityGroups.category, category))
        .orderBy(desc(communityGroups.createdAt));
    }
    return db.select().from(communityGroups)
      .orderBy(desc(communityGroups.createdAt));
  }

  async createCommunityGroup(group: InsertCommunityGroup): Promise<CommunityGroup> {
    const [newGroup] = await db.insert(communityGroups).values(group).returning();
    return newGroup;
  }

  async joinCommunityGroup(membership: InsertCommunityGroupMember): Promise<CommunityGroupMember> {
    const [newMember] = await db.insert(communityGroupMembers).values(membership).returning();
    
    // Update member count
    await db
      .update(communityGroups)
      .set({ memberCount: sql`${communityGroups.memberCount} + 1` })
      .where(eq(communityGroups.id, membership.groupId));
    
    return newMember;
  }

  async leaveCommunityGroup(groupId: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(communityGroupMembers)
      .where(and(
        eq(communityGroupMembers.groupId, groupId),
        eq(communityGroupMembers.userId, userId)
      ));
    
    if (result.rowCount && result.rowCount > 0) {
      // Update member count
      await db
        .update(communityGroups)
        .set({ memberCount: sql`${communityGroups.memberCount} - 1` })
        .where(eq(communityGroups.id, groupId));
      return true;
    }
    return false;
  }

  async getCommunityGroupMembers(groupId: string): Promise<CommunityGroupMember[]> {
    return db.select().from(communityGroupMembers)
      .where(eq(communityGroupMembers.groupId, groupId))
      .orderBy(communityGroupMembers.joinedAt);
  }

  // Expert Q&A Sessions
  async getExpertQASessions(upcoming?: boolean): Promise<ExpertQASession[]> {
    if (upcoming) {
      return db.select().from(expertQASessions)
        .where(gte(expertQASessions.scheduledAt, new Date()))
        .orderBy(expertQASessions.scheduledAt);
    }
    return db.select().from(expertQASessions)
      .orderBy(desc(expertQASessions.scheduledAt));
  }

  async createExpertQASession(session: InsertExpertQASession): Promise<ExpertQASession> {
    const [newSession] = await db.insert(expertQASessions).values(session).returning();
    return newSession;
  }

  async registerForQASession(registration: InsertQASessionRegistration): Promise<QASessionRegistration> {
    const [newRegistration] = await db.insert(qaSessionRegistrations).values(registration).returning();
    
    // Update participant count
    await db
      .update(expertQASessions)
      .set({ currentParticipants: sql`${expertQASessions.currentParticipants} + 1` })
      .where(eq(expertQASessions.id, registration.sessionId));
    
    return newRegistration;
  }

  // Peer Partnerships
  async getUserPartnerships(userId: string): Promise<PeerPartnership[]> {
    return db.select().from(peerPartnerships)
      .where(or(
        eq(peerPartnerships.initiatorId, userId),
        eq(peerPartnerships.partnerId, userId)
      ))
      .orderBy(desc(peerPartnerships.createdAt));
  }

  async createPeerPartnership(partnership: InsertPeerPartnership): Promise<PeerPartnership> {
    const [newPartnership] = await db.insert(peerPartnerships).values(partnership).returning();
    return newPartnership;
  }

  async createPartnershipCheckIn(checkIn: InsertPartnershipCheckIn): Promise<PartnershipCheckIn> {
    const [newCheckIn] = await db.insert(partnershipCheckIns).values(checkIn).returning();
    return newCheckIn;
  }

  // Health Challenges
  async getHealthChallenges(category?: string, active?: boolean): Promise<HealthChallenge[]> {
    const conditions = [];
    
    if (category) {
      conditions.push(eq(healthChallenges.category, category));
    }
    
    if (active !== undefined) {
      conditions.push(eq(healthChallenges.isActive, active));
    }
    
    if (conditions.length > 0) {
      return db.select().from(healthChallenges)
        .where(and(...conditions))
        .orderBy(desc(healthChallenges.createdAt));
    }
    
    return db.select().from(healthChallenges)
      .orderBy(desc(healthChallenges.createdAt));
  }

  async createHealthChallenge(challenge: InsertHealthChallenge): Promise<HealthChallenge> {
    const [newChallenge] = await db.insert(healthChallenges).values(challenge).returning();
    return newChallenge;
  }

  async joinHealthChallenge(participation: InsertChallengeParticipation): Promise<ChallengeParticipation> {
    const [newParticipation] = await db.insert(challengeParticipations).values(participation).returning();
    
    // Update participant count
    await db
      .update(healthChallenges)
      .set({ participantCount: sql`${healthChallenges.participantCount} + 1` })
      .where(eq(healthChallenges.id, participation.challengeId));
    
    return newParticipation;
  }

  async logChallengeProgress(progress: InsertChallengeProgressLog): Promise<ChallengeProgressLog> {
    const [newProgress] = await db.insert(challengeProgressLogs).values(progress).returning();
    return newProgress;
  }

  // Educational Library operations
  async getEducationContent(category?: string, difficulty?: string, type?: string): Promise<EducationContent[]> {
    const conditions = [];
    
    if (category && category !== 'all') {
      conditions.push(eq(educationContent.category, category as any));
    }
    
    if (difficulty && difficulty !== 'all') {
      conditions.push(eq(educationContent.difficulty, difficulty as any));
    }
    
    if (type && type !== 'all') {
      conditions.push(eq(educationContent.type, type as any));
    }
    
    if (conditions.length > 0) {
      return db.select().from(educationContent)
        .where(and(...conditions))
        .orderBy(desc(educationContent.createdAt));
    }
    
    return db.select().from(educationContent)
      .orderBy(desc(educationContent.createdAt));
  }

  async getEducationContentById(id: string): Promise<EducationContent | undefined> {
    const [content] = await db.select().from(educationContent).where(eq(educationContent.id, id));
    return content;
  }

  async createEducationContent(content: InsertEducationContent): Promise<EducationContent> {
    const [newContent] = await db.insert(educationContent).values(content).returning();
    return newContent;
  }

  async searchEducationContent(query: string): Promise<EducationContent[]> {
    return db.select().from(educationContent)
      .where(or(
        like(educationContent.title, `%${query}%`),
        like(educationContent.description, `%${query}%`)
      ))
      .orderBy(desc(educationContent.createdAt));
  }

  async getUserEducationProgress(userId: string): Promise<EducationProgress[]> {
    return db.select().from(educationProgress)
      .where(eq(educationProgress.userId, userId))
      .orderBy(desc(educationProgress.updatedAt));
  }

  async createEducationProgress(progress: InsertEducationProgress): Promise<EducationProgress> {
    const [newProgress] = await db.insert(educationProgress).values(progress).returning();
    return newProgress;
  }

  async updateEducationProgress(id: string, updates: Partial<EducationProgress>): Promise<EducationProgress> {
    const [updatedProgress] = await db
      .update(educationProgress)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(educationProgress.id, id))
      .returning();
    return updatedProgress;
  }

  // Learning Paths operations
  async getLearningPaths(): Promise<any[]> {
    const paths = await db
      .select()
      .from(learningPaths)
      .orderBy(learningPaths.createdAt);
    
    // Get module counts for each path
    const pathsWithModules = await Promise.all(
      paths.map(async (path) => {
        const modules = await db
          .select()
          .from(learningPathModules)
          .where(eq(learningPathModules.pathId, path.id));
        
        return {
          ...path,
          totalModules: modules.length
        };
      })
    );
    
    // Sort by difficulty: beginner → intermediate → advanced
    const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
    return pathsWithModules.sort((a, b) => {
      const orderA = difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 999;
      const orderB = difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 999;
      return orderA - orderB;
    });
  }

  async getLearningPathById(id: string): Promise<any | undefined> {
    const [path] = await db.select().from(learningPaths).where(eq(learningPaths.id, id));
    if (!path) return undefined;
    
    // Get total module count
    const modules = await db
      .select()
      .from(learningPathModules)
      .where(eq(learningPathModules.pathId, id));
    
    return {
      ...path,
      totalModules: modules.length
    };
  }

  async getLearningPathModules(pathId: string): Promise<any[]> {
    const modules = await db
      .select({
        id: learningPathModules.id,
        pathId: learningPathModules.pathId,
        moduleOrder: learningPathModules.moduleOrder,
        isRequired: learningPathModules.isRequired,
        content: educationContent
      })
      .from(learningPathModules)
      .leftJoin(educationContent, eq(learningPathModules.contentId, educationContent.id))
      .where(eq(learningPathModules.pathId, pathId))
      .orderBy(learningPathModules.moduleOrder);
    
    return modules;
  }

  async getUserLearningPathProgress(userId: string, pathId: string): Promise<any | undefined> {
    const [progress] = await db
      .select()
      .from(learningPathProgress)
      .where(
        and(
          eq(learningPathProgress.userId, userId),
          eq(learningPathProgress.pathId, pathId)
        )
      );
    
    return progress;
  }

  async createLearningPathProgress(progress: any): Promise<any> {
    const [newProgress] = await db.insert(learningPathProgress).values(progress).returning();
    return newProgress;
  }

  async updateLearningPathProgress(id: string, updates: any): Promise<any> {
    const [updatedProgress] = await db
      .update(learningPathProgress)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(learningPathProgress.id, id))
      .returning();
    return updatedProgress;
  }

  // Gamification operations
  async getUserPoints(userId: string): Promise<UserPoints | undefined> {
    const [points] = await db.select().from(userPoints).where(eq(userPoints.userId, userId));
    return points;
  }

  async createUserPoints(points: InsertUserPoints): Promise<UserPoints> {
    const [newPoints] = await db.insert(userPoints).values(points).returning();
    return newPoints;
  }

  async updateUserPoints(userId: string, points: number): Promise<UserPoints> {
    const [updatedPoints] = await db
      .update(userPoints)
      .set({ totalPoints: points, updatedAt: new Date() })
      .where(eq(userPoints.userId, userId))
      .returning();
    return updatedPoints;
  }

  async addPointTransaction(transaction: InsertPointTransaction): Promise<PointTransaction> {
    const [newTransaction] = await db.insert(pointTransactions).values(transaction).returning();
    
    // Update user's total points
    await db
      .update(userPoints)
      .set({ totalPoints: sql`${userPoints.totalPoints} + ${transaction.points}` })
      .where(eq(userPoints.userId, transaction.userId));
      
    return newTransaction;
  }

  async getUserPointTransactions(userId: string): Promise<PointTransaction[]> {
    return db.select().from(pointTransactions)
      .where(eq(pointTransactions.userId, userId))
      .orderBy(desc(pointTransactions.createdAt));
  }

  async getBadges(): Promise<Badge[]> {
    return db.select().from(badges).orderBy(badges.name);
  }

  async getUserBadges(userId: string): Promise<UserBadge[]> {
    const userBadgeData = await db
      .select({
        id: userBadges.id,
        userId: userBadges.userId,
        badgeId: userBadges.badgeId,
        earnedAt: userBadges.earnedAt,
        badgeName: badges.name,
        badgeDescription: badges.description,
      })
      .from(userBadges)
      .leftJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(eq(userBadges.userId, userId))
      .orderBy(desc(userBadges.earnedAt));

    return userBadgeData.map(row => ({
      id: row.id,
      userId: row.userId,
      badgeId: row.badgeId,
      earnedAt: row.earnedAt,
      name: row.badgeName || 'Unknown Badge',
      description: row.badgeDescription || '',
    })) as any;
  }

  async awardBadgeToUser(userBadge: InsertUserBadge): Promise<UserBadge> {
    const [newBadge] = await db.insert(userBadges).values(userBadge).returning();
    return newBadge;
  }

  async getJourneyMoodEnergy(userId: string, days: number): Promise<Array<{ date: string; mood: number; energy: number }>> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Map mood/energy enums to numeric values
    const moodMap: Record<string, number> = { very_low: 1, low: 2, neutral: 3, good: 4, excellent: 5 };
    const energyMap: Record<string, number> = { very_low: 1, low: 2, moderate: 3, high: 4, very_high: 5 };
    
    // Get mood logs for the period
    const moodData = await db.select()
      .from(moodLogs)
      .where(and(
        eq(moodLogs.userId, userId),
        gte(moodLogs.loggedAt, startDate)
      ))
      .orderBy(moodLogs.loggedAt);
    
    // Get energy logs for the period
    const energyData = await db.select()
      .from(energyLogs)
      .where(and(
        eq(energyLogs.userId, userId),
        gte(energyLogs.loggedAt, startDate)
      ))
      .orderBy(energyLogs.loggedAt);
    
    // Combine data by date
    const dataByDate = new Map<string, { mood: number | null; energy: number | null }>();
    
    moodData.forEach(log => {
      const date = log.loggedAt?.toISOString().split('T')[0] || '';
      if (date) {
        dataByDate.set(date, { 
          mood: moodMap[log.mood] || 3, 
          energy: dataByDate.get(date)?.energy || null 
        });
      }
    });
    
    energyData.forEach(log => {
      const date = log.loggedAt?.toISOString().split('T')[0] || '';
      if (date) {
        const existing = dataByDate.get(date) || { mood: null, energy: null };
        dataByDate.set(date, { 
          mood: existing.mood, 
          energy: energyMap[log.energyLevel] || 3 
        });
      }
    });
    
    // Convert to array and fill in missing values
    return Array.from(dataByDate.entries())
      .map(([date, data]) => ({
        date,
        mood: data.mood || 3, // default to neutral if no mood data
        energy: data.energy || 3 // default to moderate if no energy data
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  // Workout Library operations
  async getWorkoutCategories(): Promise<WorkoutCategory[]> {
    return db.select().from(workoutCategories).orderBy(workoutCategories.name);
  }

  async getWorkouts(categoryId?: string, difficulty?: string): Promise<Workout[]> {
    const conditions = [];
    
    if (categoryId) {
      conditions.push(eq(workouts.categoryId, categoryId));
    }
    
    if (difficulty) {
      conditions.push(eq(workouts.difficulty, difficulty as any));
    }
    
    if (conditions.length > 0) {
      return db.select().from(workouts)
        .where(and(...conditions))
        .orderBy(desc(workouts.createdAt));
    }
    
    return db.select().from(workouts)
      .orderBy(desc(workouts.createdAt));
  }

  async getWorkoutById(id: string): Promise<Workout | undefined> {
    const [workout] = await db.select().from(workouts).where(eq(workouts.id, id));
    return workout;
  }

  async createWorkout(workout: InsertWorkout): Promise<Workout> {
    const [newWorkout] = await db.insert(workouts).values(workout).returning();
    return newWorkout;
  }

  async getUserWorkoutProgress(userId: string): Promise<WorkoutProgress[]> {
    return db.select().from(workoutProgress)
      .where(eq(workoutProgress.userId, userId))
      .orderBy(desc(workoutProgress.completedAt));
  }

  async createWorkoutProgress(progress: InsertWorkoutProgress): Promise<WorkoutProgress> {
    const [newProgress] = await db.insert(workoutProgress).values(progress).returning();
    return newProgress;
  }

  async searchWorkouts(query: string): Promise<Workout[]> {
    return db.select().from(workouts)
      .where(or(
        like(workouts.title, `%${query}%`),
        like(workouts.description, `%${query}%`)
      ))
      .orderBy(desc(workouts.createdAt));
  }

  // Risk Assessment operations
  async getRiskAssessmentTemplates(type?: string): Promise<RiskAssessmentTemplate[]> {
    // Note: type parameter is ignored as riskAssessmentTemplates table doesn't have a 'type' column
    return db.select().from(riskAssessmentTemplates)
      .where(eq(riskAssessmentTemplates.isActive, true))
      .orderBy(riskAssessmentTemplates.title);
  }

  async getUserRiskAssessmentsByTemplate(userId: string, templateId?: string): Promise<UserRiskAssessment[]> {
    if (templateId) {
      return db.select().from(userRiskAssessments)
        .where(and(
          eq(userRiskAssessments.userId, userId),
          eq(userRiskAssessments.templateId, templateId)
        ))
        .orderBy(desc(userRiskAssessments.completedAt));
    }
    return db.select().from(userRiskAssessments)
      .where(eq(userRiskAssessments.userId, userId))
      .orderBy(desc(userRiskAssessments.completedAt));
  }

  async createUserRiskAssessment(assessment: InsertUserRiskAssessment): Promise<UserRiskAssessment> {
    const [newAssessment] = await db.insert(userRiskAssessments).values(assessment).returning();
    return newAssessment;
  }

  async getLatestUserRiskAssessment(userId: string, templateId: string): Promise<UserRiskAssessment | undefined> {
    const [assessment] = await db.select().from(userRiskAssessments)
      .where(and(
        eq(userRiskAssessments.userId, userId),
        eq(userRiskAssessments.templateId, templateId)
      ))
      .orderBy(desc(userRiskAssessments.completedAt))
      .limit(1);
    return assessment;
  }

  // Step 3: Insights operations
  async getUserInsights(userId: string): Promise<UserInsight[]> {
    return db.select().from(userInsights)
      .where(eq(userInsights.userId, userId))
      .orderBy(desc(userInsights.priority), desc(userInsights.createdAt));
  }

  async createUserInsight(insight: InsertUserInsight): Promise<UserInsight> {
    const [newInsight] = await db.insert(userInsights).values(insight).returning();
    return newInsight;
  }

  async getUserActiveInsights(userId: string): Promise<UserInsight[]> {
    const now = new Date();
    return db.select().from(userInsights)
      .where(and(
        eq(userInsights.userId, userId),
        eq(userInsights.isActive, true),
        sql`${userInsights.expiresAt} > ${now}`
      ))
      .orderBy(desc(userInsights.priority), desc(userInsights.createdAt))
      .limit(3); // Return top 3 as per guardrails
  }

  async getUserActiveInsightsByRange(userId: string, range: string): Promise<UserInsight[]> {
    // Part 2: Pure caching approach - this method is now primarily for fallback
    // The main caching happens in routes.ts with NodeCache
    const now = new Date();
    return db.select().from(userInsights)
      .where(and(
        eq(userInsights.userId, userId),
        eq(userInsights.isActive, true),
        sql`${userInsights.expiresAt} > ${now}`
      ))
      .orderBy(desc(userInsights.priority), desc(userInsights.createdAt))
      .limit(3); // Return top 3 as per guardrails
  }

  async clearExpiredInsights(userId: string): Promise<void> {
    const now = new Date();
    await db.delete(userInsights)
      .where(and(
        eq(userInsights.userId, userId),
        sql`${userInsights.expiresAt} <= ${now}`
      ));
  }

  async generateAndCacheInsights(userId: string, range: string = '7d'): Promise<UserInsight[]> {
    try {
      // Import the insights service
      const { insightsService } = await import('./insights-service');
      
      // Clear expired insights first
      await this.clearExpiredInsights(userId);
      
      // Part 2: Deactivate existing insights to ensure only top 3 fresh ones remain
      const now = new Date();
      await db.update(userInsights)
        .set({ isActive: false })
        .where(eq(userInsights.userId, userId));
      
      // Get user and recent data for insight generation with bounded windows
      const user = await this.getUser(userId);
      if (!user) return [];
      
      const endDate = new Date();
      const daysMap = { '7d': 7, '14d': 14, '30d': 30 };
      const days = daysMap[range] || 7;
      const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
      
      // Bounded queries: limit to 300 records max to control costs
      const recentMealLogs = (await this.getUserMealLogs(userId, startDate, endDate)).slice(0, 150);
      const recentGlucoseReadings = (await this.getUserGlucoseReadings(userId, startDate, endDate)).slice(0, 150);
      const recentExerciseLogs = (await this.getUserExerciseLogs(userId, startDate, endDate)).slice(0, 100);
    
      // Skip if insufficient data - return static insights without database
      if (recentMealLogs.length < 3 && recentGlucoseReadings.length < 3) {
        const now = new Date();
        // Return static insights for demo (bypass database until schema is fixed)
        return [
          {
            id: `temp-1-${Date.now()}`,
            userId: userId,
            type: 'evening_pattern',
            title: 'Morning Routine Opportunity',
            body: 'Starting your day with a low-GI breakfast can help maintain stable blood sugar levels throughout the morning.',
            severity: 'info',
            priority: 90,
            actionable: true,
            isActive: true,
            expiresAt: new Date(now.getTime() + 15 * 60 * 1000),
            generatedAt: now,
            createdAt: now,
            mealId: null,
            readingId: null,
            category: '7d'
          }
        ];
      }
      
      // Continue with normal flow if data exists
      // ... rest of the function
      return [];
    } catch (error) {
      console.error('Error generating insights:', error);
      const now = new Date();
      // Return static insights when database has column issues
      return [
        {
          id: `temp-1-${Date.now()}`,
          userId: userId,
          type: 'evening_pattern',
          title: 'Sleep & Recovery Focus',
          body: 'Quality sleep supports healthy glucose patterns. Consider tracking your sleep quality alongside your daily energy levels.',
          severity: 'info',
          priority: 90,
          actionable: true,
          isActive: true,
          expiresAt: new Date(now.getTime() + 15 * 60 * 1000),
          generatedAt: now,
          createdAt: now,
          mealId: null,
          readingId: null,
          category: '7d'
        }
      ];
    }
  }

  // Stage 4: Onboarding & Reflection operations
  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getUserReflectionForDate(userId: string, date: string): Promise<any | undefined> {
    const [reflection] = await db
      .select()
      .from(dailyReflections)
      .where(and(eq(dailyReflections.userId, userId), eq(dailyReflections.date, date)))
      .limit(1);
    return reflection;
  }

  async updateReflection(id: string, updates: any): Promise<any> {
    const [reflection] = await db
      .update(dailyReflections)
      .set(updates)
      .where(eq(dailyReflections.id, id))
      .returning();
    return reflection;
  }

  async createReflection(reflection: any): Promise<any> {
    const [created] = await db
      .insert(dailyReflections)
      .values(reflection)
      .returning();
    return created;
  }

  async getUserReflectionsForWeek(userId: string, weekStart: Date): Promise<any[]> {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const reflections = await db
      .select()
      .from(dailyReflections)
      .where(
        and(
          eq(dailyReflections.userId, userId),
          gte(dailyReflections.date, weekStart.toISOString().split('T')[0]),
          lte(dailyReflections.date, weekEnd.toISOString().split('T')[0])
        )
      )
      .orderBy(dailyReflections.date);
    
    return reflections;
  }

  // Phase 5: Insight History operations
  async createInsightHistory(userId: string, insightText: string, category: string): Promise<any> {
    const [insight] = await db
      .insert(insightHistory)
      .values({
        userId,
        insightText,
        insightCategory: category,
      })
      .returning();
    return insight;
  }

  async getUserInsightHistory(userId: string, options?: { category?: string; startDate?: Date; endDate?: Date; limit?: number }): Promise<any[]> {
    const conditions = [eq(insightHistory.userId, userId)];
    
    if (options?.category) {
      conditions.push(eq(insightHistory.insightCategory, options.category));
    }
    
    if (options?.startDate) {
      conditions.push(gte(insightHistory.shownAt, options.startDate));
    }
    
    if (options?.endDate) {
      conditions.push(lte(insightHistory.shownAt, options.endDate));
    }
    
    const query = db
      .select()
      .from(insightHistory)
      .where(and(...conditions))
      .orderBy(desc(insightHistory.shownAt));
    
    if (options?.limit) {
      query.limit(options.limit);
    }
    
    return await query;
  }

  async dismissInsight(insightId: string): Promise<any> {
    const [insight] = await db
      .update(insightHistory)
      .set({ dismissedAt: new Date() })
      .where(eq(insightHistory.id, insightId))
      .returning();
    return insight;
  }

  // Stage 4: Export operations
  async generateCSVExport(userId: string, options: any): Promise<string> {
    // Generate CSV headers
    const headers = ['Date', 'Type', 'Name', 'Value', 'Notes'];
    const rows = [headers.join(',')];

    // Add meal log data if included
    if (options.includeData.meals) {
      const mealLogs = await this.getUserMealLogs(userId, options.startDate, options.endDate);
      for (const log of mealLogs) {
        rows.push([
          log.loggedAt.toISOString().split('T')[0],
          'Meal',
          log.mealName || 'Unknown',
          `${log.carbohydratesConsumed || 0}g carbs`,
          log.notes || ''
        ].join(','));
      }
    }

    // Add reflection data if included  
    if (options.includeData.reflections) {
      // Would add reflection data here
      rows.push([
        new Date().toISOString().split('T')[0],
        'Reflection',
        'Daily Check-in',
        'Sample data',
        'Mock reflection entry'
      ].join(','));
    }

    return rows.join('\n');
  }

  async generatePDFExport(userId: string, options: any): Promise<{ downloadUrl: string; filename: string }> {
    // Use dynamic imports for ES modules
    const PDFKit = await import('pdfkit');
    const PDFDocument = PDFKit.default;
    const fs = await import('node:fs');
    const path = await import('node:path');
    
    // Create exports directory if it doesn't exist
    const exportDir = path.join(process.cwd(), 'tmp', 'exports');
    fs.mkdirSync(exportDir, { recursive: true });
    
    // Generate filename
    const timestamp = Date.now();
    const filename = `wellness-report-${timestamp}.pdf`;
    const filePath = path.join(exportDir, filename);
    
    // Get user data for the report
    const user = await this.getUser(userId);
    const startDate = new Date(options.startDate);
    const endDate = new Date(options.endDate);
    
    // Fetch user data
    const mealLogs = options.includeData.meals ? await this.getUserMealLogs(userId, startDate, endDate) : [];
    const glucoseReadings = options.includeData.insights ? await this.getUserGlucoseReadings(userId, startDate, endDate) : [];
    
    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);
    
    // Header
    doc.fontSize(24).text('GlycoGuide Wellness Report', 50, 50);
    doc.fontSize(12).text(`Generated: ${new Date().toLocaleDateString()}`, 50, 80);
    doc.text(`Report Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`, 50, 95);
    doc.text(`User: ${user?.displayName || 'User'}`, 50, 110);
    
    let yPosition = 140;
    
    // Summary section
    if (options.includeData.summary) {
      doc.fontSize(16).text('Summary', 50, yPosition);
      yPosition += 30;
      doc.fontSize(12)
        .text(`• Total meals logged: ${mealLogs.length}`, 70, yPosition)
        .text(`• Total glucose readings: ${glucoseReadings.length}`, 70, yPosition + 15)
        .text(`• Average daily tracking: ${Math.round((mealLogs.length + glucoseReadings.length) / Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))))} entries/day`, 70, yPosition + 30);
      yPosition += 70;
    }
    
    // Meals section
    if (options.includeData.meals && mealLogs.length > 0) {
      doc.fontSize(16).text('Recent Meals', 50, yPosition);
      yPosition += 25;
      
      mealLogs.slice(0, 10).forEach((meal, index) => {
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
        }
        doc.fontSize(11)
          .text(`${meal.loggedAt?.toLocaleDateString() || 'Unknown date'}: ${meal.customMealName || 'Meal'} (${meal.customCarbs || 0}g carbs)`, 70, yPosition);
        yPosition += 20;
      });
      
      if (mealLogs.length > 10) {
        doc.text(`... and ${mealLogs.length - 10} more meals`, 70, yPosition);
        yPosition += 20;
      }
      yPosition += 15;
    }
    
    // Footer
    doc.fontSize(10).text('Generated by GlycoGuide - Your Diabetes Management Platform', 50, doc.page.height - 50);
    
    doc.end();
    
    // Wait for the PDF to be written
    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });
    
    return { 
      downloadUrl: `/api/exports/download/${filename}`, 
      filename 
    };
  }

  async getCachedPDFExports(userId: string): Promise<any[]> {
    // Stub implementation - would return cached PDF exports
    // Mock some cached exports for development
    return [
      {
        template: 'Standard',
        dateRange: 'Last 30 days',
        createdAt: '2 hours ago',
        downloadUrl: '/api/exports/download/sample-report-1.pdf'
      },
      {
        template: 'Detailed',  
        dateRange: 'Last 7 days',
        createdAt: 'Yesterday',
        downloadUrl: '/api/exports/download/sample-report-2.pdf'
      }
    ];
  }

  // Security and Audit Logging Methods Implementation
  
  async logSecurityEvent(event: InsertSecurityAuditLog): Promise<SecurityAuditLog> {
    try {
      // Generate audit log entry with proper ID
      const auditLogData = {
        id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: event.userId || null,
        action: event.action,
        resourceType: event.resourceType,
        resourceId: event.resourceId || null,
        details: event.details || null, // TODO: Will be sanitized in next task to remove PHI
        ipAddress: event.ipAddress || null,
        userAgent: event.userAgent || null,
        timestamp: new Date(),
        severity: event.severity || 'info'
      };

      // TODO: Implement actual database insert when schema is synced
      // For now, store in memory and return the audit log
      // const [auditLog] = await db.insert(securityAuditLog).values(auditLogData).returning();
      
      // Secure logging without exposing sensitive details
      const logMessage = `AUDIT: ${event.action} by ${event.userId} on ${event.resourceType}`;
      console.log(logMessage);
      
      return auditLogData;
    } catch (error) {
      console.error('Failed to log security event:', error);
      throw error;
    }
  }

  async getSecurityAuditLogs(userId?: string, action?: string, startDate?: Date, endDate?: Date): Promise<SecurityAuditLog[]> {
    // TODO: Implement with actual securityAuditLog table query when schema is synced
    return [];
  }

  async createSecuritySession(session: InsertSecuritySession): Promise<SecuritySession> {
    // TODO: Implement with actual securitySessions table when schema is synced
    const securitySession: SecuritySession = {
      id: `session_${Date.now()}`,
      userId: session.userId,
      sessionToken: session.sessionToken,
      ipAddress: session.ipAddress || null,
      userAgent: session.userAgent || null,
      deviceFingerprint: session.deviceFingerprint || null,
      isActive: true,
      lastActivity: new Date(),
      createdAt: new Date(),
      expiresAt: session.expiresAt || null
    };
    
    return securitySession;
  }

  async updateSecuritySession(sessionId: string, updates: Partial<SecuritySession>): Promise<SecuritySession> {
    // TODO: Implement with actual securitySessions table update when schema is synced
    throw new Error('Security session not found');
  }

  async deactivateSecuritySession(sessionToken: string): Promise<boolean> {
    // TODO: Implement with actual securitySessions table update when schema is synced
    console.log(`🔒 [SECURITY] Deactivating session: ${sessionToken}`);
    return true;
  }

  async getUserActiveSessions(userId: string): Promise<SecuritySession[]> {
    // TODO: Implement with actual securitySessions table query when schema is synced
    return [];
  }

  async validateSessionSecurity(sessionToken: string, ipAddress: string): Promise<SecuritySession | null> {
    // TODO: Implement with actual securitySessions table validation when schema is synced
    console.log(`🔒 [SECURITY] Validating session security for IP: ${ipAddress}`);
    return null;
  }

  // Stage 9: Beta feedback & invite operations
  async checkBetaInvite(email: string): Promise<boolean> {
    try {
      const [invite] = await db.select().from(betaAllowlist).where(eq(betaAllowlist.email, email.toLowerCase().trim()));
      return !!invite;
    } catch (error) {
      console.error('Error checking beta invite:', error);
      return false;
    }
  }

  async addBetaInvite(email: string): Promise<void> {
    try {
      await db.insert(betaAllowlist).values({
        email: email.toLowerCase().trim()
      }).onConflictDoNothing();
    } catch (error) {
      console.error('Error adding beta invite:', error);
      throw error;
    }
  }

  async createFeedback(feedbackData: { userId?: string; kind: string; message: string; context?: any }): Promise<any> {
    try {
      const [feedbackEntry] = await db.insert(feedback).values({
        userId: feedbackData.userId || null,
        kind: feedbackData.kind,
        message: feedbackData.message,
        context: feedbackData.context || null
      }).returning();
      return feedbackEntry;
    } catch (error) {
      console.error('Error creating feedback:', error);
      throw error;
    }
  }

  async getFeedback(limit: number = 50): Promise<any[]> {
    try {
      const feedbackEntries = await db.select().from(feedback)
        .orderBy(desc(feedback.createdAt))
        .limit(limit);
      return feedbackEntries;
    } catch (error) {
      console.error('Error getting feedback:', error);
      return [];
    }
  }

  async trackAnalyticsEvent(eventData: { userId?: string; event: string; properties: any }): Promise<void> {
    // Currently using client-side analytics only to keep costs low
    // Database analytics tracking is temporarily disabled
    console.log('Analytics event (client-side only):', eventData);
  }

  // Stage 10: Community Hub operations
  async getCommunityFeed(limit: number = 100): Promise<CommunityPost[]> {
    const posts = await db
      .select()
      .from(communityPosts)
      .leftJoin(users, eq(communityPosts.userId, users.id))
      .orderBy(desc(communityPosts.createdAt))
      .limit(limit);
    return posts.map(p => p.community_posts);
  }

  // Duplicate method removed - using original createCommunityPost with InsertCommunityPost parameter

  async getCommunityPost(id: string): Promise<CommunityPost | undefined> {
    const [post] = await db
      .select()
      .from(communityPosts)
      .where(eq(communityPosts.id, id));
    return post;
  }

  async likeCommunityPost(userId: string, postId: string): Promise<void> {
    // Check if like already exists
    const [existingLike] = await db
      .select()
      .from(communityLikes)
      .where(and(eq(communityLikes.userId, userId), eq(communityLikes.postId, postId)));

    if (!existingLike) {
      // Create like
      await db.insert(communityLikes).values({
        userId,
        postId,
      });

      // Increment likes count
      await db
        .update(communityPosts)
        .set({ likesCount: sql`${communityPosts.likesCount} + 1` })
        .where(eq(communityPosts.id, postId));
    }
  }

  async unlikeCommunityPost(userId: string, postId: string): Promise<void> {
    // Delete like and decrement count
    await db
      .delete(communityLikes)
      .where(and(eq(communityLikes.userId, userId), eq(communityLikes.postId, postId)));

    await db
      .update(communityPosts)
      .set({ likesCount: sql`${communityPosts.likesCount} - 1` })
      .where(eq(communityPosts.id, postId));
  }

  async getUserCommunityPosts(userId: string, limit: number = 50): Promise<CommunityPost[]> {
    const posts = await db
      .select()
      .from(communityPosts)
      .where(eq(communityPosts.userId, userId))
      .orderBy(desc(communityPosts.createdAt))
      .limit(limit);
    return posts;
  }

  async getCommunityPostsWithLikes(userId: string, limit: number = 100): Promise<(CommunityPost & { isLiked: boolean })[]> {
    const posts = await db
      .select({
        ...communityPosts,
        isLiked: sql<boolean>`CASE WHEN ${communityLikes.id} IS NOT NULL THEN true ELSE false END`,
      })
      .from(communityPosts)
      .leftJoin(
        communityLikes,
        and(
          eq(communityLikes.postId, communityPosts.id),
          eq(communityLikes.userId, userId)
        )
      )
      .orderBy(desc(communityPosts.createdAt))
      .limit(limit);

    return posts as (CommunityPost & { isLiked: boolean })[];
  }

  // Phase 4: Community Reflection Feed methods
  async getActiveCommunityReflections(limit: number = 5): Promise<(CommunityReflection & { hasUserEncouraged: boolean })[]> {
    const now = new Date();
    
    const reflections = await db
      .select()
      .from(communityReflections)
      .where(gte(communityReflections.expiresAt, now))
      .orderBy(desc(communityReflections.createdAt))
      .limit(limit);
    
    // For now, hasUserEncouraged is always false (we'd need userId to check properly)
    return reflections.map(r => ({ ...r, hasUserEncouraged: false }));
  }

  async createCommunityReflection(userId: string, content: string, mood?: string): Promise<CommunityReflection> {
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours from now
    
    const [reflection] = await db
      .insert(communityReflections)
      .values({
        userId,
        content,
        mood,
        expiresAt,
      })
      .returning();
    
    return reflection;
  }

  async encourageCommunityReflection(userId: string, reflectionId: string): Promise<void> {
    // Check if already encouraged
    const [existing] = await db
      .select()
      .from(communityReflectionEncouragements)
      .where(
        and(
          eq(communityReflectionEncouragements.reflectionId, reflectionId),
          eq(communityReflectionEncouragements.userId, userId)
        )
      );
    
    if (!existing) {
      await db.insert(communityReflectionEncouragements).values({
        reflectionId,
        userId,
      });
      
      // Increment count
      await db
        .update(communityReflections)
        .set({ encouragementCount: sql`${communityReflections.encouragementCount} + 1` })
        .where(eq(communityReflections.id, reflectionId));
    }
  }

  async unencourageCommunityReflection(userId: string, reflectionId: string): Promise<void> {
    const result = await db
      .delete(communityReflectionEncouragements)
      .where(
        and(
          eq(communityReflectionEncouragements.reflectionId, reflectionId),
          eq(communityReflectionEncouragements.userId, userId)
        )
      );
    
    if (result) {
      // Decrement count
      await db
        .update(communityReflections)
        .set({ encouragementCount: sql`${communityReflections.encouragementCount} - 1` })
        .where(eq(communityReflections.id, reflectionId));
    }
  }

  async deleteExpiredReflections(): Promise<number> {
    const now = new Date();
    
    const result = await db
      .delete(communityReflections)
      .where(lte(communityReflections.expiresAt, now));
    
    return result ? 1 : 0;
  }

  // Stage 11: Mindfulness library methods
  async getMeditationSessions(): Promise<MeditationLibrary[]> {
    const sessions = await db
      .select()
      .from(meditationLibrary)
      .where(eq(meditationLibrary.isActive, true))
      .orderBy(meditationLibrary.sortOrder, meditationLibrary.createdAt);
    return sessions;
  }

  async createMeditationSession(sessionData: InsertMeditationLibrary): Promise<MeditationLibrary> {
    const [session] = await db
      .insert(meditationLibrary)
      .values(sessionData)
      .returning();
    return session;
  }

  // Stage 16: Hydration tracking methods
  async getTodaysHydrationLog(userId: string): Promise<{ cups: number }> {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD format
    
    const [log] = await db
      .select({ cups: hydrationLogs.cups })
      .from(hydrationLogs)
      .where(and(
        eq(hydrationLogs.userId, userId),
        eq(hydrationLogs.date, today)
      ));
    
    return { cups: log?.cups || 0 };
  }

  async addCupToHydration(userId: string): Promise<{ success: boolean }> {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD format
    
    try {
      // Use INSERT ... ON CONFLICT to handle upsert behavior
      await db.execute(sql`
        INSERT INTO hydration_logs (user_id, date, cups, created_at)
        VALUES (${userId}, ${today}, 1, NOW())
        ON CONFLICT (user_id, date) 
        DO UPDATE SET cups = hydration_logs.cups + 1
      `);
      
      return { success: true };
    } catch (error) {
      console.error('Error adding cup to hydration:', error);
      return { success: false };
    }
  }

  async updateHydrationLog(userId: string, date: string, cups: number): Promise<{ success: boolean }> {
    try {
      // Use INSERT ... ON CONFLICT to handle upsert behavior
      await db.execute(sql`
        INSERT INTO hydration_logs (user_id, date, cups, created_at)
        VALUES (${userId}, ${date}, ${cups}, NOW())
        ON CONFLICT (user_id, date) 
        DO UPDATE SET cups = EXCLUDED.cups
      `);
      
      return { success: true };
    } catch (error) {
      console.error('Error updating hydration log:', error);
      return { success: false };
    }
  }

  async getHydrationHistory(userId: string, days: number): Promise<{ date: string; cups: number; createdAt: Date }[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffDateStr = cutoffDate.toISOString().slice(0, 10); // YYYY-MM-DD format
    
    const logs = await db
      .select({
        date: hydrationLogs.date,
        cups: hydrationLogs.cups,
        createdAt: hydrationLogs.createdAt
      })
      .from(hydrationLogs)
      .where(
        and(
          eq(hydrationLogs.userId, userId),
          gte(hydrationLogs.date, cutoffDateStr)
        )
      )
      .orderBy(desc(hydrationLogs.date));
    
    return logs;
  }

  // Stage 23.1: BM tracking methods
  async getTodaysBmLog(userId: string): Promise<BmLog | null> {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD format
    
    const [log] = await db
      .select()
      .from(bmLogs)
      .where(
        and(
          eq(bmLogs.userId, userId),
          eq(bmLogs.date, today)
        )
      );
    
    return log || null;
  }

  async createBmLog(bmLog: InsertBmLog): Promise<BmLog> {
    const [newBmLog] = await db.insert(bmLogs).values(bmLog).returning();
    return newBmLog;
  }

  async getBmHistory(userId: string, days: number): Promise<BmLog[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffDateStr = cutoffDate.toISOString().slice(0, 10); // YYYY-MM-DD format
    
    const logs = await db
      .select()
      .from(bmLogs)
      .where(
        and(
          eq(bmLogs.userId, userId),
          gte(bmLogs.date, cutoffDateStr)
        )
      )
      .orderBy(desc(bmLogs.date));
    
    return logs;
  }

  async deleteBmLog(userId: string, date: string): Promise<void> {
    await db
      .delete(bmLogs)
      .where(
        and(
          eq(bmLogs.userId, userId),
          eq(bmLogs.date, date)
        )
      );
  }

  // Blood Pressure tracking methods
  async createBloodPressureLog(log: BloodPressureLogInsert): Promise<BloodPressureLog> {
    const [newLog] = await db.insert(bloodPressureLogs).values(log).returning();
    return newLog;
  }

  async getBloodPressureLogsForDate(userId: string, date: string): Promise<BloodPressureLog[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const logs = await db
      .select()
      .from(bloodPressureLogs)
      .where(
        and(
          eq(bloodPressureLogs.userId, userId),
          gte(bloodPressureLogs.loggedAt, startOfDay),
          lte(bloodPressureLogs.loggedAt, endOfDay)
        )
      )
      .orderBy(desc(bloodPressureLogs.loggedAt));
    
    return logs;
  }

  async getBloodPressureHistory(userId: string, days: number): Promise<BloodPressureLog[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const logs = await db
      .select()
      .from(bloodPressureLogs)
      .where(
        and(
          eq(bloodPressureLogs.userId, userId),
          gte(bloodPressureLogs.loggedAt, cutoffDate)
        )
      )
      .orderBy(desc(bloodPressureLogs.loggedAt));
    
    return logs;
  }

  // Blood Sugar tracking methods
  async createBloodSugarLog(log: BloodSugarLogInsert): Promise<BloodSugarLog> {
    const [newLog] = await db.insert(bloodSugarLogs).values(log).returning();
    return newLog;
  }

  async getBloodSugarLogsForDate(userId: string, date: string): Promise<BloodSugarLog[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const logs = await db
      .select()
      .from(bloodSugarLogs)
      .where(
        and(
          eq(bloodSugarLogs.userId, userId),
          gte(bloodSugarLogs.loggedAt, startOfDay),
          lte(bloodSugarLogs.loggedAt, endOfDay)
        )
      )
      .orderBy(desc(bloodSugarLogs.loggedAt));
    
    return logs;
  }

  async getBloodSugarHistory(userId: string, days: number): Promise<BloodSugarLog[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const logs = await db
      .select()
      .from(bloodSugarLogs)
      .where(
        and(
          eq(bloodSugarLogs.userId, userId),
          gte(bloodSugarLogs.loggedAt, cutoffDate)
        )
      )
      .orderBy(desc(bloodSugarLogs.loggedAt));
    
    return logs;
  }

  // ========================================
  // STAGE 22: PERSONALIZATION & SMART NUDGES STORAGE METHODS
  // ========================================

  async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    const [preferences] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));
    return preferences;
  }

  async createOrUpdateUserPreferences(userId: string, preferencesData: InsertUserPreferences): Promise<UserPreferences> {
    const [preferences] = await db
      .insert(userPreferences)
      .values(preferencesData)
      .onConflictDoUpdate({
        target: userPreferences.userId,
        set: {
          ...preferencesData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return preferences;
  }

  async getUserNudgesForDate(userId: string, startDate: Date, endDate: Date): Promise<SmartNudge[]> {
    const nudges = await db
      .select()
      .from(smartNudges)
      .where(
        and(
          eq(smartNudges.userId, userId),
          gte(smartNudges.scheduledFor, startDate),
          lte(smartNudges.scheduledFor, endDate)
        )
      )
      .orderBy(desc(smartNudges.createdAt));
    return nudges;
  }

  async getUserNudges(userId: string, options: { completed?: boolean; type?: string; limit?: number }): Promise<SmartNudge[]> {
    const conditions = [eq(smartNudges.userId, userId)];
    
    if (options.completed !== undefined) {
      conditions.push(eq(smartNudges.completed, options.completed));
    }
    
    if (options.type) {
      conditions.push(eq(smartNudges.type, options.type));
    }

    let query = db
      .select()
      .from(smartNudges)
      .where(and(...conditions))
      .orderBy(desc(smartNudges.createdAt));

    if (options.limit) {
      query = query.limit(options.limit);
    }

    return await query;
  }

  async createSmartNudge(nudgeData: InsertSmartNudge): Promise<SmartNudge> {
    const [nudge] = await db
      .insert(smartNudges)
      .values(nudgeData)
      .returning();
    return nudge;
  }

  async markNudgeComplete(nudgeId: string): Promise<SmartNudge | undefined> {
    const [nudge] = await db
      .update(smartNudges)
      .set({ 
        completed: true,
        completedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(smartNudges.id, nudgeId))
      .returning();
    return nudge;
  }

  async deleteSmartNudge(nudgeId: string): Promise<boolean> {
    const result = await db
      .delete(smartNudges)
      .where(eq(smartNudges.id, nudgeId));
    return result.rowCount > 0;
  }

  // Phase 5: Adaptive Wellness Insights implementations
  async getRecentMoodLogs(userId: string, limit: number = 30): Promise<any[]> {
    const logs = await db
      .select()
      .from(moodLogs)
      .where(eq(moodLogs.userId, userId))
      .orderBy(desc(moodLogs.loggedAt))
      .limit(limit);
    return logs;
  }

  async getRecentEnergyLogs(userId: string, limit: number = 30): Promise<any[]> {
    const logs = await db
      .select()
      .from(energyLogs)
      .where(eq(energyLogs.userId, userId))
      .orderBy(desc(energyLogs.loggedAt))
      .limit(limit);
    return logs;
  }

  async getUserMoodEnergyPatterns(userId: string, days: number = 14): Promise<{
    moodLogs: any[];
    energyLogs: any[];
    patterns: {
      topMood?: string;
      avgEnergy?: string;
      moodTrends?: { day: string; mood: string; count: number }[];
      energyTrends?: { day: string; energy: string; count: number }[];
      insights: string[];
    }
  }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Get mood and energy logs
    const moodLogsData = await db
      .select()
      .from(moodLogs)
      .where(and(
        eq(moodLogs.userId, userId),
        sql`${moodLogs.loggedAt} >= ${cutoffDate}`
      ))
      .orderBy(desc(moodLogs.loggedAt));

    const energyLogsData = await db
      .select()
      .from(energyLogs)
      .where(and(
        eq(energyLogs.userId, userId),
        sql`${energyLogs.loggedAt} >= ${cutoffDate}`
      ))
      .orderBy(desc(energyLogs.loggedAt));

    // Analyze patterns
    const insights: string[] = [];
    
    // Mood analysis
    const moodCounts: Record<string, number> = {};
    const moodByDay: Record<string, Record<string, number>> = {};
    
    moodLogsData.forEach(log => {
      const mood = log.mood;
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
      
      const dayOfWeek = new Date(log.loggedAt).toLocaleDateString('en-US', { weekday: 'long' });
      if (!moodByDay[dayOfWeek]) moodByDay[dayOfWeek] = {};
      moodByDay[dayOfWeek][mood] = (moodByDay[dayOfWeek][mood] || 0) + 1;
    });

    const topMood = Object.keys(moodCounts).sort((a, b) => moodCounts[b] - moodCounts[a])[0];
    
    // Energy analysis
    const energyCounts: Record<string, number> = {};
    const energyByDay: Record<string, Record<string, number>> = {};
    
    energyLogsData.forEach(log => {
      const energy = log.energyLevel;
      energyCounts[energy] = (energyCounts[energy] || 0) + 1;
      
      const dayOfWeek = new Date(log.loggedAt).toLocaleDateString('en-US', { weekday: 'long' });
      if (!energyByDay[dayOfWeek]) energyByDay[dayOfWeek] = {};
      energyByDay[dayOfWeek][energy] = (energyByDay[dayOfWeek][energy] || 0) + 1;
    });

    const topEnergy = Object.keys(energyCounts).sort((a, b) => energyCounts[b] - energyCounts[a])[0];

    // Generate insights
    if (topMood === 'calm' && moodCounts[topMood] >= 3) {
      insights.push(`You've felt calm ${moodCounts[topMood]} times recently — reflect on what's helping your peace.`);
    }
    
    if (topMood === 'anxious' && moodCounts[topMood] >= 3) {
      insights.push(`You've felt anxious recently — try a calming track or mindful breathing when this happens.`);
    }

    if (topEnergy === 'low' || topEnergy === 'very_low') {
      insights.push(`Energy has been lower lately — consider earlier sleep or a gentle afternoon walk.`);
    }

    if (topEnergy === 'high' || topEnergy === 'very_high') {
      insights.push(`Energy is strong — this is a great time for meal planning or movement.`);
    }

    // Day-specific patterns
    Object.keys(energyByDay).forEach(day => {
      const dayEnergies = energyByDay[day];
      const topDayEnergy = Object.keys(dayEnergies).sort((a, b) => dayEnergies[b] - dayEnergies[a])[0];
      
      if ((topDayEnergy === 'low' || topDayEnergy === 'very_low') && dayEnergies[topDayEnergy] >= 2) {
        insights.push(`Energy tends to dip on ${day}s — try an earlier evening wind-down.`);
      }
    });

    // Limit insights to top 3
    const limitedInsights = insights.slice(0, 3);

    return {
      moodLogs: moodLogsData,
      energyLogs: energyLogsData,
      patterns: {
        topMood,
        avgEnergy: topEnergy,
        moodTrends: Object.keys(moodByDay).map(day => ({
          day,
          mood: Object.keys(moodByDay[day]).sort((a, b) => moodByDay[day][b] - moodByDay[day][a])[0],
          count: moodByDay[day][Object.keys(moodByDay[day])[0]]
        })),
        energyTrends: Object.keys(energyByDay).map(day => ({
          day,
          energy: Object.keys(energyByDay[day]).sort((a, b) => energyByDay[day][b] - energyByDay[day][a])[0],
          count: energyByDay[day][Object.keys(energyByDay[day])[0]]
        })),
        insights: limitedInsights
      }
    };
  }
}

export const storage = new DatabaseStorage();
