import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

interface HeroThreeSceneProps {
  isDarkMode: boolean;
  reduceMotion?: boolean;
  isDyslexiaMode?: boolean;
}

function checkWebGLSupport(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch {
    return false;
  }
}

// Generate circular soft golden starlight mote (Zero harsh edges, zero dark confetti)
function createParticleTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
  gradient.addColorStop(0.25, 'rgba(254, 240, 138, 0.7)');
  gradient.addColorStop(0.6, 'rgba(251, 191, 36, 0.2)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

// Generate soft radial contact shadow texture to physically ground the 3D centerpiece
function createShadowTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, 'rgba(15, 23, 42, 0.35)');
  gradient.addColorStop(0.3, 'rgba(15, 23, 42, 0.15)');
  gradient.addColorStop(0.7, 'rgba(15, 23, 42, 0.03)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(canvas);
}

// Restrained count confined strictly around the core (Zero visual clutter for dyslexic/neurodivergent readers)
const PARTICLE_COUNT = 18;

export function HeroThreeScene({
  isDarkMode,
  reduceMotion = false,
  isDyslexiaMode = false,
}: HeroThreeSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const pmremGeneratorRef = useRef<THREE.PMREMGenerator | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const isInteractingRef = useRef(false);
  const previousPointerPositionRef = useRef({ x: 0, y: 0 });
  const reduceMotionRef = useRef(reduceMotion);
  const isDarkModeRef = useRef(isDarkMode);
  const isDyslexiaModeRef = useRef(isDyslexiaMode);

  // Keep refs synchronized
  useEffect(() => {
    reduceMotionRef.current = reduceMotion;
  }, [reduceMotion]);

  useEffect(() => {
    isDarkModeRef.current = isDarkMode;
  }, [isDarkMode]);

  useEffect(() => {
    isDyslexiaModeRef.current = isDyslexiaMode;
  }, [isDyslexiaMode]);

  // 3D Model References
  const coreMeshRef = useRef<THREE.Mesh | null>(null);
  const innerCoreMeshRef = useRef<THREE.Mesh | null>(null);
  const synapseGroupRef = useRef<THREE.Group | null>(null);
  const synapseNodeMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const synapseLineMatRef = useRef<THREE.LineBasicMaterial | null>(null);
  const ring1Ref = useRef<THREE.Group | null>(null);
  const ring2Ref = useRef<THREE.Group | null>(null);
  const particlesMeshRef = useRef<THREE.Points | null>(null);
  const shadowMeshRef = useRef<THREE.Mesh | null>(null);
  const mainGroupRef = useRef<THREE.Group | null>(null);

  // Materials & Lights References
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const goldLightRef = useRef<THREE.PointLight | null>(null);
  const rimLightRef = useRef<THREE.PointLight | null>(null);
  const fillLightRef = useRef<THREE.PointLight | null>(null);
  const innerLightRef = useRef<THREE.PointLight | null>(null);

  const coreMatRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const innerMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const ringMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const satelliteMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const shadowMatRef = useRef<THREE.MeshBasicMaterial | null>(null);

  // Mouse Parallax Targets
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const [hasWebGL] = useState(checkWebGLSupport);

  // Build Studio Lighting Environment Map (Calm, balanced reflections)
  const updateEnvironmentMap = useCallback((darkMode: boolean) => {
    if (!rendererRef.current || !sceneRef.current || !pmremGeneratorRef.current) return;

    const envScene = new THREE.Scene();

    if (darkMode) {
      // Dark Mode: Deep calming indigo with soft gold highlights
      envScene.background = new THREE.Color(0x0a0f1d);

      const goldGeo = new THREE.PlaneGeometry(5, 5);
      const goldMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
      const goldBox = new THREE.Mesh(goldGeo, goldMat);
      goldBox.position.set(3, 4, 3);
      goldBox.lookAt(0, 0, 0);
      envScene.add(goldBox);

      const violetGeo = new THREE.PlaneGeometry(5, 5);
      const violetMat = new THREE.MeshBasicMaterial({ color: 0x8b5cf6 });
      const violetBox = new THREE.Mesh(violetGeo, violetMat);
      violetBox.position.set(-3, -2, -3);
      violetBox.lookAt(0, 0, 0);
      envScene.add(violetBox);
    } else {
      // Light Mode: High-contrast studio environment for crisp glass caustics
      envScene.background = new THREE.Color(0xf1f5f9);

      // Deep Contrast Slate Softbox Left (Provides dark reflection lines essential for crystal glass)
      const darkGeo = new THREE.PlaneGeometry(8, 8);
      const darkMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
      const darkBox1 = new THREE.Mesh(darkGeo, darkMat);
      darkBox1.position.set(-5, 0, -3);
      darkBox1.lookAt(0, 0, 0);
      envScene.add(darkBox1);

      // Deep Contrast Slate Softbox Right
      const darkBox2 = new THREE.Mesh(darkGeo, darkMat);
      darkBox2.position.set(5, -1, -3);
      darkBox2.lookAt(0, 0, 0);
      envScene.add(darkBox2);

      // Warm Golden Key Softbox (Gives glass rich gold highlights)
      const warmGeo = new THREE.PlaneGeometry(6, 6);
      const warmMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
      const warmBox = new THREE.Mesh(warmGeo, warmMat);
      warmBox.position.set(4, 5, 3);
      warmBox.lookAt(0, 0, 0);
      envScene.add(warmBox);

      // Royal Indigo Rim Softbox
      const rimGeo = new THREE.PlaneGeometry(5, 5);
      const rimMat = new THREE.MeshBasicMaterial({ color: 0x4f46e5 });
      const rimBox = new THREE.Mesh(rimGeo, rimMat);
      rimBox.position.set(-3, 4, 2);
      rimBox.lookAt(0, 0, 0);
      envScene.add(rimBox);

      // Crisp White Top Daylight Panel
      const daylightGeo = new THREE.PlaneGeometry(8, 3);
      const daylightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const daylightBox = new THREE.Mesh(daylightGeo, daylightMat);
      daylightBox.position.set(0, 6, 1);
      daylightBox.lookAt(0, 0, 0);
      envScene.add(daylightBox);
    }

    if (sceneRef.current.environment) {
      sceneRef.current.environment.dispose();
    }
    const envMap = pmremGeneratorRef.current.fromScene(envScene).texture;
    sceneRef.current.environment = envMap;
  }, []);

  // Update theme-based materials, lights, and reflections dynamically
  const applyThemeColors = useCallback((darkMode: boolean) => {
    if (!coreMatRef.current || !ambientLightRef.current || !keyLightRef.current || !goldLightRef.current || !rimLightRef.current) {
      return;
    }

    updateEnvironmentMap(darkMode);

    if (darkMode) {
      // ── DARK MODE CINEMATIC PALETTE ────────────────────────────────
      ambientLightRef.current.color.set(0x1e1b4b);
      ambientLightRef.current.intensity = 0.9;

      keyLightRef.current.color.set(0xfffbeb);
      keyLightRef.current.intensity = 2.4;
      keyLightRef.current.position.set(3.5, 4.5, 3.5);

      goldLightRef.current.color.set(0xf59e0b);
      goldLightRef.current.intensity = 3.2;

      rimLightRef.current.color.set(0x818cf8);
      rimLightRef.current.intensity = 2.4;

      if (fillLightRef.current) {
        fillLightRef.current.color.set(0x38bdf8);
        fillLightRef.current.intensity = 1.4;
      }

      if (innerLightRef.current) {
        innerLightRef.current.color.set(0xf59e0b);
        innerLightRef.current.intensity = 2.8;
      }

      // Core Glass: Deep Smoked Obsidian Crystal with Radiant Gold Refractions
      coreMatRef.current.color.set(0x0f172a);
      coreMatRef.current.metalness = 0.12;
      coreMatRef.current.roughness = 0.1;
      coreMatRef.current.transmission = 0.9;
      coreMatRef.current.thickness = 2.0;
      coreMatRef.current.ior = 1.58;
      coreMatRef.current.reflectivity = 0.95;
      coreMatRef.current.clearcoat = 1.0;
      coreMatRef.current.clearcoatRoughness = 0.06;
      coreMatRef.current.iridescence = 0.85;
      coreMatRef.current.iridescenceIOR = 1.4;
      coreMatRef.current.dispersion = 0.05;
      coreMatRef.current.attenuationColor.set(0xf59e0b);
      coreMatRef.current.attenuationDistance = 1.4;
      coreMatRef.current.needsUpdate = true;

      // Inner Core: Radiant Amber-Gold Cognitive Nucleus
      if (innerMatRef.current) {
        innerMatRef.current.color.set(0xf59e0b);
        innerMatRef.current.emissive.set(0xd97706);
        innerMatRef.current.emissiveIntensity = 1.1;
        innerMatRef.current.needsUpdate = true;
      }

      if (synapseNodeMatRef.current) {
        synapseNodeMatRef.current.color.set(0xf59e0b);
        synapseNodeMatRef.current.emissive.set(0xd97706);
        synapseNodeMatRef.current.needsUpdate = true;
      }
      if (synapseLineMatRef.current) {
        synapseLineMatRef.current.color.set(0xf59e0b);
        synapseLineMatRef.current.opacity = 0.45;
        synapseLineMatRef.current.needsUpdate = true;
      }

      // Orbital Rings: Refined Brushed Gold (Calm, not overpowering)
      if (ringMatRef.current) {
        ringMatRef.current.color.set(0xf59e0b);
        ringMatRef.current.metalness = 0.92;
        ringMatRef.current.roughness = 0.18;
        ringMatRef.current.emissive.set(0xb45309);
        ringMatRef.current.emissiveIntensity = 0.25;
        ringMatRef.current.needsUpdate = true;
      }

      if (satelliteMatRef.current) {
        satelliteMatRef.current.color.set(0xfef08a);
        satelliteMatRef.current.emissive.set(0xf59e0b);
        satelliteMatRef.current.emissiveIntensity = 1.2;
        satelliteMatRef.current.needsUpdate = true;
      }

      // Contact Shadow
      if (shadowMatRef.current) {
        shadowMatRef.current.opacity = 0.4;
        shadowMatRef.current.needsUpdate = true;
      }
    } else {
      // ── LIGHT MODE CINEMATIC CRYSTAL DESIGN (CRISP CAUSTICS & DEPTH) ──
      ambientLightRef.current.color.set(0xffffff);
      ambientLightRef.current.intensity = 0.35; // Controlled ambient light allows deep 3D shadows and specular reflections

      keyLightRef.current.color.set(0xfffbeb);
      keyLightRef.current.intensity = 1.8;
      keyLightRef.current.position.set(4.0, 5.0, 3.5);

      goldLightRef.current.color.set(0xf59e0b);
      goldLightRef.current.intensity = 2.2;
      goldLightRef.current.position.set(3.5, -2.0, 2.5);

      rimLightRef.current.color.set(0x818cf8);
      rimLightRef.current.intensity = 2.0;
      rimLightRef.current.position.set(-3.5, 3.0, -3.0);

      if (fillLightRef.current) {
        fillLightRef.current.color.set(0x38bdf8);
        fillLightRef.current.intensity = 1.0;
      }

      if (innerLightRef.current) {
        innerLightRef.current.color.set(0x6366f1);
        innerLightRef.current.intensity = 2.4;
      }

      // Core Glass: Pristine Refractive Crystal with Defined Amber Caustics
      coreMatRef.current.color.set(0xffffff);
      coreMatRef.current.metalness = 0.06;
      coreMatRef.current.roughness = 0.03;
      coreMatRef.current.transmission = 0.88;
      coreMatRef.current.thickness = 2.2;
      coreMatRef.current.ior = 1.54;
      coreMatRef.current.reflectivity = 0.95;
      coreMatRef.current.clearcoat = 1.0;
      coreMatRef.current.clearcoatRoughness = 0.02;
      coreMatRef.current.iridescence = 0.95;
      coreMatRef.current.iridescenceIOR = 1.38;
      coreMatRef.current.dispersion = 0.1;
      coreMatRef.current.attenuationColor.set(0xd97706); // Warm golden amber core caustics
      coreMatRef.current.attenuationDistance = 0.75;
      coreMatRef.current.needsUpdate = true;

      // Inner Core: Brilliant Sapphire-Indigo Cognitive Nucleus
      if (innerMatRef.current) {
        innerMatRef.current.color.set(0x4f46e5);
        innerMatRef.current.emissive.set(0x6366f1);
        innerMatRef.current.emissiveIntensity = 2.2;
        innerMatRef.current.needsUpdate = true;
      }

      if (synapseNodeMatRef.current) {
        synapseNodeMatRef.current.color.set(0x818cf8);
        synapseNodeMatRef.current.emissive.set(0x4f46e5);
        synapseNodeMatRef.current.needsUpdate = true;
      }
      if (synapseLineMatRef.current) {
        synapseLineMatRef.current.color.set(0x6366f1);
        synapseLineMatRef.current.opacity = 0.35;
        synapseLineMatRef.current.needsUpdate = true;
      }

      // Orbital Rings: Sleek Aerospace Titanium-Platinum with Polished 24k Gold Accents
      if (ringMatRef.current) {
        ringMatRef.current.color.set(0x334155);
        ringMatRef.current.metalness = 0.94;
        ringMatRef.current.roughness = 0.15;
        ringMatRef.current.emissive.set(0x1e293b);
        ringMatRef.current.emissiveIntensity = 0.12;
        ringMatRef.current.needsUpdate = true;
      }

      if (satelliteMatRef.current) {
        satelliteMatRef.current.color.set(0xf59e0b);
        satelliteMatRef.current.metalness = 0.95;
        satelliteMatRef.current.roughness = 0.1;
        satelliteMatRef.current.emissive.set(0xd97706);
        satelliteMatRef.current.emissiveIntensity = 0.8;
        satelliteMatRef.current.needsUpdate = true;
      }

      // Contact Shadow: Distinct Grounding Shadow
      if (shadowMatRef.current) {
        shadowMatRef.current.opacity = 0.2;
        shadowMatRef.current.needsUpdate = true;
      }
    }
  }, [updateEnvironmentMap]);

  const applyThemeColorsRef = useRef(applyThemeColors);
  useEffect(() => {
    applyThemeColorsRef.current = applyThemeColors;
  }, [applyThemeColors]);

  // Synchronize theme changes without rebuilding WebGL context
  useEffect(() => {
    applyThemeColors(isDarkMode);
  }, [isDarkMode, applyThemeColors]);

  // Main Scene Setup
  useEffect(() => {
    if (!hasWebGL) return;
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 700;
    const height = container.clientHeight || 620;

    // 1. Scene, Camera & Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0.1, 8.0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    pmremGeneratorRef.current = pmremGenerator;

    // 2. Main Group
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);
    mainGroupRef.current = mainGroup;

    // 3. Cinematic Lights Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 1.8);
    keyLight.position.set(4.0, 5.0, 3.5);
    scene.add(keyLight);
    keyLightRef.current = keyLight;

    const goldLight = new THREE.PointLight(0xf59e0b, 2.2, 14);
    goldLight.position.set(3.5, -2.0, 2.5);
    scene.add(goldLight);
    goldLightRef.current = goldLight;

    const rimLight = new THREE.PointLight(0x818cf8, 2.0, 14);
    rimLight.position.set(-3.5, 3.0, -3.0);
    scene.add(rimLight);
    rimLightRef.current = rimLight;

    const fillLight = new THREE.PointLight(0x38bdf8, 1.0, 12);
    fillLight.position.set(0, -3.0, 2.2);
    scene.add(fillLight);
    fillLightRef.current = fillLight;

    // Radiant Cognitive Energy Nucleus Light (Illuminates crystal knot from within)
    const innerLight = new THREE.PointLight(0x6366f1, 2.4, 5.5);
    innerLight.position.set(0, 0, 0);
    mainGroup.add(innerLight);
    innerLightRef.current = innerLight;

    // 4. Materials Setup (Prisms & Polished Crystal)
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.06,
      roughness: 0.03,
      transmission: 0.88,
      thickness: 2.2,
      ior: 1.54,
      reflectivity: 0.95,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      iridescence: 0.95,
      iridescenceIOR: 1.38,
      dispersion: 0.1,
      attenuationColor: new THREE.Color(0xd97706),
      attenuationDistance: 0.75,
    });
    coreMatRef.current = coreMat;

    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x4f46e5,
      metalness: 0.35,
      roughness: 0.15,
      emissive: new THREE.Color(0x6366f1),
      emissiveIntensity: 2.2,
    });
    innerMatRef.current = innerMat;

    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.96,
      roughness: 0.1,
      emissive: new THREE.Color(0xb45309),
      emissiveIntensity: 0.25,
    });
    ringMatRef.current = ringMat;

    const satelliteMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      metalness: 0.95,
      roughness: 0.08,
      emissive: new THREE.Color(0xf59e0b),
      emissiveIntensity: 0.7,
    });
    satelliteMatRef.current = satelliteMat;

    // 5. Geometries & Meshes
    // 5a. Professional Symmetrical Optical Crystal Neural Sphere
    const coreGeo = new THREE.SphereGeometry(1.15, 64, 64);
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    mainGroup.add(coreMesh);
    coreMeshRef.current = coreMesh;

    // 5b. Inner Cognitive Geodesic Energy Nucleus
    const innerGeo = new THREE.IcosahedronGeometry(0.52, 2);
    const innerCoreMesh = new THREE.Mesh(innerGeo, innerMat);
    mainGroup.add(innerCoreMesh);
    innerCoreMeshRef.current = innerCoreMesh;

    // 5c. Interconnected Neural Synapse Constellation (Inside the Crystal Sphere)
    const synapseGroup = new THREE.Group();
    mainGroup.add(synapseGroup);
    synapseGroupRef.current = synapseGroup;

    const phi = (1 + Math.sqrt(5)) / 2;
    const rawSynapseCoords = [
      [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
      [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
      [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1],
    ];
    const synapseRadius = 0.82;
    const synapseNodes: THREE.Vector3[] = rawSynapseCoords.map(([x, y, z]) => {
      const len = Math.sqrt(x * x + y * y + z * z);
      return new THREE.Vector3((x / len) * synapseRadius, (y / len) * synapseRadius, (z / len) * synapseRadius);
    });

    const synapseNodeGeo = new THREE.SphereGeometry(0.045, 16, 16);
    const synapseNodeMat = new THREE.MeshStandardMaterial({
      color: isDarkModeRef.current ? 0xf59e0b : 0x818cf8,
      emissive: isDarkModeRef.current ? 0xd97706 : 0x4f46e5,
      emissiveIntensity: 1.8,
      metalness: 0.8,
      roughness: 0.2,
    });
    synapseNodeMatRef.current = synapseNodeMat;

    synapseNodes.forEach((pos) => {
      const nodeMesh = new THREE.Mesh(synapseNodeGeo, synapseNodeMat);
      nodeMesh.position.copy(pos);
      synapseGroup.add(nodeMesh);
    });

    const synapseLineCoords: number[] = [];
    for (let i = 0; i < synapseNodes.length; i++) {
      for (let j = i + 1; j < synapseNodes.length; j++) {
        const d = synapseNodes[i].distanceTo(synapseNodes[j]);
        if (d < synapseRadius * 1.15) {
          synapseLineCoords.push(
            synapseNodes[i].x, synapseNodes[i].y, synapseNodes[i].z,
            synapseNodes[j].x, synapseNodes[j].y, synapseNodes[j].z
          );
        }
      }
    }

    const synapseLineGeo = new THREE.BufferGeometry();
    synapseLineGeo.setAttribute('position', new THREE.Float32BufferAttribute(synapseLineCoords, 3));
    const synapseLineMat = new THREE.LineBasicMaterial({
      color: isDarkModeRef.current ? 0xf59e0b : 0x6366f1,
      transparent: true,
      opacity: isDarkModeRef.current ? 0.45 : 0.35,
    });
    synapseLineMatRef.current = synapseLineMat;

    const synapseLines = new THREE.LineSegments(synapseLineGeo, synapseLineMat);
    synapseGroup.add(synapseLines);

    // 5c. Two Delicate Concentric Orbital Rings (Never overlap text cards)
    const createOrbitalRing = (radius: number, tube: number, rotX: number, rotY: number, rotZ: number) => {
      const ringGroup = new THREE.Group();
      ringGroup.rotation.set(rotX, rotY, rotZ);

      const ringGeo = new THREE.TorusGeometry(radius, tube, 24, 128);
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringGroup.add(ringMesh);

      const satGeo = new THREE.SphereGeometry(tube * 2.2, 16, 16);
      const sat1 = new THREE.Mesh(satGeo, satelliteMat);
      sat1.position.set(radius, 0, 0);
      ringGroup.add(sat1);

      const sat2 = new THREE.Mesh(satGeo, satelliteMat);
      sat2.position.set(-radius * 0.7, radius * 0.7, 0);
      ringGroup.add(sat2);

      return ringGroup;
    };

    const ring1 = createOrbitalRing(1.48, 0.015, Math.PI / 4, Math.PI / 6, 0);
    mainGroup.add(ring1);
    ring1Ref.current = ring1;

    const ring2 = createOrbitalRing(1.78, 0.011, -Math.PI / 4.5, 0, Math.PI / 4.5);
    mainGroup.add(ring2);
    ring2Ref.current = ring2;

    // 5d. Muted Atmospheric Particles Cloud (Confined strictly around core, never drifting into text)
    const initialDark = isDarkModeRef.current;
    const particlePositions = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const radius = 0.95 + Math.random() * 0.45; // Confined tightly to 0.95 - 1.40
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.75;
      particlePositions[i * 3 + 2] = radius * Math.cos(phi);
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleTexture = createParticleTexture();
    const particleMat = new THREE.PointsMaterial({
      map: particleTexture,
      size: 0.08,
      transparent: true,
      color: 0xfef08a,
      opacity: isDyslexiaModeRef.current ? 0 : (initialDark ? 0.75 : 0.35),
      blending: initialDark ? THREE.AdditiveBlending : THREE.NormalBlending,
      depthWrite: false,
    });
    const particlesMesh = new THREE.Points(particleGeo, particleMat);
    particlesMesh.visible = !isDyslexiaModeRef.current;
    mainGroup.add(particlesMesh);
    particlesMeshRef.current = particlesMesh;

    // 5e. Ground Contact Shadow Plane
    const shadowGeo = new THREE.PlaneGeometry(5.0, 5.0);
    const shadowTexture = createShadowTexture();
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      opacity: initialDark ? 0.4 : 0.18,
      depthWrite: false,
    });
    shadowMatRef.current = shadowMat;

    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -1.65;
    scene.add(shadowMesh);
    shadowMeshRef.current = shadowMesh;

    // Apply initial theme settings
    applyThemeColorsRef.current(isDarkModeRef.current);

    // 6. Interactive Mouse Parallax & Direct Drag
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseRef.current.targetX = x * 0.35;
      mouseRef.current.targetY = y * 0.25;

      if (isInteractingRef.current && mainGroupRef.current) {
        const deltaX = e.clientX - previousPointerPositionRef.current.x;
        const deltaY = e.clientY - previousPointerPositionRef.current.y;
        mainGroupRef.current.rotation.y += deltaX * 0.006;
        mainGroupRef.current.rotation.x += deltaY * 0.006;
        previousPointerPositionRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      isInteractingRef.current = true;
      previousPointerPositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isInteractingRef.current = false;
    };

    // Touch support for mobile interaction
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isInteractingRef.current = true;
        previousPointerPositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isInteractingRef.current && e.touches.length === 1 && mainGroupRef.current) {
        const deltaX = e.touches[0].clientX - previousPointerPositionRef.current.x;
        const deltaY = e.touches[0].clientY - previousPointerPositionRef.current.y;
        mainGroupRef.current.rotation.y += deltaX * 0.006;
        mainGroupRef.current.rotation.x += deltaY * 0.006;
        previousPointerPositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const handleTouchEnd = () => {
      isInteractingRef.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    // 7. Responsive Resizing
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 8. Animation Loop (Calm and steady, gentle on neurodivergent senses)
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse parallax interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.04;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.04;

      if (mainGroupRef.current && !isInteractingRef.current) {
        mainGroupRef.current.rotation.y = mouseRef.current.x * 0.4;
        mainGroupRef.current.rotation.x = -mouseRef.current.y * 0.28;
      }

      if (!reduceMotionRef.current) {
        // In Dyslexia Mode: rotation is slowed down to a peaceful, soothing 35% drift
        const speed = isDyslexiaModeRef.current ? 0.35 : 1.0;

        if (coreMeshRef.current) {
          coreMeshRef.current.rotation.y += 0.12 * delta * speed;
          coreMeshRef.current.rotation.x += 0.06 * delta * speed;
        }

        if (synapseGroupRef.current) {
          synapseGroupRef.current.rotation.y -= 0.16 * delta * speed;
          synapseGroupRef.current.rotation.z += 0.08 * delta * speed;
        }

        if (innerCoreMeshRef.current) {
          innerCoreMeshRef.current.rotation.y += 0.20 * delta * speed;
          const pulse = 1.0 + Math.sin(elapsedTime * 1.8) * 0.035;
          innerCoreMeshRef.current.scale.set(pulse, pulse, pulse);
        }

        if (ring1Ref.current) ring1Ref.current.rotation.z += 0.12 * delta * speed;
        if (ring2Ref.current) ring2Ref.current.rotation.z -= 0.09 * delta * speed;

        if (particlesMeshRef.current) {
          particlesMeshRef.current.visible = !isDyslexiaModeRef.current;
          if (!isDyslexiaModeRef.current) {
            particlesMeshRef.current.rotation.y += 0.04 * delta;
            particlesMeshRef.current.rotation.x = Math.sin(elapsedTime * 0.25) * 0.04;
          }
        }

        if (mainGroupRef.current) {
          mainGroupRef.current.position.y = Math.sin(elapsedTime * 1.1) * 0.05;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // 9. Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', handleResize);

      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }

      coreGeo.dispose();
      innerGeo.dispose();
      particleGeo.dispose();
      shadowGeo.dispose();
      particleTexture.dispose();
      shadowTexture.dispose();

      coreMat.dispose();
      innerMat.dispose();
      ringMat.dispose();
      satelliteMat.dispose();
      particleMat.dispose();
      shadowMat.dispose();

      if (pmremGeneratorRef.current) {
        pmremGeneratorRef.current.dispose();
      }

      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (rendererRef.current.domElement && rendererRef.current.domElement.parentElement) {
          rendererRef.current.domElement.parentElement.removeChild(rendererRef.current.domElement);
        }
      }
    };
  }, [hasWebGL]);

  if (!hasWebGL) {
    return (
      <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
        <div className="relative w-64 h-64 rounded-full bg-gradient-to-tr from-amber-400/20 via-blue-500/20 to-purple-500/25 blur-2xl animate-pulse" />
        <div className="text-5xl">🧠✨</div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative cursor-grab active:cursor-grabbing select-none"
      title="Click and drag to gently rotate the neural core"
    />
  );
}
