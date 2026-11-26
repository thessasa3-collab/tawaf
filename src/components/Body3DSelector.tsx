import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Eye, EyeOff, RotateCcw, Undo2 } from 'lucide-react';
import {
  BODY_PART_LABELS,
  BodyPartId,
  LanguageCode,
  UI_TRANSLATIONS,
} from '../i18n';

interface Body3DSelectorProps {
  language: LanguageCode;
  selectedPart: BodyPartId | null;
  onSelectPart: (part: BodyPartId | null) => void;
}

const ALL_BODY_PARTS: BodyPartId[] = [
  'head',
  'neck',
  'chest',
  'abdomen',
  'back',
  'left_arm',
  'right_arm',
  'left_leg',
  'right_leg',
  'feet',
];

const DEFAULT_CAM_POS = new THREE.Vector3(0, 1.18, 2.95);
const FRONT_CAM_POS = new THREE.Vector3(0, 1.18, 2.95);
const BACK_CAM_POS = new THREE.Vector3(0, 1.18, -2.95);
const SIDE_CAM_POS = new THREE.Vector3(2.85, 1.18, 0.28);
const CAM_TARGET = new THREE.Vector3(0, 0.96, 0);

const _mouse = new THREE.Vector2();
const _raycaster = new THREE.Raycaster();

function createSkinTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#E3B89C');
    grad.addColorStop(0.5, '#D7A587');
    grad.addColorStop(1, '#CC9878');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    // Subtle natural micro-texture grain
    for (let i = 0; i < 1600; i++) {
      const x = (i * 73) % 256;
      const y = (i * 139) % 256;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255,245,236,0.04)' : 'rgba(130,75,50,0.035)';
      ctx.fillRect(x, y, 2, 2);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createWovenFabricTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#F7F4EC';
    ctx.fillRect(0, 0, 128, 128);
    ctx.strokeStyle = 'rgba(181, 142, 70, 0.14)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 128; i += 6) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(128, i);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 128);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 2);
  return tex;
}

function createLatheFromSpline(
  points: Array<[number, number]>,
  segments = 32
): THREE.LatheGeometry {
  const spline = new THREE.SplineCurve(points.map(([r, y]) => new THREE.Vector2(r, y)));
  return new THREE.LatheGeometry(spline.getPoints(28), segments);
}

export const Body3DSelector: React.FC<Body3DSelectorProps> = ({
  language,
  selectedPart,
  onSelectPart,
}) => {
  const t = UI_TRANSLATIONS[language];
  const mountRef = useRef<HTMLDivElement | null>(null);

  const [controlsCollapsed, setControlsCollapsed] = useState(false);
  const [hoveredPart, setHoveredPart] = useState<BodyPartId | null>(null);
  const [webglError, setWebglError] = useState(false);

  const selectedPartRef = useRef<BodyPartId | null>(selectedPart);
  const hoveredPartRef = useRef<BodyPartId | null>(null);
  const onSelectRef = useRef(onSelectPart);
  const setCameraTargetRef = useRef<((pos: THREE.Vector3) => void) | null>(null);
  const requestRenderRef = useRef<(() => void) | null>(null);

  selectedPartRef.current = selectedPart;
  onSelectRef.current = onSelectPart;

  useEffect(() => {
    requestRenderRef.current?.();
  }, [selectedPart]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = (() => {
      try {
        const probe = document.createElement('canvas');
        const gl = probe.getContext('webgl2') || probe.getContext('webgl');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
        alpha: false,
      });
    } catch {
      setWebglError(true);
      return;
    }

    const width = container.clientWidth || 420;
    const height = container.clientHeight || 420;

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.06;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const canvas = renderer.domElement;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.touchAction = 'none';
    container.innerHTML = '';
    container.appendChild(canvas);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setWebglError(true);
    };
    const handleContextRestored = () => {
      setWebglError(false);
    };
    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x072d23);
    scene.fog = new THREE.FogExp2(0x072d23, 0.08);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTex = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 30);
    camera.position.copy(DEFAULT_CAM_POS);

    const controls = new OrbitControls(camera, canvas);
    controls.target.copy(CAM_TARGET);
    controls.enablePan = false;
    controls.minDistance = 1.75;
    controls.maxDistance = 4.6;
    controls.minPolarAngle = 0.3;
    controls.maxPolarAngle = Math.PI * 0.62;
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.08;
    controls.update();

    // Balanced studio lighting for realistic human skin & Ihram cloth depth
    const hemiLight = new THREE.HemisphereLight(0xfff5e6, 0x0c3429, 0.95);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff4e2, 2.15);
    keyLight.position.set(2.6, 4.1, 3.3);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 12;
    keyLight.shadow.camera.left = -2;
    keyLight.shadow.camera.right = 2;
    keyLight.shadow.camera.top = 2.5;
    keyLight.shadow.camera.bottom = -0.5;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xd9f2ec, 0.75);
    fillLight.position.set(-2.8, 1.8, 2.2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xc59b43, 1.25);
    rimLight.position.set(-2.2, 2.5, -2.7);
    scene.add(rimLight);

    const skinTexture = createSkinTexture();
    const ihramTexture = createWovenFabricTexture();

    // Pedestal base grounded at y = 0
    const pedestalGroup = new THREE.Group();
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0f3b2f,
      roughness: 0.42,
      metalness: 0.32,
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xc59b43,
      roughness: 0.26,
      metalness: 0.85,
    });
    const ihramMat = new THREE.MeshStandardMaterial({
      color: 0xfaf7ef,
      map: ihramTexture,
      roughness: 0.85,
      metalness: 0.02,
    });
    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x26211d,
      roughness: 0.82,
      metalness: 0.05,
    });

    const baseDisc = new THREE.Mesh(
      new THREE.CylinderGeometry(0.68, 0.74, 0.06, 48),
      baseMat
    );
    baseDisc.position.y = 0.03;
    baseDisc.receiveShadow = !isSoftwareGl;
    pedestalGroup.add(baseDisc);

    const goldRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.68, 0.014, 16, 64),
      goldMat
    );
    goldRing.rotation.x = Math.PI / 2;
    goldRing.position.y = 0.062;
    pedestalGroup.add(goldRing);

    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(64, 64, 6, 64, 64, 60);
      grad.addColorStop(0, 'rgba(0,0,0,0.55)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 128, 128);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    shadowTex.colorSpace = THREE.SRGBColorSpace;
    const contactPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(1.15, 1.15),
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        depthWrite: false,
        opacity: 0.65,
      })
    );
    contactPlane.rotation.x = -Math.PI / 2;
    contactPlane.position.y = 0.064;
    pedestalGroup.add(contactPlane);
    scene.add(pedestalGroup);

    // Realistic Sculpted Anatomical Human Figure
    const bodyGroup = new THREE.Group();
    bodyGroup.position.y = 0.06;

    const partMaterials = new Map<BodyPartId, THREE.MeshPhysicalMaterial>();
    const clickableMeshes: THREE.Mesh[] = [];
    const decorativeMeshes: THREE.Mesh[] = [];

    const createPartMaterial = (partId: BodyPartId) => {
      const mat = new THREE.MeshPhysicalMaterial({
        color: 0xe8c4ad,
        map: skinTexture,
        roughness: 0.54,
        metalness: 0.02,
        clearcoat: 0.07,
        clearcoatRoughness: 0.72,
        emissive: new THREE.Color(0x000000),
        emissiveIntensity: 0,
      });
      partMaterials.set(partId, mat);
      return mat;
    };

    const registerMesh = (
      geo: THREE.BufferGeometry,
      partId: BodyPartId,
      pos: [number, number, number],
      rot?: [number, number, number],
      scale?: [number, number, number]
    ) => {
      let mat = partMaterials.get(partId);
      if (!mat) mat = createPartMaterial(partId);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...pos);
      if (rot) mesh.rotation.set(...rot);
      if (scale) mesh.scale.set(...scale);
      mesh.castShadow = !isSoftwareGl;
      mesh.receiveShadow = !isSoftwareGl;
      mesh.userData.partId = partId;
      mesh.layers.enable(1);
      clickableMeshes.push(mesh);
      bodyGroup.add(mesh);
      return mesh;
    };

    const addDecor = (
      geo: THREE.BufferGeometry,
      mat: THREE.Material,
      pos: [number, number, number],
      rot?: [number, number, number],
      scale?: [number, number, number]
    ) => {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...pos);
      if (rot) mesh.rotation.set(...rot);
      if (scale) mesh.scale.set(...scale);
      mesh.castShadow = !isSoftwareGl;
      mesh.receiveShadow = !isSoftwareGl;
      decorativeMeshes.push(mesh);
      bodyGroup.add(mesh);
      return mesh;
    };

    // 1. HEAD & FACE (Sculpted Cranium + Chin/Jaw + Facial Features + Ears)
    const headGeo = createLatheFromSpline([
      [0.001, -0.135],
      [0.048, -0.12],
      [0.082, -0.068],
      [0.098, 0.0],
      [0.105, 0.055],
      [0.092, 0.105],
      [0.054, 0.135],
      [0.001, 0.145],
    ]);
    registerMesh(headGeo, 'head', [0, 1.66, 0.005], undefined, [0.92, 1.0, 1.05]);
    // Nasal bridge & tip
    registerMesh(new THREE.CapsuleGeometry(0.013, 0.032, 6, 12), 'head', [0, 1.655, 0.104], [-0.26, 0, 0]);
    // Brow ridge
    registerMesh(new THREE.CapsuleGeometry(0.011, 0.068, 6, 12), 'head', [0, 1.69, 0.094], [0, 0, Math.PI / 2]);
    // Sculpted Left & Right Ears
    registerMesh(new THREE.SphereGeometry(0.025, 14, 14), 'head', [0.095, 1.66, -0.012], [0, 0, -0.15], [0.42, 1.18, 0.72]);
    registerMesh(new THREE.SphereGeometry(0.025, 14, 14), 'head', [-0.095, 1.66, -0.012], [0, 0, 0.15], [0.42, 1.18, 0.72]);
    // Hairline / scalp cap for natural realism
    addDecor(
      new THREE.SphereGeometry(0.106, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.56),
      hairMat,
      [0, 1.675, -0.008],
      [-0.25, 0, 0],
      [0.92, 1.0, 1.04]
    );

    // 2. NECK, TRAPEZIUS & SHOULDERS
    const neckGeo = createLatheFromSpline([
      [0.072, -0.07],
      [0.056, -0.02],
      [0.052, 0.03],
      [0.058, 0.075],
    ]);
    registerMesh(neckGeo, 'neck', [0, 1.495, -0.005]);
    // Trapezius & Clavicle Shoulder Yoke
    registerMesh(new THREE.CapsuleGeometry(0.058, 0.30, 12, 24), 'neck', [0, 1.405, -0.005], [0, 0, Math.PI / 2], [1, 1, 0.85]);
    // Deltoid shoulder caps
    registerMesh(new THREE.SphereGeometry(0.074, 20, 18), 'neck', [0.215, 1.385, -0.005], undefined, [0.95, 1.05, 0.92]);
    registerMesh(new THREE.SphereGeometry(0.074, 20, 18), 'neck', [-0.215, 1.385, -0.005], undefined, [0.95, 1.05, 0.92]);

    // 3. CHEST (Sculpted Ribcage + Pectoral Contour)
    const chestGeo = createLatheFromSpline([
      [0.145, -0.125],
      [0.162, -0.05],
      [0.184, 0.03],
      [0.188, 0.095],
      [0.165, 0.135],
    ]);
    registerMesh(chestGeo, 'chest', [0, 1.255, 0.024], undefined, [1.06, 1.0, 0.68]);
    // Pectoral anterior contours
    registerMesh(new THREE.SphereGeometry(0.092, 18, 16), 'chest', [0.075, 1.275, 0.088], undefined, [1.05, 0.82, 0.45]);
    registerMesh(new THREE.SphereGeometry(0.092, 18, 16), 'chest', [-0.075, 1.275, 0.088], undefined, [1.05, 0.82, 0.45]);

    // 4. ABDOMEN & WAIST
    const abdomenGeo = createLatheFromSpline([
      [0.164, -0.12],
      [0.148, -0.04],
      [0.145, 0.04],
      [0.155, 0.12],
    ]);
    registerMesh(abdomenGeo, 'abdomen', [0, 1.02, 0.022], undefined, [1.04, 1.0, 0.66]);

    // 5. BACK & SPINE (Sculpted Dorsal Thorax + Scapulae)
    const backGeo = createLatheFromSpline([
      [0.148, -0.20],
      [0.142, -0.08],
      [0.166, 0.06],
      [0.172, 0.16],
      [0.140, 0.21],
    ]);
    registerMesh(backGeo, 'back', [0, 1.15, -0.042], undefined, [1.05, 1.0, 0.52]);
    // Subtle posterior scapulae musculature
    registerMesh(new THREE.SphereGeometry(0.084, 16, 14), 'back', [0.078, 1.27, -0.082], [0.1, 0, -0.12], [0.95, 1.15, 0.42]);
    registerMesh(new THREE.SphereGeometry(0.084, 16, 14), 'back', [-0.078, 1.27, -0.082], [0.1, 0, 0.12], [0.95, 1.15, 0.42]);

    // Modest Pilgrim Ihram Waist-Wrap (Izar) + Gold Belt Trim (decorative only, keeps limbs/abdomen clickable)
    const ihramWrapGeo = createLatheFromSpline([
      [0.188, -0.14],
      [0.184, -0.05],
      [0.176, 0.04],
      [0.168, 0.10],
    ]);
    addDecor(ihramWrapGeo, ihramMat, [0, 0.84, 0.005], undefined, [1.06, 1.0, 0.72]);
    addDecor(new THREE.CylinderGeometry(0.175, 0.178, 0.028, 32), goldMat, [0, 0.925, 0.005], undefined, [1.06, 1.0, 0.72]);

    // Helper for sculpted arms + hands with thumb & fingers
    const buildArm = (side: 'left_arm' | 'right_arm', sign: 1 | -1) => {
      const upperArmGeo = createLatheFromSpline([
        [0.039, -0.135],
        [0.046, -0.05],
        [0.052, 0.04],
        [0.054, 0.115],
        [0.042, 0.14],
      ]);
      registerMesh(upperArmGeo, side, [sign * 0.255, 1.24, 0.0], [0, 0, -sign * 0.14]);

      // Elbow joint contour
      registerMesh(new THREE.SphereGeometry(0.041, 16, 14), side, [sign * 0.278, 1.10, 0.012]);

      const forearmGeo = createLatheFromSpline([
        [0.028, -0.13],
        [0.034, -0.04],
        [0.042, 0.05],
        [0.040, 0.12],
      ]);
      registerMesh(forearmGeo, side, [sign * 0.305, 0.965, 0.036], [-0.22, 0, -sign * 0.08]);

      // Palm + Thumb + Fingers
      registerMesh(new THREE.BoxGeometry(0.044, 0.072, 0.024), side, [sign * 0.328, 0.81, 0.07], [-0.22, 0, -sign * 0.06], [1, 1, 1]);
      registerMesh(new THREE.CapsuleGeometry(0.010, 0.026, 6, 10), side, [sign * 0.305, 0.815, 0.088], [-0.4, 0, sign * 0.5]);
      // Finger bank
      for (let f = -1.5; f <= 1.5; f += 1) {
        registerMesh(
          new THREE.CapsuleGeometry(0.0065, 0.034, 6, 8),
          side,
          [sign * 0.328, 0.752, 0.076 + f * 0.008],
          [-0.22, 0, -sign * 0.05]
        );
      }
    };

    buildArm('left_arm', 1);
    buildArm('right_arm', -1);

    // Helper for sculpted thigh + knee + calf + contoured foot with toes
    const buildLeg = (legPart: 'left_leg' | 'right_leg', sign: 1 | -1) => {
      const thighGeo = createLatheFromSpline([
        [0.058, -0.19],
        [0.068, -0.08],
        [0.081, 0.04],
        [0.086, 0.16],
        [0.074, 0.20],
      ]);
      registerMesh(thighGeo, legPart, [sign * 0.105, 0.65, 0.0], undefined, [1.0, 1.0, 1.04]);

      // Anatomical Knee Patella
      registerMesh(new THREE.SphereGeometry(0.058, 18, 16), legPart, [sign * 0.105, 0.455, 0.012], undefined, [0.95, 1.08, 0.96]);

      const calfGeo = createLatheFromSpline([
        [0.038, -0.19],
        [0.046, -0.09],
        [0.060, 0.04],
        [0.056, 0.14],
        [0.052, 0.19],
      ]);
      registerMesh(calfGeo, legPart, [sign * 0.105, 0.265, -0.004]);

      // Feet & Ankles (grounded cleanly on pedestal top y = 0 in bodyGroup)
      registerMesh(new THREE.SphereGeometry(0.044, 16, 14), 'feet', [sign * 0.105, 0.075, -0.005], undefined, [0.92, 0.95, 1.02]);
      // Heel & Midfoot arch
      registerMesh(new THREE.CapsuleGeometry(0.042, 0.105, 10, 16), 'feet', [sign * 0.105, 0.036, 0.035], [Math.PI / 2, 0, 0], [1.05, 1.0, 0.72]);
      // Sculpted Forefoot & Toes
      for (let tIdx = 0; tIdx < 5; tIdx++) {
        const xOff = sign * (0.075 + tIdx * 0.015);
        const zLen = 0.125 - tIdx * 0.005;
        registerMesh(
          new THREE.CapsuleGeometry(0.0085, 0.022, 6, 10),
          'feet',
          [xOff, 0.024, zLen],
          [Math.PI / 2, 0, 0]
        );
      }
    };

    buildLeg('left_leg', 1);
    buildLeg('right_leg', -1);

    scene.add(bodyGroup);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    let targetCamPos: THREE.Vector3 | null = null;
    let lastFrameTime = performance.now();

    controls.addEventListener('start', () => {
      targetCamPos = null;
    });

    let frameId = 0;
    let renderBusy = false;
    let renderDirty = false;
    let disposed = false;

    const updatePartAppearance = () => {
      const activeSelected = selectedPartRef.current;
      const activeHovered = hoveredPartRef.current;
      partMaterials.forEach((mat, id) => {
        if (id === activeSelected) {
          mat.color.setHex(0xef4444);
          mat.emissive.setHex(0x991b1b);
          mat.emissiveIntensity = 0.42;
          mat.roughness = 0.34;
        } else if (id === activeHovered) {
          mat.color.setHex(0xfbbf24);
          mat.emissive.setHex(0xb45309);
          mat.emissiveIntensity = 0.25;
          mat.roughness = 0.38;
        } else {
          mat.color.setHex(0xe8c4ad);
          mat.emissive.setHex(0x000000);
          mat.emissiveIntensity = 0;
          mat.roughness = 0.54;
        }
      });
    };

    const afterDraw = (cb: () => void) => {
      try {
        const gl = renderer.getContext() as WebGL2RenderingContext;
        if (!gl || !gl.fenceSync) {
          frameId = window.setTimeout(cb, 80);
          return;
        }
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (disposed) return;
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 80);
          }
        };
        frameId = window.setTimeout(poll, 5);
      } catch {
        frameId = window.setTimeout(cb, 80);
      }
    };

    const requestRender = () => {
      if (disposed) return;
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame(() => {
        if (disposed) return;
        renderDirty = false;
        const nowTime = performance.now();
        const delta = Math.min((nowTime - lastFrameTime) / 1000, 0.05);
        lastFrameTime = nowTime;

        if (targetCamPos) {
          camera.position.x = THREE.MathUtils.damp(
            camera.position.x,
            targetCamPos.x,
            7,
            delta || 0.016
          );
          camera.position.y = THREE.MathUtils.damp(
            camera.position.y,
            targetCamPos.y,
            7,
            delta || 0.016
          );
          camera.position.z = THREE.MathUtils.damp(
            camera.position.z,
            targetCamPos.z,
            7,
            delta || 0.016
          );
          if (camera.position.distanceTo(targetCamPos) < 0.015) {
            camera.position.copy(targetCamPos);
            targetCamPos = null;
          } else {
            renderDirty = true;
          }
        }

        const stillDamping = controls.update();
        if (stillDamping && !isSoftwareGl) {
          renderDirty = true;
        }

        updatePartAppearance();
        renderer.render(scene, camera);

        const done = () => {
          renderBusy = false;
          if (renderDirty && !disposed) requestRender();
        };
        if (isSoftwareGl) afterDraw(done);
        else done();
      });
    };

    requestRenderRef.current = requestRender;
    setCameraTargetRef.current = (pos: THREE.Vector3) => {
      targetCamPos = pos.clone();
      requestRender();
    };

    controls.addEventListener('change', () => {
      requestRender();
    });

    let downX = 0;
    let downY = 0;
    let lastHoverCheck = 0;

    const updateMouseNDC = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      _mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      _mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    };

    const pickBodyPart = (clientX: number, clientY: number): BodyPartId | null => {
      updateMouseNDC(clientX, clientY);
      _raycaster.layers.set(1);
      _raycaster.setFromCamera(_mouse, camera);
      const hits = _raycaster.intersectObjects(clickableMeshes, false);
      if (hits.length > 0) {
        return (hits[0].object.userData.partId as BodyPartId) || null;
      }
      return null;
    };

    const onPointerDown = (e: PointerEvent) => {
      downX = e.clientX;
      downY = e.clientY;
    };

    const onPointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - downX, e.clientY - downY);
      if (dist > 6) return;
      const hitPart = pickBodyPart(e.clientX, e.clientY);
      if (hitPart) {
        onSelectRef.current(hitPart === selectedPartRef.current ? null : hitPart);
        requestRender();
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastHoverCheck < 50) return;
      lastHoverCheck = now;
      const hitPart = pickBodyPart(e.clientX, e.clientY);
      if (hitPart !== hoveredPartRef.current) {
        hoveredPartRef.current = hitPart;
        setHoveredPart(hitPart);
        canvas.style.cursor = hitPart ? 'pointer' : 'grab';
        requestRender();
      }
    };

    const onPointerLeave = () => {
      if (hoveredPartRef.current !== null) {
        hoveredPartRef.current = null;
        setHoveredPart(null);
        canvas.style.cursor = 'grab';
        requestRender();
      }
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerleave', onPointerLeave);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 420;
      const h = container.clientHeight || 420;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      requestRender();
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    requestRender();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);

      controls.dispose();
      envTex.dispose();
      shadowTex.dispose();
      skinTexture.dispose();
      ihramTexture.dispose();
      clickableMeshes.forEach((m) => m.geometry.dispose());
      decorativeMeshes.forEach((m) => m.geometry.dispose());
      partMaterials.forEach((m) => m.dispose());
      baseDisc.geometry.dispose();
      goldRing.geometry.dispose();
      contactPlane.geometry.dispose();
      baseMat.dispose();
      goldMat.dispose();
      ihramMat.dispose();
      hairMat.dispose();
      renderer.dispose();
    };
  }, []);

  const activePartLabel = selectedPart
    ? BODY_PART_LABELS[selectedPart][language]
    : hoveredPart
    ? BODY_PART_LABELS[hoveredPart][language]
    : null;

  return (
    <div className="a11y-surface bg-white border-2 border-[#DDD4C2] rounded-xl overflow-hidden shadow-xs">
      {/* Section Header */}
      <div className="px-5 py-4 bg-[#0D5240] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-[#B58E46]">
        <div>
          <h2 className="font-display text-base sm:text-lg font-bold text-white">
            {t.body3DTitle}
          </h2>
          <p className="text-xs text-slate-200 mt-0.5">{t.body3DHint}</p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="text-[#E6C77A]">{t.selectedAreaLabel}</span>
          <span className="text-white">
            {selectedPart
              ? BODY_PART_LABELS[selectedPart][language]
              : t.noAreaSelected}
          </span>
        </div>
      </div>

      {/* 3D Viewport Container */}
      <div className="relative w-full h-[390px] sm:h-[440px] bg-[#072D23]">
        {webglError ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white space-y-3 bg-[#083D2F]">
            <p className="font-display font-bold text-base text-[#E6C77A]">{t.body3DTitle}</p>
            <p className="font-medium text-sm max-w-md text-slate-200">{t.body3DHint}</p>
            <div className="bg-[#06221A] border border-[#B58E46]/60 rounded-lg px-4 py-2 text-xs text-slate-100">
              {t.selectedAreaLabel}{' '}
              <strong className="text-[#E6C77A]">
                {selectedPart
                  ? BODY_PART_LABELS[selectedPart][language]
                  : t.noAreaSelected}
              </strong>
            </div>
          </div>
        ) : (
          <div ref={mountRef} className="w-full h-full" />
        )}

        {/* Top-Center Readout Strip (Solid surface, no backdrop-blur over WebGL) */}
        {activePartLabel && (
          <div className="pointer-events-none absolute top-3 inset-x-0 flex justify-center px-3 z-10">
            <div className="bg-[#083D2F] border border-[#E6C77A] text-white text-xs font-bold px-3.5 py-1.5 rounded-lg shadow-md">
              {activePartLabel}
            </div>
          </div>
        )}

        {/* Collapsible Bottom Control Dock (Zero Viewport Occlusion) */}
        <div className="absolute bottom-3 inset-x-0 flex flex-col items-center px-3 z-10 pointer-events-none">
          <button
            type="button"
            onClick={() => setControlsCollapsed((prev) => !prev)}
            className="pointer-events-auto mb-1.5 px-3 py-1 rounded-md bg-[#083D2F] border border-[#B58E46]/70 text-[#E6C77A] text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-[#0D5240] transition-colors"
          >
            {controlsCollapsed ? (
              <>
                <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t.showControls}</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t.hideControls}</span>
              </>
            )}
          </button>

          {!controlsCollapsed && (
            <div className="pointer-events-auto bg-[#083D2F] border border-[#B58E46]/70 rounded-xl p-1.5 flex flex-wrap items-center justify-center gap-1.5 shadow-lg">
              <button
                type="button"
                onClick={() => setCameraTargetRef.current?.(FRONT_CAM_POS)}
                className="btn-interactive min-h-[38px] px-3 py-1.5 text-xs font-semibold text-white bg-[#0D5240] hover:bg-[#146D55] rounded-lg cursor-pointer whitespace-nowrap"
              >
                {t.viewFront}
              </button>
              <button
                type="button"
                onClick={() => setCameraTargetRef.current?.(BACK_CAM_POS)}
                className="btn-interactive min-h-[38px] px-3 py-1.5 text-xs font-semibold text-white bg-[#0D5240] hover:bg-[#146D55] rounded-lg cursor-pointer whitespace-nowrap"
              >
                {t.viewBack}
              </button>
              <button
                type="button"
                onClick={() => setCameraTargetRef.current?.(SIDE_CAM_POS)}
                className="btn-interactive min-h-[38px] px-3 py-1.5 text-xs font-semibold text-white bg-[#0D5240] hover:bg-[#146D55] rounded-lg cursor-pointer whitespace-nowrap"
              >
                {t.viewSide}
              </button>
              <button
                type="button"
                onClick={() => setCameraTargetRef.current?.(DEFAULT_CAM_POS)}
                className="btn-interactive min-h-[38px] px-3 py-1.5 text-xs font-semibold text-[#E6C77A] hover:bg-[#0D5240] rounded-lg flex items-center gap-1 cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t.viewReset}</span>
              </button>
              {selectedPart && (
                <button
                  type="button"
                  onClick={() => onSelectPart(null)}
                  className="btn-interactive min-h-[38px] px-3 py-1.5 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-lg flex items-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  <Undo2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{t.clearAreaBtn}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Accessible Quick Body-Part Buttons below the 3D viewport */}
      <div className="p-4 bg-[#FAF8F4] border-t border-[#DDD4C2]">
        <div className="flex flex-wrap gap-1.5">
          {ALL_BODY_PARTS.map((partId) => {
            const isSelected = selectedPart === partId;
            return (
              <button
                key={partId}
                type="button"
                onClick={() => onSelectPart(isSelected ? null : partId)}
                aria-pressed={isSelected}
                className={`btn-interactive min-h-[42px] px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-red-700 text-white border-red-800 shadow-sm ring-2 ring-red-700/25'
                    : 'bg-white text-[#111D18] border-[#DDD4C2] hover:border-[#0D5240] hover:bg-[#F2EDE2]'
                }`}
              >
                {BODY_PART_LABELS[partId][language]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
