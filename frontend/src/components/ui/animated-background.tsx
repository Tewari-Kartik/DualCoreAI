"use client"

import { useMemo, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Points, PointMaterial } from "@react-three/drei"
import * as THREE from "three"

const PARTICLE_COUNT = 600

function ParticleField() {
  const ref = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 14
      arr[i * 3 + 1] = (Math.random() - 0.5) * 8
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8
    }
    return arr
  }, [])

  const colors = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3)
    const palette = [
      [0.62, 0.49, 1.0],   // purple #9D7CFF
      [0.25, 0.79, 0.73],  // teal #3FC9B5
      [0.91, 0.64, 0.24],  // amber #E8A33D
      [0.51, 0.55, 0.98],  // indigo
    ]
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const c = palette[Math.floor(Math.random() * palette.length)]
      arr[i * 3] = c[0]
      arr[i * 3 + 1] = c[1]
      arr[i * 3 + 2] = c[2]
    }
    return arr
  }, [])

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.012
      ref.current.rotation.x += delta * 0.004
    }
  })

  return (
    <Points ref={ref} positions={positions} colors={colors} stride={3} frustumCulled>
      <PointMaterial
        transparent
        vertexColors
        size={0.035}
        sizeAttenuation
        depthWrite={false}
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  )
}

export function AnimatedBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 opacity-70" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }} dpr={[1, 1.5]}>
        <ParticleField />
      </Canvas>
    </div>
  )
}