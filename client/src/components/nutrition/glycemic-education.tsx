import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Info, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Brain,
  Heart,
  Activity,
  ChevronRight,
  BookOpen,
  Target
} from "lucide-react";

interface GIQuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const quizQuestions: GIQuizQuestion[] = [
  {
    question: "What does a low glycemic index (GI) value indicate?",
    options: [
      "Food raises blood sugar quickly",
      "Food raises blood sugar slowly",
      "Food has no carbohydrates",
      "Food is high in protein"
    ],
    correct: 1,
    explanation: "Low GI foods (55 or less) raise blood sugar slowly and steadily, providing sustained energy and better glucose control."
  },
  {
    question: "Which GI range is considered 'medium'?",
    options: ["0-55", "56-69", "70-100", "Above 100"],
    correct: 1,
    explanation: "Medium GI foods fall between 56-69. They cause a moderate rise in blood sugar levels."
  },
  {
    question: "What factors can affect a food's glycemic index?",
    options: [
      "Processing and cooking method",
      "Fiber and fat content",
      "Food combinations",
      "All of the above"
    ],
    correct: 3,
    explanation: "All these factors influence GI: processing increases it, fiber/fat lower it, and food combinations can modify the overall glycemic response."
  }
];

const giExamples = {
  low: [
    { food: "Steel-cut oats", gi: 42 },
    { food: "Sweet potato", gi: 44 },
    { food: "Quinoa", gi: 53 },
    { food: "Greek yogurt", gi: 11 },
    { food: "Lentils", gi: 25 },
    { food: "Berries", gi: 40 }
  ],
  medium: [
    { food: "Brown rice", gi: 68 },
    { food: "Whole wheat bread", gi: 69 },
    { food: "Banana (ripe)", gi: 62 },
    { food: "Orange", gi: 58 },
    { food: "Honey", gi: 61 },
    { food: "Basmati rice", gi: 58 }
  ],
  high: [
    { food: "White bread", gi: 75 },
    { food: "Watermelon", gi: 76 },
    { food: "Instant oats", gi: 79 },
    { food: "White rice", gi: 73 },
    { food: "Glucose", gi: 100 },
    { food: "Cornflakes", gi: 81 }
  ]
};

export default function GlycemicEducation() {
  const [currentQuiz, setCurrentQuiz] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [completedQuizzes, setCompletedQuizzes] = useState(0);

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);
    
    if (answerIndex === quizQuestions[currentQuiz].correct) {
      setQuizScore(quizScore + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuiz < quizQuestions.length - 1) {
      setCurrentQuiz(currentQuiz + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setCompletedQuizzes(completedQuizzes + 1);
    }
  };

  const resetQuiz = () => {
    setCurrentQuiz(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setQuizScore(0);
    setCompletedQuizzes(0);
  };

  const getGIColor = (gi: number) => {
    if (gi <= 55) return "text-green-600 bg-green-50 border-green-200";
    if (gi <= 69) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getGIIcon = (category: string) => {
    switch (category) {
      case 'low': return <TrendingDown className="w-4 h-4 text-green-600" />;
      case 'medium': return <Minus className="w-4 h-4 text-yellow-600" />;
      case 'high': return <TrendingUp className="w-4 h-4 text-red-600" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6" data-testid="glycemic-education">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Glycemic Index Education</h2>
        <p className="text-muted-foreground">Master your blood sugar through smart food choices</p>
      </div>

      <Tabs defaultValue="basics" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basics" data-testid="tab-basics">
            <BookOpen className="w-4 h-4 mr-2" />
            Basics
          </TabsTrigger>
          <TabsTrigger value="examples" data-testid="tab-examples">
            <Target className="w-4 h-4 mr-2" />
            Examples
          </TabsTrigger>
          <TabsTrigger value="impact" data-testid="tab-impact">
            <Activity className="w-4 h-4 mr-2" />
            Health Impact
          </TabsTrigger>
          <TabsTrigger value="quiz" data-testid="tab-quiz">
            <Brain className="w-4 h-4 mr-2" />
            Quiz
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="w-5 h-5 mr-2 text-primary" />
                What is Glycemic Index?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                The Glycemic Index (GI) measures how quickly carbohydrate-containing foods raise blood glucose levels compared to pure glucose (GI = 100).
              </p>
              
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-4">
                    <div className="flex items-center mb-2">
                      <TrendingDown className="w-5 h-5 text-green-600 mr-2" />
                      <h4 className="font-semibold text-green-800">Low GI (≤55)</h4>
                    </div>
                    <p className="text-sm text-green-700">Slow, steady rise in blood sugar. Best for sustained energy and glucose control.</p>
                  </CardContent>
                </Card>

                <Card className="border-yellow-200 bg-yellow-50">
                  <CardContent className="p-4">
                    <div className="flex items-center mb-2">
                      <Minus className="w-5 h-5 text-yellow-600 mr-2" />
                      <h4 className="font-semibold text-yellow-800">Medium GI (56-69)</h4>
                    </div>
                    <p className="text-sm text-yellow-700">Moderate rise in blood sugar. Use in moderation and pair with low GI foods.</p>
                  </CardContent>
                </Card>

                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-4">
                    <div className="flex items-center mb-2">
                      <TrendingUp className="w-5 h-5 text-red-600 mr-2" />
                      <h4 className="font-semibold text-red-800">High GI (≥70)</h4>
                    </div>
                    <p className="text-sm text-red-700">Rapid spike in blood sugar. Best reserved for post-exercise recovery or emergencies.</p>
                  </CardContent>
                </Card>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Pro Tip:</strong> Combining high GI foods with protein, fiber, or healthy fats can help slow glucose absorption and reduce the overall glycemic impact.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(giExamples).map(([category, foods]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center capitalize">
                    {getGIIcon(category)}
                    <span className="ml-2">{category} GI Foods</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {foods.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="font-medium">{item.food}</span>
                        <Badge className={`${getGIColor(item.gi)} border`}>
                          GI: {item.gi}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="impact" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-red-500" />
                  Health Benefits of Low GI
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <ChevronRight className="w-4 h-4 text-green-500 mt-1" />
                  <div>
                    <h5 className="font-medium">Better Glucose Control</h5>
                    <p className="text-sm text-muted-foreground">Reduces blood sugar spikes and improves HbA1c levels</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <ChevronRight className="w-4 h-4 text-green-500 mt-1" />
                  <div>
                    <h5 className="font-medium">Sustained Energy</h5>
                    <p className="text-sm text-muted-foreground">Provides steady energy without crashes</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <ChevronRight className="w-4 h-4 text-green-500 mt-1" />
                  <div>
                    <h5 className="font-medium">Weight Management</h5>
                    <p className="text-sm text-muted-foreground">Helps control appetite and reduces cravings</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <ChevronRight className="w-4 h-4 text-green-500 mt-1" />
                  <div>
                    <h5 className="font-medium">Heart Health</h5>
                    <p className="text-sm text-muted-foreground">May reduce risk of cardiovascular disease</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>GI vs. Glycemic Load</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  While GI measures quality, <strong>Glycemic Load (GL)</strong> considers both quality and quantity of carbohydrates.
                </p>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-mono">
                    GL = (GI × Carbs per serving) ÷ 100
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Low GL:</span>
                    <span className="text-sm font-medium">≤ 10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Medium GL:</span>
                    <span className="text-sm font-medium">11-19</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">High GL:</span>
                    <span className="text-sm font-medium">≥ 20</span>
                  </div>
                </div>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Example: Watermelon has high GI (76) but low GL (5) because it's mostly water with little carbohydrates per serving.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="quiz" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Test Your Knowledge</span>
                <Badge variant="outline">
                  Question {currentQuiz + 1} of {quizQuestions.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress 
                value={((currentQuiz + (showExplanation ? 1 : 0)) / quizQuestions.length) * 100} 
                className="w-full" 
              />

              {currentQuiz < quizQuestions.length ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">
                    {quizQuestions[currentQuiz].question}
                  </h3>
                  
                  <div className="space-y-2">
                    {quizQuestions[currentQuiz].options.map((option, index) => (
                      <Button
                        key={index}
                        variant={
                          showExplanation
                            ? index === quizQuestions[currentQuiz].correct
                              ? "default"
                              : selectedAnswer === index
                              ? "destructive"
                              : "outline"
                            : selectedAnswer === index
                            ? "default"
                            : "outline"
                        }
                        className="w-full justify-start"
                        onClick={() => !showExplanation && handleAnswerSelect(index)}
                        disabled={showExplanation}
                        data-testid={`quiz-option-${index}`}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>

                  {showExplanation && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        {quizQuestions[currentQuiz].explanation}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={resetQuiz} data-testid="button-reset-quiz">
                      Restart Quiz
                    </Button>
                    {showExplanation && (
                      <Button onClick={nextQuestion} data-testid="button-next-question">
                        {currentQuiz === quizQuestions.length - 1 ? "Finish Quiz" : "Next Question"}
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <h3 className="text-xl font-bold mb-2">Quiz Complete!</h3>
                  <p className="text-lg mb-4">
                    You scored {quizScore} out of {quizQuestions.length}
                  </p>
                  <Progress value={(quizScore / quizQuestions.length) * 100} className="mb-4" />
                  <Button onClick={resetQuiz} data-testid="button-retake-quiz">
                    Take Quiz Again
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}