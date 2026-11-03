import { REGISTRY } from "@/content/registry";
import LessonOverview from "./overview.client";

/** Static-export support: every lesson in the registry is prerendered. */
export function generateStaticParams() {
  return REGISTRY.map((lesson) => ({ id: lesson.id }));
}

export default function LessonOverviewRoute() {
  return <LessonOverview />;
}
