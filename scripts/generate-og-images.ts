/**
 * Generate OG social-media cards for blog posts and the site-wide default.
 *
 * Uses satori (flexbox → SVG) + @resvg/resvg-js (SVG → PNG).
 * Fonts are static TTF files in scripts/fonts/.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Dimensions ───────────────────────────────────────────────────────────────
const WIDTH = 1200;
const HEIGHT = 630;

// ── Palette ──────────────────────────────────────────────────────────────────
const CREAM = "#faf9f7";
const TITLE_COLOR = "#3d3a36";
const SUBTITLE_COLOR = "#8b7355";
const ACCENT = "#c45a3b";

// ── Paths ────────────────────────────────────────────────────────────────────
const ROOT = path.resolve(__dirname, "..");
const SCRIPT_FONTS_DIR = path.join(__dirname, "fonts");
const OUT_DIR = path.join(ROOT, "assets", "images", "og");
const DEFAULT_OUT = path.join(ROOT, "assets", "images", "default_og.png");

// ── Post data ────────────────────────────────────────────────────────────────
interface CardData {
  filename: string;
  title: string;
  subtitle?: string;
}

const POSTS: CardData[] = [
  {
    filename: "cdc-part-1.png",
    title: "From Problem to Taxonomy",
    subtitle: "Content-Defined Chunking, Part 1",
  },
  {
    filename: "cdc-part-2.png",
    title: "A Deep Dive into FastCDC",
    subtitle: "Content-Defined Chunking, Part 2",
  },
  {
    filename: "cdc-part-3.png",
    title: "Deduplication in Action",
    subtitle: "Content-Defined Chunking, Part 3",
  },
  {
    filename: "cdc-part-4.png",
    title: "CDC in the Cloud",
    subtitle: "Content-Defined Chunking, Part 4",
  },
  {
    filename: "cdc-part-5.png",
    title: "CDC at Scale on a Budget",
    subtitle: "Content-Defined Chunking, Part 5",
  },
  {
    filename: "10-lessons-from-github.png",
    title: "10 Lessons from 10 Years at GitHub",
  },
  {
    filename: "line-field-animation.png",
    title: "Anatomy of a Line Field Animation",
  },
  {
    filename: "superintelligence.png",
    title: "How Software Engineers Can Prepare for Superintelligence",
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

async function loadFont(name: string): Promise<Buffer> {
  return fs.readFile(path.join(SCRIPT_FONTS_DIR, name));
}

async function renderPng(svg: string): Promise<Buffer> {
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width" as const, value: WIDTH },
  });
  const pngData = resvg.render();
  return Buffer.from(pngData.asPng());
}

// ── Card layouts (satori JSX) ────────────────────────────────────────────────

function postCard(title: string, subtitle?: string) {
  const children: object[] = [
    // Accent bar
    {
      type: "div",
      props: {
        style: {
          width: 60,
          height: 3,
          backgroundColor: ACCENT,
          marginBottom: 32,
        },
      },
    },
    // Title
    {
      type: "div",
      props: {
        style: {
          fontFamily: "Libre Baskerville",
          fontSize: subtitle ? 52 : 46,
          color: TITLE_COLOR,
          textAlign: "center",
          lineHeight: 1.25,
          marginBottom: subtitle ? 20 : 0,
        },
        children: title,
      },
    },
  ];

  if (subtitle) {
    children.push({
      type: "div",
      props: {
        style: {
          fontFamily: "Source Serif 4",
          fontSize: 26,
          color: SUBTITLE_COLOR,
          textAlign: "center",
        },
        children: subtitle,
      },
    });
  }

  // Footer
  children.push({
    type: "div",
    props: {
      style: {
        position: "absolute",
        bottom: 36,
        right: 48,
        fontFamily: "Source Serif 4",
        fontSize: 18,
        color: SUBTITLE_COLOR,
      },
      children: "rickwinfrey.com",
    },
  });

  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: WIDTH,
        height: HEIGHT,
        backgroundColor: CREAM,
        padding: "60px 80px",
      },
      children,
    },
  };
}

function defaultCard() {
  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: WIDTH,
        height: HEIGHT,
        backgroundColor: CREAM,
      },
      children: [
        // Footer
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              bottom: 36,
              right: 48,
              fontFamily: "Source Serif 4",
              fontSize: 18,
              color: SUBTITLE_COLOR,
            },
            children: "rickwinfrey.com",
          },
        },
      ],
    },
  };
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // Load fonts
  const [libreBaskerville, sourceSerif4] = await Promise.all([
    loadFont("LibreBaskerville-Regular.ttf"),
    loadFont("SourceSerif4-Regular.ttf"),
  ]);

  const fonts = [
    { name: "Libre Baskerville", data: libreBaskerville, weight: 400 as const },
    { name: "Source Serif 4", data: sourceSerif4, weight: 400 as const },
  ];

  // Ensure output directory exists
  await fs.mkdir(OUT_DIR, { recursive: true });

  // Generate post cards
  for (const post of POSTS) {
    const svg = await satori(postCard(post.title, post.subtitle) as any, {
      width: WIDTH,
      height: HEIGHT,
      fonts,
    });
    const png = await renderPng(svg);
    const outPath = path.join(OUT_DIR, post.filename);
    await fs.writeFile(outPath, png);
    console.log(`  ✓ ${outPath}`);
  }

  // Generate default site card
  const defaultSvg = await satori(defaultCard() as any, {
    width: WIDTH,
    height: HEIGHT,
    fonts,
  });
  const defaultPng = await renderPng(defaultSvg);
  await fs.writeFile(DEFAULT_OUT, defaultPng);
  console.log(`  ✓ ${DEFAULT_OUT}`);

  console.log(`\nDone — generated ${POSTS.length + 1} OG images.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
