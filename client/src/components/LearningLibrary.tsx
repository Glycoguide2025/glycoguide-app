import { motion } from "framer-motion";
import { BookOpen, Play, CheckCircle, Clock, HelpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import ComingSoon from "@/components/ComingSoon";
import type { EducationContent, EducationProgress } from "@shared/schema";

interface EducationContentWithProgress extends EducationContent {
  progress?: EducationProgress;
}

interface Props {
  selectedType: string;
  items: EducationContentWithProgress[];
  onStartContent: (content: EducationContentWithProgress) => void;
  getDifficultyColor: (difficulty: string) => string;
  getProgressPercentage: (content: EducationContentWithProgress) => number;
  getContentTypeIcon: (type: string) => JSX.Element;
}

export default function LearningLibrary({ 
  selectedType, 
  items, 
  onStartContent,
  getDifficultyColor,
  getProgressPercentage,
  getContentTypeIcon
}: Props) {
  // Handle "no content" states
  if (!items || items.length === 0) {
    // VIDEO or AUDIO => show Coming Soon
    if (selectedType === "video") {
      return <ComingSoon type="Video" />;
    }
    
    if (selectedType === "audio") {
      return <ComingSoon type="Audio" />;
    }

    // 📘 COURSES -> motivational message
    if (selectedType === "course") {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center justify-center py-20 text-center"
          data-testid="empty-state-courses"
        >
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-full mb-4 shadow-sm">
            <BookOpen className="w-10 h-10 text-blue-500" />
          </div>
          <p className="text-xl font-semibold text-gray-700 dark:text-gray-200">
            No Courses Yet
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md">
            When you complete your first course, it will appear here. Keep
            learning to unlock your next milestone!
          </p>
        </motion.div>
      );
    }

    // 🧩 QUIZZES -> supportive message
    if (selectedType === "quiz") {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center justify-center py-20 text-center"
          data-testid="empty-state-quizzes"
        >
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-full mb-4 shadow-sm">
            <HelpCircle className="w-10 h-10 text-blue-500" />
          </div>
          <p className="text-xl font-semibold text-gray-700 dark:text-gray-200">
            No Quizzes Yet
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md">
            Once you complete a quiz, it will appear here with your progress
            and score history.
          </p>
        </motion.div>
      );
    }

    // All other categories (Articles, etc.)
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center justify-center py-16 text-center"
        data-testid="empty-state-no-content"
      >
        <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No content found</h3>
        <p className="text-sm text-muted-foreground">
          Try adjusting your search criteria or check back later.
        </p>
      </motion.div>
    );
  }

  // If items exist, render the content grid
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {items.map((content) => (
        <Card 
          key={content.id} 
          className="hover:shadow-lg transition-shadow" 
          data-testid={`card-content-${content.id}`}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-base leading-tight mb-2">
                  {content.title}
                  {content.isPro && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Pro
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {content.description}
                </p>
              </div>
              <div className="ml-3">
                {getContentTypeIcon(content.type)}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1 mt-3">
              {content.difficulty && (
                <Badge variant="outline" className={getDifficultyColor(content.difficulty)}>
                  {content.difficulty}
                </Badge>
              )}
              {content.estimatedDuration && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {content.estimatedDuration}min
                </Badge>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            {/* Progress bar if started */}
            {content.progress && content.progress.status !== 'not_started' && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{getProgressPercentage(content)}%</span>
                </div>
                <Progress value={getProgressPercentage(content)} className="h-2" />
              </div>
            )}
            
            <div className="flex gap-2">
              <Button 
                size="sm" 
                className="flex-1"
                onClick={() => onStartContent(content)}
                data-testid={`button-start-${content.id}`}
              >
                {content.progress?.status === 'completed' ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Review
                  </>
                ) : content.progress?.status === 'in_progress' ? (
                  <>
                    <Play className="w-4 h-4 mr-1" />
                    Continue
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-1" />
                    Start
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </motion.div>
  );
}
