import React from "react";
import { Coffee, Sandwich, UtensilsCrossed, Cookie, Soup, IceCream } from "lucide-react";

type IconSpec = { node: JSX.Element; label: string };

export const CAT_ICONS: Record<string, IconSpec> = {
  breakfast: { node: <Coffee className="h-5 w-5" aria-hidden="true" />, label: "Breakfast" },
  lunch:     { node: <Sandwich className="h-5 w-5" aria-hidden="true" />, label: "Lunch" },
  dinner:    { node: <UtensilsCrossed className="h-5 w-5" aria-hidden="true" />, label: "Dinner" },
  snacks:    { node: <Cookie className="h-5 w-5" aria-hidden="true" />, label: "Snacks" },
  soups:     { node: <Soup className="h-5 w-5" aria-hidden="true" />, label: "Soups" },
  desserts:  { node: <IceCream className="h-5 w-5" aria-hidden="true" />, label: "Desserts" },
};

export const CAT_EMOJI: Record<string, IconSpec> = {
  breakfast: { node: <span role="img" aria-label="Breakfast">☕️</span>, label: "Breakfast" },
  lunch:     { node: <span role="img" aria-label="Lunch">🥪</span>, label: "Lunch" },
  dinner:    { node: <span role="img" aria-label="Dinner">🍽️</span>, label: "Dinner" },
  snacks:    { node: <span role="img" aria-label="Snacks">🍪</span>, label: "Snacks" },
  soups:     { node: <span role="img" aria-label="Soups">🥣</span>, label: "Soups" },
  desserts:  { node: <span role="img" aria-label="Desserts">🍨</span>, label: "Desserts" },
};