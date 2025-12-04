import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Calculator, 
  Target, 
  TrendingUp,
  Info,
  Clock,
  Apple,
  Scale
} from "lucide-react";

interface FoodItem {
  name: string;
  carbsPer100g: number;
  gi: number;
  category: string;
}

interface MealItem {
  food: FoodItem;
  quantity: number;
  carbsContribution: number;
  glContribution: number;
}

const commonFoods: FoodItem[] = [
  { name: "White Rice (cooked)", carbsPer100g: 28, gi: 73, category: "grains" },
  { name: "Brown Rice (cooked)", carbsPer100g: 23, gi: 68, category: "grains" },
  { name: "Whole Wheat Bread", carbsPer100g: 43, gi: 69, category: "grains" },
  { name: "White Bread", carbsPer100g: 49, gi: 75, category: "grains" },
  { name: "Quinoa (cooked)", carbsPer100g: 22, gi: 53, category: "grains" },
  { name: "Sweet Potato", carbsPer100g: 20, gi: 44, category: "vegetables" },
  { name: "Apple", carbsPer100g: 14, gi: 36, category: "fruits" },
  { name: "Banana", carbsPer100g: 23, gi: 51, category: "fruits" },
  { name: "Orange", carbsPer100g: 12, gi: 45, category: "fruits" },
  { name: "Lentils (cooked)", carbsPer100g: 20, gi: 32, category: "legumes" },
  { name: "Chickpeas (cooked)", carbsPer100g: 27, gi: 28, category: "legumes" },
  { name: "Oats (cooked)", carbsPer100g: 12, gi: 55, category: "grains" }
];

export default function CarbCalculator() {
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState<string>("");
  const [mealItems, setMealItems] = useState<MealItem[]>([]);
  const [customFood, setCustomFood] = useState({ name: "", carbs: "", gi: "" });
  const [targetCarbs, setTargetCarbs] = useState<string>("45");
  const [insulinRatio, setInsulinRatio] = useState<string>("15");

  const addToMeal = () => {
    if (!selectedFood || !quantity) return;
    
    const quantityNum = parseFloat(quantity);
    const carbsContribution = (selectedFood.carbsPer100g * quantityNum) / 100;
    const glContribution = (selectedFood.gi * carbsContribution) / 100;
    
    const newItem: MealItem = {
      food: selectedFood,
      quantity: quantityNum,
      carbsContribution,
      glContribution
    };
    
    setMealItems([...mealItems, newItem]);
    setQuantity("");
  };

  const addCustomFood = () => {
    if (!customFood.name || !customFood.carbs || !customFood.gi) return;
    
    const customFoodItem: FoodItem = {
      name: customFood.name,
      carbsPer100g: parseFloat(customFood.carbs),
      gi: parseFloat(customFood.gi),
      category: "custom"
    };
    
    setSelectedFood(customFoodItem);
    setCustomFood({ name: "", carbs: "", gi: "" });
  };

  const removeFromMeal = (index: number) => {
    setMealItems(mealItems.filter((_, i) => i !== index));
  };

  const clearMeal = () => {
    setMealItems([]);
  };

  const totalCarbs = mealItems.reduce((sum, item) => sum + item.carbsContribution, 0);
  const avgGI = mealItems.length > 0 
    ? mealItems.reduce((sum, item) => sum + (item.food.gi * item.carbsContribution), 0) / totalCarbs || 0
    : 0;
  const totalGL = mealItems.reduce((sum, item) => sum + item.glContribution, 0);

  const getGICategory = (gi: number) => {
    if (gi <= 55) return { label: "Low", color: "bg-green-100 text-green-800 border-green-200" };
    if (gi <= 69) return { label: "Medium", color: "bg-yellow-100 text-yellow-800 border-yellow-200" };
    return { label: "High", color: "bg-red-100 text-red-800 border-red-200" };
  };

  const getGLCategory = (gl: number) => {
    if (gl <= 10) return { label: "Low", color: "bg-green-100 text-green-800 border-green-200" };
    if (gl <= 19) return { label: "Medium", color: "bg-yellow-100 text-yellow-800 border-yellow-200" };
    return { label: "High", color: "bg-red-100 text-red-800 border-red-200" };
  };

  const insulinUnits = totalCarbs / (parseFloat(insulinRatio) || 15);
  const remainingCarbs = Math.max(0, parseFloat(targetCarbs) - totalCarbs);
  const carbProgress = (totalCarbs / parseFloat(targetCarbs)) * 100;

  return (
    <div className="space-y-6" data-testid="carb-calculator">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Carbohydrate Counting Tools</h2>
        <p className="text-muted-foreground">Calculate carbs, glycemic load, and insulin needs for your meals</p>
      </div>

      <Tabs defaultValue="calculator" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calculator" data-testid="tab-calculator">
            <Calculator className="w-4 h-4 mr-2" />
            Calculator
          </TabsTrigger>
          <TabsTrigger value="targets" data-testid="tab-targets">
            <Target className="w-4 h-4 mr-2" />
            Targets
          </TabsTrigger>
          <TabsTrigger value="analysis" data-testid="tab-analysis">
            <TrendingUp className="w-4 h-4 mr-2" />
            Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Food Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Apple className="w-5 h-5 mr-2 text-primary" />
                  Add Foods to Meal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="food-select">Select Food</Label>
                  <select
                    id="food-select"
                    className="w-full mt-1 p-2 border rounded-md"
                    value={selectedFood?.name || ""}
                    onChange={(e) => {
                      const food = commonFoods.find(f => f.name === e.target.value);
                      setSelectedFood(food || null);
                    }}
                    data-testid="select-food"
                  >
                    <option value="">Choose a food...</option>
                    {Object.entries(
                      commonFoods.reduce((acc, food) => {
                        if (!acc[food.category]) acc[food.category] = [];
                        acc[food.category].push(food);
                        return acc;
                      }, {} as Record<string, FoodItem[]>)
                    ).map(([category, foods]) => (
                      <optgroup key={category} label={category.charAt(0).toUpperCase() + category.slice(1)}>
                        {foods.map(food => (
                          <option key={food.name} value={food.name}>
                            {food.name} (GI: {food.gi})
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="quantity">Quantity (grams)</Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="100"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    data-testid="input-quantity"
                  />
                </div>

                {selectedFood && quantity && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      {quantity}g of {selectedFood.name} = {((selectedFood.carbsPer100g * parseFloat(quantity)) / 100).toFixed(1)}g carbs
                      (GI: {selectedFood.gi})
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  onClick={addToMeal} 
                  disabled={!selectedFood || !quantity}
                  className="w-full"
                  data-testid="button-add-food"
                >
                  Add to Meal
                </Button>

                {/* Custom Food */}
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Add Custom Food</h4>
                  <div className="space-y-2">
                    <Input
                      placeholder="Food name"
                      value={customFood.name}
                      onChange={(e) => setCustomFood({...customFood, name: e.target.value})}
                      data-testid="input-custom-name"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Carbs per 100g"
                        type="number"
                        value={customFood.carbs}
                        onChange={(e) => setCustomFood({...customFood, carbs: e.target.value})}
                        data-testid="input-custom-carbs"
                      />
                      <Input
                        placeholder="GI value"
                        type="number"
                        value={customFood.gi}
                        onChange={(e) => setCustomFood({...customFood, gi: e.target.value})}
                        data-testid="input-custom-gi"
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={addCustomFood}
                      disabled={!customFood.name || !customFood.carbs || !customFood.gi}
                      className="w-full"
                      data-testid="button-add-custom"
                    >
                      Add Custom Food
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Meal Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Scale className="w-5 h-5 mr-2 text-primary" />
                    Current Meal
                  </span>
                  {mealItems.length > 0 && (
                    <Button variant="outline" size="sm" onClick={clearMeal} data-testid="button-clear-meal">
                      Clear All
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mealItems.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No foods added yet. Select foods to build your meal.
                  </p>
                ) : (
                  <>
                    <div className="space-y-3">
                      {mealItems.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex-1">
                            <h5 className="font-medium">{item.food.name}</h5>
                            <p className="text-sm text-muted-foreground">
                              {item.quantity}g • {item.carbsContribution.toFixed(1)}g carbs • GI: {item.food.gi}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromMeal(index)}
                            data-testid={`button-remove-${index}`}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-primary/10 rounded-lg">
                          <p className="text-2xl font-bold text-primary">{totalCarbs.toFixed(1)}g</p>
                          <p className="text-sm text-muted-foreground">Total Carbs</p>
                        </div>
                        <div className="text-center p-3 bg-secondary/10 rounded-lg">
                          <p className="text-2xl font-bold">{avgGI.toFixed(0)}</p>
                          <p className="text-sm text-muted-foreground">Avg GI</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span>Glycemic Load:</span>
                        <Badge className={getGLCategory(totalGL).color}>
                          {totalGL.toFixed(1)} ({getGLCategory(totalGL).label})
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <span>Overall GI Category:</span>
                        <Badge className={getGICategory(avgGI).color}>
                          {getGICategory(avgGI).label}
                        </Badge>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="targets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Meal Targets & Goals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="target-carbs">Target Carbs per Meal (g)</Label>
                  <Input
                    id="target-carbs"
                    type="number"
                    value={targetCarbs}
                    onChange={(e) => setTargetCarbs(e.target.value)}
                    data-testid="input-target-carbs"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Typical range: 30-60g per meal
                  </p>
                </div>

                <div>
                  <Label htmlFor="insulin-ratio">Insulin-to-Carb Ratio</Label>
                  <Input
                    id="insulin-ratio"
                    type="number"
                    value={insulinRatio}
                    onChange={(e) => setInsulinRatio(e.target.value)}
                    data-testid="input-insulin-ratio"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Grams of carbs covered by 1 unit of insulin
                  </p>
                </div>
              </div>

              {mealItems.length > 0 && (
                <div className="grid md:grid-cols-3 gap-4 pt-6 border-t">
                  <Card className="p-4">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${carbProgress > 100 ? 'text-red-600' : carbProgress > 80 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {carbProgress.toFixed(0)}%
                      </div>
                      <p className="text-sm text-muted-foreground">Target Progress</p>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {remainingCarbs.toFixed(1)}g
                      </div>
                      <p className="text-sm text-muted-foreground">Remaining Carbs</p>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent">
                        {insulinUnits.toFixed(1)}u
                      </div>
                      <p className="text-sm text-muted-foreground">Estimated Insulin</p>
                    </div>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Meal Analysis & Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mealItems.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Add foods to your meal to see analysis and recommendations
                </p>
              ) : (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="p-4">
                      <h4 className="font-medium mb-3">Glycemic Impact</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Average GI:</span>
                          <Badge className={getGICategory(avgGI).color}>
                            {avgGI.toFixed(0)} ({getGICategory(avgGI).label})
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Total GL:</span>
                          <Badge className={getGLCategory(totalGL).color}>
                            {totalGL.toFixed(1)} ({getGLCategory(totalGL).label})
                          </Badge>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium mb-3">Carb Distribution</h4>
                      <div className="space-y-2">
                        {mealItems.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.food.name}:</span>
                            <span>{((item.carbsContribution / totalCarbs) * 100).toFixed(0)}%</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>

                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Timing Recommendation:</strong> {
                        avgGI <= 55 
                          ? "This low-GI meal provides sustained energy. Great for any time of day."
                          : avgGI <= 69
                          ? "This moderate-GI meal is best consumed around physical activity."
                          : "This high-GI meal may cause rapid blood sugar rise. Consider pairing with protein or fiber."
                      }
                    </AlertDescription>
                  </Alert>

                  {avgGI > 55 && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Optimization Tips:</strong>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>Add protein (nuts, yogurt, or lean meat) to slow glucose absorption</li>
                          <li>Include healthy fats (avocado, olive oil) to reduce glycemic impact</li>
                          <li>Consider eating this meal after exercise when muscles can better utilize glucose</li>
                          <li>Monitor blood sugar 1-2 hours after eating</li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}