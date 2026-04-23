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
  const children = Array.from(dl.children);

  for (let i = 0; i < children.length; i++) {
    const el = children[i];
    if (el.tagName !== "DT") continue;

    const h3 = el.querySelector(":scope > H3");
    const a = el.querySelector(":scope > A");
    const childDl = el.querySelector(":scope > DL");

    if (h3) {
      const folder: BookmarkNode = {
        type: "folder",
        title: h3.textContent?.trim() || "Unnamed Folder",
        children: childDl ? parseDl(childDl) : [],
      };
      nodes.push(folder);
    } else if (a) {
      const href = a.getAttribute("href");
      if (href && !href.startsWith("javascript:") && !href.startsWith("place:") && !href.startsWith("data:")) {
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
    if (child.type === "folder") {
      const subCat = convertFolderToSubCategory(child);
      if (subCat) {
        subCategories.push(subCat);
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

function convertFolderToSubCategory(node: BookmarkNode): SubCategory | null {
  const directLinks: LinkItem[] = [];
  const childSubs: SubCategory[] = [];

  for (const child of node.children || []) {
    if (child.type === "link") {
      directLinks.push({
        id: generateId(),
        title: child.title,
        url: child.url!,
      });
    } else if (child.type === "folder") {
      const sub = convertFolderToSubCategory(child);
      if (sub) {
        childSubs.push(sub);
      }
    }
  }

  if (directLinks.length === 0 && childSubs.length === 0) return null;

  if (childSubs.length === 0) {
    return {
      id: generateId(),
      title: node.title,
      items: directLinks,
    };
  }

  const subCategories: SubCategory[] = [];
  if (directLinks.length > 0) {
    subCategories.push({
      id: generateId(),
      title: "Default",
      items: directLinks,
    });
  }
  subCategories.push(...childSubs);

  return {
    id: generateId(),
    title: node.title,
    items: directLinks.length > 0
      ? directLinks
      : childSubs[0]?.items || [],
    subCategories,
  };
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

export function mergeCategories(existing: Category[], imported: Category[]): Category[] {
  const merged = [...existing];

  for (const impCat of imported) {
    const existingCat = merged.find(
      (c) => c.title.toLowerCase() === impCat.title.toLowerCase()
    );

    if (existingCat) {
      for (const impSub of impCat.subCategories) {
        const existingSub = existingCat.subCategories.find(
          (s) => s.title.toLowerCase() === impSub.title.toLowerCase()
        );

        if (existingSub) {
          const existingUrls = new Set(existingSub.items.map((item) => item.url));
          for (const impItem of impSub.items) {
            if (!existingUrls.has(impItem.url)) {
              existingSub.items.push(impItem);
            }
          }
        } else {
          existingCat.subCategories.push(impSub);
        }
      }
    } else {
      merged.push(impCat);
    }
  }

  return merged;
}
