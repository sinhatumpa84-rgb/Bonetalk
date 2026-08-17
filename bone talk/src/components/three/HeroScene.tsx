import { useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'
import { useTheme } from '../../context/ThemeContext'

interface NeckDeviceProps {
  scrollProgress?: number
  intensity?: number
}

function NeckSignalPulse({ intensity = 1 }: { intensity: number }) {
  const leftLineRef = useRef<THREE.Line | null>(null)
  const rightLineRef = useRef<THREE.Line | null>(null)

  useEffect(() => {
    const count = 50
    const geomLeft = new THREE.BufferGeometry()
    const geomRight = new THREE.BufferGeometry()
    geomLeft.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
    geomRight.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))

    const mat = new THREE.LineBasicMaterial({
      color: '#00d4b8',
      transparent: true,
      opacity: 0.85 * intensity,
      linewidth: 2,
    })

    const lineL = new THREE.Line(geomLeft, mat)
    const lineR = new THREE.Line(geomRight, mat)

    leftLineRef.current = lineL
    rightLineRef.current = lineR

    return () => {
      geomLeft.dispose()
      geomRight.dispose()
      mat.dispose()
    }
  }, [intensity])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const count = 50

    if (leftLineRef.current && rightLineRef.current) {
      const posL = leftLineRef.current.geometry.attributes.position as THREE.BufferAttribute
      const posR = rightLineRef.current.geometry.attributes.position as THREE.BufferAttribute

      for (let i = 0; i < count; i++) {
        const u = i / (count - 1)
        const xDist = 0.5 + u * 1.6
        const wave = Math.sin(u * 16 - t * 4) * 0.06 * intensity + Math.sin(u * 32 + t * 6) * 0.025 * intensity
        const env = Math.sin(u * Math.PI)

        // Symmetrical soundwave/telemetry lines extending horizontally from both sides
        posL.setXYZ(i, -xDist, 0.22 + wave * env, 0.35 + Math.cos(u * 8 + t * 2) * 0.02 * env)
        posR.setXYZ(i, xDist, 0.22 + wave * env, 0.35 + Math.cos(u * 8 + t * 2) * 0.02 * env)
      }
      posL.needsUpdate = true
      posR.needsUpdate = true
    }
  })

  return (
    <>
      {leftLineRef.current && <primitive object={leftLineRef.current} />}
      {rightLineRef.current && <primitive object={rightLineRef.current} />}
    </>
  )
}

function NeckDeviceModel({
  scrollProgress = 0,
  intensity = 1,
  isLight = false,
}: NeckDeviceProps & { isLight?: boolean }) {
  const groupRef = useRef<THREE.Group>(null)
  const ledRingRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (groupRef.current) {
      // Smooth, controlled rotation (No motion sickness or mouse tracking lag)
      const targetRotY = scrollProgress * 0.3 + Math.sin(t * 0.25) * 0.02
      const targetRotX = -0.08 + scrollProgress * 0.08 + Math.cos(t * 0.2) * 0.012
      
      groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * 0.06
      groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * 0.06
      groupRef.current.position.y = Math.sin(t * 0.5) * 0.025
    }

    if (ledRingRef.current) {
      const mat = ledRingRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.5 + intensity * 0.4 + Math.sin(t * 2.2) * 0.25
    }
  })

  // Light mode mannequin bust color is matte cream/off-white #E8E6E0; Dark mode is dark graphite #141416
  const mannequinColor = isLight ? '#E8E6E0' : '#141416'
  const clavicleColor = isLight ? '#DDD9D0' : '#111113'

  return (
    <group ref={groupRef}>
      {/* 1. Stylized Human Neck & Upper Chest Silhouette (Cream in Light Mode, Dark in Dark Mode) */}
      <group position={[0, -0.4, -0.1]}>
        {/* Main Neck Pillar */}
        <mesh position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.6, 0.7, 1.3, 32]} />
          <meshStandardMaterial
            color={mannequinColor}
            roughness={isLight ? 0.88 : 0.82}
            metalness={isLight ? 0.04 : 0.12}
          />
        </mesh>

        {/* Clavicle / Upper Chest Curve */}
        <mesh position={[0, -0.3, 0.1]} rotation={[0.38, 0, 0]}>
          <cylinderGeometry args={[0.72, 1.08, 0.7, 32]} />
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
          <torusGeometry args={[0.7, 0.085, 24, 64, Math.PI * 1.55]} />
          <meshStandardMaterial
            color="#16161c"
            roughness={0.22}
            metalness={0.88}
          />
        </mesh>

        {/* Central ESP32-S3 Processing Unit (Rests at front of neck) */}
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

          {/* Dark Glass Cover Plate */}
          <mesh position={[0, 0, 0.063]}>
            <boxGeometry args={[0.52, 0.2, 0.01]} />
            <meshPhysicalMaterial
              color="#09090d"
              roughness={0.12}
              metalness={0.2}
              transmission={0.4}
              transparent
              opacity={0.88}
            />
          </mesh>

          {/* Cyan Micro-LED Status Ring */}
          <mesh ref={ledRingRef} position={[0, 0, 0.07]}>
            <ringGeometry args={[0.06, 0.085, 32]} />
            <meshStandardMaterial
              color="#22d3ee"
              emissive="#22d3ee"
              emissiveIntensity={0.8}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Surface EMG Electrode Contacts (Contacting Neck Muscles) */}
          {[-0.2, 0, 0.2].map((x, i) => (
            <mesh key={i} position={[x, 0, -0.063]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.02, 24]} />
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
        {[-0.6, 0.6].map((x, i) => (
          <group key={i} position={[x, 0.1, 0.28]} rotation={[0, i === 0 ? 0.3 : -0.3, 0]}>
            <mesh>
              <boxGeometry args={[0.14, 0.16, 0.32]} />
              <meshStandardMaterial color="#111116" roughness={0.35} metalness={0.75} />
            </mesh>
            <mesh position={[0, 0, 0.16]}>
              <sphereGeometry args={[0.035, 16, 16]} />
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

  // Mobile camera is centered, slightly closer, and balanced so the neck wearable occupies ~65-75% of the frame
  const cameraPosition: [number, number, number] = isMobile ? [0, 0.04, 2.5] : [0, 0.15, 3.4]
  const cameraFov = isMobile ? 42 : 38

  return (
    <div className={`${className} relative h-full w-full bg-transparent`} aria-hidden="true">
      <Canvas
        camera={{ position: cameraPosition, fov: cameraFov }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
      >
        {isLight ? (
          // ── LIGHT MODE LIGHTING ──────────────────────────────────────────
          // Bright studio light so the dark device has strong contrast
          // against the white/off-white background.
          <>
            <ambientLight intensity={0.85} color="#ffffff" />
            <directionalLight position={[5, 8, 5]} intensity={2.2} color="#ffffff" />
            <directionalLight position={[-3, 2, 2]} intensity={0.6} color="#e0f7f2" />
            <pointLight position={[0, 0.4, 1.4]} intensity={1.0} color="#00A878" distance={5} />
            <spotLight position={[0, 4, 3]} angle={0.5} penumbra={0.7} intensity={1.2} color="#ffffff" />
          </>
        ) : (
          // ── DARK MODE LIGHTING ───────────────────────────────────────────
          // Original moody studio setup — unchanged.
          <>
            <ambientLight intensity={0.45} />
            <directionalLight position={[4, 5, 4]} intensity={1.1} color="#f5f2eb" />
            <directionalLight position={[-4, 2, -2]} intensity={0.8} color="#22d3ee" />
            <pointLight position={[0, 0.4, 1.4]} intensity={0.8} color="#4ade80" distance={4} />
            <spotLight position={[0, 3.5, 2.5]} angle={0.45} penumbra={0.8} intensity={0.9} color="#22d3ee" />
          </>
        )}

        <Float speed={1.4} rotationIntensity={0.06} floatIntensity={0.2}>
          <NeckDeviceModel
            scrollProgress={scrollProgress}
            intensity={intensity}
            isLight={isLight}
          />
        </Float>
      </Canvas>
    </div>
  )
}
