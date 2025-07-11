export function generateProjectSlug(owner: string, repo: string): string {
  // Convert to lowercase and replace special characters
  const cleanOwner = owner.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const cleanRepo = repo.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return `${cleanOwner}-${cleanRepo}`;
}

export function getPublicUrl(slug: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  return `${baseUrl}/p/${slug}`;
}