// routes/MealsRoute.tsx - Toggle between clean and old Meals UI
import MealsClean from "@/pages/MealsClean";
import MealsOld from "@/pages/meals";

export default function MealsRoute() {
  const params = new URLSearchParams(window.location.search);
  const forceOld = params.get("ui") === "old";
  
  return forceOld ? <MealsOld /> : <MealsClean />;
}