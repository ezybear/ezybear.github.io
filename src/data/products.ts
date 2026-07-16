import { getCollection, type CollectionEntry } from "astro:content";

type ProjectEntry = CollectionEntry<"projects">;
export type Project = ProjectEntry["data"] & { slug: string; description: string };

function slugFromEntry(entry: ProjectEntry): string {
  return entry.id.replace(/\.(md|mdx)$/, "");
}

function descriptionFromEntry(entry: ProjectEntry): string {
  return (entry.body ?? "").trim().replace(/\s+/g, " ");
}

function byOrderThenName(a: Project, b: Project): number {
  return (a.order ?? 999) - (b.order ?? 999) || a.title.localeCompare(b.title);
}

export async function getProjects(): Promise<Project[]> {
  const entries = await getCollection("projects");
  return entries
    .map((entry: ProjectEntry) => ({
      slug: slugFromEntry(entry),
      description: descriptionFromEntry(entry),
      ...entry.data,
    }))
    .sort(byOrderThenName);
}

export async function getProducts(): Promise<Project[]> {
  return getProjects();
}

export async function getProject(slug: string): Promise<Project | undefined> {
  const projects = await getProjects();
  return projects.find((project) => project.slug === slug);
}

export async function getProduct(slug: string): Promise<Project | undefined> {
  return getProject(slug);
}

export function getRelated(projects: Project[], slug: string, limit = 3): Project[] {
  const current = projects.find((project) => project.slug === slug);
  if (!current) return projects.slice(0, limit);

  return projects
    .filter((project) => project.slug !== slug)
    .sort((a, b) => {
      const aScore = a.type === current.type ? -1 : 1;
      const bScore = b.type === current.type ? -1 : 1;
      return aScore - bScore || byOrderThenName(a, b);
    })
    .slice(0, limit);
}

export function getProjectFilters(projects: Project[]): {
  types: string[];
  stacks: string[];
} {
  return {
    types: [...new Set(projects.map((project) => project.type))],
    stacks: [...new Set(projects.map((project) => project.stack))],
  };
}

export function formatPrice(value: number | undefined): string {
  const safeValue = typeof value === "number" && Number.isFinite(value) ? value : 0;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(safeValue);
}

export function projectForJson(project: Project) {
  return {
    slug: project.slug,
    title: project.title,
    client: project.client,
    type: project.type,
    stack: project.stack,
    year: project.year,
    summary: project.summary,
    description: project.description,
    link: project.link,
    repo: project.repo,
  };
}

export function productForJson(product: Project) {
  return projectForJson(product);
}
