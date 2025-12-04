import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShieldAlert, 
  Heart,
  Activity,
  Target,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Users,
  BarChart
} from "lucide-react";
import type { UserRiskAssessment, InsertUserRiskAssessment, RiskAssessmentTemplate } from "@shared/schema";

interface AssessmentQuestion {
  id: string;
  question: string;
  options: Array<{
    value: string;
    label: string;
    score: number;
  }>;
}

const riskAssessmentQuestions: AssessmentQuestion[] = [
  {
    id: "age",
    question: "What is your age?",
    options: [
      { value: "under-40", label: "Under 40", score: 0 },
      { value: "40-49", label: "40-49", score: 1 },
      { value: "50-59", label: "50-59", score: 2 },
      { value: "60-plus", label: "60 or older", score: 3 },
    ]
  },
  {
    id: "bmi",
    question: "What is your BMI or body type?",
    options: [
      { value: "normal", label: "Normal weight (BMI < 25)", score: 0 },
      { value: "overweight", label: "Overweight (BMI 25-29.9)", score: 1 },
      { value: "obese", label: "Obese (BMI 30+)", score: 2 },
    ]
  },
  {
    id: "family_history",
    question: "Do you have a family history of diabetes?",
    options: [
      { value: "no", label: "No family history", score: 0 },
      { value: "parent_sibling", label: "Parent or sibling with diabetes", score: 1 },
      { value: "grandparent", label: "Grandparent with diabetes", score: 0.5 },
    ]
  },
  {
    id: "physical_activity",
    question: "How physically active are you?",
    options: [
      { value: "very_active", label: "Very active (30+ min daily)", score: 0 },
      { value: "moderately_active", label: "Moderately active (few times/week)", score: 1 },
      { value: "sedentary", label: "Mostly sedentary", score: 2 },
    ]
  },
  {
    id: "blood_pressure",
    question: "Have you been told you have high blood pressure?",
    options: [
      { value: "no", label: "No, never", score: 0 },
      { value: "yes", label: "Yes, I have high blood pressure", score: 1 },
    ]
  },
  {
    id: "gestational_diabetes",
    question: "Have you ever had gestational diabetes or given birth to a baby over 9 pounds?",
    options: [
      { value: "no", label: "No", score: 0 },
      { value: "yes", label: "Yes", score: 1 },
      { value: "not_applicable", label: "Not applicable", score: 0 },
    ]
  }
];

export default function PrediabetesRisk() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("assessment");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [riskScore, setRiskScore] = useState<number | null>(null);

  // Fetch previous risk assessments
  const { data: riskAssessments = [] } = useQuery<UserRiskAssessment[]>({
    queryKey: ["/api/risk-assessments/prediabetes"],
    enabled: isAuthenticated,
  });

  // Submit risk assessment mutation
  const submitAssessmentMutation = useMutation({
    mutationFn: async (data: Omit<InsertUserRiskAssessment, 'userId'>) => {
      const res = await apiRequest('POST', '/api/risk-assessments', data);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/risk-assessments/prediabetes"] });
      setAssessmentComplete(true);
      setRiskScore(data.score);
      toast({
        title: "Assessment Complete",
        description: "Your prediabetes risk assessment has been saved!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save assessment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const nextQuestion = () => {
    if (currentQuestion < riskAssessmentQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const calculateScore = () => {
    let score = 0;
    Object.entries(answers).forEach(([questionId, answer]) => {
      const question = riskAssessmentQuestions.find(q => q.id === questionId);
      const option = question?.options.find(o => o.value === answer);
      if (option) {
        score += option.score;
      }
    });
    return score;
  };

  const submitAssessment = async () => {
    setIsSubmitting(true);
    try {
      const score = calculateScore();
      const riskLevel: 'low' | 'moderate' | 'high' = score <= 2 ? 'low' : score <= 5 ? 'moderate' : 'high';
      
      const assessmentData = {
        templateId: 'prediabetes-template',
        responses: answers,
        score,
        riskLevel,
        recommendations: generateRecommendations(riskLevel)
      };

      await submitAssessmentMutation.mutateAsync(assessmentData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateRecommendations = (riskLevel: string): string[] => {
    const baseRecommendations = [
      "Maintain a healthy weight through balanced nutrition",
      "Engage in regular physical activity (150 minutes per week)",
      "Follow a diabetes-friendly eating pattern",
      "Monitor your health with regular check-ups"
    ];

    if (riskLevel === 'high') {
      return [
        "Consult with your healthcare provider immediately",
        "Consider diabetes prevention programs",
        "Aim for 5-7% weight loss if overweight",
        ...baseRecommendations
      ];
    } else if (riskLevel === 'moderate') {
      return [
        "Schedule a check-up with your healthcare provider",
        "Focus on lifestyle modifications",
        ...baseRecommendations
      ];
    } else {
      return [
        "Continue your healthy lifestyle habits",
        ...baseRecommendations.slice(0, 2)
      ];
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskLevelIcon = (level: string) => {
    switch (level) {
      case 'low': return <CheckCircle className="w-5 h-5" />;
      case 'moderate': return <AlertTriangle className="w-5 h-5" />;
      case 'high': return <ShieldAlert className="w-5 h-5" />;
      default: return <BarChart className="w-5 h-5" />;
    }
  };

  const progress = ((currentQuestion + 1) / riskAssessmentQuestions.length) * 100;
  const isLastQuestion = currentQuestion === riskAssessmentQuestions.length - 1;
  const canProceed = answers[riskAssessmentQuestions[currentQuestion].id];

  return (
    <div className="min-h-screen bg-background" data-testid="prediabetes-risk-page">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-6">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full mb-6">
            <Target className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Prediabetes Risk Assessment
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Take this evidence-based assessment to understand your prediabetes risk and receive personalized prevention strategies.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="assessment" data-testid="tab-assessment">Risk Assessment</TabsTrigger>
            <TabsTrigger value="education" data-testid="tab-education">Learn About Risk</TabsTrigger>
            <TabsTrigger value="prevention" data-testid="tab-prevention">Prevention Tips</TabsTrigger>
            <TabsTrigger value="success" data-testid="tab-success">Success Stories</TabsTrigger>
          </TabsList>

          <TabsContent value="assessment" className="space-y-6">
            {!assessmentComplete ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Prediabetes Risk Assessment</CardTitle>
                    <Badge variant="outline">
                      {currentQuestion + 1} of {riskAssessmentQuestions.length}
                    </Badge>
                  </div>
                  <Progress value={progress} className="w-full" />
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="min-h-[200px]">
                    <h3 className="text-lg font-semibold mb-4">
                      {riskAssessmentQuestions[currentQuestion].question}
                    </h3>
                    
                    <RadioGroup
                      value={answers[riskAssessmentQuestions[currentQuestion].id] || ""}
                      onValueChange={(value) => handleAnswerChange(riskAssessmentQuestions[currentQuestion].id, value)}
                      className="space-y-3"
                    >
                      {riskAssessmentQuestions[currentQuestion].options.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={option.value} id={option.value} />
                          <Label 
                            htmlFor={option.value}
                            className="flex-1 cursor-pointer"
                            data-testid={`radio-${option.value}`}
                          >
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={prevQuestion}
                      disabled={currentQuestion === 0}
                      data-testid="button-previous"
                    >
                      Previous
                    </Button>
                    
                    {isLastQuestion ? (
                      <Button
                        onClick={submitAssessment}
                        disabled={!canProceed || isSubmitting}
                        data-testid="button-submit"
                      >
                        {isSubmitting ? "ONE MOMENT PLEASE WHILE WE DO SOME CALCULATIONS..." : "Complete Assessment"}
                      </Button>
                    ) : (
                      <Button
                        onClick={nextQuestion}
                        disabled={!canProceed}
                        data-testid="button-next"
                      >
                        Next
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    Assessment Complete
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {riskScore !== null && (
                      <div className="text-center">
                        <div className="inline-flex items-center gap-3 p-4 rounded-lg border-2 border-dashed">
                          <div className="text-3xl font-bold">{riskScore}/10</div>
                          <div>
                            <div className="font-semibold">Risk Score</div>
                            <div className="text-sm text-muted-foreground">
                              {riskScore <= 2 ? 'Low Risk' : riskScore <= 5 ? 'Moderate Risk' : 'High Risk'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <h3 className="font-semibold">Personalized Recommendations:</h3>
                      <div className="space-y-2">
                        {riskScore !== null && generateRecommendations(riskScore <= 2 ? 'low' : riskScore <= 5 ? 'moderate' : 'high').map((rec, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <Lightbulb className="w-4 h-4 mt-0.5 text-yellow-500 flex-shrink-0" />
                            <span className="text-sm">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button 
                      onClick={() => {
                        setAssessmentComplete(false);
                        setCurrentQuestion(0);
                        setAnswers({});
                        setRiskScore(null);
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      Take Assessment Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Previous Assessments */}
            {riskAssessments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Assessment History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {riskAssessments.slice(0, 3).map((assessment) => (
                      <div key={assessment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getRiskLevelIcon(assessment.riskLevel)}
                          <div>
                            <div className="font-medium">Score: {assessment.score}/10</div>
                            <div className="text-sm text-muted-foreground">
                              {assessment.completedAt ? new Date(assessment.completedAt).toLocaleDateString() : 'N/A'}
                            </div>
                          </div>
                        </div>
                        <Badge className={getRiskLevelColor(assessment.riskLevel)}>
                          {assessment.riskLevel} risk
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="education" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    What is Prediabetes?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Prediabetes is a condition where your numbers are higher than normal but not yet high enough to be diagnosed as type 2 diabetes.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      Affects 1 in 3 US adults
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      Often has no symptoms
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      Can be reversed with lifestyle changes
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    Risk Factors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="font-medium">Modifiable Factors:</div>
                    <ul className="space-y-1 ml-4">
                      <li>• Physical inactivity</li>
                      <li>• Excess weight</li>
                      <li>• Poor diet quality</li>
                    </ul>
                    
                    <div className="font-medium mt-4">Non-modifiable Factors:</div>
                    <ul className="space-y-1 ml-4">
                      <li>• Age (45+)</li>
                      <li>• Family history</li>
                      <li>• Race/ethnicity</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-500" />
                    Prevention Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">58%</div>
                      <div className="text-sm text-muted-foreground">Risk reduction with lifestyle intervention</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">5-7%</div>
                      <div className="text-sm text-muted-foreground">Body weight loss goal</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">150min</div>
                      <div className="text-sm text-muted-foreground">Weekly exercise target</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-orange-500" />
                    Testing Guidelines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div>
                      <div className="font-medium">A1C Test:</div>
                      <div className="text-muted-foreground">5.7-6.4% indicates prediabetes</div>
                    </div>
                    <div>
                      <div className="font-medium">Fasting Blood Sugar:</div>
                      <div className="text-muted-foreground">100-125 mg/dL indicates prediabetes</div>
                    </div>
                    <div>
                      <div className="font-medium">Who Should Test:</div>
                      <div className="text-muted-foreground">Adults 45+ or younger adults with risk factors</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="prevention" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Nutrition Strategies</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Choose whole grains over refined carbs
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Include lean proteins with each meal
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Fill half your plate with non-starchy vegetables
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Limit sugar-sweetened beverages
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Practice portion control
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Physical Activity Goals</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <Activity className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      150 minutes moderate activity weekly
                    </li>
                    <li className="flex items-start gap-2">
                      <Activity className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      2+ days strength training per week
                    </li>
                    <li className="flex items-start gap-2">
                      <Activity className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      Start with 10-minute activity sessions
                    </li>
                    <li className="flex items-start gap-2">
                      <Activity className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      Include enjoyable activities you'll stick with
                    </li>
                    <li className="flex items-start gap-2">
                      <Activity className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      Reduce sedentary time throughout the day
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Diabetes Prevention Program (DPP)</CardTitle>
                <p className="text-muted-foreground">Evidence-based lifestyle intervention program</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Target className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                    <div className="font-semibold">Weight Loss Goal</div>
                    <div className="text-2xl font-bold">5-7%</div>
                    <div className="text-sm text-muted-foreground">Of starting body weight</div>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <Activity className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <div className="font-semibold">Exercise Target</div>
                    <div className="text-2xl font-bold">150min</div>
                    <div className="text-sm text-muted-foreground">Per week moderate activity</div>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <div className="font-semibold">Risk Reduction</div>
                    <div className="text-2xl font-bold">58%</div>
                    <div className="text-sm text-muted-foreground">Lower diabetes risk</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="success" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-500" />
                  Success Stories
                </CardTitle>
                <p className="text-muted-foreground">Real stories from our community members</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    {
                      name: "Maria S.",
                      age: 52,
                      achievement: "Lost 15 pounds and reversed prediabetes",
                      story: "Through the GlycoGuide program, I learned to make sustainable changes to my diet and exercise routine. My A1C dropped from 6.1% to 5.4% in just 6 months!",
                      timeframe: "6 months"
                    },
                    {
                      name: "John D.", 
                      age: 47,
                      achievement: "Reduced A1C from 6.3% to 5.6%",
                      story: "The structured approach helped me understand how my lifestyle choices directly impact my numbers. The community support was invaluable.",
                      timeframe: "8 months"
                    },
                    {
                      name: "Sarah L.",
                      age: 39,
                      achievement: "Maintained healthy weight and energy levels",
                      story: "Even though I was younger, my family history put me at risk. The prevention strategies helped me build habits that protect my health long-term.",
                      timeframe: "12 months"
                    }
                  ].map((story, index) => (
                    <Card key={index} className="border-l-4 border-l-green-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">{story.name}, {story.age}</h3>
                            <p className="text-sm font-medium text-green-600">{story.achievement}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {story.timeframe}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground italic">
                          "{story.story}"
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="text-center pt-6">
                  <p className="text-sm text-muted-foreground mb-4">
                    Ready to start your prevention journey?
                  </p>
                  <Button onClick={() => setActiveTab("assessment")}>
                    Take Risk Assessment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <BottomNavigation />
    </div>
  );
}