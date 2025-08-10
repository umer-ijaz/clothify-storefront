import { ReactElement, ReactNode } from "react";
export interface DeliveryWarrantyData {
  freeDelivery?: {
    description: string;
    enabled: boolean;
    threshold?: number; // Optional threshold
  };
  personalPickup?: {
    description: string;
    enabled: boolean;
  };
  standardDelivery?: {
    description?: string; // Make description optional if guarantee is used
    enabled: boolean;
    guarantee?: string; // Use guarantee field
  };
  warranty?: {
    description?: string; // Make description optional if period is used
    enabled: boolean;
    period?: string; // Use period field
  };
}

// Define the structure for the displayed options
export interface DisplayOption {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
}
