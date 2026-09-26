import { Environment, Lightformer, Text } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { type Palette } from './config'
import Fish from './Fish'

const WALL_Z = -2
const MAX_LINE_WIDTH = 14 // world units; wider lines shrink to fit (less on narrow screens)
const LINE_HEIGHT = 3.6

// One word stays on one line; more words split into two lines at the most even space.
function toLines(text: string) {
  const words = text.toUpperCase().split(/\s+/).filter(Boolean)
  if (words.length < 2) return words
  let best = 1
  for (let i = 1; i < words.length; i++) {
    const diff = (s: number) => Math.abs(words.slice(0, s).join(' ').length - words.slice(s).join(' ').length)
    if (diff(i) < diff(best)) best = i
  }
  return [words.slice(0, best).join(' '), words.slice(best).join(' ')]
}
const SHADOW_OPACITY = 0.3

// Live colours, created once from the first palette and then eased toward whichever palette
// is picked. The wall, the text and the fish's fin shader all hold these exact Color objects.
function useLiveColors(palette: Palette) {
  const live = useMemo(() => {
    const background = new THREE.Color(palette.background)
    const text = new THREE.Color(palette.text)
    const fins = new THREE.Color(palette.fins)
    // Flat and unlit, skipping tone mapping, so the wall and text show the palette's exact
    // hex colours. The shadow comes from the shadow catcher laid over them.
    const wallMaterial = new THREE.MeshBasicMaterial({ toneMapped: false })
    const textMaterial = new THREE.MeshBasicMaterial({ toneMapped: false })
    wallMaterial.color = background
    textMaterial.color = text
    return { background, text, fins, wallMaterial, textMaterial }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only the first palette seeds them
  }, [])
  const target = useMemo(
    () => ({
      background: new THREE.Color(palette.background),
      text: new THREE.Color(palette.text),
      fins: new THREE.Color(palette.fins),
    }),
    [palette],
  )
  useFrame((_, dt) => {
    const k = 1 - Math.exp(-dt * 8) // about half a second to settle
    live.background.lerp(target.background, k)
    live.text.lerp(target.text, k)
    live.fins.lerp(target.fins, k)
  })
  return live
}

export default function Scene({ palette, text }: { palette: Palette; text: string }) {
  const colors = useLiveColors(palette)
  const lines = toLines(text)
  const textGroup = useRef<THREE.Group>(null!)

  // Fit each line to the screen: its natural width is recorded when troika lays it out,
  // and the scale follows the visible wall width, so resizing or rotating a phone refits it.
  const camera = useThree((s) => s.camera)
  const viewport = useThree((s) => s.viewport)
  useFrame(() => {
    const wallWidth = viewport.getCurrentViewport(camera, [0, 0, WALL_Z]).width
    const maxWidth = Math.min(MAX_LINE_WIDTH, wallWidth * 0.9)
    for (const line of textGroup.current.children) {
      const natural = line.userData.naturalWidth as number | undefined
      if (natural) line.scale.setScalar(Math.min(1, maxWidth / natural))
    }
  })

  return (
    <>
      <primitive attach="background" object={colors.background} />

      <ambientLight intensity={0.5} />
      <directionalLight
        position={[-5, 7, 10]}
        intensity={2.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-bias={-0.0005}
        shadow-radius={6}
      />

      {/* Offline studio lighting so the "shiny" fish has something to reflect */}
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={4} position={[-4, 5, 6]} scale={[10, 4, 1]} />
        <Lightformer form="rect" intensity={2} position={[6, 0, 4]} scale={[4, 6, 1]} />
      </Environment>

      {/* Backdrop in the exact palette colour */}
      <mesh position={[0, 0, WALL_Z]} material={colors.wallMaterial}>
        <planeGeometry args={[60, 40]} />
      </mesh>

      {/* Transparent except where the fish's shadow falls, over both the wall and the text */}
      <mesh position={[0, 0, WALL_Z + 0.02]} receiveShadow>
        <planeGeometry args={[60, 40]} />
        <shadowMaterial opacity={SHADOW_OPACITY} />
      </mesh>

      {/* Big background text */}
      <group ref={textGroup}>
        {lines.map((line, i) => (
          <Text
            key={palette.font + i}
            position={[0, 0.1 + ((lines.length - 1) / 2 - i) * LINE_HEIGHT, WALL_Z + 0.01]}
            font={palette.font}
            material={colors.textMaterial}
            fontSize={4}
          sdfGlyphSize={128} // sharper thin strokes, e.g. TBJ's hairline diagonals
            letterSpacing={-0.04}
            anchorX="center"
            anchorY="middle"
            onSync={(mesh) => {
              const [x0, , x1] = mesh.textRenderInfo.blockBounds
              mesh.userData.naturalWidth = x1 - x0
            }}
          >
            {line}
          </Text>
        ))}
      </group>

      <Fish finColor={colors.fins} />
    </>
  )
}
