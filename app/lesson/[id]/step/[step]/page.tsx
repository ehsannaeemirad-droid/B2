import { REGISTRY } from "@/content/registry";
import LessonStep from "./step.client";

const STEP_COUNT = 6;

/** Static-export support: six prerendered step pages per lesson. */
export function generateStaticParams() {
  return REGISTRY.flatMap((lesson) =>
    Array.from({ length: STEP_COUNT }, (_, i) => ({ id: lesson.id, step: String(i + 1) }))
  );
}

export default function LessonStepRoute() {
  return <LessonStep />;
}
