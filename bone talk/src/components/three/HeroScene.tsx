import { useRef, useCallback, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'
import { useTheme } from '../../context/ThemeContext'

// ─── NeckSignalPulse ────────────────────────────────────────────────────────
// Uses useMemo to create THREE.Line objects synchronously before first render,
// so <primitive object={...}> always has a valid reference.
// Position attributes are mutated in useFrame — zero allocations per frame.

const WAVE_COUNT = 40

function NeckSignalPulse({ intensity = 1 }: { intensity: number }) {
  // Create geometry + material + line synchronously via useMemo
  // so they exist on the very first render (fixes the broken ref-based pattern)
  const { lineL, lineR, geomL, geomR } = useMemo(() => {
    const count = WAVE_COUNT
    const makeGeom = () => {
      const g = new THREE.BufferGeometry()
      g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
      return g
    }
    const mat = new THREE.LineBasicMaterial({
      color: '#00d4b8',
      transparent: true,
      opacity: 0.85 * intensity,
    })
    const gL = makeGeom()
    const gR = makeGeom()
    return {
      geomL: gL,
      geomR: gR,
      lineL: new THREE.Line(gL, mat),
      lineR: new THREE.Line(gR, mat),
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally stable — intensity change only affects opacity which we update below

  // Update opacity when intensity prop changes
  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    const posL = geomL.attributes.position as THREE.BufferAttribute
    const posR = geomR.attributes.position as THREE.BufferAttribute
    const mat = lineL.material as THREE.LineBasicMaterial
    mat.opacity = 0.85 * intensity

    for (let i = 0; i < WAVE_COUNT; i++) {
      const u = i / (WAVE_COUNT - 1)
      const xDist = 0.5 + u * 1.5
      const env = Math.sin(u * Math.PI)
      const wave =
        Math.sin(u * 14 - t * 4) * 0.06 * intensity * env +
        Math.sin(u * 28 + t * 5) * 0.025 * intensity * env
      const y = 0.22 + wave
      const z = 0.35 + Math.cos(u * 7 + t * 2) * 0.018 * env

      posL.setXYZ(i, -xDist, y, z)
      posR.setXYZ(i, xDist, y, z)
    }
    posL.needsUpdate = true
    posR.needsUpdate = true
  })

  return (
    <>
      <primitive object={lineL} />
      <primitive object={lineR} />
    </>
  )
}

// ─── NeckDeviceModel ─────────────────────────────────────────────────────────

interface NeckDeviceProps {
  scrollProgress?: number
  intensity?: number
  isLight?: boolean
  isMobile?: boolean
}

function NeckDeviceModel({
  scrollProgress = 0,
  intensity = 1,
  isLight = false,
  isMobile = false,
}: NeckDeviceProps) {
  const groupRef = useRef<THREE.Group>(null)
  const ledRingRef = useRef<THREE.Mesh>(null)

  // On mobile disable scroll-driven rotation (no scroll parallax needed)
  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (groupRef.current) {
      const targetRotY = (isMobile ? 0 : scrollProgress * 0.3) + Math.sin(t * 0.25) * 0.02
      const targetRotX = -0.08 + (isMobile ? 0 : scrollProgress * 0.08) + Math.cos(t * 0.2) * 0.012
      groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * 0.06
      groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * 0.06
      groupRef.current.position.y = Math.sin(t * 0.5) * 0.025
    }

    if (ledRingRef.current) {
      const mat = ledRingRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.5 + intensity * 0.4 + Math.sin(t * 2.2) * 0.25
    }
  })

  // Segment counts — lower on mobile to reduce GPU vertex pressure
  const cylSegments = isMobile ? 20 : 32
  const torusSegments = isMobile ? 40 : 64
  const ringSegments = isMobile ? 24 : 32
  const electrodeSegments = isMobile ? 16 : 24

  // Light/Dark material colors
  const mannequinColor = isLight ? '#E8E6E0' : '#141416'
  const clavicleColor = isLight ? '#DDD9D0' : '#111113'

  return (
    <group ref={groupRef}>
      {/* 1. Stylized Human Neck & Upper Chest Silhouette */}
      <group position={[0, -0.4, -0.1]}>
        {/* Main Neck Pillar */}
        <mesh position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.6, 0.7, 1.3, cylSegments]} />
          <meshStandardMaterial
            color={mannequinColor}
            roughness={isLight ? 0.88 : 0.82}
            metalness={isLight ? 0.04 : 0.12}
          />
        </mesh>

        {/* Clavicle / Upper Chest Curve */}
        <mesh position={[0, -0.3, 0.1]} rotation={[0.38, 0, 0]}>
          <cylinderGeometry args={[0.72, 1.08, 0.7, cylSegments]} />
          <meshStandardMaterial
            color={clavicleColor}
            roughness={isLight ? 0.90 : 0.88}
            metalness={isLight ? 0.02 : 0.08}
          />
        </mesh>
      </group>

      {/* 2. BoneTalk Neck-Worn Device (Ergonomic Collar & Pod) */}
      <group position={[0, 0.12, 0.12]}>
        {/* Main Ergonomic Neck Collar Band */}
        <mesh rotation={[Math.PI / 2.2, 0, 0]}>
          <torusGeometry args={[0.7, 0.085, 20, torusSegments, Math.PI * 1.55]} />
          <meshStandardMaterial
            color="#16161c"
            roughness={0.22}
            metalness={0.88}
          />
        </mesh>

        {/* Central ESP32-S3 Processing Unit */}
        <group position={[0, -0.05, 0.66]}>
          {/* Main Pod Base */}
          <mesh>
            <boxGeometry args={[0.6, 0.26, 0.12]} />
            <meshStandardMaterial
              color="#1a1a24"
              roughness={0.18}
              metalness={0.92}
            />
          </mesh>

          {/* Dark Glass Cover Plate — skip transmission on mobile (expensive) */}
          <mesh position={[0, 0, 0.063]}>
            <boxGeometry args={[0.52, 0.2, 0.01]} />
            {isMobile ? (
              <meshStandardMaterial
                color="#09090d"
                roughness={0.12}
                metalness={0.4}
              />
            ) : (
              <meshPhysicalMaterial
                color="#09090d"
                roughness={0.12}
                metalness={0.2}
                transmission={0.4}
                transparent
                opacity={0.88}
              />
            )}
          </mesh>

          {/* Cyan Micro-LED Status Ring */}
          <mesh ref={ledRingRef} position={[0, 0, 0.07]}>
            <ringGeometry args={[0.06, 0.085, ringSegments]} />
            <meshStandardMaterial
              color="#22d3ee"
              emissive="#22d3ee"
              emissiveIntensity={0.8}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Surface EMG Electrode Contacts */}
          {([-0.2, 0, 0.2] as const).map((x, i) => (
            <mesh key={i} position={[x, 0, -0.063]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.02, electrodeSegments]} />
              <meshStandardMaterial
                color="#eab308"
                roughness={0.15}
                metalness={0.95}
                emissive="#ca8a04"
                emissiveIntensity={0.25}
              />
            </mesh>
          ))}
        </group>

        {/* Flexible Wing Adjusters (Left & Right Sides) */}
        {([-0.6, 0.6] as const).map((x, i) => (
          <group key={i} position={[x, 0.1, 0.28]} rotation={[0, i === 0 ? 0.3 : -0.3, 0]}>
            <mesh>
              <boxGeometry args={[0.14, 0.16, 0.32]} />
              <meshStandardMaterial color="#111116" roughness={0.35} metalness={0.75} />
            </mesh>
            <mesh position={[0, 0, 0.16]}>
              <sphereGeometry args={[0.035, 12, 12]} />
              <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.6} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 3. Cyan EMG Waveform Signal from Neck Device */}
      <NeckSignalPulse intensity={intensity} />
    </group>
  )
}

// ─── HeroScene ───────────────────────────────────────────────────────────────

interface HeroSceneProps {
  scrollProgress?: number
  intensity?: number
  className?: string
  isMobile?: boolean
}

export function HeroScene({
  scrollProgress = 0,
  intensity = 1,
  className = '',
  isMobile = false,
}: HeroSceneProps) {
  const { theme } = useTheme()
  const isLight = theme === 'light'

  // Mobile: closer camera, wider FOV so device fills 65-75% of frame
  const cameraPosition: [number, number, number] = isMobile ? [0, 0.04, 2.5] : [0, 0.15, 3.4]
  const cameraFov = isMobile ? 42 : 38

  // WebGL context loss recovery — prevents blank/frozen canvas on mobile GPU pressure
  const handleContextLost = useCallback((event: Event) => {
    event.preventDefault()
    console.warn('[BoneTalk] WebGL context lost — waiting for restore...')
  }, [])

  const handleContextRestored = useCallback(() => {
    console.info('[BoneTalk] WebGL context restored.')
  }, [])

  return (
    <div className={`${className} relative h-full w-full bg-transparent`} aria-hidden="true">
      <Canvas
        camera={{ position: cameraPosition, fov: cameraFov }}
        // Cap DPR at 1.5 — prevents mobile GPU exhaustion on 3× retina screens
        dpr={[1, Math.min(1.5, typeof window !== 'undefined' ? window.devicePixelRatio : 1.5)]}
        gl={{
          antialias: !isMobile, // disable MSAA on mobile — major perf win
          alpha: true,
          powerPreference: isMobile ? 'low-power' : 'high-performance',
          // Preserve drawing buffer prevents context loss on some Android browsers
          preserveDrawingBuffer: false,
          failIfMajorPerformanceCaveat: false,
        }}
        style={{ background: 'transparent' }}
        onCreated={({ gl }) => {
          // Attach context loss/restore handlers directly to the canvas element
          const canvas = gl.domElement
          canvas.addEventListener('webglcontextlost', handleContextLost)
          canvas.addEventListener('webglcontextrestored', handleContextRestored)

          // Return cleanup function via R3F's onCreated teardown pattern
          // (R3F calls the returned function on unmount)
          return () => {
            canvas.removeEventListener('webglcontextlost', handleContextLost)
            canvas.removeEventListener('webglcontextrestored', handleContextRestored)
            // Explicit renderer dispose prevents GPU memory leak on unmount
            gl.dispose()
          }
        }}
      >
        {/* ── LIGHTING ── */}
        {isLight ? (
          <>
            <ambientLight intensity={0.85} color="#ffffff" />
            <directionalLight position={[5, 8, 5]} intensity={isMobile ? 1.8 : 2.2} color="#ffffff" />
            <directionalLight position={[-3, 2, 2]} intensity={0.6} color="#e0f7f2" />
            <pointLight position={[0, 0.4, 1.4]} intensity={1.0} color="#00A878" distance={5} />
            {!isMobile && (
              <spotLight position={[0, 4, 3]} angle={0.5} penumbra={0.7} intensity={1.2} color="#ffffff" />
            )}
          </>
        ) : (
          <>
            <ambientLight intensity={0.45} />
            <directionalLight position={[4, 5, 4]} intensity={isMobile ? 0.9 : 1.1} color="#f5f2eb" />
            <directionalLight position={[-4, 2, -2]} intensity={0.8} color="#22d3ee" />
            <pointLight position={[0, 0.4, 1.4]} intensity={0.8} color="#4ade80" distance={4} />
            {!isMobile && (
              <spotLight position={[0, 3.5, 2.5]} angle={0.45} penumbra={0.8} intensity={0.9} color="#22d3ee" />
            )}
          </>
        )}

        {/* ── DEVICE ── */}
        <Float speed={1.4} rotationIntensity={0.06} floatIntensity={0.2}>
          <NeckDeviceModel
            scrollProgress={scrollProgress}
            intensity={intensity}
            isLight={isLight}
            isMobile={isMobile}
          />
        </Float>
      </Canvas>
    </div>
  )
}
