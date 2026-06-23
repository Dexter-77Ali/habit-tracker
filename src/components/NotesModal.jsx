import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function NotesModal({ item, onSave, onClose }) {
  const [notes, setNotes] = useState(item?.notes || '')
  const textareaRef = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const insertMarkdown = (before, after = '') => {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const selected = notes.slice(start, end)
    const replacement = before + (selected || 'text') + after
    const newNotes = notes.slice(0, start) + replacement + notes.slice(end)
    setNotes(newNotes)
    setTimeout(() => {
      ta.focus()
      ta.selectionStart = start + before.length
      ta.selectionEnd = start + before.length + (selected || 'text').length
    }, 0)
  }

  const toolbarActions = [
    { label: 'B', title: 'Bold', action: () => insertMarkdown('**', '**') },
    { label: 'I', title: 'Italic', action: () => insertMarkdown('_', '_') },
    { label: 'H', title: 'Heading', action: () => insertMarkdown('## ') },
    { label: '🔗', title: 'Link', action: () => insertMarkdown('[', '](url)') },
    { label: '•', title: 'List', action: () => insertMarkdown('- ') },
    { label: '<>', title: 'Code', action: () => insertMarkdown('`', '`') },
  ]

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="notes-modal" role="dialog" aria-modal="true">
        <div className="modal-header">
          <h2>{item?.icon} {item?.name} — Notes</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="notes-content">
          <div className="notes-editor">
            <div className="notes-toolbar">
              {toolbarActions.map((btn) => (
                <button
                  key={btn.title}
                  type="button"
                  className="notes-toolbar-btn"
                  onClick={btn.action}
                  title={btn.title}
                >
                  {btn.label}
                </button>
              ))}
            </div>
            <textarea
              ref={textareaRef}
              className="notes-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write your notes here... Use markdown for formatting.&#10;&#10;Example:&#10;## Study HTB&#10;- [Module Link](https://academy.hackthebox.com/module/123)&#10;- **Key concept**: Buffer overflows"
            />
          </div>

          <div className="notes-preview">
            <div className="notes-preview-label">Preview</div>
            <div className="notes-preview-content">
              {notes ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({ href, children }) => (
                      <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
                    ),
                  }}
                >
                  {notes}
                </ReactMarkdown>
              ) : (
                <p className="notes-empty">Nothing here yet. Start typing on the left.</p>
              )}
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={() => onSave(notes)}>
            Save Notes
          </button>
        </div>
      </div>
    </div>
  )
}
