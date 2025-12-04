import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft, BookOpen, Heart, Brain, Sprout, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface ResearchStatement {
  id: string;
  icon: React.ElementType;
  title: string;
  statement: string;
  reference: {
    authors: string;
    title: string;
    journal: string;
    year: number;
    doi?: string;
  };
}

const researchStatements: ResearchStatement[] = [
  {
    id: "1",
    icon: Sprout,
    title: "Low Glycemic Index Diet & Blood Sugar Control",
    statement: "Research indicates that low glycemic index (GI) diets can significantly improve glycemic control in individuals with type 2 diabetes. A systematic review and meta-analysis found that low-GI diets reduced HbA1c levels by an average of 0.5%, demonstrating meaningful clinical benefits for diabetes management.",
    reference: {
      authors: "Thomas D, Elliott EJ",
      title: "Low glycaemic index, or low glycaemic load, diets for diabetes mellitus",
      journal: "Cochrane Database of Systematic Reviews",
      year: 2009,
      doi: "10.1002/14651858.CD006296.pub2"
    }
  },
  {
    id: "2",
    icon: Brain,
    title: "Mindfulness & Emotional Well-Being in Diabetes",
    statement: "Mindfulness-based interventions have shown promise in improving psychological outcomes for people with diabetes. Studies demonstrate that mindfulness practices can reduce diabetes-related distress, improve emotional regulation, and enhance overall quality of life in individuals managing chronic conditions.",
    reference: {
      authors: "Hartmann M, Kopf S, Kircher C, et al.",
      title: "Sustained effects of a mindfulness-based stress-reduction intervention in type 2 diabetic patients",
      journal: "Diabetes Care",
      year: 2012,
      doi: "10.2337/dc11-1343"
    }
  },
  {
    id: "3",
    icon: Activity,
    title: "Physical Activity & Insulin Sensitivity",
    statement: "Regular physical activity is a cornerstone of diabetes management. Evidence shows that both aerobic and resistance exercise improve insulin sensitivity, enhance glucose uptake by muscles, and contribute to better glycemic control. Even moderate-intensity activities like walking can yield significant metabolic benefits.",
    reference: {
      authors: "Colberg SR, Sigal RJ, Yardley JE, et al.",
      title: "Physical Activity/Exercise and Diabetes: A Position Statement of the American Diabetes Association",
      journal: "Diabetes Care",
      year: 2016,
      doi: "10.2337/dc16-1728"
    }
  },
  {
    id: "4",
    icon: Heart,
    title: "Sleep Quality & Glucose Metabolism",
    statement: "Sleep plays a critical role in metabolic health. Research has established strong links between sleep duration, sleep quality, and glucose regulation. Poor sleep patterns are associated with increased insulin resistance, impaired glucose tolerance, and elevated risk of type 2 diabetes complications.",
    reference: {
      authors: "Knutson KL, Van Cauter E",
      title: "Associations between sleep loss and increased risk of obesity and diabetes",
      journal: "Annals of the New York Academy of Sciences",
      year: 2008,
      doi: "10.1196/annals.1447.032"
    }
  },
  {
    id: "5",
    icon: BookOpen,
    title: "Self-Monitoring & Glycemic Outcomes",
    statement: "Self-monitoring of health behaviors, including food intake, physical activity, and blood glucose levels, has been shown to improve diabetes outcomes. Digital health tools that facilitate tracking and provide feedback can enhance self-management skills and promote sustained behavior change.",
    reference: {
      authors: "Greenwood DA, Gee PM, Fatkin KJ, Peeples M",
      title: "A Systematic Review of Reviews Evaluating Technology-Enabled Diabetes Self-Management Education and Support",
      journal: "Journal of Diabetes Science and Technology",
      year: 2017,
      doi: "10.1177/1932296817713506"
    }
  }
];

export default function SciencePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 pb-24">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/settings">
              <Button variant="ghost" size="sm" className="gap-2" data-testid="button-back-to-settings">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-[#A9B89E]" />
                Science & Research
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Evidence-based foundations of wellness
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Introduction */}
        <Card data-testid="card-science-intro">
          <CardHeader>
            <CardTitle className="text-xl">Our Evidence-Based Approach</CardTitle>
            <CardDescription>
              GlycoGuide's wellness features are grounded in peer-reviewed research. Below are key scientific findings that inform our approach to diabetes management and holistic well-being.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Research Statements */}
        {researchStatements.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <Card key={item.id} data-testid={`card-research-${item.id}`}>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <IconComponent className="w-6 h-6 text-[#A9B89E]" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{item.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                      {item.statement}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border-l-4 border-[#A9B89E]">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                    Reference:
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {item.reference.authors}. ({item.reference.year}). <em>{item.reference.title}</em>. {item.reference.journal}.
                    {item.reference.doi && (
                      <>
                        {" "}
                        <a 
                          href={`https://doi.org/${item.reference.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#A9B89E] hover:underline"
                          data-testid={`link-doi-${item.id}`}
                        >
                          doi:{item.reference.doi}
                        </a>
                      </>
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}

        <Separator className="my-8" />

        {/* Disclaimer */}
        <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800" data-testid="card-disclaimer">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              <strong>Important:</strong> GlycoGuide is a wellness and self-tracking application designed to support healthy lifestyle habits. It does not diagnose, treat, cure, or prevent any disease. The information provided is for educational purposes and should not replace professional medical advice. Always consult with qualified healthcare providers regarding diabetes management and treatment decisions.
            </p>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="flex justify-center pt-4">
          <Link href="/settings">
            <Button variant="outline" size="lg" className="gap-2" data-testid="button-back-bottom">
              <ArrowLeft className="w-4 h-4" />
              Return to Settings
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
