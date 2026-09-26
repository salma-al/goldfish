import { useAnimations, useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { clone as cloneSkinned } from 'three/addons/utils/SkeletonUtils.js'
import { FISH } from './config'

// Average colour of the texture's blue fin pixels (linear), measured from guppy.glb.
const FIN_REF = new THREE.Color('#435985')

// Re-hues the blue fin pixels towards uFin, keeping their stripes and shading: each pixel's
// saturation and brightness are scaled by how uFin compares to the fins' average colour.
// Warm body colours (hue < ~0.3) sit far from the blue band and are left alone.
const FIN_HEAD = `
uniform vec3 uFin;
uniform vec3 uFinRef;
vec3 finRgb2hsv(vec3 c) {
  vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
  vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
  float d = q.x - min(q.w, q.y);
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + 1e-10)), d / (q.x + 1e-10), q.x);
}
vec3 finHsv2rgb(vec3 c) {
  vec3 p = abs(fract(c.xxx + vec3(1.0, 2.0 / 3.0, 1.0 / 3.0)) * 6.0 - 3.0);
  return c.z * mix(vec3(1.0), clamp(p - 1.0, 0.0, 1.0), c.y);
}`

const FIN_RECOLOR = `
{
  vec3 src = finRgb2hsv(diffuseColor.rgb);
  vec3 target = finRgb2hsv(uFin);
  vec3 ref = finRgb2hsv(uFinRef);
  float isFin = smoothstep(0.42, 0.5, src.x) * (1.0 - smoothstep(0.7, 0.76, src.x))
              * smoothstep(0.12, 0.3, src.y);
  vec3 tinted = finHsv2rgb(vec3(
    target.x,
    clamp(src.y * target.y / ref.y, 0.0, 1.0),
    src.z * target.z / ref.z
  ));
  diffuseColor.rgb = mix(diffuseColor.rgb, tinted, isFin);
}`

// Changes whenever the shader text changes, so three.js never reuses a stale program.
const FIN_KEY = 'fins-' + [...FIN_HEAD + FIN_RECOLOR].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 0)

useGLTF.preload(FISH.url)

function patchFins(mat: THREE.Material, finColor: THREE.Color) {
  mat.onBeforeCompile = (shader) => {
    // Same Color object the scene animates, so palette changes flow straight into the shader.
    shader.uniforms.uFin = { value: finColor }
    shader.uniforms.uFinRef = { value: FIN_REF }
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>' + FIN_HEAD)
      .replace('#include <map_fragment>', '#include <map_fragment>' + FIN_RECOLOR)
  }
  mat.customProgramCacheKey = () => FIN_KEY
  return mat
}

export default function Fish({ finColor }: { finColor: THREE.Color }) {
  const { scene, animations } = useGLTF(FISH.url)
  const group = useRef<THREE.Group>(null!)

  const { root, scale, center, facing } = useMemo(() => {
    // Skinned clone, so the skeleton and its swim clip drive this copy of the fish.
    const root = cloneSkinned(scene)
    root.updateMatrixWorld(true)
    // Own material copies: the loader caches materials across hot reloads, and an
    // already-compiled shared one would keep a previous render's uniforms.
    const materials = new Map<THREE.Material, THREE.Material>()
    const box = new THREE.Box3()
    root.traverse((o) => {
      const m = o as THREE.SkinnedMesh
      if (!m.isSkinnedMesh) return
      const src = m.material as THREE.Material
      if (!materials.has(src)) materials.set(src, patchFins(src.clone(), finColor))
      m.material = materials.get(src)!
      m.skeleton.update()
      m.computeBoundingBox() // measured in the posed shape, not the raw bind pose
      box.expandByObject(m)
    })
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    // Head along +X (or -X), which the path code steers.
    const facing = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), FISH.headSign > 0 ? 0 : Math.PI)
    return { root, scale: FISH.size / size.x, center, facing }
  }, [scene, finColor])

  useLayoutEffect(() => {
    root.traverse((o) => {
      const m = o as THREE.Mesh
      if (!m.isMesh) return
      m.castShadow = true
      m.receiveShadow = true
      m.frustumCulled = false // vertices move with the skeleton
    })
  }, [root])

  const { actions } = useAnimations(animations, root)
  useEffect(() => {
    const action = actions[FISH.clip]
    action?.reset().play()
    return () => void action?.stop()
  }, [actions])

  useFrame(({ clock, camera, viewport }) => {
    const t = clock.elapsedTime

    // Narrow screens (phones) shrink the fish and its sideways swing together, so it stays
    // in view; anything at least as wide as the desktop layout keeps full size.
    const visibleWidth = viewport.getCurrentViewport(camera, [0, 0, 1]).width
    const fit = Math.min(1, visibleWidth / FISH.fullSizeWidth)
    group.current.scale.setScalar(fit)

    // Lazy figure-eight path; face the direction of travel.
    const p = (time: number) =>
      new THREE.Vector3(
        Math.sin(time * 0.35) * 4.5 * fit,
        Math.sin(time * 0.7) * 0.9,
        1 + Math.cos(time * 0.35) * 0.8,
      )
    const pos = p(t)
    const ahead = p(t + 0.05)
    const v = ahead.clone().sub(pos)
    group.current.position.copy(pos)
    // Head points along +X in group space. Turn it toward the camera a little (sign follows
    // the swim direction), otherwise the sideways tail sweep is hidden in a pure side view.
    const toCamera = -FISH.cameraTurn * (v.x / v.length())
    group.current.rotation.y = Math.atan2(-v.z, v.x) + toCamera
    group.current.rotation.z = Math.atan2(v.y, Math.hypot(v.x, v.z)) * 0.8
  })

  return (
    <group ref={group}>
      <group scale={scale} quaternion={facing}>
        <primitive object={root} position={center.clone().multiplyScalar(-1)} />
      </group>
    </group>
  )
}
