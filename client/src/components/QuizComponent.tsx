import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface QuizQuestion {
  question: string;
  answers: string[];
  correctAnswer: string;
}

interface QuizComponentProps {
  questions: QuizQuestion[];
  onComplete: (score: number, total: number) => void;
  onSkip?: () => void;
}

export default function QuizComponent({ questions, onComplete, onSkip }: QuizComponentProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleAnswerSelect = (answer: string) => {
    if (showFeedback) return;
    setSelectedAnswer(answer);
  };

  const handleSubmit = () => {
    if (!selectedAnswer) return;

    const correct = selectedAnswer === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      // Move to next question
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setIsCorrect(false);
    } else {
      // Complete quiz - use functional update to get latest score
      setScore(currentScore => {
        onComplete(currentScore, questions.length);
        return currentScore;
      });
    }
  };

  useEffect(() => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowFeedback(false);
  }, [questions]);

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto space-y-6 pb-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question */}
        <div>
          <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
            {currentQuestion.question}
          </h3>

          {/* Answer Options */}
          <div className="space-y-3">
            <AnimatePresence>
              {currentQuestion.answers.map((answer, idx) => {
                const isSelected = selectedAnswer === answer;
                const isCorrectAnswer = answer === currentQuestion.correctAnswer;
                const showCorrect = showFeedback && isCorrectAnswer;
                const showIncorrect = showFeedback && isSelected && !isCorrectAnswer;

                return (
                  <motion.div
                    key={`${currentIndex}-${idx}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Button
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => handleAnswerSelect(answer)}
                      disabled={showFeedback}
                      className={`w-full text-left justify-start h-auto py-4 px-5 text-base font-medium rounded-xl transition-all ${
                        showCorrect
                          ? "bg-green-50 dark:bg-green-900/30 border-green-500 text-green-800 dark:text-green-200 shadow-sm"
                          : showIncorrect
                          ? "bg-red-50 dark:bg-red-900/30 border-red-500 text-red-800 dark:text-red-200 shadow-sm"
                          : isSelected
                          ? "shadow-md"
                          : "hover:shadow-sm"
                      }`}
                      data-testid={`quiz-answer-${idx}`}
                    >
                      <span className="flex-1">{answer}</span>
                      {showCorrect && <CheckCircle className="w-5 h-5 ml-2 text-green-600 dark:text-green-400" />}
                      {showIncorrect && <XCircle className="w-5 h-5 ml-2 text-red-600 dark:text-red-400" />}
                    </Button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Feedback Message */}
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 rounded-xl ${
              isCorrect
                ? "bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800"
                : "bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800"
            }`}
          >
            <p className={`text-sm font-medium ${
              isCorrect
                ? "text-green-800 dark:text-green-200"
                : "text-blue-800 dark:text-blue-200"
            }`}>
              {isCorrect
                ? "✓ Correct! Great understanding."
                : `The correct answer is: "${currentQuestion.correctAnswer}"`}
            </p>
          </motion.div>
        )}

        {/* Current Score */}
        <div className="text-center text-sm text-muted-foreground">
          Current Score: {score} / {currentIndex + (showFeedback ? 1 : 0)}
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-900 pt-4 pb-2 border-t border-gray-200 dark:border-gray-800">
        <div className="flex justify-between items-center">
          {onSkip && !showFeedback && (
            <Button
              variant="ghost"
              onClick={onSkip}
              className="text-muted-foreground"
              data-testid="button-skip-quiz"
            >
              Skip Quiz
            </Button>
          )}
          <div className="flex gap-3 ml-auto">
            {!showFeedback ? (
              <Button
                onClick={handleSubmit}
                disabled={!selectedAnswer}
                className="px-6 py-2.5 font-semibold"
                data-testid="button-submit-answer"
              >
                Submit Answer
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="px-6 py-2.5 font-semibold"
                data-testid="button-next-question"
              >
                {currentIndex + 1 < questions.length ? "Next Question" : "See Results"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
