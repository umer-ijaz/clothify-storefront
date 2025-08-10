"use client";
import React, { Suspense } from "react";
import { useParams } from "next/navigation";
import Loading from "@/app/loading";

function Page() {
  const { categoryName } = useParams();

  setTimeout(() => {}, 2000);
  if (!categoryName) {
    return (
      <div>
        <Loading />
      </div>
    );
  }

  return (
    <div>
      <Suspense
        fallback={
          <div>
            <Loading />
          </div>
        }
      ></Suspense>
    </div>
  );
}

export default Page;
