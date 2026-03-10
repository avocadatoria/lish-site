'use client';

import { Controller } from 'react-hook-form';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Box from '@mui/material/Box';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  return (
    <Box
      sx={{
        borderBottom: `1px solid #e0e0e0`,
        padding: `8px`,
        display: `flex`,
        gap: `4px`,
        flexWrap: `wrap`,
        backgroundColor: `#f5f5f5`,
      }}
    >
      <button
        type={`button`}
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={editor.isActive(`bold`) ? `is-active` : ``}
        style={{
          padding: `4px 8px`,
          border: `1px solid #ccc`,
          background: editor.isActive(`bold`) ? `#ddd` : `white`,
          cursor: `pointer`,
          fontWeight: `bold`,
        }}
      >
        B
      </button>
      <button
        type={`button`}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={editor.isActive(`italic`) ? `is-active` : ``}
        style={{
          padding: `4px 8px`,
          border: `1px solid #ccc`,
          background: editor.isActive(`italic`) ? `#ddd` : `white`,
          cursor: `pointer`,
          fontStyle: `italic`,
        }}
      >
        I
      </button>
      <button
        type={`button`}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={editor.isActive(`strike`) ? `is-active` : ``}
        style={{
          padding: `4px 8px`,
          border: `1px solid #ccc`,
          background: editor.isActive(`strike`) ? `#ddd` : `white`,
          cursor: `pointer`,
          textDecoration: `line-through`,
        }}
      >
        S
      </button>
      <button
        type={`button`}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive(`bulletList`) ? `is-active` : ``}
        style={{
          padding: `4px 8px`,
          border: `1px solid #ccc`,
          background: editor.isActive(`bulletList`) ? `#ddd` : `white`,
          cursor: `pointer`,
        }}
      >
        • List
      </button>
      <button
        type={`button`}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive(`orderedList`) ? `is-active` : ``}
        style={{
          padding: `4px 8px`,
          border: `1px solid #ccc`,
          background: editor.isActive(`orderedList`) ? `#ddd` : `white`,
          cursor: `pointer`,
        }}
      >
        1. List
      </button>
      <button
        type={`button`}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive(`heading`, { level: 2 }) ? `is-active` : ``}
        style={{
          padding: `4px 8px`,
          border: `1px solid #ccc`,
          background: editor.isActive(`heading`, { level: 2 }) ? `#ddd` : `white`,
          cursor: `pointer`,
          fontWeight: `bold`,
        }}
      >
        H2
      </button>
      <button
        type={`button`}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={editor.isActive(`heading`, { level: 3 }) ? `is-active` : ``}
        style={{
          padding: `4px 8px`,
          border: `1px solid #ccc`,
          background: editor.isActive(`heading`, { level: 3 }) ? `#ddd` : `white`,
          cursor: `pointer`,
          fontWeight: `bold`,
        }}
      >
        H3
      </button>
    </Box>
  );
};

function RichTextEditorField({ field, error, label, ...props }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: field.value || ``,
    immediatelyRender: false,
    editable: true,
    editorProps: {
      attributes: {
        class: `prose prose-sm focus:outline-none min-h-[150px] p-3`,
      },
    },
    onUpdate: ({ editor: ed }) => {
      field.onChange(ed.getHTML());
    },
  });

  useEffect(() => {
    if (editor && field.value !== editor.getHTML()) {
      editor.commands.setContent(field.value || ``);
    }
  }, [field.value, editor]);

  return (
    <FormControl error={!!error} fullWidth {...props}>
      <Box sx={{ display: `flex`, flexDirection: `column`, gap: 1 }}>
        {label && (
          <Box component={`label`} sx={{ fontWeight: 500, fontSize: `0.875rem` }}>
            {label}
          </Box>
        )}
        <Box
          sx={{
            border: error ? `1px solid #d32f2f` : `1px solid #ccc`,
            borderRadius: `4px`,
            overflow: `hidden`,
          }}
        >
          <MenuBar editor={editor} />
          <Box
            sx={{
              [`& .ProseMirror`]: {
                minHeight: `150px`,
                padding: `12px`,
                backgroundColor: `white`,
                outline: `none`,
                [`&:focus`]: {
                  outline: `none`,
                },
              },
              [`& .ProseMirror p`]: {
                margin: 0,
              },
            }}
          >
            <EditorContent editor={editor} />
          </Box>
        </Box>
        {error && <FormHelperText>{error.message}</FormHelperText>}
      </Box>
    </FormControl>
  );
}

export default function WrappedMUIRichTextEditor({
  name,
  control,
  label,
  rules,
  placeholder = `Enter text...`,
  ...props
}) {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <RichTextEditorField field={field} error={error} label={label} {...props} />
      )}
    />
  );
}
