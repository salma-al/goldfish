import { Canvas } from '@react-three/fiber'
import { Suspense, useEffect, useState, type CSSProperties } from 'react'
import { PALETTES, TEXT } from './config'
import Header from './Header'
import Scene from './Scene'

// The URL remembers the pick (?palette=…), so a reload keeps it.
function useUrlChoice<T extends { id: string }>(key: string, options: T[]) {
  const [id, setId] = useState(() => {
    const fromUrl = new URLSearchParams(location.search).get(key)
    return options.some((o) => o.id === fromUrl) ? fromUrl! : options[0].id
  })
  const pick = (next: string) => {
    setId(next)
    const url = new URL(location.href)
    url.searchParams.set(key, next)
    history.replaceState(null, '', url)
  }
  return [options.find((o) => o.id === id)!, pick] as const
}

// A short message at the top centre that clears itself. `key` restarts the fade when
// the same message repeats.
function useToast() {
  const [toast, setToast] = useState<{ message: string; key: number } | null>(null)
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 2000)
    return () => clearTimeout(timer)
  }, [toast])
  return [toast, (message: string) => setToast({ message, key: Date.now() })] as const
}

export default function App() {
  const [palette, pickPalette] = useUrlChoice('palette', PALETTES)
  // Not kept in the URL: a refresh brings back the default text and the empty field.
  const [text, setText] = useState('')
  const [toast, showToast] = useToast()

  return (
    <div className="app" data-mode={palette.mode} style={{ '--text': palette.text } as CSSProperties}>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0, 14], fov: 35 }}
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          <Scene palette={palette} text={text.trim() || TEXT.default} />
        </Suspense>
      </Canvas>

      <Header onToast={showToast} />

      <input
        className="text-field"
        type="text"
        value={text}
        maxLength={TEXT.maxLength}
        placeholder={TEXT.placeholder}
        aria-label="Background text"
        spellCheck={false}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="palettes" role="radiogroup" aria-label="Colours">
        {PALETTES.map((p) => (
          <button
            key={p.id}
            className="swatch"
            role="radio"
            aria-checked={p.id === palette.id}
            aria-label={p.label}
            title={p.label}
            style={{ background: p.background, color: p.text }}
            onClick={() => pickPalette(p.id)}
          >
            Aa
            <span className="swatch-fins" style={{ background: p.fins }} />
          </button>
        ))}
      </div>

      <div className="toast-region" aria-live="polite">
        {toast && (
          <div key={toast.key} className="toast">
            {toast.message}
          </div>
        )}
      </div>
    </div>
  )
}
