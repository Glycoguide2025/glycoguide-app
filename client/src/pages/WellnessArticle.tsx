import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen, X } from "lucide-react";
import articlesData from "@/data/wellness-articles.json";

export default function WellnessArticle() {
  const [, params] = useRoute("/articles/:category/:slug");
  const [, setLocation] = useLocation();
  
  const article = articlesData.articles.find(a => a.id === params?.slug);

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-4xl mx-auto pt-20">
          <Card>
            <CardContent className="p-12 text-center">
              <h2 className="text-2xl font-bold mb-4">Article Not Found</h2>
              <p className="text-muted-foreground mb-6">The article you're looking for doesn't exist.</p>
              <Button onClick={() => setLocation("/dashboard")} data-testid="button-return-dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto p-6 pt-20 pb-24">
        {/* Close Button */}
        <div className="flex justify-end mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation(article.returnTo)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            data-testid="button-close-article"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <BookOpen className="h-4 w-4" />
            <span>{article.section}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {article.title}
          </h1>
        </div>

        {/* Article Content */}
        <Card className="mb-8">
          <CardContent className="p-8 md:p-12">
            {/* Introduction */}
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
              {article.content.introduction}
            </p>

            {/* Sections */}
            {article.content.sections.map((section, index) => (
              <div key={index} className="mb-8 last:mb-0">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  {section.heading}
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {section.body}
                </p>
              </div>
            ))}

            {/* Conclusion */}
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <p className="text-lg font-medium text-gray-900 dark:text-white leading-relaxed">
                {article.content.conclusion}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Return Button */}
        <div className="flex justify-center">
          <Button 
            onClick={() => setLocation(article.returnTo)}
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white"
            data-testid="button-return-tracker"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {article.returnLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
