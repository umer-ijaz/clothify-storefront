"use client";
import CategoryPage from "@/components/categoryComponents/categoryMain";
import React, { Suspense } from "react";
import { useParams } from "next/navigation";

function Page() {
  const { categoryId } = useParams() as { categoryId: string };

  // Convert the single word into a one-element array
  const slug = [categoryId];

  if (!categoryId) {
    return <div>Laden...</div>;
  }

  return (
    <div>
      <Suspense fallback={<div>Laden...</div>}>
        <CategoryPage params={{ slug }} />
      </Suspense>
    </div>
  );
}

export default Page;
