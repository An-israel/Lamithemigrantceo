"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { clsx } from "@/lib/clsx";

/**
 * WYSIWYG editor for long-form content (product full_description etc).
 * Saves as HTML — render it with dangerouslySetInnerHTML wherever it's
 * shown, inside a `.rich-content` container (styled in globals.css).
 */
export function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer" },
      }),
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "rich-content rich-content-editable",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  function setLink() {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  if (!editor) {
    return <div className="field h-40 animate-pulse bg-peach" />;
  }

  const buttons: {
    label: string;
    active: boolean;
    onClick: () => void;
  }[] = [
    {
      label: "Bold",
      active: editor.isActive("bold"),
      onClick: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: "Italic",
      active: editor.isActive("italic"),
      onClick: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      label: "H2",
      active: editor.isActive("heading", { level: 2 }),
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: "H3",
      active: editor.isActive("heading", { level: 3 }),
      onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      label: "• List",
      active: editor.isActive("bulletList"),
      onClick: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: "1. List",
      active: editor.isActive("orderedList"),
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      label: "Link",
      active: editor.isActive("link"),
      onClick: setLink,
    },
  ];

  return (
    <div className="overflow-hidden rounded-input border border-line">
      <div className="flex flex-wrap gap-1 border-b border-line bg-peach p-2">
        {buttons.map((b) => (
          <button
            key={b.label}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={b.onClick}
            className={clsx(
              "rounded px-2.5 py-1.5 text-xs font-bold",
              b.active ? "bg-clay text-shell" : "bg-shell text-ink hover:bg-peach-deep"
            )}
          >
            {b.label}
          </button>
        ))}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().undo().run()}
          className="rounded bg-shell px-2.5 py-1.5 text-xs font-bold text-ink hover:bg-peach-deep"
        >
          Undo
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().redo().run()}
          className="rounded bg-shell px-2.5 py-1.5 text-xs font-bold text-ink hover:bg-peach-deep"
        >
          Redo
        </button>
      </div>
      <EditorContent editor={editor} className="bg-shell px-4 py-3" />
    </div>
  );
}
