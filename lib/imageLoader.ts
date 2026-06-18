// Custom next/image loader for Unsplash. Instead of proxying through the Next
// image optimizer (which needs server-side outbound access), we delegate
// resizing to Unsplash's own CDN via its `w`/`q` params. The browser loads the
// right-sized image directly — fast, responsive, no layout shift, and robust
// across hosting environments.
interface LoaderArgs {
  src: string;
  width: number;
  quality?: number;
}

export default function unsplashLoader({ src, width, quality }: LoaderArgs): string {
  try {
    const url = new URL(src);
    url.searchParams.set("w", String(width));
    url.searchParams.set("q", String(quality ?? 70));
    url.searchParams.set("auto", "format");
    if (!url.searchParams.get("fit")) url.searchParams.set("fit", "crop");
    return url.toString();
  } catch {
    return src;
  }
}
