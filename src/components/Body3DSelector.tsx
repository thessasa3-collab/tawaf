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

const DEFAULT_CAM_POS = new THREE.Vector3(0, 1.18, 3.05);
const FRONT_CAM_POS = new THREE.Vector3(0, 1.18, 3.05);
const BACK_CAM_POS = new THREE.Vector3(0, 1.18, -3.05);
const CAM_TARGET = new THREE.Vector3(0, 0.96, 0);

const _mouse = new THREE.Vector2();
const _raycaster = new THREE.Raycaster();

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

    // Software WebGL guard
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
    renderer.toneMappingExposure = 1.08;
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
    scene.background = new THREE.Color(0x09241c);
    scene.fog = new THREE.FogExp2(0x09241c, 0.085);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTex = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 30);
    camera.position.copy(DEFAULT_CAM_POS);

    const controls = new OrbitControls(camera, canvas);
    controls.target.copy(CAM_TARGET);
    controls.enablePan = false;
    controls.minDistance = 1.9;
    controls.maxDistance = 4.6;
    controls.minPolarAngle = 0.35;
    controls.maxPolarAngle = Math.PI * 0.62;
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.08;
    controls.update();

    // 3-point balanced studio lighting
    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x102a22, 0.9);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff5e4, 2.1);
    keyLight.position.set(2.8, 4.2, 3.2);
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

    const rimLight = new THREE.DirectionalLight(0xc59b43, 1.35);
    rimLight.position.set(-2.6, 2.4, -2.5);
    scene.add(rimLight);

    // Pedestal base grounded at y = 0
    const pedestalGroup = new THREE.Group();
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x12392d,
      roughness: 0.45,
      metalness: 0.3,
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xc59b43,
      roughness: 0.25,
      metalness: 0.85,
    });
    const jointMat = new THREE.MeshStandardMaterial({
      color: 0xb08d44,
      roughness: 0.35,
      metalness: 0.72,
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

    // Contact shadow disc
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

    // Composite Anatomical Human Model (Group of sculpted parts)
    const bodyGroup = new THREE.Group();
    bodyGroup.position.y = 0.06;

    const partMaterials = new Map<BodyPartId, THREE.MeshStandardMaterial>();
    const clickableMeshes: THREE.Mesh[] = [];

    const createPartMaterial = (partId: BodyPartId) => {
      const mat = new THREE.MeshStandardMaterial({
        color: 0xe6ece9,
        roughness: 0.42,
        metalness: 0.08,
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

    // 1. Head & Face
    registerMesh(new THREE.SphereGeometry(0.135, 32, 24), 'head', [0, 1.66, 0], undefined, [0.92, 1.12, 0.98]);

    // 2. Neck & Shoulders
    registerMesh(new THREE.CylinderGeometry(0.058, 0.068, 0.12, 24), 'neck', [0, 1.49, 0]);
    registerMesh(
      new THREE.CapsuleGeometry(0.065, 0.31, 12, 20),
      'neck',
      [0, 1.40, 0],
      [0, 0, Math.PI / 2]
    );

    // 3. Chest (Anterior Thorax)
    registerMesh(
      new THREE.CylinderGeometry(0.195, 0.165, 0.25, 28),
      'chest',
      [0, 1.26, 0.025],
      undefined,
      [1.08, 1, 0.65]
    );

    // 4. Abdomen & Stomach
    registerMesh(
      new THREE.CylinderGeometry(0.162, 0.168, 0.24, 28),
      'abdomen',
      [0, 1.02, 0.025],
      undefined,
      [1.02, 1, 0.62]
    );

    // 5. Back & Spine (Posterior Thorax + Lumbar)
    registerMesh(
      new THREE.CapsuleGeometry(0.145, 0.34, 16, 24),
      'back',
      [0, 1.14, -0.055],
      undefined,
      [1.12, 1, 0.45]
    );

    // Pelvis structural connector (gold accent belt ring)
    const waistBand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.172, 0.175, 0.05, 28),
      baseMat
    );
    waistBand.position.set(0, 0.89, 0);
    waistBand.scale.set(1.02, 1, 0.68);
    bodyGroup.add(waistBand);

    // 6. Left Arm (viewer's right side in anatomical +X/+Z -> anatomical left is +X)
    registerMesh(new THREE.CapsuleGeometry(0.048, 0.21, 10, 18), 'left_arm', [0.275, 1.24, 0], [0, 0, -0.14]);
    registerMesh(new THREE.CapsuleGeometry(0.041, 0.21, 10, 18), 'left_arm', [0.315, 0.99, 0.03], [-0.18, 0, -0.08]);
    registerMesh(new THREE.SphereGeometry(0.048, 16, 16), 'left_arm', [0.33, 0.83, 0.06]);

    // 7. Right Arm (anatomical right is -X)
    registerMesh(new THREE.CapsuleGeometry(0.048, 0.21, 10, 18), 'right_arm', [-0.275, 1.24, 0], [0, 0, 0.14]);
    registerMesh(new THREE.CapsuleGeometry(0.041, 0.21, 10, 18), 'right_arm', [-0.315, 0.99, 0.03], [-0.18, 0, 0.08]);
    registerMesh(new THREE.SphereGeometry(0.048, 16, 16), 'right_arm', [-0.33, 0.83, 0.06]);

    // 8. Left Leg & Knee
    registerMesh(new THREE.CapsuleGeometry(0.072, 0.30, 12, 20), 'left_leg', [0.105, 0.68, 0]);
    registerMesh(new THREE.CapsuleGeometry(0.056, 0.28, 12, 20), 'left_leg', [0.105, 0.30, 0]);

    // 9. Right Leg & Knee
    registerMesh(new THREE.CapsuleGeometry(0.072, 0.30, 12, 20), 'right_leg', [-0.105, 0.68, 0]);
    registerMesh(new THREE.CapsuleGeometry(0.056, 0.28, 12, 20), 'right_leg', [-0.105, 0.30, 0]);

    // 10. Feet & Ankles
    registerMesh(new THREE.BoxGeometry(0.11, 0.065, 0.22), 'feet', [0.105, 0.045, 0.045]);
    registerMesh(new THREE.BoxGeometry(0.11, 0.065, 0.22), 'feet', [-0.105, 0.045, 0.045]);

    // Subtle metallic anatomical joint rings (knees, elbows, shoulders) for high-craft detail
    const jointCoords: [number, number, number][] = [
      [0.24, 1.38, 0],
      [-0.24, 1.38, 0],
      [0.295, 1.11, 0.01],
      [-0.295, 1.11, 0.01],
      [0.105, 0.49, 0],
      [-0.105, 0.49, 0],
    ];
    jointCoords.forEach(([jx, jy, jz]) => {
      const jointSphere = new THREE.Mesh(new THREE.SphereGeometry(0.036, 14, 14), jointMat);
      jointSphere.position.set(jx, jy, jz);
      bodyGroup.add(jointSphere);
    });

    scene.add(bodyGroup);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Camera transition state (exponentially damped, cancelled on manual drag)
    let targetCamPos: THREE.Vector3 | null = null;
    let lastFrameTime = performance.now();

    controls.addEventListener('start', () => {
      targetCamPos = null;
    });

    // Coalesced On-Demand Rendering Loop
    let frameId = 0;
    let renderBusy = false;
    let renderDirty = false;
    let disposed = false;

    const updatePartAppearance = () => {
      const activeSelected = selectedPartRef.current;
      const activeHovered = hoveredPartRef.current;
      partMaterials.forEach((mat, id) => {
        if (id === activeSelected) {
          mat.color.setHex(0xdc2626);
          mat.emissive.setHex(0x991b1b);
          mat.emissiveIntensity = 0.45;
          mat.roughness = 0.28;
        } else if (id === activeHovered) {
          mat.color.setHex(0xf59e0b);
          mat.emissive.setHex(0xb45309);
          mat.emissiveIntensity = 0.25;
          mat.roughness = 0.34;
        } else {
          mat.color.setHex(0xe6ece9);
          mat.emissive.setHex(0x000000);
          mat.emissiveIntensity = 0;
          mat.roughness = 0.42;
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

    // Pointer interaction (distinguish click vs orbit drag)
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
      if (dist > 6) return; // User dragged to orbit
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

    // Initial render
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
      clickableMeshes.forEach((m) => m.geometry.dispose());
      partMaterials.forEach((m) => m.dispose());
      baseDisc.geometry.dispose();
      goldRing.geometry.dispose();
      contactPlane.geometry.dispose();
      waistBand.geometry.dispose();
      baseMat.dispose();
      goldMat.dispose();
      jointMat.dispose();
      renderer.dispose();
    };
  }, []);

  const activePartLabel = selectedPart
    ? BODY_PART_LABELS[selectedPart][language]
    : hoveredPart
    ? BODY_PART_LABELS[hoveredPart][language]
    : null;

  return (
    <div className="bg-white border-2 border-slate-300 rounded-xl overflow-hidden shadow-xs">
      {/* Section Header */}
      <div className="px-5 py-4 bg-[#082D23] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-[#C59B43]">
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
      <div className="relative w-full h-[380px] sm:h-[430px] bg-[#09241C]">
        {webglError ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white space-y-3">
            <p className="font-semibold text-sm">{t.body3DHint}</p>
            <p className="text-xs text-slate-300">
              {t.selectedAreaLabel}{' '}
              {selectedPart
                ? BODY_PART_LABELS[selectedPart][language]
                : t.noAreaSelected}
            </p>
          </div>
        ) : (
          <div ref={mountRef} className="w-full h-full" />
        )}

        {/* Top-Center Readout Strip (Solid surface, no backdrop-blur over WebGL) */}
        {activePartLabel && (
          <div className="pointer-events-none absolute top-3 inset-x-0 flex justify-center px-3 z-10">
            <div className="bg-[#082D23]/95 border border-[#C59B43] text-white text-xs font-bold px-3.5 py-1.5 rounded-lg shadow-md">
              {activePartLabel}
            </div>
          </div>
        )}

        {/* Collapsible Bottom Control Dock (Zero Viewport Occlusion) */}
        <div className="absolute bottom-3 inset-x-0 flex flex-col items-center px-3 z-10 pointer-events-none">
          <button
            type="button"
            onClick={() => setControlsCollapsed((prev) => !prev)}
            className="pointer-events-auto mb-1.5 px-3 py-1 rounded-md bg-[#082D23] border border-[#C59B43]/70 text-[#E6C77A] text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-[#0D4435] transition-colors"
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
            <div className="pointer-events-auto bg-[#082D23]/95 border border-[#C59B43]/60 rounded-xl p-1.5 flex flex-wrap items-center justify-center gap-1.5 shadow-lg">
              <button
                type="button"
                onClick={() => setCameraTargetRef.current?.(FRONT_CAM_POS)}
                className="btn-interactive min-h-[38px] px-3 py-1.5 text-xs font-semibold text-white bg-[#0F4939] hover:bg-[#15634D] rounded-lg cursor-pointer whitespace-nowrap"
              >
                {t.viewFront}
              </button>
              <button
                type="button"
                onClick={() => setCameraTargetRef.current?.(BACK_CAM_POS)}
                className="btn-interactive min-h-[38px] px-3 py-1.5 text-xs font-semibold text-white bg-[#0F4939] hover:bg-[#15634D] rounded-lg cursor-pointer whitespace-nowrap"
              >
                {t.viewBack}
              </button>
              <button
                type="button"
                onClick={() => setCameraTargetRef.current?.(DEFAULT_CAM_POS)}
                className="btn-interactive min-h-[38px] px-3 py-1.5 text-xs font-semibold text-[#E6C77A] hover:bg-[#0F4939] rounded-lg flex items-center gap-1 cursor-pointer whitespace-nowrap"
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
      <div className="p-4 bg-slate-50 border-t border-slate-200">
        <div className="flex flex-wrap gap-1.5">
          {ALL_BODY_PARTS.map((partId) => {
            const isSelected = selectedPart === partId;
            return (
              <button
                key={partId}
                type="button"
                onClick={() => onSelectPart(isSelected ? null : partId)}
                aria-pressed={isSelected}
                className={`btn-interactive min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-red-700 text-white border-red-800 shadow-sm ring-2 ring-red-700/25'
                    : 'bg-white text-slate-800 border-slate-300 hover:border-[#082D23] hover:bg-slate-100'
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
