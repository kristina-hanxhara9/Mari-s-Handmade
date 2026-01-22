
import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { MeshDistortMaterial, Sparkles, Float } from '@react-three/drei';
import * as THREE from 'three';

// --- Components ---

/**
 * A trailing particle effect that follows the mouse cursor
 */
const MouseTrail = () => {
  const { viewport, mouse } = useThree();
  const ref = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (ref.current) {
      // Map mouse (-1 to 1) to viewport coordinates
      const x = (mouse.x * viewport.width) / 2;
      const y = (mouse.y * viewport.height) / 2;
      
      // Smooth movement (lerp)
      ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, x, 0.15);
      ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, y, 0.15);
      ref.current.position.z = 0; // Keep at 0 for z-plane
    }
  });

  return (
    // @ts-ignore
    <group ref={ref}>
        {/* The little "spark" at the cursor */}
        {/* @ts-ignore */}
        <mesh>
            {/* @ts-ignore */}
            <sphereGeometry args={[0.05, 16, 16]} />
            {/* @ts-ignore */}
            <meshBasicMaterial color="#FFF" transparent opacity={0.8} />
        {/* @ts-ignore */}
        </mesh>
        
        {/* Light emitting from cursor */}
        {/* @ts-ignore */}
        <pointLight ref={lightRef} distance={4} intensity={2} color="#ffcf70" decay={2} />

        {/* Trail particles */}
        <Sparkles 
            count={20} 
            scale={2} 
            size={4} 
            speed={2} 
            opacity={1} 
            color="#FF9E80" 
            noise={0.5}
        />
    {/* @ts-ignore */}
    </group>
  );
};

/**
 * The Main Candle Flame
 * Consists of 3 Layers: Core (Hot), Inner (Color), Outer (Glow)
 */
const MagicFlame = () => {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  
  const { mouse, viewport, clock } = useThree();
  
  // Pre-define colors for memory efficiency
  const colorTeal = useMemo(() => new THREE.Color('#4A90A4'), []);
  const colorPink = useMemo(() => new THREE.Color('#F4C2C2'), []);
  const colorGold = useMemo(() => new THREE.Color('#ffcf70'), []);
  
  useFrame((state) => {
    const time = clock.elapsedTime;
    const x = (mouse.x * viewport.width) / 2;
    const y = (mouse.y * viewport.height) / 2;

    // --- 1. Follow Mouse with "Drag" (Wind Effect) ---
    if (groupRef.current) {
       // Move base towards mouse slightly for parallax
       const targetX = x * 0.1; 
       const targetY = y * 0.1;
       
       groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.05);
       groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, -1 + targetY, 0.05);
       
       // Rotation (Leaning) based on mouse position (simulating wind)
       // If mouse is far left, flame leans right
       groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, -mouse.x * 0.5, 0.1);
    }

    // --- 2. Color Morphing Logic ---
    // Morph between Teal (Left) and Pink (Right) based on screen position
    if (bodyRef.current) {
        const material = bodyRef.current.material as any;
        const targetColor = new THREE.Color().copy(colorGold);
        
        if (mouse.x < -0.2) {
            targetColor.lerp(colorTeal, Math.abs(mouse.x));
        } else if (mouse.x > 0.2) {
            targetColor.lerp(colorPink, Math.abs(mouse.x));
        }
        
        // Dynamic material updates
        material.color.lerp(targetColor, 0.05);
        material.emissive.lerp(targetColor, 0.05);
        
        // "Breathing" scale
        const breathe = 1 + Math.sin(time * 3) * 0.05;
        bodyRef.current.scale.set(1 * breathe, 1.8 * breathe, 1 * breathe);
    }

    // --- 3. Flickering Light Physics ---
    if (lightRef.current) {
        // Flicker intensity using noise-like sine combination
        const flicker = Math.sin(time * 20) * 0.1 + Math.sin(time * 45) * 0.1 + Math.cos(time * 10) * 0.1;
        lightRef.current.intensity = 3 + flicker;
        lightRef.current.distance = 10 + flicker * 2;
    }

    // --- 4. Core Intensity ---
    if (coreRef.current) {
       const material = coreRef.current.material as any;
       // Make core distort faster when mouse moves fast (turbulence)
       // We estimate turbulence by distance from center
       const turbulence = Math.abs(mouse.x) + Math.abs(mouse.y);
       material.speed = 4 + turbulence * 5;
       material.distort = 0.3 + turbulence * 0.2;
    }
  });

  return (
    // @ts-ignore
    <group ref={groupRef} position={[0, -1, 0]}>
        {/* Dynamic Light Source (The Candle Light) */}
        {/* @ts-ignore */}
        <pointLight 
            ref={lightRef} 
            position={[0, 1, 0]} 
            color="#ffaa5e" 
            castShadow 
            shadow-mapSize={[1024, 1024]} 
        />
        
        {/* 1. The Core (Hot White/Gold) - High Speed Distortion */}
        {/* @ts-ignore */}
        <mesh ref={coreRef} position={[0, 0.2, 0]}>
            {/* @ts-ignore */}
            <sphereGeometry args={[0.5, 32, 32]} />
            <MeshDistortMaterial 
                color="#fff" 
                emissive="#ffcf70"
                emissiveIntensity={2}
                roughness={0}
                metalness={0.1}
                distort={0.4}
                speed={5}
            />
        {/* @ts-ignore */}
        </mesh>

        {/* 2. The Body (Morphing Color) - Elongated Sphere */}
        {/* @ts-ignore */}
        <mesh ref={bodyRef} position={[0, 0.5, 0]}>
            {/* @ts-ignore */}
            <sphereGeometry args={[0.8, 64, 64]} />
            <MeshDistortMaterial 
                color="#ffcf70"
                emissive="#ff8a65"
                emissiveIntensity={0.5}
                roughness={0.2}
                metalness={0.8}
                distort={0.5}
                speed={2}
                transparent
                opacity={0.8}
            />
        {/* @ts-ignore */}
        </mesh>
        
        {/* 3. The Halo (Outer Glow) */}
        {/* @ts-ignore */}
        <mesh position={[0, 0.8, 0]}>
            {/* @ts-ignore */}
            <sphereGeometry args={[1.4, 32, 32]} />
             <MeshDistortMaterial 
                color="#ff5e3a"
                distort={0.6}
                speed={1.5}
                transparent
                opacity={0.15}
                side={THREE.DoubleSide}
            />
        {/* @ts-ignore */}
        </mesh>
        
        {/* The Wick */}
        {/* @ts-ignore */}
        <mesh position={[0, -0.6, 0]}>
             {/* @ts-ignore */}
             <cylinderGeometry args={[0.05, 0.05, 1, 8]} />
             {/* @ts-ignore */}
             <meshStandardMaterial color="#111" />
        {/* @ts-ignore */}
        </mesh>
    {/* @ts-ignore */}
    </group>
  );
};

/**
 * Scene setup with background and camera
 */
export const CandleEffect = () => {
  return (
    <div className="w-full h-full bg-gradient-to-b from-mari-cream to-[#f0f0f0]">
      <Canvas 
        shadows 
        camera={{ position: [0, 0, 8], fov: 40 }}
        dpr={[1, 2]} // Support high-res displays
      >
        <Suspense fallback={null}>
            {/* @ts-ignore */}
            <fog attach="fog" args={['#FCFBF9', 5, 25]} />
            {/* @ts-ignore */}
            <ambientLight intensity={0.4} color="#ffffff" />
            
            {/* Interactive Elements */}
            <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
                <MagicFlame />
            </Float>
            
            <MouseTrail />

            {/* Background Environment Particles (Embers) */}
            <Sparkles 
                count={80} 
                scale={[12, 12, 12]} 
                size={4} 
                speed={0.4} 
                opacity={0.6}
                color="#FF9E80" // Soft Coral Embers
                position={[0, 2, -2]}
            />
             <Sparkles 
                count={50} 
                scale={[10, 10, 5]} 
                size={6} 
                speed={0.2} 
                opacity={0.4}
                color="#4A90A4" // Magical Teal Particles
                position={[0, -2, 1]}
            />
        </Suspense>
      </Canvas>
      
      {/* Vignette Overlay for atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(255,255,255,0.8)_100%)] pointer-events-none mix-blend-overlay" />
    </div>
  );
};
