import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { motion } from 'framer-motion';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  MapPin,
  LocateFixed,
  Search,
  Navigation,
  Car,
  Footprints,
  Bike,
  Phone,
  ExternalLink,
  Volume2,
  VolumeX,
  CornerUpLeft,
  CornerUpRight,
  ArrowUp,
  Flag,
  AlertCircle,
  Loader2,
  X,
  ShieldAlert,
} from 'lucide-react';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { getNaturalVoiceConfig } from '../../utils/naturalVoice';

/* ─────────────────────────────────────────────────────────────────────────────
   Nearby Care — find hospitals, psychiatrists, therapists, etc. near the student
   and navigate there. Uses Mapbox GL (map), Search Box API (places) and the
   Directions API (route + turn-by-turn). Token: VITE_MAPBOX_TOKEN (public pk.*).
───────────────────────────────────────────────────────────────────────────── */

const MAPBOX_TOKEN: string = import.meta.env.VITE_MAPBOX_TOKEN ?? '';

type LngLat = [number, number];
type Mode = 'drive' | 'walk' | 'bike';
type CategoryId = 'hospital' | 'psychiatrist' | 'therapist' | 'clinic' | 'pharmacy' | 'custom';

interface Place {
  id: string;
  name: string;
  address: string;
  coords: LngLat;
  category: string;
  distanceKm: number;
}

interface RouteStep {
  instruction: string;
  distance: number; // metres
  type: string;
  modifier?: string;
  location: LngLat;
}

interface RouteInfo {
  coords: LngLat[];
  distance: number; // metres
  duration: number; // seconds
  steps: RouteStep[];
}

const CATEGORIES: { id: CategoryId; label: string; query: string; color: string; glyph: string }[] = [
  { id: 'hospital', label: 'Hospitals', query: 'hospital', color: '#DC2626', glyph: 'H' },
  { id: 'psychiatrist', label: 'Psychiatrists', query: 'psychiatrist', color: '#7C3AED', glyph: 'Ψ' },
  { id: 'therapist', label: 'Therapists', query: 'psychologist counselling', color: '#0D9488', glyph: 'T' },
  { id: 'clinic', label: 'Clinics', query: 'clinic', color: '#C2410C', glyph: '+' },
  { id: 'pharmacy', label: 'Pharmacies', query: 'pharmacy', color: '#15803D', glyph: 'Rx' },
];

const MODES: { id: Mode; label: string; profile: string; icon: typeof Car; kmh: number }[] = [
  { id: 'drive', label: 'Drive', profile: 'driving-traffic', icon: Car, kmh: 22 },
  { id: 'walk', label: 'Walk', profile: 'walking', icon: Footprints, kmh: 5 },
  { id: 'bike', label: 'Cycle', profile: 'cycling', icon: Bike, kmh: 14 },
];

const RADII = [1, 3, 5, 10];

/* ── helpers ─────────────────────────────────────────────────────────────── */

function haversineKm(a: LngLat, b: LngLat): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[1])) * Math.cos(toRad(b[1])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

function fmtDistance(metres: number): string {
  if (metres < 950) return `${Math.max(10, Math.round(metres / 10) * 10)} m`;
  return `${(metres / 1000).toFixed(1)} km`;
}

function fmtDuration(seconds: number): string {
  const m = Math.max(1, Math.round(seconds / 60));
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)} h ${m % 60} min`;
}

/** Shortest distance (metres) from a point to a polyline, using a local flat-earth approximation. */
function distanceToLineM(p: LngLat, line: LngLat[]): number {
  const kLat = 111320;
  const kLng = 111320 * Math.cos((p[1] * Math.PI) / 180);
  let best = Infinity;
  for (let i = 0; i < line.length - 1; i++) {
    const ax = (line[i][0] - p[0]) * kLng, ay = (line[i][1] - p[1]) * kLat;
    const bx = (line[i + 1][0] - p[0]) * kLng, by = (line[i + 1][1] - p[1]) * kLat;
    const dx = bx - ax, dy = by - ay;
    const len2 = dx * dx + dy * dy;
    const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, -(ax * dx + ay * dy) / len2));
    best = Math.min(best, Math.hypot(ax + t * dx, ay + t * dy));
  }
  return best;
}

function stepIcon(step: RouteStep) {
  if (step.type === 'arrive') return Flag;
  const m = step.modifier ?? '';
  if (m.includes('left')) return CornerUpLeft;
  if (m.includes('right')) return CornerUpRight;
  return ArrowUp;
}

function prefersReducedMotion(): boolean {
  return document.body.classList.contains('accessibility-reduce-motion');
}

/* ── API calls ───────────────────────────────────────────────────────────── */

async function searchPlaces(query: string, near: LngLat, radiusKm: number): Promise<Place[]> {
  const params = new URLSearchParams({
    q: query,
    proximity: `${near[0]},${near[1]}`,
    limit: '10',
    types: 'poi',
    language: 'en',
    access_token: MAPBOX_TOKEN,
  });
  if (radiusKm > 0) {
    const dLat = radiusKm / 111;
    const dLng = radiusKm / (111 * Math.cos((near[1] * Math.PI) / 180));
    params.set('bbox', [near[0] - dLng, near[1] - dLat, near[0] + dLng, near[1] + dLat].join(','));
  }
  const res = await fetch(`https://api.mapbox.com/search/searchbox/v1/forward?${params}`);
  if (!res.ok) throw new Error(res.status === 401 ? 'Mapbox token was rejected.' : 'Could not load places.');
  const json = await res.json();
  const out: Place[] = [];
  for (const f of json.features ?? []) {
    const c = f.geometry?.coordinates as LngLat | undefined;
    if (!c) continue;
    const d = haversineKm(near, c);
    if (radiusKm > 0 && d > radiusKm) continue;
    out.push({
      id: f.properties?.mapbox_id ?? `${c[0]},${c[1]}`,
      name: f.properties?.name ?? 'Unnamed place',
      address: f.properties?.full_address ?? f.properties?.place_formatted ?? '',
      coords: c,
      category: Array.isArray(f.properties?.poi_category) ? f.properties.poi_category[0] : '',
      distanceKm: d,
    });
  }
  return out.sort((a, b) => a.distanceKm - b.distanceKm);
}

async function fetchRoute(from: LngLat, to: LngLat, mode: Mode): Promise<RouteInfo> {
  const profile = MODES.find((m) => m.id === mode)!.profile;
  const params = new URLSearchParams({
    geometries: 'geojson',
    overview: 'full',
    steps: 'true',
    language: 'en',
    access_token: MAPBOX_TOKEN,
  });
  const res = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/${profile}/${from.join(',')};${to.join(',')}?${params}`,
  );
  if (!res.ok) throw new Error('Could not get directions.');
  const json = await res.json();
  const r = json.routes?.[0];
  if (!r) throw new Error('No route found between these points.');
  const steps: RouteStep[] = (r.legs?.[0]?.steps ?? []).map((s: { maneuver?: { instruction?: string; type?: string; modifier?: string; location?: number[] }; distance?: number }) => ({
    instruction: s.maneuver?.instruction ?? '',
    distance: s.distance ?? 0,
    type: s.maneuver?.type ?? '',
    modifier: s.maneuver?.modifier,
    location: (s.maneuver?.location ?? [0, 0]) as LngLat,
  }));
  return { coords: r.geometry.coordinates, distance: r.distance, duration: r.duration, steps };
}

async function geocode(text: string): Promise<{ coords: LngLat; label: string } | null> {
  const params = new URLSearchParams({ q: text, limit: '1', access_token: MAPBOX_TOKEN });
  const res = await fetch(`https://api.mapbox.com/search/geocode/v6/forward?${params}`);
  if (!res.ok) return null;
  const json = await res.json();
  const f = json.features?.[0];
  if (!f) return null;
  return { coords: f.geometry.coordinates as LngLat, label: f.properties?.full_address ?? f.properties?.name ?? text };
}

/* ── component ───────────────────────────────────────────────────────────── */

export function NearbyCare() {
  const { isDarkMode } = useDyslexia();

  const [loc, setLoc] = useState<LngLat | null>(null);
  const [locLabel, setLocLabel] = useState('');
  const [locState, setLocState] = useState<'idle' | 'locating' | 'denied' | 'ready'>('idle');
  const [addressInput, setAddressInput] = useState('');

  const [category, setCategory] = useState<CategoryId>('psychiatrist');
  const [customQuery, setCustomQuery] = useState('');
  const [radius, setRadius] = useState(5);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [placesError, setPlacesError] = useState('');

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('drive');
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [routeError, setRouteError] = useState('');

  const [navigating, setNavigating] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [remaining, setRemaining] = useState<{ distance: number; duration: number } | null>(null);
  const [arrived, setArrived] = useState(false);
  const [voice, setVoice] = useState(false);
  const [navError, setNavError] = useState('');
  const [livePos, setLivePos] = useState<LngLat | null>(null);

  const mapEl = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const placeMarkers = useRef<mapboxgl.Marker[]>([]);
  const routeRef = useRef<RouteInfo | null>(null);
  const watchId = useRef<number | null>(null);
  const lastReroute = useRef(0);
  const locRef = useRef<LngLat | null>(null);
  const voiceRef = useRef(false);
  const spokenStep = useRef(-1);

  const selected = useMemo(() => places.find((p) => p.id === selectedId) ?? null, [places, selectedId]);
  const activeQuery = category === 'custom' ? customQuery.trim() : CATEGORIES.find((c) => c.id === category)?.query ?? '';
  const catMeta = () => CATEGORIES.find((c) => c.id === category) ?? { color: '#2563EB', glyph: '•' };

  routeRef.current = route;
  locRef.current = loc;
  voiceRef.current = voice;

  /* ── location ── */
  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setLocState('denied');
      return;
    }
    setLocState('locating');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoc([pos.coords.longitude, pos.coords.latitude]);
        setLocLabel('Your current location');
        setLocState('ready');
      },
      () => setLocState('denied'),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 },
    );
  }, []);

  useEffect(() => {
    if (MAPBOX_TOKEN) locate();
  }, [locate]);

  const submitAddress = async (e: FormEvent) => {
    e.preventDefault();
    if (!addressInput.trim()) return;
    setLocState('locating');
    const hit = await geocode(addressInput.trim()).catch(() => null);
    if (hit) {
      setLoc(hit.coords);
      setLocLabel(hit.label);
      setLocState('ready');
    } else {
      setLocState('denied');
      setPlacesError('Could not find that address. Try adding the city.');
    }
  };

  /* ── map init ── */
  useEffect(() => {
    if (!MAPBOX_TOKEN || !mapEl.current || mapRef.current) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;
    const map = new mapboxgl.Map({
      container: mapEl.current,
      style: isDarkMode ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/streets-v12',
      center: [78.9629, 20.5937],
      zoom: 3.4,
      attributionControl: true,
    });
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── route layer (re-added whenever the style reloads) ── */
  const paintRoute = useCallback(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const data = {
      type: 'Feature' as const,
      properties: {},
      geometry: { type: 'LineString' as const, coordinates: routeRef.current?.coords ?? [] },
    };
    const src = map.getSource('nc-route') as mapboxgl.GeoJSONSource | undefined;
    if (src) {
      src.setData(data);
      return;
    }
    map.addSource('nc-route', { type: 'geojson', data });
    map.addLayer({
      id: 'nc-route-casing',
      type: 'line',
      source: 'nc-route',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#FFFFFF', 'line-width': 10, 'line-opacity': 0.9 },
    });
    map.addLayer({
      id: 'nc-route-line',
      type: 'line',
      source: 'nc-route',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#2563EB', 'line-width': 6 },
    });
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setStyle(isDarkMode ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/streets-v12');
    map.once('style.load', paintRoute);
  }, [isDarkMode, paintRoute]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (map.isStyleLoaded()) paintRoute();
    else map.once('load', paintRoute);
  }, [route, paintRoute]);

  /* ── user marker (draggable to correct the location) ── */
  useEffect(() => {
    const map = mapRef.current;
    const at = livePos ?? loc;
    if (!map || !at) return;
    if (!userMarker.current) {
      const dot = document.createElement('div');
      dot.setAttribute('aria-label', 'Your location');
      dot.style.cssText =
        'width:20px;height:20px;border-radius:50%;background:#2563EB;border:4px solid #fff;box-shadow:0 0 0 6px rgba(37,99,235,.25),0 2px 8px rgba(0,0,0,.3);cursor:grab';
      const m = new mapboxgl.Marker({ element: dot, draggable: true }).setLngLat(at).addTo(map);
      m.on('dragend', () => {
        const p = m.getLngLat();
        setLoc([p.lng, p.lat]);
        setLocLabel('Custom location you set on the map');
        setLocState('ready');
        setSelectedId(null);
        setRoute(null);
      });
      userMarker.current = m;
      map.jumpTo({ center: at, zoom: 13 });
    } else {
      userMarker.current.setLngLat(at);
    }
  }, [loc, livePos]);

  /* ── fetch places ── */
  useEffect(() => {
    if (!MAPBOX_TOKEN || !loc || !activeQuery) {
      setPlaces([]);
      return;
    }
    let cancelled = false;
    setLoadingPlaces(true);
    setPlacesError('');
    const t = setTimeout(() => {
      searchPlaces(activeQuery, loc, radius)
        .then((p) => {
          if (cancelled) return;
          setPlaces(p);
          setSelectedId(null);
          setRoute(null);
        })
        .catch((e: Error) => !cancelled && setPlacesError(e.message))
        .finally(() => !cancelled && setLoadingPlaces(false));
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [loc, activeQuery, radius]);

  /* ── place markers ── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    placeMarkers.current.forEach((m) => m.remove());
    placeMarkers.current = [];
    places.forEach((p, i) => {
      const meta = catMeta();
      const el = document.createElement('button');
      el.type = 'button';
      el.setAttribute('aria-label', `${p.name}, ${fmtDistance(p.distanceKm * 1000)} away`);
      const isSel = p.id === selectedId;
      el.style.cssText = `width:${isSel ? 38 : 30}px;height:${isSel ? 38 : 30}px;border-radius:50%;background:${meta.color};color:#fff;border:3px solid #fff;font:700 ${isSel ? 14 : 12}px system-ui;box-shadow:0 2px 8px rgba(0,0,0,.35);cursor:pointer;display:grid;place-items:center;padding:0`;
      el.textContent = String(i + 1);
      el.addEventListener('click', (ev) => {
        ev.stopPropagation();
        setSelectedId(p.id);
      });
      placeMarkers.current.push(new mapboxgl.Marker({ element: el }).setLngLat(p.coords).addTo(map));
    });
    if (places.length && loc && !selectedId) {
      const b = new mapboxgl.LngLatBounds(loc, loc);
      places.forEach((p) => b.extend(p.coords));
      map.fitBounds(b, { padding: 70, maxZoom: 15, duration: prefersReducedMotion() ? 0 : 700 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [places, selectedId, category]);

  /* ── directions ── */
  useEffect(() => {
    if (!selected || !loc) {
      setRoute(null);
      return;
    }
    let cancelled = false;
    setLoadingRoute(true);
    setRouteError('');
    fetchRoute(loc, selected.coords, mode)
      .then((r) => {
        if (cancelled) return;
        setRoute(r);
        setStepIdx(0);
        setRemaining({ distance: r.distance, duration: r.duration });
        const map = mapRef.current;
        if (map && !navigating) {
          const b = new mapboxgl.LngLatBounds(r.coords[0], r.coords[0]);
          r.coords.forEach((c) => b.extend(c));
          map.fitBounds(b, { padding: 80, duration: prefersReducedMotion() ? 0 : 700 });
        }
      })
      .catch((e: Error) => !cancelled && setRouteError(e.message))
      .finally(() => !cancelled && setLoadingRoute(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, mode]);

  /* ── live navigation ── */
  const speak = useCallback((text: string) => {
    if (!voiceRef.current || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voiceConfig = getNaturalVoiceConfig('en');
    if (voiceConfig.voice) utterance.voice = voiceConfig.voice;
    utterance.lang = voiceConfig.voice?.lang || voiceConfig.lang;
    utterance.rate = voiceConfig.rate;
    window.speechSynthesis.speak(utterance);
  }, []);

  const stopNavigation = useCallback(() => {
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    watchId.current = null;
    setNavigating(false);
    setArrived(false);
    setLivePos(null);
    spokenStep.current = -1;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    const map = mapRef.current;
    if (map) map.easeTo({ pitch: 0, bearing: 0, duration: prefersReducedMotion() ? 0 : 500 });
  }, []);

  useEffect(() => () => stopNavigation(), [stopNavigation]);

  const startNavigation = () => {
    if (!route || !selected) return;
    if (!navigator.geolocation) {
      setNavError('Live location is not available in this browser.');
      return;
    }
    setNavError('');
    setNavigating(true);
    setArrived(false);
    setStepIdx(0);
    spokenStep.current = -1;
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const here: LngLat = [pos.coords.longitude, pos.coords.latitude];
        setLivePos(here);
        const r = routeRef.current;
        if (!r || !selected) return;

        // arrived?
        if (haversineKm(here, selected.coords) * 1000 < 40) {
          setArrived(true);
          speak(`You have arrived at ${selected.name}`);
          if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
          watchId.current = null;
          return;
        }

        // advance to the next maneuver once we are close to it
        setStepIdx((cur) => {
          let idx = cur;
          while (idx < r.steps.length - 1 && haversineKm(here, r.steps[idx + 1].location) * 1000 < 30) idx++;
          if (idx !== spokenStep.current) {
            spokenStep.current = idx;
            const nxt = r.steps[Math.min(idx + 1, r.steps.length - 1)];
            if (nxt) speak(nxt.instruction);
          }
          // remaining distance: to next maneuver + all later steps
          let rem = haversineKm(here, r.steps[Math.min(idx + 1, r.steps.length - 1)].location) * 1000;
          for (let i = idx + 1; i < r.steps.length; i++) rem += r.steps[i].distance;
          setRemaining({ distance: rem, duration: (rem / Math.max(1, r.distance)) * r.duration });
          return idx;
        });

        // follow the user
        const map = mapRef.current;
        if (map) {
          map.easeTo({
            center: here,
            zoom: 16.5,
            pitch: 45,
            bearing: pos.coords.heading ?? map.getBearing(),
            duration: prefersReducedMotion() ? 0 : 800,
          });
        }

        // off route for a while: ask for a fresh route from here
        if (distanceToLineM(here, r.coords) > 80 && Date.now() - lastReroute.current > 15000) {
          lastReroute.current = Date.now();
          fetchRoute(here, selected.coords, mode)
            .then((nr) => {
              setRoute(nr);
              setStepIdx(0);
              spokenStep.current = -1;
              speak('Route updated');
            })
            .catch(() => {});
        }
      },
      () => {
        setNavError('Lost your location signal. Check that location is allowed for this site.');
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 },
    );
  };

  const toggleVoice = () => {
    setVoice((v) => {
      if (v && 'speechSynthesis' in window) window.speechSynthesis.cancel();
      return !v;
    });
  };

  /* ── render ── */

  if (!MAPBOX_TOKEN) {
    return (
      <div className="max-w-3xl mx-auto pb-12">
        <div className="bg-white rounded-3xl p-8 border border-blue-100/80 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-xl font-extrabold text-[#1A202C]">Map token needed</h2>
          <p className="text-sm text-[#64748B]">
            Nearby Care needs a Mapbox public token. Create <code className="font-mono">frontend/.env.local</code> with:
          </p>
          <pre className="bg-[#F8FAFC] border border-blue-100 rounded-xl p-3 text-xs text-[#1A202C] overflow-x-auto">VITE_MAPBOX_TOKEN=pk.your_public_token</pre>
          <p className="text-sm text-[#64748B]">Then restart <code className="font-mono">npm run dev</code>.</p>
        </div>
      </div>
    );
  }

  const nextStep = route ? route.steps[Math.min(stepIdx + 1, route.steps.length - 1)] : null;
  const NextIcon = nextStep ? stepIcon(nextStep) : ArrowUp;
  const distToNext =
    navigating && route && (livePos ?? loc) && nextStep ? haversineKm((livePos ?? loc)!, nextStep.location) * 1000 : 0;
  const gmapsUrl = selected
    ? `https://www.google.com/maps/dir/?api=1&destination=${selected.coords[1]},${selected.coords[0]}&travelmode=${
        mode === 'drive' ? 'driving' : mode === 'walk' ? 'walking' : 'bicycling'
      }`
    : '#';

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-end justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] shrink-0">
            <MapPin size={24} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A202C]">Nearby Care</h1>
            <p className="text-sm text-[#64748B] max-w-xl">
              Find hospitals, psychiatrists, therapists and other support close to you, then get directions from where you are.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="tel:112"
            className="inline-flex items-center gap-2 text-xs font-bold px-3.5 py-2 rounded-full bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-colors"
          >
            <ShieldAlert size={14} /> Emergency 112
          </a>
          <a
            href="tel:14416"
            className="inline-flex items-center gap-2 text-xs font-bold px-3.5 py-2 rounded-full bg-blue-50 text-[#2563EB] border border-blue-100 hover:bg-blue-100 transition-colors"
          >
            <Phone size={14} /> Tele-MANAS 14416
          </a>
        </div>
      </motion.div>

      {/* Controls */}
      <div className="bg-white rounded-3xl p-5 border border-blue-100/80 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1 basis-64">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] shrink-0">
              <LocateFixed size={18} />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">Your location</div>
              <div className="text-sm font-bold text-[#1A202C] break-words">
                {locState === 'locating' && 'Finding you…'}
                {locState === 'ready' && (locLabel || 'Location set')}
                {locState === 'denied' && 'Location is off. Enter your area instead.'}
                {locState === 'idle' && 'Not set yet'}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={locate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] text-white text-sm font-bold hover:bg-[#1D4ED8] transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/40"
          >
            <Navigation size={15} /> Use my location
          </button>
          <form onSubmit={submitAddress} className="flex gap-2 flex-1 basis-64 min-w-0">
            <input
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              placeholder="Or type your area, e.g. Vidyavihar, Mumbai"
              aria-label="Enter your area"
              className="w-full min-w-0 px-3.5 py-2.5 bg-[#F8FAFC] border border-blue-100 rounded-xl text-sm text-[#1A202C] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
            />
            <button
              type="submit"
              className="px-4 rounded-xl border border-blue-100 text-sm font-bold text-[#2563EB] hover:bg-blue-50 transition-colors cursor-pointer"
            >
              Set
            </button>
          </form>
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Place type">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              aria-pressed={category === c.id}
              className={`inline-flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 rounded-full border text-sm font-bold transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/40 ${
                category === c.id
                  ? 'bg-blue-50 border-[#2563EB] text-[#1A202C]'
                  : 'bg-white border-blue-100 text-[#1A202C] hover:border-blue-300'
              }`}
            >
              <span
                className="w-6 h-6 rounded-full text-white text-[11px] font-extrabold flex items-center justify-center"
                style={{ background: c.color }}
                aria-hidden="true"
              >
                {c.glyph}
              </span>
              {c.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 basis-64 min-w-0">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" aria-hidden="true" />
            <input
              value={customQuery}
              onChange={(e) => {
                setCustomQuery(e.target.value);
                setCategory(e.target.value.trim() ? 'custom' : 'psychiatrist');
              }}
              placeholder="Search any place, e.g. dyslexia support, eye hospital"
              aria-label="Search any place"
              className="w-full pl-9 pr-3.5 py-2.5 bg-[#F8FAFC] border border-blue-100 rounded-xl text-sm text-[#1A202C] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
            />
          </div>
          <div className="flex items-center gap-2" role="group" aria-label="Search distance">
            <span className="text-xs font-bold text-[#64748B]">Within</span>
            {RADII.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRadius(r)}
                aria-pressed={radius === r}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  radius === r ? 'bg-[#2563EB] text-white border-[#2563EB]' : 'bg-white text-[#64748B] border-blue-100 hover:border-blue-300'
                }`}
              >
                {r} km
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results + map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section aria-label="Results" className="lg:col-span-5 order-2 lg:order-1">
          <div className="flex items-baseline justify-between px-1 pb-2 text-xs text-[#64748B]">
            <span>
              <b className="text-sm text-[#1A202C]">
                {loadingPlaces ? 'Searching…' : `${places.length} ${places.length === 1 ? 'place' : 'places'}`}
              </b>{' '}
              within {radius} km
            </span>
            <span>Nearest first</span>
          </div>

          <div className="space-y-3 lg:max-h-[640px] lg:overflow-y-auto lg:pr-1">
            {placesError && (
              <div role="alert" className="flex gap-2 items-start text-sm text-red-600 bg-red-50 border border-red-100 rounded-2xl p-4">
                <AlertCircle size={16} className="mt-0.5 shrink-0" /> {placesError}
              </div>
            )}
            {!placesError && !loadingPlaces && locState === 'ready' && places.length === 0 && (
              <div className="text-center text-sm text-[#64748B] border-2 border-dashed border-blue-100 rounded-2xl p-8">
                <b className="block text-[#1A202C] mb-1">Nothing found here</b>
                Try a wider distance or another place type.
              </div>
            )}
            {locState !== 'ready' && (
              <div className="text-center text-sm text-[#64748B] border-2 border-dashed border-blue-100 rounded-2xl p-8">
                <b className="block text-[#1A202C] mb-1">Set your location to start</b>
                Allow location access, or type your area above.
              </div>
            )}

            {places.map((p, i) => {
              const meta = catMeta();
              const isSel = p.id === selectedId;
              return (
                <div key={p.id} className="space-y-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (navigating) stopNavigation();
                      setSelectedId(isSel ? null : p.id);
                      const map = mapRef.current;
                      if (map && !isSel) map.easeTo({ center: p.coords, duration: prefersReducedMotion() ? 0 : 500 });
                    }}
                    aria-pressed={isSel}
                    className={`w-full text-left bg-white rounded-2xl p-4 border-2 shadow-sm transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/40 ${
                      isSel ? 'border-[#2563EB] shadow-md' : 'border-blue-100/80 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className="w-8 h-8 rounded-full text-white text-sm font-extrabold flex items-center justify-center shrink-0"
                        style={{ background: meta.color }}
                        aria-hidden="true"
                      >
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-extrabold text-[#1A202C] break-words">{p.name}</div>
                        <div className="text-xs text-[#64748B] break-words">{p.address}</div>
                        {p.category && (
                          <span className="inline-block mt-2 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#2563EB] border border-blue-100 capitalize">
                            {p.category}
                          </span>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-extrabold text-[#1A202C] tabular-nums">{fmtDistance(p.distanceKm * 1000)}</div>
                        <div className="text-[11px] text-[#94A3B8]">straight line</div>
                      </div>
                    </div>
                  </button>

                  {isSel && (
                    <div className="mt-2 bg-white rounded-2xl p-4 border-2 border-[#2563EB] shadow-md space-y-3">
                      <div className="inline-flex p-1 rounded-xl bg-[#F8FAFC] border border-blue-100" role="group" aria-label="Travel mode">
                        {MODES.map((m) => {
                          const Icon = m.icon;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => {
                                if (navigating) stopNavigation();
                                setMode(m.id);
                              }}
                              aria-pressed={mode === m.id}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                mode === m.id ? 'bg-white text-[#2563EB] shadow-sm' : 'text-[#64748B] hover:text-[#2563EB]'
                              }`}
                            >
                              <Icon size={14} /> {m.label}
                            </button>
                          );
                        })}
                      </div>

                      {loadingRoute && (
                        <div className="flex items-center gap-2 text-sm text-[#64748B]">
                          <Loader2 size={16} className="animate-spin" /> Getting directions…
                        </div>
                      )}
                      {routeError && (
                        <div role="alert" className="text-sm text-red-600 flex gap-2 items-start">
                          <AlertCircle size={16} className="mt-0.5 shrink-0" /> {routeError}
                        </div>
                      )}

                      {route && !loadingRoute && (
                        <>
                          <div className="flex items-baseline gap-3 flex-wrap">
                            <span className="text-2xl font-extrabold text-[#1A202C] tabular-nums">
                              {arrived ? 'Arrived' : fmtDuration((navigating && remaining ? remaining : route).duration)}
                            </span>
                            <span className="text-sm text-[#64748B] tabular-nums">
                              {arrived ? `You are at ${p.name}` : `${fmtDistance((navigating && remaining ? remaining : route).distance)} · ${MODES.find((m) => m.id === mode)!.label.toLowerCase()} route`}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {!navigating ? (
                              <button
                                type="button"
                                onClick={startNavigation}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] text-white text-sm font-bold hover:bg-[#1D4ED8] transition-colors cursor-pointer"
                              >
                                <Navigation size={15} /> Start navigation
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={stopNavigation}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors cursor-pointer"
                              >
                                <X size={15} /> Stop
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={toggleVoice}
                              aria-pressed={voice}
                              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-blue-100 text-sm font-bold text-[#1A202C] hover:border-blue-300 transition-colors cursor-pointer"
                            >
                              {voice ? <Volume2 size={15} /> : <VolumeX size={15} />} Voice {voice ? 'on' : 'off'}
                            </button>
                            <a
                              href={gmapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-blue-100 text-sm font-bold text-[#2563EB] hover:bg-blue-50 transition-colors"
                            >
                              <ExternalLink size={14} /> Google Maps
                            </a>
                          </div>
                          {navError && (
                            <div role="alert" className="text-xs text-red-600">{navError}</div>
                          )}

                          <ol className="space-y-0.5" aria-label="Turn by turn directions">
                            {route.steps.map((s, idx) => {
                              const Icon = stepIcon(s);
                              const state = navigating ? (idx <= stepIdx ? 'done' : idx === stepIdx + 1 ? 'now' : '') : '';
                              return (
                                <li
                                  key={idx}
                                  className={`flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm ${
                                    state === 'now' ? 'bg-blue-50 font-bold text-[#1A202C]' : 'text-[#1A202C]'
                                  } ${state === 'done' ? 'opacity-50' : ''}`}
                                >
                                  <Icon size={17} className="text-[#2563EB] shrink-0" aria-hidden="true" />
                                  <span className="flex-1 break-words">{s.instruction}</span>
                                  {s.distance > 0 && (
                                    <span className="text-xs text-[#64748B] tabular-nums whitespace-nowrap">{fmtDistance(s.distance)}</span>
                                  )}
                                </li>
                              );
                            })}
                          </ol>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-[#94A3B8] px-1 pt-3">
            Place data comes from Mapbox. Opening hours and availability are not shown, so call ahead before you travel.
          </p>
        </section>

        <section aria-label="Map" className="lg:col-span-7 order-1 lg:order-2 lg:sticky lg:top-4">
          <div className="relative bg-white rounded-3xl border border-blue-100/80 shadow-sm overflow-hidden">
            <div ref={mapEl} className="w-full h-[380px] sm:h-[460px] lg:h-[640px]" role="application" aria-label="Map of nearby places" />
            {navigating && route && nextStep && (
              <div className="absolute left-3 right-14 top-3 bg-[#2563EB] text-white rounded-2xl px-4 py-3 shadow-lg flex items-center gap-3">
                {arrived ? <Flag size={26} aria-hidden="true" /> : <NextIcon size={26} aria-hidden="true" />}
                <div className="min-w-0">
                  <div className="text-sm sm:text-base font-extrabold leading-tight break-words">
                    {arrived ? 'You have arrived' : nextStep.instruction}
                  </div>
                  {!arrived && <div className="text-xs opacity-90 tabular-nums">in {fmtDistance(distToNext)}</div>}
                </div>
              </div>
            )}
            {loadingPlaces && (
              <div className="absolute left-3 bottom-3 inline-flex items-center gap-2 bg-white/95 border border-blue-100 rounded-full px-3 py-1.5 text-xs font-bold text-[#64748B]">
                <Loader2 size={13} className="animate-spin" /> Searching nearby…
              </div>
            )}
          </div>
          <p className="text-xs text-[#64748B] px-2 pt-2">Drag the blue dot if your location is a bit off.</p>
        </section>
      </div>
    </div>
  );
}