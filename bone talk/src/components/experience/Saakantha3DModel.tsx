import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { ProductVariant } from './data/productVariants'

interface Saakantha3DModelProps {
  variant: ProductVariant
  activeFocus?: 'full' | 'module' | 'sensor' | 'strap'
  signalActive?: boolean
  isLight?: boolean
  isMobile?: boolean
}

// Generate procedural textures for strap weaves matching the authentic references
function createStrapTexture(type: ProductVariant['bandTexture'], color: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.CanvasTexture(canvas)

  ctx.fillStyle = color
  ctx.fillRect(0, 0, 512, 128)

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)'
  ctx.lineWidth = 1.5

  if (type === 'art-deco') {
    // Geometric art-deco chevron / diamond lattice
    for (let x = 0; x < 512; x += 32) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x + 16, 64)
      ctx.lineTo(x, 128)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(x + 16, 0)
      ctx.lineTo(x + 32, 64)
      ctx.lineTo(x + 16, 128)
      ctx.stroke()
    }
  } else if (type === 'floral-vine') {
    // Organic sinuous floral vine pattern with leaf accents
    ctx.strokeStyle = 'rgba(255, 235, 180, 0.2)'
    ctx.beginPath()
    for (let x = 0; x < 512; x += 4) {
      const y = 64 + Math.sin(x * 0.05) * 24 + Math.cos(x * 0.1) * 8
      if (x === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
    // Micro leaf dots
    ctx.fillStyle = 'rgba(255, 235, 180, 0.25)'
    for (let x = 16; x < 512; x += 40) {
      ctx.beginPath()
      ctx.arc(x, 64 + Math.sin(x * 0.05) * 24, 4, 0, Math.PI * 2)
      ctx.fill()
    }
  } else if (type === 'wave-koi') {
    // Japanese wave crest pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)'
    for (let x = 0; x < 512; x += 24) {
      ctx.beginPath()
      ctx.arc(x, 40, 16, 0, Math.PI, false)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(x + 12, 88, 16, 0, Math.PI, false)
      ctx.stroke()
    }
  } else if (type === 'filigree') {
    // Delicate lace filigree embroidery
    ctx.strokeStyle = 'rgba(255, 240, 245, 0.16)'
    for (let x = 0; x < 512; x += 28) {
      ctx.beginPath()
      ctx.arc(x + 14, 64, 12, 0, Math.PI * 2)
      ctx.stroke()
      ctx.strokeRect(x + 4, 54, 20, 20)
    }
  } else if (type === 'tactical-mesh') {
    // High-tensile tactical grid / carbon mesh
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)'
    for (let x = 0; x < 512; x += 8) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, 128)
      ctx.stroke()
    }
    for (let y = 0; y < 128; y += 8) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(512, y)
      ctx.stroke()
    }
  } else {
    // Solid fine herringbone fabric weave
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)'
    for (let x = 0; x < 512; x += 6) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x + 3, 128)
      ctx.stroke()
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(4, 1)
  return texture
}

export function Saakantha3DModel({
  variant,
  activeFocus = 'full',
  signalActive = false,
  isLight = false,
  isMobile = false,
}: Saakantha3DModelProps) {
  const rootRef = useRef<THREE.Group>(null)
  const ledRef = useRef<THREE.Mesh>(null)
  const leftDiscRef = useRef<THREE.Group>(null)
  const rightDiscRef = useRef<THREE.Group>(null)
  const signalRingLRef = useRef<THREE.Mesh>(null)
  const signalRingRRef = useRef<THREE.Mesh>(null)

  // Dynamic strap weave texture cached per variant
  const strapTexture = useMemo(
    () => createStrapTexture(variant.bandTexture, variant.bandColor),
    [variant.bandTexture, variant.bandColor]
  )

  // Dual Organic Wire Leads Spline Curves (from hub to circular electrode discs)
  const { leftWireGeom, rightWireGeom } = useMemo(() => {
    // Left wire: exits lower left of pod, curves naturally in 3D space down to left neck/throat sensor disc
    const curveL = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.22, -0.12, 0.58),
      new THREE.Vector3(-0.35, -0.22, 0.52),
      new THREE.Vector3(-0.52, -0.32, 0.44),
      new THREE.Vector3(-0.62, -0.28, 0.38),
      new THREE.Vector3(-0.72, -0.22, 0.32),
    ])

    // Right wire: exits lower right of pod, curves to right sensor disc
    const curveR = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.22, -0.12, 0.58),
      new THREE.Vector3(0.35, -0.22, 0.52),
      new THREE.Vector3(0.52, -0.32, 0.44),
      new THREE.Vector3(0.62, -0.28, 0.38),
      new THREE.Vector3(0.72, -0.22, 0.32),
    ])

    const tubularSegs = isMobile ? 24 : 40
    const radialSegs = isMobile ? 6 : 8
    const wireRadius = 0.014

    return {
      leftWireGeom: new THREE.TubeGeometry(curveL, tubularSegs, wireRadius, radialSegs, false),
      rightWireGeom: new THREE.TubeGeometry(curveR, tubularSegs, wireRadius, radialSegs, false),
    }
  }, [isMobile])

  // Real-time animation loop
  useFrame((state) => {
    const t = state.clock.getElapsedTime()

    // Smooth subtle breath/float movement
    if (rootRef.current) {
      if (activeFocus === 'full') {
        rootRef.current.position.y = Math.sin(t * 0.8) * 0.015
      } else if (activeFocus === 'module') {
        rootRef.current.position.y = THREE.MathUtils.lerp(rootRef.current.position.y, -0.05, 0.05)
      } else if (activeFocus === 'sensor') {
        rootRef.current.position.y = THREE.MathUtils.lerp(rootRef.current.position.y, 0.08, 0.05)
      }
    }

    // Micro LED breathing pulse
    if (ledRef.current) {
      const ledMat = ledRef.current.material as THREE.MeshStandardMaterial
      const basePulse = 0.7 + Math.sin(t * 3.0) * 0.35
      const burstPulse = signalActive ? 1.6 + Math.sin(t * 12.0) * 0.4 : basePulse
      ledMat.emissiveIntensity = burstPulse
    }

    // Signal ring expansion animation on contact discs
    if (signalRingLRef.current && signalRingRRef.current) {
      const ringMatL = signalRingLRef.current.material as THREE.MeshBasicMaterial
      const ringMatR = signalRingRRef.current.material as THREE.MeshBasicMaterial
      if (signalActive) {
        const pulsePhase = (t * 4) % 1
        const scale = 1 + pulsePhase * 0.5
        const opacity = (1 - pulsePhase) * 0.8
        signalRingLRef.current.scale.set(scale, scale, 1)
        signalRingRRef.current.scale.set(scale, scale, 1)
        ringMatL.opacity = opacity
        ringMatR.opacity = opacity
      } else {
        ringMatL.opacity = 0.15
        ringMatR.opacity = 0.15
      }
    }
  })

  const segs = isMobile ? 32 : 56

  return (
    <group ref={rootRef} dispose={null}>
      {/* ── 1. ERGONOMIC NECKBAND / STRAP LOOP ── */}
      <group position={[0, 0.08, 0]}>
        {/* Main Contoured Elastic Band */}
        <mesh rotation={[Math.PI / 2.25, 0, 0]}>
          <torusGeometry args={[0.78, 0.075, 16, segs, Math.PI * 1.58]} />
          <meshStandardMaterial
            color={variant.bandColor}
            map={strapTexture}
            roughness={0.55}
            metalness={0.12}
          />
        </mesh>

        {/* Left Side Adjustment Buckle Slider */}
        <group position={[-0.62, 0.04, 0.32]} rotation={[0, 0.32, 0]}>
          <mesh>
            <boxGeometry args={[0.07, 0.16, 0.04]} />
            <meshStandardMaterial
              color={isLight ? '#555555' : '#222226'}
              roughness={0.25}
              metalness={0.85}
            />
          </mesh>
          <mesh position={[-0.04, 0, 0]}>
            <boxGeometry args={[0.02, 0.14, 0.05]} />
            <meshStandardMaterial
              color={isLight ? '#777777' : '#3a3a42'}
              roughness={0.3}
              metalness={0.7}
            />
          </mesh>
        </group>

        {/* Right Side Adjustment Buckle Slider */}
        <group position={[0.62, 0.04, 0.32]} rotation={[0, -0.32, 0]}>
          <mesh>
            <boxGeometry args={[0.07, 0.16, 0.04]} />
            <meshStandardMaterial
              color={isLight ? '#555555' : '#222226'}
              roughness={0.25}
              metalness={0.85}
            />
          </mesh>
          <mesh position={[0.04, 0, 0]}>
            <boxGeometry args={[0.02, 0.14, 0.05]} />
            <meshStandardMaterial
              color={isLight ? '#777777' : '#3a3a42'}
              roughness={0.3}
              metalness={0.7}
            />
          </mesh>
        </group>
      </group>

      {/* ── 2. CENTRAL PROCESSING HUB / POD ── */}
      <group position={[0, 0, 0.72]}>
        {/* Main Chamfered Housing Module */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.56, 0.28, 0.14]} />
          <meshPhysicalMaterial
            color={variant.podColor}
            roughness={0.22}
            metalness={0.65}
            clearcoat={0.35}
            clearcoatRoughness={0.2}
          />
        </mesh>

        {/* Front Plate / Emblem Insert */}
        <mesh position={[0, 0, 0.072]}>
          <boxGeometry args={[0.48, 0.22, 0.01]} />
          <meshStandardMaterial
            color={variant.plateColor || variant.podColor}
            roughness={0.3}
            metalness={0.75}
          />
        </mesh>

        {/* Precision Corner Screws / Accents */}
        {[
          [-0.23, 0.1, 0.073],
          [0.23, 0.1, 0.073],
          [-0.23, -0.1, 0.073],
          [0.23, -0.1, 0.073],
        ].map(([x, y, z], i) => (
          <mesh key={i} position={[x, y, z]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.005, 12]} />
            <meshStandardMaterial color="#888888" roughness={0.15} metalness={0.9} />
          </mesh>
        ))}

        {/* Central Glowing Micro-LED Jewel Dot */}
        <mesh ref={ledRef} position={[0, 0, 0.078]}>
          <circleGeometry args={[0.018, 20]} />
          <meshStandardMaterial
            color={variant.ledColor}
            emissive={variant.ledColor}
            emissiveIntensity={1.2}
            toneMapped={false}
          />
        </mesh>

        {/* Micro-LED Jewel Rim Bezel */}
        <mesh position={[0, 0, 0.076]}>
          <ringGeometry args={[0.018, 0.025, 24]} />
          <meshStandardMaterial color="#1a1a1d" roughness={0.2} metalness={0.8} />
        </mesh>

        {/* Anime Badge Insignia Visual Representation */}
        {variant.badgeSymbol && variant.badgeSymbol !== 'none' && (
          <group position={[0, 0, 0.077]}>
            {variant.badgeSymbol === 'leaf' && (
              // Naruto Leaf Spiral Symbol
              <mesh>
                <ringGeometry args={[0.04, 0.055, 24, 1, 0, Math.PI * 1.7]} />
                <meshStandardMaterial color="#18181b" roughness={0.3} />
              </mesh>
            )}
            {variant.badgeSymbol === 'straw-hat' && (
              // One Piece Jolly Roger Crest
              <mesh>
                <circleGeometry args={[0.05, 20]} />
                <meshStandardMaterial color="#111827" roughness={0.3} />
              </mesh>
            )}
            {variant.badgeSymbol === 'wings' && (
              // Survey Corps Wings of Freedom Shield
              <mesh>
                <planeGeometry args={[0.09, 0.09]} />
                <meshStandardMaterial color="#f8fafc" roughness={0.4} metalness={0.2} />
              </mesh>
            )}
            {variant.badgeSymbol === 'shield' && (
              // Bleach Katana Shield Badge
              <mesh>
                <planeGeometry args={[0.07, 0.09]} />
                <meshStandardMaterial color="#94a3b8" roughness={0.2} metalness={0.85} />
              </mesh>
            )}
            {variant.badgeSymbol === 'cursed' && (
              // JJK Cursed Reticle Sigil
              <mesh>
                <ringGeometry args={[0.035, 0.045, 24]} />
                <meshStandardMaterial
                  color="#ef4444"
                  emissive="#dc2626"
                  emissiveIntensity={0.8}
                />
              </mesh>
            )}
          </group>
        )}

        {/* Underside Cable Strain Relief Boots */}
        <mesh position={[-0.2, -0.13, -0.01]} rotation={[0.4, 0, 0.2]}>
          <cylinderGeometry args={[0.022, 0.028, 0.05, 12]} />
          <meshStandardMaterial color={variant.wireColor} roughness={0.6} />
        </mesh>
        <mesh position={[0.2, -0.13, -0.01]} rotation={[0.4, 0, -0.2]}>
          <cylinderGeometry args={[0.022, 0.028, 0.05, 12]} />
          <meshStandardMaterial color={variant.wireColor} roughness={0.6} />
        </mesh>
      </group>

      {/* ── 3. DUAL FLEXIBLE EMG SENSOR WIRE LEADS ── */}
      <mesh geometry={leftWireGeom} castShadow>
        <meshStandardMaterial
          color={variant.wireColor}
          roughness={0.45}
          metalness={0.25}
        />
      </mesh>
      <mesh geometry={rightWireGeom} castShadow>
        <meshStandardMaterial
          color={variant.wireColor}
          roughness={0.45}
          metalness={0.25}
        />
      </mesh>

      {/* ── 4. LEFT SURFACE EMG ELECTRODE CONTACT DISC ── */}
      <group ref={leftDiscRef} position={[-0.72, -0.22, 0.32]} rotation={[0.4, 0.6, -0.2]}>
        {/* Outer Disc Housing */}
        <mesh castShadow>
          <cylinderGeometry args={[0.11, 0.11, 0.028, 28]} />
          <meshStandardMaterial
            color={variant.discColor}
            roughness={0.25}
            metalness={0.7}
          />
        </mesh>

        {/* Inner Bio-Conductive EMG Contact Ring */}
        <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.088, 24]} />
          <meshStandardMaterial
            color={variant.discAccentColor}
            roughness={0.15}
            metalness={0.9}
            emissive={signalActive ? variant.ledColor : '#000000'}
            emissiveIntensity={signalActive ? 0.4 : 0}
          />
        </mesh>

        {/* Concentric Pickup Pattern */}
        <mesh position={[0, 0.016, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.045, 0.055, 24]} />
          <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.8} />
        </mesh>

        {/* Dynamic Electric Pulse Signal Ring */}
        <mesh ref={signalRingLRef} position={[0, 0.017, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.09, 0.105, 32]} />
          <meshBasicMaterial color={variant.ledColor} transparent opacity={0.2} />
        </mesh>
      </group>

      {/* ── 5. RIGHT SURFACE EMG ELECTRODE CONTACT DISC ── */}
      <group ref={rightDiscRef} position={[0.72, -0.22, 0.32]} rotation={[0.4, -0.6, 0.2]}>
        {/* Outer Disc Housing */}
        <mesh castShadow>
          <cylinderGeometry args={[0.11, 0.11, 0.028, 28]} />
          <meshStandardMaterial
            color={variant.discColor}
            roughness={0.25}
            metalness={0.7}
          />
        </mesh>

        {/* Inner Bio-Conductive EMG Contact Ring */}
        <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.088, 24]} />
          <meshStandardMaterial
            color={variant.discAccentColor}
            roughness={0.15}
            metalness={0.9}
            emissive={signalActive ? variant.ledColor : '#000000'}
            emissiveIntensity={signalActive ? 0.4 : 0}
          />
        </mesh>

        {/* Concentric Pickup Pattern */}
        <mesh position={[0, 0.016, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.045, 0.055, 24]} />
          <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.8} />
        </mesh>

        {/* Dynamic Electric Pulse Signal Ring */}
        <mesh ref={signalRingRRef} position={[0, 0.017, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.09, 0.105, 32]} />
          <meshBasicMaterial color={variant.ledColor} transparent opacity={0.2} />
        </mesh>
      </group>
    </group>
  )
}
