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

  useEffect(() => {
    focusRef.current = [
      city.lat * (Math.PI / 180),
      city.lng * (Math.PI / 180),
    ];
  }, [city]);

  useEffect(() => {
    let size = 0;
    const onResize = () => {
      if (canvasRef.current) {
        size = canvasRef.current.offsetWidth;
      }
    };
    onResize();
    window.addEventListener("resize", onResize);

    const globe = createGlobe(canvasRef.current!, {
      devicePixelRatio: 2,
      width: size * 2,
      height: size * 2,
      phi: 0,
      theta: 0.25,
      dark: 1,
      diffuse: 3,
      mapSamples: 40000,
      mapBrightness: 8,
      baseColor: [0.15, 0.2, 0.35],
      markerColor: [0.79, 0.66, 0.3],
      glowColor: [0.08, 0.12, 0.2],
      markers: CITIES.map((c) => ({
        location: [c.lat, c.lng] as [number, number],
        size: c.id === city.id ? 0.12 : 0.06,
      })),
      onRender: (state) => {
        if (!pointerInteracting.current) {
          phiRef.current += 0.003;
        }

        const [targetTheta] = focusRef.current;
        state.phi = phiRef.current + pointerInteractionMovement.current;
        state.theta = targetTheta;

        state.width = size * 2;
        state.height = size * 2;

        state.markers = CITIES.map((c) => ({
          location: [c.lat, c.lng] as [number, number],
          size: c.id === city.id ? 0.12 : 0.06,
        }));
      },
    });

    return () => {
      globe.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, [city]);

  return (
    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
      {/* Globe */}
      <div className="relative w-[220px] h-[220px] md:w-[260px] md:h-[260px] shrink-0">
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
      </div>

      {/* City info + selector */}
      <div className="flex flex-col gap-3 min-w-0">
        <div>
          <h3 className="text-[10px] font-mono text-slate-500 tracking-[0.15em] uppercase mb-1">
            Global Command Center
          </h3>
          <p className="text-lg md:text-xl font-bold font-mono text-white">
            {city.name}
          </p>
          <p className="text-xs font-mono text-slate-400">
            {city.primaryLabel}
            {city.secondaryLabel ? ` / ${city.secondaryLabel}` : ""}
            {" · "}
            {city.currencyLabel}
            {" · "}
            {city.timezone}
          </p>
        </div>

        {/* City selector pills */}
        <div className="flex flex-wrap gap-1.5">
          {CITIES.map((c) => (
            <button
              key={c.id}
              onClick={() => selectCity(c.id)}
              className={`px-2 py-1 rounded text-[10px] font-mono font-bold tracking-wider transition-all ${
                c.id === city.id
                  ? "bg-gold text-navy-900 shadow-md shadow-gold/20"
                  : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-gold"
              }`}
            >
              {c.short}
            </button>
          ))}
        </div>

        <p className="text-[10px] font-mono text-slate-600">
          Drag globe to rotate · Select a city to update all widgets
        </p>
      </div>
    </div>
  );
}
