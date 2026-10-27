import { useEffect, useRef, useState } from "react";

export interface Terrarium3DShowcaseProps {
  lightActive?: boolean;
  onLightChange?: (active: boolean) => void;
  mistActive?: boolean;
  onMistChange?: (active: boolean) => void;
  lidStyle?: "smooth" | "ridged";
  selectedIds?: string[];
  fallbackPhotoUrl?: string;
  captionTitle?: string;
  captionPrice?: string;
  compact?: boolean;
}

type ViewMode = "webgl" | "photo";

export default function Terrarium3DShowcase({
  lightActive: controlledLight,
  onLightChange,
  mistActive: controlledMist,
  onMistChange,
  lidStyle: controlledLidStyle,
  selectedIds = ["jar_smooth", "volcanic", "fern", "fittonia", "moss", "wood", "light", "mist"],
  fallbackPhotoUrl = "https://images.unsplash.com/photo-1603451670728-e8b944dae5a9?auto=format&fit=crop&w=1600&q=88",
  captionTitle = "Interactive 3D Showcase",
  captionPrice = "Drag to rotate · Scroll to zoom",
  compact = false,
}: Terrarium3DShowcaseProps) {
  const [internalLight, setInternalLight] = useState(true);
  const [internalMist, setInternalMist] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("webgl");
  const [webglStatus, setWebglStatus] = useState<"loading" | "ready" | "fallback">("loading");

  const lightOn = controlledLight ?? internalLight;
  const mistOn = controlledMist ?? internalMist;
  const lidStyle =
    controlledLidStyle ?? (selectedIds.includes("jar_ridged") ? "ridged" : "smooth");

  const setLightOn = (next: boolean) => {
    setInternalLight(next);
    onLightChange?.(next);
  };
  const setMistOn = (next: boolean) => {
    setInternalMist(next);
    onMistChange?.(next);
  };

  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef({ lightOn, mistOn, lidStyle, selectedIds, viewMode });
  stateRef.current = { lightOn, mistOn, lidStyle, selectedIds, viewMode };

  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    let disposed = false;
    let animationFrameId = 0;
    let rendererInstance: any = null;

    async function initThree() {
      try {
        // Loaded on demand from the bundled three package, so the 3D code stays out of the first page load.
        // Typed loosely: this scene code predates strict typing of the three.js API.
        const [THREE, { GLTFLoader }, { OrbitControls }] = (await Promise.all([
          import("three"),
          import("three/examples/jsm/loaders/GLTFLoader.js"),
          import("three/examples/jsm/controls/OrbitControls.js"),
        ])) as [any, any, any];

        if (disposed || !container) return;

        const width = container.clientWidth || 600;
        const height = container.clientHeight || 540;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
        camera.position.set(6.85, 3.1, 6.85);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        rendererInstance = renderer;
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.25;

        container.innerHTML = "";
        container.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.06;
        controls.enablePan = false;
        controls.minDistance = 4.0;
        controls.maxDistance = 12.0;
        controls.maxPolarAngle = Math.PI * 0.56;
        controls.minPolarAngle = Math.PI * 0.08;
        controls.target.set(0, 1.85, 0);
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.6;

        // Soft Studio + Botanical Lighting
        const ambient = new THREE.AmbientLight(0xf0ede3, 1.65);
        scene.add(ambient);

        const keyLight = new THREE.DirectionalLight(0xfff5e4, 2.2);
        keyLight.position.set(4, 6, 4);
        scene.add(keyLight);

        const rimLight = new THREE.DirectionalLight(0x88d4ab, 1.35);
        rimLight.position.set(-4, 3, -3);
        scene.add(rimLight);

        // Warm Canopy LED Light inside the Under-Lid Unit
        const circadianLight = new THREE.PointLight(0xffd280, 4.2, 5.0, 1.5);
        circadianLight.position.set(0.15, 2.75, 0.1);
        scene.add(circadianLight);

        // Create a soft radial Gaussian cloud texture so fog looks like billowing vapor, not snow!
        const fogCanvas = document.createElement("canvas");
        fogCanvas.width = 128;
        fogCanvas.height = 128;
        const ctx = fogCanvas.getContext("2d");
        if (ctx) {
          const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 62);
          grad.addColorStop(0, "rgba(244, 250, 247, 0.55)");
          grad.addColorStop(0.35, "rgba(236, 246, 241, 0.28)");
          grad.addColorStop(0.7, "rgba(228, 242, 236, 0.08)");
          grad.addColorStop(1, "rgba(228, 242, 236, 0)");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, 128, 128);
        }
        const fogTexture = new THREE.CanvasTexture(fogCanvas);

        // Soft Volumetric-style Cloud Puffs (28 large overlapping vapor clouds instead of small snow dots)
        const cloudCount = 28;
        const mistGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(cloudCount * 3);
        const driftSeeds = new Float32Array(cloudCount);
        for (let i = 0; i < cloudCount; i++) {
          const t = i / cloudCount;
          const r = (0.08 + t * 0.58) * (0.7 + Math.random() * 0.4);
          const theta = i * 2.399 + Math.random() * 0.5;
          positions[i * 3] = Math.cos(theta) * r;
          positions[i * 3 + 1] = 1.05 + (1 - t) * 1.75;
          positions[i * 3 + 2] = Math.sin(theta) * r;
          driftSeeds[i] = Math.random() * Math.PI * 2;
        }
        mistGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

        const mistMat = new THREE.PointsMaterial({
          map: fogTexture,
          color: 0xf2faf6,
          size: 1.55,
          transparent: true,
          opacity: 0.34,
          depthWrite: false,
          blending: THREE.NormalBlending,
        });
        const mistClouds = new THREE.Points(mistGeo, mistMat);
        scene.add(mistClouds);

        // Load Blender MCP exported GLB (/models/terrarium-hero.glb)
        const loader = new GLTFLoader();
        const ridgeMeshes: any[] = [];

        loader.load(
          "/models/terrarium-hero.glb?v=5",
          (gltf: any) => {
            if (disposed) return;
            const root = gltf.scene;

            root.traverse((obj: any) => {
              if (obj.name === "Hardware_Power_Cord" && obj.isMesh) {
                obj.material = new THREE.MeshStandardMaterial({
                  color: 0xf6f4ee,
                  roughness: 0.65,
                  metalness: 0.02,
                  emissive: 0xf6f4ee,
                  emissiveIntensity: 0.2,
                });
              }
              if (obj.name && obj.name.startsWith("Hardware_Lid_Ridge_")) {
                ridgeMeshes.push(obj);
                obj.visible = stateRef.current.lidStyle === "ridged";
                if (obj.isMesh) {
                  obj.castShadow = false;
                  obj.receiveShadow = false;
                  obj.material = new THREE.MeshStandardMaterial({
                    color: 0xf6f4ee,
                    roughness: 0.82,
                    metalness: 0.01,
                    emissive: 0xf6f4ee,
                    emissiveIntensity: 0.28,
                  });
                }
              }
              if (obj.name === "Vessel_Circular_Glass" && obj.isMesh) {
                obj.material = new THREE.MeshPhysicalMaterial({
                  color: 0xebf7f2,
                  transparent: true,
                  opacity: 0.24,
                  roughness: 0.05,
                  metalness: 0.04,
                  transmission: 0.85,
                  thickness: 0.16,
                  ior: 1.48,
                  depthWrite: false,
                });
              }
            });

            scene.add(root);
            setWebglStatus("ready");
          },
          undefined,
          () => {
            if (!disposed) {
              setWebglStatus("fallback");
              setViewMode("photo");
            }
          }
        );

        const handleResize = () => {
          if (!container || disposed) return;
          const w = container.clientWidth || 600;
          const h = container.clientHeight || 540;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        };
        window.addEventListener("resize", handleResize);

        let clockTime = 0;
        const animate = () => {
          if (disposed) return;
          animationFrameId = requestAnimationFrame(animate);

          if (stateRef.current.viewMode === "photo") {
            return;
          }

          clockTime += 0.012;

          const {
            lightOn: isLight,
            mistOn: isMist,
            lidStyle: currentLidStyle,
          } = stateRef.current;

          const showRidges = currentLidStyle === "ridged";
          for (let i = 0; i < ridgeMeshes.length; i++) {
            ridgeMeshes[i].visible = showRidges;
          }

          // Smoothly adjust warm LED glow
          const targetIntensity = isLight ? 4.5 : 0.15;
          circadianLight.intensity += (targetIntensity - circadianLight.intensity) * 0.08;

          // Smoothly billow & drift the soft fog clouds inside the jar
          const targetMistOpacity = isMist ? 0.36 : 0.0;
          mistMat.opacity += (targetMistOpacity - mistMat.opacity) * 0.06;

          if (mistMat.opacity > 0.01) {
            const posAttr = mistGeo.getAttribute("position");
            for (let i = 0; i < cloudCount; i++) {
              const seed = driftSeeds[i];
              let py = posAttr.getY(i) - 0.0022;
              if (py < 1.05) {
                py = 2.76;
              }
              const progress = Math.max(0, Math.min(1, (2.76 - py) / 1.71));
              const spreadRadius = 0.08 + progress * 0.62;
              const angle = seed + clockTime * 0.35 + i * 0.4;
              posAttr.setXYZ(
                i,
                Math.cos(angle) * spreadRadius,
                py,
                Math.sin(angle) * spreadRadius
              );
            }
            posAttr.needsUpdate = true;
          }

          controls.update();
          renderer.render(scene, camera);
        };
        animate();

        return () => {
          window.removeEventListener("resize", handleResize);
        };
      } catch {
        if (!disposed) {
          setWebglStatus("fallback");
          setViewMode("photo");
        }
      }
    }

    initThree();

    return () => {
      disposed = true;
      cancelAnimationFrame(animationFrameId);
      if (rendererInstance) {
        rendererInstance.dispose();
      }
    };
  }, []);

  return (
    <div
      className={`terrarium-showcase ${compact ? "compact" : ""} ${lightOn ? "light-active" : "light-dim"}`}
    >
      {/* Simplified, Friendly Controls: Just "3D" and "Studio" + "Fogger" and "LED" */}
      <div className="showcase-toolbar">
        <div className="mode-pill-group" role="tablist" aria-label="Showcase mode">
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === "webgl"}
            className={viewMode === "webgl" ? "active" : ""}
            onClick={() => setViewMode("webgl")}
          >
            3D
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === "photo"}
            className={viewMode === "photo" ? "active" : ""}
            onClick={() => setViewMode("photo")}
          >
            Studio
          </button>
        </div>

        <div className="hardware-toggles">
          <button
            type="button"
            className={`hw-chip ${mistOn ? "on" : ""}`}
            onClick={() => setMistOn(!mistOn)}
          >
            <span className="dot mist" />
            Fogger
          </button>
          <button
            type="button"
            className={`hw-chip ${lightOn ? "on" : ""}`}
            onClick={() => setLightOn(!lightOn)}
          >
            <span className="dot warm" />
            LED
          </button>
        </div>
      </div>

      {/* Unified Stage Frame: Both layers stay mounted so toggling 3D <-> Studio is instant */}
      <div className="webgl-stage">
        <div
          className={`webgl-layer-wrap ${viewMode === "webgl" ? "is-active" : "is-hidden"}`}
        >
          <div ref={canvasContainerRef} className="webgl-canvas-mount" />
          {webglStatus === "loading" && (
            <div className="webgl-loading">
              <img
                src="/renders/terrarium-assembled.png?v=5"
                alt="3D Terrarium preview"
              />
              <span>Loading 3D Model…</span>
            </div>
          )}
          <div className="webgl-hint">Drag to rotate · Scroll to zoom</div>
        </div>

        <div
          className={`studio-photo-stage ${viewMode === "photo" ? "is-active" : "is-hidden"}`}
        >
          <img
            src={fallbackPhotoUrl}
            alt="A lush terrarium in a glass vessel"
            className={`studio-framed-photo ${lightOn ? "led-lit" : "led-dimmed"}`}
          />
          {mistOn && (
            <div className="studio-photo-fog" aria-hidden="true">
              <span className="fog-layer f1" />
              <span className="fog-layer f2" />
            </div>
          )}
          <div className="webgl-hint">Studio photography · Toggle Fogger & LED above</div>
        </div>
      </div>

      {/* Bottom Caption Bar */}
      <div className="image-caption">
        <span>{captionTitle}</span>
        <strong>{captionPrice}</strong>
      </div>
    </div>
  );
}
