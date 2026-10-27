import LessonStep from "./step.client";

/** Static-export support (GitHub Pages): prerender all six steps of Lesson 1. */
export function generateStaticParams() {
  return [1, 2, 3, 4, 5, 6].map((step) => ({ id: "lesson-01", step: String(step) }));
}

export default function LessonStepRoute() {
  return <LessonStep />;
}
