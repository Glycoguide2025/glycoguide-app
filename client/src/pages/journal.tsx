import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { BookOpen, Heart, Target, Lightbulb, Plus, Calendar, Search, Filter, Star, Smile, TrendingUp } from "lucide-react";
import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from "date-fns";
import type { JournalEntry, InsertJournalEntry } from "@shared/schema";

export default function Journal() {
  const { toast } = useToast();
  const [showCreateEntry, setShowCreateEntry] = useState(false);
  const [activeView, setActiveView] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [newEntry, setNewEntry] = useState<Partial<InsertJournalEntry>>({
    title: '',
    content: '',
    gratitude: [],
    goals: [],
    reflections: '',
    isPrivate: true,
  });
  const [gratitudeInput, setGratitudeInput] = useState('');
  const [goalInput, setGoalInput] = useState('');

  // Fetch journal entries
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['/api/journal-entries'],
  });

  // Create entry mutation
  const createEntryMutation = useMutation({
    mutationFn: async (entryData: InsertJournalEntry) => {
      return await apiRequest('/api/journal-entries', 'POST', entryData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/journal-entries'] });
      toast({
        title: "Journal Entry Saved",
        description: "Your thoughts and reflections have been recorded.",
      });
      setShowCreateEntry(false);
      setNewEntry({
        title: '',
        content: '',
        gratitude: [],
        goals: [],
        reflections: '',
        isPrivate: true,
      });
      setGratitudeInput('');
      setGoalInput('');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save your journal entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitEntry = () => {
    if (!newEntry.content?.trim()) {
      toast({
        title: "Missing Content",
        description: "Please write something in your journal entry.",
        variant: "destructive",
      });
      return;
    }

    createEntryMutation.mutate(newEntry as InsertJournalEntry);
  };

  const addGratitude = () => {
    if (gratitudeInput.trim()) {
      setNewEntry(prev => ({
        ...prev,
        gratitude: [...(prev.gratitude || []), gratitudeInput.trim()]
      }));
      setGratitudeInput('');
    }
  };

  const removeGratitude = (index: number) => {
    setNewEntry(prev => ({
      ...prev,
      gratitude: prev.gratitude?.filter((_, i) => i !== index) || []
    }));
  };

  const addGoal = () => {
    if (goalInput.trim()) {
      setNewEntry(prev => ({
        ...prev,
        goals: [...(prev.goals || []), goalInput.trim()]
      }));
      setGoalInput('');
    }
  };

  const removeGoal = (index: number) => {
    setNewEntry(prev => ({
      ...prev,
      goals: prev.goals?.filter((_, i) => i !== index) || []
    }));
  };

  const getDateDisplay = (date: string) => {
    const entryDate = parseISO(date);
    if (isToday(entryDate)) return 'Today';
    if (isYesterday(entryDate)) return 'Yesterday';
    return format(entryDate, 'MMM dd, yyyy');
  };

  const filteredEntries = entries.filter((entry: JournalEntry) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        entry.title?.toLowerCase().includes(query) ||
        entry.content.toLowerCase().includes(query) ||
        entry.reflections?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const journalPrompts = [
    "What am I most grateful for today?",
    "How did I take care of my health today?",
    "What challenge did I overcome, and what did I learn?",
    "What positive choice did I make for my wellbeing?",
    "How did I show kindness to myself or others today?",
    "What progress did I make toward my health goals?",
    "What mindful moment stood out to me today?",
    "How did I manage stress or difficult emotions?",
    "What healthy habit am I proud of maintaining?",
    "What would I tell my future self about today?"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50" data-testid="journal-page">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full mb-6">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Wellness Journal
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Reflect on your wellness journey, express gratitude, set intentions, and track your personal growth.
          </p>
        </div>

        {/* Journal Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-amber-600 mb-2">
                {entries.length}
              </div>
              <p className="text-sm text-muted-foreground">Journal Entries</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {entries.reduce((acc: number, entry: JournalEntry) => acc + (entry.gratitude?.length || 0), 0)}
              </div>
              <p className="text-sm text-muted-foreground">Gratitude Notes</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {entries.reduce((acc: number, entry: JournalEntry) => acc + (entry.goals?.length || 0), 0)}
              </div>
              <p className="text-sm text-muted-foreground">Goals Set</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {entries.filter((entry: JournalEntry) => {
                  const entryDate = parseISO(entry.createdAt!);
                  const daysSinceEntry = Math.floor((new Date().getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
                  return daysSinceEntry <= 7;
                }).length}
              </div>
              <p className="text-sm text-muted-foreground">This Week</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-8">
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search your entries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
                data-testid="input-search-entries"
              />
            </div>
          </div>

          <Dialog open={showCreateEntry} onOpenChange={setShowCreateEntry}>
            <DialogTrigger asChild>
              <Button size="lg" data-testid="button-create-entry">
                <Plus className="w-5 h-5 mr-2" />
                New Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>New Journal Entry</DialogTitle>
                <DialogDescription>
                  Take a moment to reflect on your day and capture your thoughts.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="entry-title">Title (Optional)</Label>
                  <Input
                    id="entry-title"
                    placeholder="Give your entry a title..."
                    value={newEntry.title}
                    onChange={(e) => setNewEntry(prev => ({
                      ...prev,
                      title: e.target.value
                    }))}
                    data-testid="input-entry-title"
                  />
                </div>

                <div>
                  <Label htmlFor="entry-content">What's on your mind?</Label>
                  <Textarea
                    id="entry-content"
                    placeholder="Write freely about your thoughts, experiences, challenges, or celebrations..."
                    className="min-h-40"
                    value={newEntry.content}
                    onChange={(e) => setNewEntry(prev => ({
                      ...prev,
                      content: e.target.value
                    }))}
                    data-testid="textarea-entry-content"
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-3">
                    <Heart className="w-4 h-4 text-pink-500" />
                    Gratitude List
                  </Label>
                  <div className="flex gap-2 mb-3">
                    <Input
                      placeholder="What are you grateful for today?"
                      value={gratitudeInput}
                      onChange={(e) => setGratitudeInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addGratitude()}
                      data-testid="input-gratitude"
                    />
                    <Button onClick={addGratitude} disabled={!gratitudeInput.trim()}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {newEntry.gratitude?.map((item, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeGratitude(index)}
                      >
                        {item} ×
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-blue-500" />
                    Goals & Intentions
                  </Label>
                  <div className="flex gap-2 mb-3">
                    <Input
                      placeholder="What do you want to accomplish?"
                      value={goalInput}
                      onChange={(e) => setGoalInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addGoal()}
                      data-testid="input-goal"
                    />
                    <Button onClick={addGoal} disabled={!goalInput.trim()}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {newEntry.goals?.map((goal, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeGoal(index)}
                      >
                        {goal} ×
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="entry-reflections">Daily Reflection</Label>
                  <Textarea
                    id="entry-reflections"
                    placeholder="What did you learn today? How did you grow? What would you do differently?"
                    className="min-h-24"
                    value={newEntry.reflections || ''}
                    onChange={(e) => setNewEntry(prev => ({
                      ...prev,
                      reflections: e.target.value
                    }))}
                    data-testid="textarea-reflections"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="private"
                    checked={newEntry.isPrivate}
                    onChange={(e) => setNewEntry(prev => ({
                      ...prev,
                      isPrivate: e.target.checked
                    }))}
                    data-testid="checkbox-private"
                  />
                  <Label htmlFor="private" className="text-sm">
                    Keep this entry private (only visible to you)
                  </Label>
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={handleSubmitEntry} 
                    disabled={createEntryMutation.isPending}
                    className="flex-1"
                    data-testid="button-save-entry"
                  >
                    {createEntryMutation.isPending ? 'Saving...' : 'Save Entry'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreateEntry(false)}
                    disabled={createEntryMutation.isPending}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Journal Entries */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {isLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                        <div className="h-24 bg-muted rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredEntries.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">
                    {searchQuery ? 'No entries found' : 'Start your wellness journal'}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery 
                      ? 'Try adjusting your search terms.' 
                      : 'Begin documenting your thoughts, gratitude, and goals.'
                    }
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => setShowCreateEntry(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Write First Entry
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredEntries.map((entry: JournalEntry) => (
                <Card key={entry.id} className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Entry Header */}
                      <div className="flex items-center justify-between">
                        <div>
                          {entry.title && (
                            <h3 className="text-lg font-semibold mb-1">{entry.title}</h3>
                          )}
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {getDateDisplay(entry.createdAt!)} • {formatDistanceToNow(new Date(entry.createdAt!))} ago
                          </p>
                        </div>
                        {entry.isPrivate && (
                          <Badge variant="outline" className="text-xs">
                            Private
                          </Badge>
                        )}
                      </div>

                      {/* Entry Content */}
                      <div className="prose prose-sm max-w-none">
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                          {entry.content}
                        </p>
                      </div>

                      {/* Gratitude */}
                      {entry.gratitude && entry.gratitude.length > 0 && (
                        <div>
                          <h4 className="flex items-center gap-2 text-sm font-medium mb-2 text-pink-600">
                            <Heart className="w-4 h-4" />
                            Grateful For
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {entry.gratitude.map((item, index) => (
                              <Badge key={index} className="bg-pink-50 text-pink-700 hover:bg-pink-100">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Goals */}
                      {entry.goals && entry.goals.length > 0 && (
                        <div>
                          <h4 className="flex items-center gap-2 text-sm font-medium mb-2 text-blue-600">
                            <Target className="w-4 h-4" />
                            Goals & Intentions
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {entry.goals.map((goal, index) => (
                              <Badge key={index} className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                                {goal}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Reflections */}
                      {entry.reflections && (
                        <div>
                          <h4 className="flex items-center gap-2 text-sm font-medium mb-2 text-purple-600">
                            <Lightbulb className="w-4 h-4" />
                            Reflection
                          </h4>
                          <p className="text-sm text-muted-foreground italic">
                            {entry.reflections}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Writing Prompts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lightbulb className="w-5 h-5" />
                  Writing Prompts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {journalPrompts.slice(0, 5).map((prompt, index) => (
                    <div
                      key={index}
                      className="p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => {
                        setNewEntry(prev => ({
                          ...prev,
                          content: prompt + '\n\n'
                        }));
                        setShowCreateEntry(true);
                      }}
                    >
                      <p className="text-sm text-muted-foreground">"{prompt}"</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Journal Benefits */}
            <Card className="border-amber-200 bg-amber-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-800">
                  <Star className="w-5 h-5" />
                  Benefits of Journaling
                </CardTitle>
              </CardHeader>
              <CardContent className="text-amber-700">
                <div className="space-y-3 text-sm">
                  <p className="flex items-center gap-2">
                    <Smile className="w-4 h-4" />
                    Reduces stress and anxiety
                  </p>
                  <p className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Improves emotional regulation
                  </p>
                  <p className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Increases self-awareness
                  </p>
                  <p className="flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    Enhances gratitude practice
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}