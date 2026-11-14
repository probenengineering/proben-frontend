import { createCn } from "cn/config";

// Class-name helper (clsx + tailwind-merge). Configured so our Figma text styles
// (type-*, in src/styles/globals.css) replace any font-size, line-height or
// letter-spacing class that comes before them, e.g. shadcn's built-in `text-sm`.
export const cn = createCn<"type">({
  extend: {
    classGroups: {
      type: [
        {
          type: [
            "display-lg",
            "display-md",
            "display-sm",
            "heading-lg",
            "heading-md",
            "heading-sm",
            "title-lg",
            "title-md",
            "title-sm",
            "paragraph-lg",
            "paragraph-md",
            "paragraph-sm",
            "paragraph-xs",
            "caption-lg",
            "caption-sm",
            "caption-xs",
          ],
        },
      ],
    },
    conflictingClassGroups: {
      type: ["font-size", "leading", "tracking", "font-family"],
    },
  },
});
