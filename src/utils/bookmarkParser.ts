import { Category, SubCategory, LinkItem } from "../types";

interface BookmarkNode {
  type: "folder" | "link";
  title: string;
  url?: string;
  children?: BookmarkNode[];
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

function parseBookmarkHtml(html: string): BookmarkNode[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const rootDl = doc.querySelector("DL");
  if (!rootDl) return [];

  return parseDl(rootDl);
}

function parseDl(dl: Element): BookmarkNode[] {
  const nodes: BookmarkNode[] = [];
  const children = dl.children;

  for (let i = 0; i < children.length; i++) {
    const dt = children[i];
    if (dt.tagName !== "DT") continue;

    const h3 = dt.querySelector(":scope > H3");
    const a = dt.querySelector(":scope > A");

    if (h3) {
      const folder: BookmarkNode = {
        type: "folder",
        title: h3.textContent?.trim() || "Unnamed Folder",
        children: [],
      };

      const nextDl = dt.nextElementSibling;
      if (nextDl && nextDl.tagName === "DL") {
        folder.children = parseDl(nextDl);
        i++;
      }

      nodes.push(folder);
    } else if (a) {
      const href = a.getAttribute("href");
      if (href && !href.startsWith("javascript:") && !href.startsWith("place:")) {
        nodes.push({
          type: "link",
          title: a.textContent?.trim() || "Untitled",
          url: href,
        });
      }
    }
  }

  return nodes;
}

function convertNodeToCategory(node: BookmarkNode): Category | null {
  if (node.type !== "folder") return null;

  const subCategories: SubCategory[] = [];
  const directLinks: LinkItem[] = [];

  for (const child of node.children || []) {
    if (child.type === "folder" && child.children && child.children.length > 0) {
      const items: LinkItem[] = [];
      collectLinks(child, items);
      if (items.length > 0) {
        subCategories.push({
          id: generateId(),
          title: child.title,
          items,
        });
      }
    } else if (child.type === "link") {
      directLinks.push({
        id: generateId(),
        title: child.title,
        url: child.url!,
      });
    }
  }

  if (directLinks.length > 0) {
    subCategories.unshift({
      id: generateId(),
      title: "Default",
      items: directLinks,
    });
  }

  if (subCategories.length === 0) return null;

  return {
    id: generateId(),
    title: node.title,
    subCategories,
  };
}

function collectLinks(node: BookmarkNode, items: LinkItem[]) {
  for (const child of node.children || []) {
    if (child.type === "link") {
      items.push({
        id: generateId(),
        title: child.title,
        url: child.url!,
      });
    } else if (child.type === "folder") {
      collectLinks(child, items);
    }
  }
}

export function parseBookmarksToCategories(html: string): Category[] {
  const nodes = parseBookmarkHtml(html);
  const categories: Category[] = [];

  for (const node of nodes) {
    if (node.type === "folder") {
      const category = convertNodeToCategory(node);
      if (category) {
        categories.push(category);
      }
    } else if (node.type === "link") {
      let defaultCat = categories.find((c) => c.title === "Bookmarks");
      if (!defaultCat) {
        defaultCat = {
          id: generateId(),
          title: "Bookmarks",
          subCategories: [],
        };
        categories.push(defaultCat);
      }

      let defaultSub = defaultCat.subCategories.find((s) => s.title === "Default");
      if (!defaultSub) {
        defaultSub = {
          id: generateId(),
          title: "Default",
          items: [],
        };
        defaultCat.subCategories.push(defaultSub);
      }

      defaultSub.items.push({
        id: generateId(),
        title: node.title,
        url: node.url!,
      });
    }
  }

  return categories;
}
