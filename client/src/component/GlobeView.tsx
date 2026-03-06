import { useEffect, useRef } from "react";
import createGlobe from "cobe";
import { CITIES } from "../lib/cityData";
import { useCity } from "../context/CityContext";

export default function GlobeView(): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { city, selectCity } = useCity();
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const phiRef = useRef(0);
  const focusRef = useRef<[number, number]>([
    city.lat * (Math.PI / 180),
    city.lng * (Math.PI / 180),
  ]);

  // Update focus when city changes
  useEffect(() => {
    focusRef.current = [
      city.lat * (Math.PI / 180),
      city.lng * (Math.PI / 180),
    ];
  }, [city]);

  useEffect(() => {
    let width = 0;
    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
      }
    };
    onResize();
    window.addEventListener("resize", onResize);

    // Build markers from city data
    const markers = CITIES.map((c) => ({
      location: [c.lat, c.lng] as [number, number],
      size: c.id === city.id ? 0.1 : 0.06,
    }));

    const globe = createGlobe(canvasRef.current!, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.25,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 2.5,
      baseColor: [0.04, 0.06, 0.12], // navy-900
      markerColor: [0.79, 0.66, 0.3], // gold
      glowColor: [0.04, 0.06, 0.12],
      markers,
      onRender: (state) => {
        // Auto-rotate when not dragging
        if (!pointerInteracting.current) {
          phiRef.current += 0.003;
        }

        // Smooth focus toward selected city
        const [targetTheta, targetPhi] = focusRef.current;
        state.phi = phiRef.current + pointerInteractionMovement.current;
        state.theta = targetTheta;

        state.width = width * 2;
        state.height = width * 2;

        // Update marker sizes for selection highlight
        state.markers = CITIES.map((c) => ({
          location: [c.lat, c.lng] as [number, number],
          size: c.id === city.id ? 0.1 : 0.06,
        }));
      },
    });

    return () => {
      globe.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, [city]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-full aspect-square max-w-[280px]">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          onPointerDown={(e) => {
            pointerInteracting.current = e.clientX - pointerInteractionMovement.current;
            canvasRef.current!.style.cursor = "grabbing";
          }}
          onPointerUp={() => {
            pointerInteracting.current = null;
            canvasRef.current!.style.cursor = "grab";
          }}
          onPointerOut={() => {
            pointerInteracting.current = null;
            canvasRef.current!.style.cursor = "grab";
          }}
          onPointerMove={(e) => {
            if (pointerInteracting.current !== null) {
              const delta = e.clientX - pointerInteracting.current;
              pointerInteractionMovement.current = delta / 100;
            }
          }}
        />
        {/* Selected city label */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-navy-900/80 border border-gold/30">
          <span className="text-[10px] font-mono text-gold font-bold tracking-wider">
            {city.short} — {city.name}
          </span>
        </div>
      </div>

      {/* City selector pills */}
      <div className="flex flex-wrap justify-center gap-1">
        {CITIES.map((c) => (
          <button
            key={c.id}
            onClick={() => selectCity(c.id)}
            className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider transition-all ${
              c.id === city.id
                ? "bg-gold text-navy-900"
                : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-gold"
            }`}
          >
            {c.short}
          </button>
        ))}
      </div>
    </div>
  );
}
