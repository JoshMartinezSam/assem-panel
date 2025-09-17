import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Bell,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Download,
  Eye,
  Home,
  Link as LinkIcon,
  PauseCircle,
  Pencil,
  Plus,
  Search,
  Settings,
  User2,
  Users,
  Wrench,
  X,
} from "lucide-react";

/**
 * FIX SUMMARY
 * - Removed a stray `}` in the top-left logo <div>, which caused `Unexpected token`.
 * - Kept all behaviors; only structural fixes + minor responsive/typography tweaks as requested.
 * - Added lightweight runtime assertions for `toCSV` (now with an extra case for quotes escaping).
 */

// --- Types
const ESTADOS = ["En proceso", "En pausa", "Completado"] as const;
type Estado = typeof ESTADOS[number];

type Proyecto = {
  id: string;
  codigo: string;
  proyecto: string;
  responsable: string;
  fechaInicio: string; // dd-mm-yyyy
  fechaFin: string; // dd-mm-yyyy
  clientes: string[];
  estado: Estado;
};

// --- Helpers
function estadoConfig(estado: Estado) {
  switch (estado) {
    case "Completado":
      return { icon: CheckCircle2, classes: "bg-emerald-100 text-emerald-700 border-emerald-200" };
    case "En pausa":
      return { icon: PauseCircle, classes: "bg-amber-100 text-amber-700 border-amber-200" };
    case "En proceso":
    default:
      return { icon: CircleDot, classes: "bg-blue-100 text-blue-700 border-blue-200" };
  }
}

function escapeCsvValue(value: string) {
  const normalized = `${value ?? ""}`;
  const escaped = normalized.replace(/"/g, '""');
  return /[",\n\r]/.test(normalized) ? `"${escaped}"` : escaped;
}

export function toCSV(rows: Proyecto[]) {
  const header = [
    "Código",
    "Proyecto",
    "Responsable",
    "Fecha de inicio",
    "Fecha final",
    "Clientes",
    "Estado",
  ];
  const lines = rows.map((r) =>
    [
      escapeCsvValue(r.codigo),
      escapeCsvValue(r.proyecto),
      escapeCsvValue(r.responsable),
      escapeCsvValue(r.fechaInicio),
      escapeCsvValue(r.fechaFin),
      escapeCsvValue(r.clientes.join("; ")),
      escapeCsvValue(r.estado),
    ].join(",")
  );
  return [header.join(","), ...lines].join("\n");
}

function descargar(nombre: string, contenido: string, mime = "text/csv;charset=utf-8;") {
  const blob = new Blob([contenido], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}

// --- Status Pill Component
function EstadoPill({ estado, onChange }: { estado: Estado; onChange: (e: Estado) => void }) {
  const cfg = estadoConfig(estado);
  const Icon = cfg.icon;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium ${cfg.classes}`}
          title="Cambiar estado"
        >
          <Icon className="h-4 w-4" />
          {estado}
          <ChevronDown className="h-3.5 w-3.5 opacity-70" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {ESTADOS.map((e) => (
          <DropdownMenuItem key={e} onClick={() => onChange(e)}>
            {e}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// --- Create Project Form (simple)
function useNuevoProyecto(onAdd: (p: Proyecto) => void) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    codigo: "",
    proyecto: "",
    responsable: "",
    fechaInicio: "",
    fechaFin: "",
    clientes: "",
    estado: "En proceso" as Estado,
  });

  const Comp = (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2"><Plus className="h-4 w-4"/>Crear proyecto</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Nuevo proyecto</DialogTitle>
          <DialogDescription>Completa los campos para registrar un proyecto.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Código</label>
            <Input value={form.codigo} onChange={(e)=>setForm({...form, codigo:e.target.value})} placeholder="PE 000 - 2025"/>
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs text-muted-foreground">Proyecto</label>
            <Input value={form.proyecto} onChange={(e)=>setForm({...form, proyecto:e.target.value})} placeholder="Descripción del proyecto"/>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Responsable</label>
            <Input value={form.responsable} onChange={(e)=>setForm({...form, responsable:e.target.value})} placeholder="Nombre"/>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Clientes (separa por coma)</label>
            <Input value={form.clientes} onChange={(e)=>setForm({...form, clientes:e.target.value})} placeholder="Cliente A, Cliente B"/>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Fecha inicio</label>
            <Input value={form.fechaInicio} onChange={(e)=>setForm({...form, fechaInicio:e.target.value})} placeholder="dd-mm-aaaa"/>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Fecha final</label>
            <Input value={form.fechaFin} onChange={(e)=>setForm({...form, fechaFin:e.target.value})} placeholder="dd-mm-aaaa"/>
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs text-muted-foreground">Estado</label>
            <EstadoPill estado={form.estado} onChange={(e)=>setForm({...form, estado:e})}/>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              const nuevo: Proyecto = {
                id: Math.random().toString(36).slice(2),
                codigo: form.codigo.trim() || "PE 000 - 2025",
                proyecto: form.proyecto.trim() || "Proyecto sin título",
                responsable: form.responsable.trim() || "—",
                fechaInicio: form.fechaInicio.trim() || "—",
                fechaFin: form.fechaFin.trim() || "—",
                clientes: form.clientes
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
                estado: form.estado,
              };
              onAdd(nuevo);
              setOpen(false);
              setForm({ codigo: "", proyecto: "", responsable: "", fechaInicio: "", fechaFin: "", clientes: "", estado: "En proceso" });
            }}
          >
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return { Comp };
}

// --- Sidebar item
function SidebarItem({ icon: Icon, label, active = false }: { icon: any; label: string; active?: boolean }) {
  return (
    <button
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition hover:bg-slate-100 ${
        active ? "bg-slate-100 font-medium" : "text-slate-600"
      }`}
    >
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
}

// --- Main Component
export default function AssemProjectsDashboard() {
  const [query, setQuery] = useState("");
  const [porPagina, setPorPagina] = useState(10);
  const [page, setPage] = useState(1);
  const [filterResponsable, setFilterResponsable] = useState("");
  const [filterEstado, setFilterEstado] = useState<Estado | ''>("");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const updateScrollControls = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 8);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 8);
  }, []);
  const STORAGE_KEY = "assem.proyectos.v1";

  const DEMO_PROYECTOS: Proyecto[] = [
    {
      id: "1",
      codigo: "PE 232 - 2025",
      proyecto:
        "DISEÑO DE INSTALACIONES SANITARIAS Y ELÉCTRICAS DUPLEX FRANCIA",
      responsable: "Josh Haresh Martinez Samaniego",
      fechaInicio: "04-09-2025",
      fechaFin: "10-09-2025",
      clientes: ["Robles Mendoza", "Carlos Yu-Yi"],
      estado: "En proceso",
    },
    {
      id: "2",
      codigo: "PE 226 - 2025",
      proyecto:
        "ELABORACIÓN DE PLANOS AS BUILT DE ARQUITECTURA Y ESPECIALIDADES DE VIVIENDA UNIFAMILIAR",
      responsable: "Luis Alex Gonzalez Salsavilca",
      fechaInicio: "10-09-2025",
      fechaFin: "29-09-2025",
      clientes: ["Cervantes Teodoro", "Maximiliana Felicita"],
      estado: "En proceso",
    },
    {
      id: "3",
      codigo: "PE 184 - 2025",
      proyecto:
        "IIISS PARA TELEFÓNICA DEL PERÚ – EDIFICIO SURQUILLO PISO 5",
      responsable: "Josh Haresh Martinez Samaniego",
      fechaInicio: "11-07-2025",
      fechaFin: "18-07-2025",
      clientes: ["Bosch Arquitectos Perú S.R.L."],
      estado: "En proceso",
    },
  ];

  const [proyectos, setProyectos] = useState<Proyecto[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed.map((p: any) => ({
          ...p,
          estado: p.estado === "Pausado" ? "En pausa" : (p.estado === "Pendiente" ? "En proceso" : p.estado),
        }));
      }
    } catch {}
    return DEMO_PROYECTOS;
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(proyectos)); } catch {}
  }, [proyectos]);

  const { Comp: CrearProyecto } = useNuevoProyecto((p) => setProyectos((prev) => [p, ...prev]));

  // --- Filtro + paginación ---
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return proyectos.filter((p) =>
      [p.codigo, p.proyecto, p.responsable, p.clientes.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [proyectos, query]);

  const responsablesOptions = useMemo(() => Array.from(new Set(filtered.map(p => p.responsable))).sort(), [filtered]);
  const estadosOptions = useMemo(() => Array.from(new Set(filtered.map(p => p.estado))), [filtered]);

  const filtered2 = useMemo(() => filtered.filter((p) => (!filterResponsable || p.responsable === filterResponsable) && (!filterEstado || p.estado === filterEstado)), [filtered, filterResponsable, filterEstado]);

  const pages = useMemo(() => Math.max(1, Math.ceil(filtered2.length / porPagina)), [filtered2, porPagina]);

  useEffect(() => {
    if (page > pages) setPage(pages);
  }, [pages, page]);

  useEffect(() => {
    setPage(1);
  }, [porPagina, query, filterResponsable, filterEstado]);

  const current = useMemo(() => {
    const start = (page - 1) * porPagina;
    return filtered2.slice(start, start + porPagina);
  }, [filtered2, page, porPagina]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => updateScrollControls();
    const handleWindowResize = () => updateScrollControls();

    updateScrollControls();
    el.addEventListener("scroll", handleScroll);
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => updateScrollControls());
      resizeObserver.observe(el);
    }
    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleWindowResize);
    }

    return () => {
      el.removeEventListener("scroll", handleScroll);
      resizeObserver?.disconnect();
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", handleWindowResize);
      }
    };
  }, [updateScrollControls]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const id = window.requestAnimationFrame(() => updateScrollControls());
    return () => window.cancelAnimationFrame(id);
  }, [current, updateScrollControls]);

  const descargarExcel = () => descargar(
    `proyectos-assem-${new Date().toISOString().slice(0,10)}.csv`,
    toCSV(current)
  );

  const scrollHorizontally = (delta: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 text-[13px] leading-tight">
      {/* Global styles for visible horizontal scrollbar */}
      <style>{`
        .table-scroll { scrollbar-gutter: stable both-edges; }
        .table-scroll::-webkit-scrollbar { height: 10px; }
        .table-scroll::-webkit-scrollbar-thumb { background-color: #94a3b8; border-radius: 8px; }
        .table-scroll::-webkit-scrollbar-track { background-color: #e2e8f0; }
      `}</style>
      {/* Top bar */}
      <div className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between px-4 py-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
              AS
            </div>
            <div>
              <div className="text-xs tracking-wider text-slate-500">FORMATOS DE</div>
              <div className="text-sm font-semibold">ASSEM INGENIEROS CONSULTORES</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" title="Notificaciones"><Bell className="h-5 w-5"/></Button>
            <Button variant="ghost" size="icon" title="Usuarios"><Users className="h-5 w-5"/></Button>
            <Button variant="ghost" size="icon" title="Ajustes"><Settings className="h-5 w-5"/></Button>
            <div className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold">JM</div>
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="mx-auto grid max-w-screen-xl grid-cols-12 gap-6 px-4 py-4">
        {/* Sidebar */}
        <aside className="col-span-12 h-fit rounded-2xl border bg-white p-3 md:sticky md:top-20 md:col-span-3">
          <SidebarItem icon={Home} label="Home" />
          <SidebarItem icon={User2} label="Perfil" />
          <SidebarItem icon={Bell} label="Notificaciones" />
          <SidebarItem icon={Users} label="Equipo Assem" />
          <div className="my-2 h-px bg-slate-100"/>
          <SidebarItem icon={Wrench} label="Proyectos" active />
        </aside>

        {/* Main */}
        <main className="col-span-12 md:col-span-9">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-base">Panel de proyectos</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="secondary" className="gap-2"><CalendarClock className="h-4 w-4"/>Ver cronograma</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cronograma (demo)</DialogTitle>
                      <DialogDescription>Ejemplo visual. Integra tu propio Gantt aquí.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-2 text-sm">
                      {current.map((p) => (
                        <div key={p.id} className="grid grid-cols-4 items-center gap-2">
                          <div className="truncate font-medium">{p.codigo}</div>
                          <div className="col-span-2 truncate" title={p.proyecto}>{p.proyecto}</div>
                          <div>
                            <EstadoPill estado={p.estado} onChange={(e)=>setProyectos(prev=>prev.map(x=>x.id===p.id?{...x, estado:e}:x))}/>
                          </div>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="outline" className="gap-2" onClick={descargarExcel}><Download className="h-4 w-4"/>Exportar CSV</Button>
                {/* Crear proyecto */}
                <div>{CrearProyecto}</div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/>
                    <Input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Búsqueda" className="pl-8 w-72"/>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <span>Responsable{filterResponsable ? `: ${filterResponsable}` : ''}</span>
                        <ChevronDown className="h-4 w-4"/>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-64 max-h-80 overflow-auto">
                      <DropdownMenuItem onClick={()=>setFilterResponsable("")}>Todos</DropdownMenuItem>
                      {responsablesOptions.map(r => (
                        <DropdownMenuItem key={r} onClick={()=>setFilterResponsable(r)}>{r}</DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <span>Estado{filterEstado ? `: ${filterEstado}` : ''}</span>
                        <ChevronDown className="h-4 w-4"/>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                      <DropdownMenuItem onClick={()=>setFilterEstado("")}>Todos</DropdownMenuItem>
                      {estadosOptions.map(e => (
                        <DropdownMenuItem key={e} onClick={()=>setFilterEstado(e)}>{e}</DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-500">Registros:</span>
                    <select
                      className="rounded-md border px-2 py-1 text-sm"
                      value={porPagina}
                      onChange={(e)=>setPorPagina(parseInt(e.target.value))}
                    >
                      {[10,25,50].map(n=> <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                </div>
                <div className="text-sm text-slate-500">Total: {filtered2.length}</div>
              </div>

              {(filterResponsable || filterEstado) && (
                <div className="-mt-2 mb-4 flex flex-wrap items-center gap-2">
                  {filterResponsable && (
                    <Button variant="secondary" size="sm" className="rounded-full" onClick={()=>setFilterResponsable("")}>
                      Responsable: {filterResponsable}
                      <X className="ml-2 h-3.5 w-3.5"/>
                    </Button>
                  )}
                  {filterEstado && (
                    <Button variant="secondary" size="sm" className="rounded-full" onClick={()=>setFilterEstado("")}>
                      Estado: {filterEstado}
                      <X className="ml-2 h-3.5 w-3.5"/>
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={()=>{setFilterResponsable(""); setFilterEstado("");}}>
                    Limpiar filtros
                  </Button>
                </div>
              )}

              <div className="relative">
                <div
                  ref={scrollRef}
                  className="table-scroll overflow-x-auto overflow-y-hidden rounded-2xl border bg-white"
                >
                  <Table className="min-w-[2100px]">
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="w-28 md:w-[120px]">CÓDIGO</TableHead>
                      <TableHead>PROYECTO</TableHead>
                      <TableHead className="w-40 xl:w-[220px]">RESPONSABLE</TableHead>
                      <TableHead className="w-24 md:w-[100px]">F. INICIO</TableHead>
                      <TableHead className="w-24 md:w-[100px]">F. FINAL</TableHead>
                      <TableHead className="w-[220px]">CLIENTES</TableHead>
                      <TableHead className="w-[120px]">ACCIONES</TableHead>
                      <TableHead className="w-[140px]">ESTADO</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {current.map((p) => (
                      <TableRow key={p.id} className="align-top">
                        <TableCell className="font-medium">{p.codigo}</TableCell>
                        <TableCell className="min-w-0">
                          <div className="font-medium leading-tight break-words">{p.proyecto}</div>
                          <div className="text-xs text-slate-500">ASSEM</div>
                        </TableCell>
                        <TableCell className="min-w-0">
                          <div className="truncate" title={p.responsable}>{p.responsable}</div>
                        </TableCell>
                        <TableCell>{p.fechaInicio}</TableCell>
                        <TableCell>{p.fechaFin}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {p.clientes.map((c, i) => (
                              <div key={i} className="truncate" title={c}>{c}</div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" title="Vincular"><LinkIcon className="h-4 w-4"/></Button>
                            <Button variant="ghost" size="icon" title="Equipo"><Users className="h-4 w-4"/></Button>
                            <Button variant="ghost" size="icon" title="Ver"><Eye className="h-4 w-4"/></Button>
                            <Button variant="ghost" size="icon" title="Editar"><Pencil className="h-4 w-4"/></Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <EstadoPill
                            estado={p.estado}
                            onChange={(e)=>setProyectos(prev=>prev.map(x=>x.id===p.id?{...x, estado:e}:x))}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  </Table>
                </div>
                {(canScrollLeft || canScrollRight) && (
                  <>
                    {canScrollLeft && (
                      <>
                        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 rounded-l-2xl bg-gradient-to-r from-white via-white/80 to-transparent" aria-hidden="true" />
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          className="absolute left-3 top-1/2 z-20 h-8 w-8 -translate-y-1/2 rounded-full border border-slate-200 bg-white/90 shadow-md backdrop-blur"
                          onClick={() => scrollHorizontally(-320)}
                          aria-label="Desplazar tabla a la izquierda"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {canScrollRight && (
                      <>
                        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 rounded-r-2xl bg-gradient-to-l from-white via-white/80 to-transparent" aria-hidden="true" />
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          className="absolute right-3 top-1/2 z-20 h-8 w-8 -translate-y-1/2 rounded-full border border-slate-200 bg-white/90 shadow-md backdrop-blur"
                          onClick={() => scrollHorizontally(320)}
                          aria-label="Desplazar tabla a la derecha"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </>
                )}
              </div>

              <div className="flex items-center justify-between px-3 py-3 text-sm">
                <div>
                  Mostrando {(page - 1) * porPagina + 1}–{Math.min((page - 1) * porPagina + porPagina, filtered2.length)} de {filtered2.length}
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  <Button variant="outline" size="sm" onClick={()=>setPage(Math.max(1, page-1))} disabled={page===1}>Anterior</Button>
                  {Array.from({length: pages}, (_, i) => i + 1).map((n) => (
                    <Button key={n} variant={n===page? 'default' : 'outline'} size="sm" onClick={()=>setPage(n)}>{n}</Button>
                  ))}
                  <Button variant="outline" size="sm" onClick={()=>setPage(Math.min(pages, page+1))} disabled={page===pages}>Siguiente</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Footer */}
      <div className="py-8 text-center text-xs text-slate-400">© {new Date().getFullYear()} Assem Ingenieros Consultores — Panel de proyectos</div>
    </div>
  );
}

// --- Lightweight runtime assertions (acts as tiny tests) ---
if (typeof window !== 'undefined') {
  (function runTinyTests() {
    const csv = toCSV([
      { id: 't1', codigo: 'PE 001 - 2025', proyecto: 'Demo', responsable: 'Tester', fechaInicio: '01-01-2025', fechaFin: '02-01-2025', clientes: ['C1','C2'], estado: 'En proceso' },
    ]);
    console.assert(csv.startsWith('Código,Proyecto,Responsable'), 'CSV header incorrecto');
    console.assert(csv.includes('"Demo"'), 'CSV no contiene proyecto');

    // Extra test: escaping double quotes in project name
    const csv2 = toCSV([
      { id: 't2', codigo: 'PE 002 - 2025', proyecto: 'Obra "Piloto"', responsable: 'QA', fechaInicio: '01-02-2025', fechaFin: '03-02-2025', clientes: [], estado: 'En pausa' },
    ]);
    console.assert(csv2.includes('"Obra ""Piloto"""'), 'CSV no escapó las comillas correctamente');

    const csv3 = toCSV([
      { id: 't3', codigo: 'PE 003 - 2025', proyecto: 'Alpha', responsable: 'Doe, John', fechaInicio: '01-03-2025', fechaFin: '05-03-2025', clientes: ['Cliente "A"', 'Cliente B'], estado: 'Completado' },
    ]);
    console.assert(csv3.includes('"Doe, John"'), 'CSV no escapó la coma en responsable');
    console.assert(csv3.includes('"Cliente ""A""; Cliente B"'), 'CSV no escapó las comillas en clientes');
  })();
}
