"use client";
import React, { Suspense } from "react";
import { useParams } from "next/navigation";

function Page() {
  const { categoryName } = useParams();

  setTimeout(() => {}, 2000);
  if (!categoryName) {
    return <div>Laden...</div>;
  }

  return (
    <div>
      <Suspense fallback={<div>Laden...</div>}></Suspense>
    </div>
  );
}

export default Page;
