"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";

type Props = {
  content?: string;
  placeholder?: string;
  onChange: (html: string) => void;
  minHeight?: number;
};

export default function MessageEditor({
  content = "",
  placeholder = "写点什么吧...",
  onChange,
  minHeight = 120,
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "tiptap-editor prose prose-sm max-w-none focus:outline-none",
        style: `min-height: ${minHeight}px`,
      },
    },
  });

  // 当 content prop 改变时更新编辑器
  useEffect(() => {
    if (editor && content && !editor.isDestroyed) {
      if (editor.getHTML() !== content) {
        editor.commands.setContent(content);
      }
    }
  }, [content, editor]);

  if (!editor) return null;

  const tools = [
    { label: "B", action: () => editor.chain().focus().toggleBold().run(), isActive: editor.isActive("bold"), style: "font-bold" },
    { label: "I", action: () => editor.chain().focus().toggleItalic().run(), isActive: editor.isActive("italic"), style: "italic" },
    { label: "S", action: () => editor.chain().focus().toggleStrike().run(), isActive: editor.isActive("strike"), style: "line-through" },
    { label: "H1", action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), isActive: editor.isActive("heading", { level: 1 }) },
    { label: "H2", action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), isActive: editor.isActive("heading", { level: 2 }) },
    { label: "•列表", action: () => editor.chain().focus().toggleBulletList().run(), isActive: editor.isActive("bulletList") },
    { label: "1.列表", action: () => editor.chain().focus().toggleOrderedList().run(), isActive: editor.isActive("orderedList") },
    { label: "❝", action: () => editor.chain().focus().toggleBlockquote().run(), isActive: editor.isActive("blockquote") },
    { label: "</>", action: () => editor.chain().focus().toggleCodeBlock().run(), isActive: editor.isActive("codeBlock") },
  ];

  return (
    <div className="border-2 border-warm-200 rounded-2xl overflow-hidden bg-white/50 transition-colors focus-within:border-warm-400">
      {/* 工具栏 */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-warm-100 bg-gray-50/50">
        {tools.map((tool) => (
          <button
            key={tool.label}
            onClick={tool.action}
            className={`
              px-2.5 py-1.5 text-sm rounded-lg transition-all
              ${tool.isActive
                ? "bg-warm-200 text-warm-800 shadow-sm"
                : "text-gray-600 hover:bg-warm-100 hover:text-warm-700"
              }
              ${tool.style || ""}
            `}
            type="button"
          >
            {tool.label}
          </button>
        ))}
      </div>

      {/* 编辑器内容区 */}
      <div className="px-4 py-3">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
