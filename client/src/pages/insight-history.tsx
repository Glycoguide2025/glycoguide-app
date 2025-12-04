import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Sparkles, Calendar, Filter, Search, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocation } from 'wouter';
import { format } from 'date-fns';

interface InsightHistoryItem {
  id: string;
  insightText: string;
  insightCategory: string;
  shownAt: string;
  dismissedAt: string | null;
}

export default function InsightHistory() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('30');

  const { data: insights = [], isLoading } = useQuery<InsightHistoryItem[]>({
    queryKey: ['/api/insights/history', { category: categoryFilter === 'all' ? undefined : categoryFilter, limit: 100 }],
  });

  const filteredInsights = insights.filter(insight => {
    const matchesSearch = insight.insightText.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || insight.insightCategory === categoryFilter;
    
    if (dateRange !== 'all') {
      const daysAgo = parseInt(dateRange);
      const insightDate = new Date(insight.shownAt);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
      return matchesSearch && matchesCategory && insightDate >= cutoffDate;
    }
    
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'pattern', label: 'Pattern' },
    { value: 'mood', label: 'Mood' },
    { value: 'energy', label: 'Energy' },
    { value: 'wellness', label: 'Wellness' },
    { value: 'sleep', label: 'Sleep' },
    { value: 'exercise', label: 'Exercise' },
    { value: 'hydration', label: 'Hydration' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8F9F8] to-white dark:from-gray-900 dark:to-gray-800 pb-24">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/settings')}
              data-testid="button-back"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-[#A9B89E]" />
                Insight History
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Browse your wellness insights and patterns
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search insights..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-insights"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-category-filter">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-full sm:w-[160px]" data-testid="select-date-range">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredInsights.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery || categoryFilter !== 'all' 
                ? 'No insights match your filters' 
                : 'No insights yet. Keep tracking your wellness to see patterns!'}
            </p>
          </div>
        ) : (
          <div className="space-y-3" data-testid="insights-list">
            {filteredInsights.map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-[#A9B89E]/50 dark:hover:border-[#A9B89E]/30 transition-colors"
                data-testid={`insight-item-${index}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <Sparkles className="w-5 h-5 text-[#A9B89E]" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-relaxed mb-2">
                      {insight.insightText}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#A9B89E]/10 dark:bg-[#A9B89E]/20 text-[#5C6B5C] dark:text-[#A9B89E]">
                        {insight.insightCategory}
                      </span>
                      
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(insight.shownAt), 'MMM d, yyyy')}
                      </span>
                      
                      {insight.dismissedAt && (
                        <span className="text-gray-400 dark:text-gray-500">
                          Dismissed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
