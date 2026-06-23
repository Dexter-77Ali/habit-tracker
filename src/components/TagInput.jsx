import { useState, useRef } from 'react'

export default function TagInput({ tags = [], allTags = [], onChange, tagColors = {} }) {
  const [input, setInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef(null)

  const suggestions = allTags.filter(
    (t) => !tags.includes(t) && t.toLowerCase().includes(input.toLowerCase())
  )

  const addTag = (tag) => {
    const trimmed = tag.trim()
    if (!trimmed || tags.includes(trimmed)) return
    onChange([...tags, trimmed])
    setInput('')
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const removeTag = (tag) => {
    onChange(tags.filter((t) => t !== tag))
  }

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault()
      addTag(input)
    }
    if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  return (
    <div className="tag-input-container">
      <div className="tag-input-chips">
        {tags.map((tag) => (
          <span
            key={tag}
            className="tag-chip"
            style={{ borderColor: tagColors[tag] || '#888', color: tagColors[tag] || '#888' }}
          >
            <span className="tag-chip-dot" style={{ background: tagColors[tag] || '#888' }} />
            {tag}
            <button
              type="button"
              className="tag-chip-remove"
              onClick={() => removeTag(tag)}
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          className="tag-input-field"
          value={input}
          onChange={(e) => { setInput(e.target.value); setShowSuggestions(true) }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? 'Type a tag...' : ''}
        />
      </div>

      {showSuggestions && input && suggestions.length > 0 && (
        <div className="tag-suggestions">
          {suggestions.slice(0, 6).map((tag) => (
            <button
              key={tag}
              type="button"
              className="tag-suggestion-item"
              onMouseDown={(e) => { e.preventDefault(); addTag(tag) }}
            >
              <span className="tag-chip-dot" style={{ background: tagColors[tag] || '#888' }} />
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
