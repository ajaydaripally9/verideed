import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';

function HologramDeed() {
  const meshRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    // Rotate slowly
    if (meshRef.current) {
      meshRef.current.rotation.y = time * 0.3;
      meshRef.current.rotation.x = Math.sin(time * 0.5) * 0.1;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Outer Glow Outline */}
      <mesh>
        <boxGeometry args={[2.1, 3.0, 0.04]} />
        <meshBasicMaterial 
          color="#3b82f6" 
          wireframe 
          transparent 
          opacity={0.3} 
        />
      </mesh>

      {/* Main Document Body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.0, 2.9, 0.03]} />
        <meshStandardMaterial 
          color="#2563EB" 
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.45}
        />
      </mesh>

      {/* Text Line Mockups inside Document */}
      <group position={[0, 0, 0.02]}>
        {/* Header line */}
        <mesh position={[0, 1.0, 0]}>
          <boxGeometry args={[1.2, 0.08, 0.01]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
        </mesh>
        {/* Sub lines */}
        {[-0.6, -0.3, 0, 0.3, 0.6].map((y, idx) => (
          <mesh key={idx} position={[0, y - 0.2, 0]}>
            <boxGeometry args={[1.5, 0.04, 0.01]} />
            <meshBasicMaterial color="#60a5fa" transparent opacity={0.6} />
          </mesh>
        ))}
        {/* Stamp Circle mockup */}
        <mesh position={[0.5, 0.7, 0]}>
          <ringGeometry args={[0.15, 0.2, 32]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.7} />
        </mesh>
      </group>
    </group>
  );
}

export default function ThreeDDocument() {
  return (
    <div className="w-full h-[320px] relative cursor-grab">
      {/* Floating radial glow behind canvas */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.15),transparent_60%)] pointer-events-none rounded-full blur-2xl" />
      
      <Canvas camera={{ position: [0, 0, 4.0], fov: 45 }}>
        <ambientLight intensity={1.2} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <Float speed={2.5} rotationIntensity={0.2} floatIntensity={0.8}>
          <HologramDeed />
        </Float>
        
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
      
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-[9px] text-slate-500 pointer-events-none tracking-widest uppercase bg-white border border-slate-200/80 px-2.5 py-1 rounded-md shadow-sm">
        Drag to Orbit 3D Model
      </div>
    </div>
  );
}
