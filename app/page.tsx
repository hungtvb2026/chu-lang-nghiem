import { Suspense } from "react";
import { getAllVerses, getDeSections } from "@/lib/data";
import QuizClient from "./QuizClient";
import SkeletonLoader from "@/components/SkeletonLoader";

export default function Home() {
  const allVerses = getAllVerses();
  const sections = getDeSections();

  return (
    <Suspense fallback={<SkeletonLoader />}>
      <QuizClient allVerses={allVerses} sections={sections} />
    </Suspense>
  );
}
