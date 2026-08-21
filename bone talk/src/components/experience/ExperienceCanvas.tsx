import { useRef, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { Saakantha3DModel } from './Saakantha3DModel'
import type { ProductVariant } from './data/productVariants'

interface ExperienceCanvasProps {
  variant: ProductVariant
  activeFocus?: 'full' | 'module' | 'sensor' | 'strap'
  autoRotate?: boolean
  signalActive?: boolean
  isLight?: boolean
  isMobile?: boolean
  rotationY?: number
  onUserRotate?: (rotY: number) => void
  className?: string
}

function StudioSceneController({
  variant,
  activeFocus = 'full',
  autoRotate = false,
  signalActive = false,
  isLight = false,
  isMobile = false,
  rotationY = 0,
  onUserRotate,
}: ExperienceCanvasProps) {
  const pivotRef = useRef<THREE.Group>(null)
  const isDragging = useRef(false)
  const previousPointerX = useRef(0)
  const previousPointerY = useRef(0)
  const targetRotationY = useRef(rotationY)
  const targetRotationX = useRef(0.08)
  const currentRotationY = useRef(rotationY)
  const currentRotationX = useRef(0.08)
  const autoRotateSpeed = 0.008

  // Target camera position and lookAt depending on activeFocus
  const targetCamPos = useMemoCamFocus(activeFocus, isMobile)

  useFrame((state) => {
    // Smooth auto-rotation if enabled and not currently dragging
    if (autoRotate && !isDragging.current) {
      targetRotationY.current += autoRotateSpeed
      if (onUserRotate) {
        onUserRotate(targetRotationY.current)
      }
    }

    // Subtle pointer parallax when idle
    const mouseParallaxX = isMobile ? 0 : (state.pointer.x * 0.08)
    const mouseParallaxY = isMobile ? 0 : (-state.pointer.y * 0.04)

    // Smooth interpolation (damping) for rotation
    currentRotationY.current = THREE.MathUtils.lerp(
      currentRotationY.current,
      targetRotationY.current + mouseParallaxX,
      0.08
    )
    currentRotationX.current = THREE.MathUtils.lerp(
      currentRotationX.current,
      targetRotationX.current + mouseParallaxY,
      0.08
    )

    if (pivotRef.current) {
      pivotRef.current.rotation.y = currentRotationY.current
      pivotRef.current.rotation.x = currentRotationX.current
    }

    // Smooth camera transition towards focus point
    state.camera.position.lerp(targetCamPos.pos, 0.05)
    state.camera.lookAt(targetCamPos.target)
  })

  // Pointer drag event handlers for direct 360-degree rotation
  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true
    previousPointerX.current = e.clientX
    previousPointerY.current = e.clientY
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return
    const deltaX = e.clientX - previousPointerX.current
    const deltaY = e.clientY - previousPointerY.current
    previousPointerX.current = e.clientX
    previousPointerY.current = e.clientY

    // Drag left -> rotate left, Drag right -> rotate right
    targetRotationY.current += deltaX * 0.008
    // Subtle tilt clamping
    targetRotationX.current = THREE.MathUtils.clamp(
      targetRotationX.current + deltaY * 0.004,
      -0.35,
      0.45
    )

    if (onUserRotate) {
      onUserRotate(targetRotationY.current)
    }
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false
    try {
      ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {
      // ignore
    }
  }

  return (
    <>
      {/* ── LUXURY STUDIO LIGHTING ── */}
      {isLight ? (
        <>
          <ambientLight intensity={1.1} color="#ffffff" />
          <directionalLight position={[4, 6, 4]} intensity={2.4} color="#ffffff" castShadow />
          <directionalLight position={[-4, 3, -3]} intensity={1.2} color="#f0f7f5" />
          <pointLight position={[0, 0.5, 1.8]} intensity={1.5} color={variant.ledColor} distance={4} />
          <spotLight position={[0, 5, 2]} angle={0.6} penumbra={0.9} intensity={1.8} color="#ffffff" />
        </>
      ) : (
        <>
          <ambientLight intensity={0.45} color="#dbeafe" />
          <directionalLight position={[4, 5, 4]} intensity={1.4} color="#ffffff" castShadow />
          <directionalLight position={[-5, 2, -2]} intensity={1.0} color="#38bdf8" />
          <directionalLight position={[0, -3, 3]} intensity={0.5} color="#64748b" />
          <pointLight position={[0, 0.3, 1.5]} intensity={1.8} color={variant.ledColor} distance={4} />
          <spotLight position={[0, 4, 3]} angle={0.45} penumbra={0.8} intensity={1.6} color="#ffffff" />
        </>
      )}

      {/* ── 3D PIVOT & HARDWARE MESH ── */}
      <group
        ref={pivotRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <Saakantha3DModel
          variant={variant}
          activeFocus={activeFocus}
          signalActive={signalActive}
          isLight={isLight}
          isMobile={isMobile}
        />
      </group>

      {/* ── SOFT CONTACT GROUND SHADOW ── */}
      <ContactShadows
        position={[0, -0.6, 0]}
        opacity={isLight ? 0.35 : 0.65}
        scale={2.8}
        blur={2.4}
        far={1.6}
        color={isLight ? '#000000' : '#000000'}
      />
    </>
  )
}

function useMemoCamFocus(focus: 'full' | 'module' | 'sensor' | 'strap', isMobile: boolean) {
  if (focus === 'module') {
    return {
      pos: new THREE.Vector3(0, 0.05, isMobile ? 1.6 : 1.9),
      target: new THREE.Vector3(0, 0.02, 0.72),
    }
  }
  if (focus === 'sensor') {
    return {
      pos: new THREE.Vector3(isMobile ? 0.6 : 0.8, -0.15, isMobile ? 1.5 : 1.7),
      target: new THREE.Vector3(0.72, -0.22, 0.32),
    }
  }
  if (focus === 'strap') {
    return {
      pos: new THREE.Vector3(-0.6, 0.4, isMobile ? 1.6 : 1.9),
      target: new THREE.Vector3(-0.62, 0.08, 0.1),
    }
  }
  // 'full'
  return {
    pos: new THREE.Vector3(0, 0.15, isMobile ? 2.5 : 3.0),
    target: new THREE.Vector3(0, -0.02, 0.3),
  }
}

export function ExperienceCanvas({
  variant,
  activeFocus = 'full',
  autoRotate = false,
  signalActive = false,
  isLight = false,
  isMobile = false,
  rotationY = 0,
  onUserRotate,
  className = '',
}: ExperienceCanvasProps) {
  const handleContextLost = useCallback((event: Event) => {
    event.preventDefault()
    console.warn('[SAAKANTHA Showroom] WebGL context lost — recovering...')
  }, [])

  return (
    <div className={`relative h-full w-full cursor-grab active:cursor-grabbing select-none ${className}`}>
      <Canvas
        camera={{ position: [0, 0.15, isMobile ? 2.5 : 3.0], fov: isMobile ? 44 : 36 }}
        dpr={[1, Math.min(2, typeof window !== 'undefined' ? window.devicePixelRatio : 1.5)]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{ background: 'transparent' }}
        onCreated={({ gl }) => {
          const canvas = gl.domElement
          canvas.addEventListener('webglcontextlost', handleContextLost)
          return () => {
            canvas.removeEventListener('webglcontextlost', handleContextLost)
            gl.dispose()
          }
        }}
      >
        <StudioSceneController
          variant={variant}
          activeFocus={activeFocus}
          autoRotate={autoRotate}
          signalActive={signalActive}
          isLight={isLight}
          isMobile={isMobile}
          rotationY={rotationY}
          onUserRotate={onUserRotate}
        />
      </Canvas>
    </div>
  )
}
