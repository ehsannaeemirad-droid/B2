import { REGISTRY } from "@/content/registry";
import LessonOverview from "./overview.client";

/** Static-export support (GitHub Pages): only lessons with content are prerendered. */
export function generateStaticParams() {
  return REGISTRY.filter((l) => l.status === "ready").map((l) => ({ id: l.id }));
}

export default function LessonOverviewRoute() {
  return <LessonOverview />;
}
