"use client"

import { useMemo, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Points, PointMaterial } from "@react-three/drei"
import * as THREE from "three"

const PARTICLE_COUNT = 300

function ParticleField() {
  const ref = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 10
      arr[i * 3 + 1] = (Math.random() - 0.5) * 6
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6
    }
    return arr
  }, [])

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.015
  })

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled>
      <PointMaterial transparent color="#a855f7" size={0.03} sizeAttenuation depthWrite={false} opacity={0.5} />
    </Points>
  )
}

/**
 * Ambient backdrop — cheap enough to sit behind live chat (low particle
 * count, capped dpr). If it ever feels janky on your machine, drop
 * PARTICLE_COUNT or the dpr cap below before adding more visual load.
 */
export function AnimatedBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 opacity-60" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }} dpr={[1, 1.5]}>
        <ParticleField />
      </Canvas>
    </div>
  )
}