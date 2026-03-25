import { getAllVerses, getDeSections } from "@/lib/data";
import QuizClient from "./QuizClient";

export default function Home() {
  const allVerses = getAllVerses();
  const sections = getDeSections();

  return <QuizClient allVerses={allVerses} sections={sections} />;
}
