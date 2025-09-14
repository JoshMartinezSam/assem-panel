import React, { useMemo, useState, useEffect } from 'react'
import { Bell, CalendarClock, CheckCircle2, ChevronDown, CircleDot, Download, Eye, Home, Link as LinkIcon, PauseCircle, Pencil, Plus, Search, Settings, User2, Users, Wrench, X } from 'lucide-react'

type Estado = 'En proceso' | 'En pausa' | 'Completado'
type Proyecto = {
  id: string
  codigo: string
  proyecto: string
  responsable: string
  fechaInicio: string
  fechaFin: string
  clientes: string[]
  estado: Estado
}

function pillClass(estado: Estado) {
  if (estado === 'Completado') return 'pill pill-green'
  if (estado === 'En pausa') return 'pill pill-amber'
  return 'pill pill-blue'
}

export default function App() {
  const [query, setQuery] = useState('')
  const [porPagina, setPorPagina] = useState(10)
  const [page, setPage] = useState(1)
  const [filterResponsable, setFilterResponsable] = useState('')
  const [filterEstado, setFilterEstado] = useState<Estado | ''>('')

  const [proyectos, setProyectos] = useState<Proyecto[]>([
    {id:'1', codigo:'PE 232 - 2025', proyecto:'DISEÑO DE INSTALACIONES SANITARIAS Y ELÉCTRICAS DUPLEX FRANCIA', responsable:'Josh Haresh Martinez Samaniego', fechaInicio:'04-09-2025', fechaFin:'10-09-2025', clientes:['Robles Mendoza','Carlos Yu-Yi'], estado:'En proceso'},
    {id:'2', codigo:'PE 226 - 2025', proyecto:'ELABORACIÓN DE PLANOS AS BUILT DE ARQUITECTURA Y ESPECIALIDADES DE VIVIENDA UNIFAMILIAR', responsable:'Luis Alex Gonzalez Salsavilca', fechaInicio:'10-09-2025', fechaFin:'29-09-2025', clientes:['Cervantes Teodoro','Maximiliana Felicita'], estado:'En proceso'},
    {id:'3', codigo:'PE 184 - 2025', proyecto:'IIISS PARA TELEFÓNICA DEL PERÚ – EDIFICIO SURQUILLO PISO 5', responsable:'Josh Haresh Martinez Samaniego', fechaInicio:'11-07-2025', fechaFin:'18-07-2025', clientes:['Bosch Arquitectos Perú S.R.L.'], estado:'En proceso'},
  ])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return proyectos.filter(p => (p.codigo + ' ' + p.proyecto + ' ' + p.responsable + ' ' + p.clientes.join(' ')).toLowerCase().includes(q))
  }, [proyectos, query])

  const responsablesOptions = useMemo(() => Array.from(new Set(filtered.map(p => p.responsable))).sort(), [filtered])
  const estadosOptions = useMemo(() => Array.from(new Set(filtered.map(p => p.estado))), [filtered])

  const filtered2 = useMemo(() => filtered.filter(p => (!filterResponsable || p.responsable === filterResponsable) && (!filterEstado || p.estado === filterEstado)), [filtered, filterResponsable, filterEstado])

  const pages = useMemo(() => Math.max(1, Math.ceil(filtered2.length / porPagina)), [filtered2, porPagina])
  useEffect(()=>{ if(page > pages) setPage(pages) }, [pages])
  useEffect(()=>{ setPage(1) }, [porPagina, query, filterResponsable, filterEstado])

  const current = useMemo(() => {
    const start = (page - 1) * porPagina
    return filtered2.slice(start, start + porPagina)
  }, [filtered2, page, porPagina])

  const [showCrono, setShowCrono] = useState(false)
  const [showNuevo, setShowNuevo] = useState(false)

  const onGuardarNuevo = () => {
    const codigo = (document.getElementById('np_codigo') as HTMLInputElement).value.trim() || 'PE 000 - 2025'
    const proyecto = (document.getElementById('np_proyecto') as HTMLInputElement).value.trim() || 'Proyecto sin título'
    const responsable = (document.getElementById('np_responsable') as HTMLInputElement).value.trim() || '—'
    const clientes = (document.getElementById('np_clientes') as HTMLInputElement).value.split(',').map(s=>s.trim()).filter(Boolean)
    const fechaInicio = (document.getElementById('np_ini') as HTMLInputElement).value.trim() || '—'
    const fechaFin = (document.getElementById('np_fin') as HTMLInputElement).value.trim() || '—'
    const estado = ((document.getElementById('np_estado') as HTMLSelectElement).value as Estado) || 'En proceso'
    setProyectos(prev => [{ id: Math.random().toString(36).slice(2), codigo, proyecto, responsable, clientes, fechaInicio, fechaFin, estado }, ...prev])
    setShowNuevo(false)
    ;['np_codigo','np_proyecto','np_responsable','np_clientes','np_ini','np_fin'].forEach(id => { const el = document.getElementById(id) as HTMLInputElement; if(el) el.value = '' })
    ;(document.getElementById('np_estado') as HTMLSelectElement).value = 'En proceso'
  }

  const exportCSV = () => {
    const header = ['Código','Proyecto','Responsable','Fecha de inicio','Fecha final','Clientes','Estado']
    const lines = current.map(r => [r.codigo, '"' + r.proyecto.replace(/"/g,'""') + '"', r.responsable, r.fechaInicio, r.fechaFin, '"' + r.clientes.join('; ') + '"', r.estado].join(','))
    const csv = [header.join(','), ...lines].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'proyectos-assem-' + new Date().toISOString().slice(0,10) + '.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* Top bar */}
      <div className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white font-bold">AS</div>
            <div>
              <div className="text-xs tracking-wider text-slate-500">FORMATOS DE</div>
              <div className="text-sm font-semibold">ASSEM INGENIEROS CONSULTORES</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="icon-btn" title="Notificaciones"><Bell className="h-5 w-5"/></button>
            <button className="icon-btn" title="Usuarios"><Users className="h-5 w-5"/></button>
            <button className="icon-btn" title="Ajustes"><Settings className="h-5 w-5"/></button>
            <div className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold">JM</div>
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="mx-auto grid max-w-7xl grid-cols-12 gap-6 px-4 py-6">
        {/* Sidebar */}
        <aside className="col-span-12 h-fit rounded-2xl border bg-white p-3 md:sticky md:top-20 md:col-span-3">
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-slate-100 text-slate-600"><Home className="h-4 w-4"/> Home</button>
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-slate-100 text-slate-600"><User2 className="h-4 w-4"/> Perfil</button>
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-slate-100 text-slate-600"><Bell className="h-4 w-4"/> Notificaciones</button>
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-slate-100 text-slate-600"><Users className="h-4 w-4"/> Equipo Assem</button>
          <div className="my-2 h-px bg-slate-100"></div>
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm bg-slate-100 font-medium"><Wrench className="h-4 w-4"/> Proyectos</button>
        </aside>

        {/* Main */}
        <main className="col-span-12 md:col-span-9">
          <div className="card">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b p-4">
              <h1 className="text-base font-semibold">Panel de proyectos</h1>
              <div className="flex flex-wrap items-center gap-2">
                <button className="btn btn-secondary" onClick={()=>setShowCrono(true)}><CalendarClock className="h-4 w-4"/> Ver cronograma</button>
                <button className="btn btn-outline" onClick={exportCSV}><Download className="h-4 w-4"/> Exportar CSV</button>
                <button className="btn" onClick={()=>setShowNuevo(true)}><Plus className="h-4 w-4"/> Crear proyecto</button>
              </div>
            </div>

            <div className="p-4">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/>
                    <input className="pl-8 w-72 rounded-md border px-3 py-2 text-sm" placeholder="Búsqueda" value={query} onChange={(e)=>setQuery(e.target.value)}/>
                  </div>

                  {/* Responsable */}
                  <div className="dropdown">
                    <button className="btn btn-outline gap-2"><span>{filterResponsable ? `Responsable: ${filterResponsable}` : 'Responsable'}</span><ChevronDown className="h-4 w-4"/></button>
                    <div className="dropdown-menu">
                      <button className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-50" onClick={()=>setFilterResponsable('')}>Todos</button>
                      {responsablesOptions.map(r => (
                        <button key={r} className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-50" onClick={()=>setFilterResponsable(r)}>{r}</button>
                      ))}
                    </div>
                  </div>

                  {/* Estado */}
                  <div className="dropdown">
                    <button className="btn btn-outline gap-2"><span>{filterEstado ? `Estado: ${filterEstado}` : 'Estado'}</span><ChevronDown className="h-4 w-4"/></button>
                    <div className="dropdown-menu">
                      <button className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-50" onClick={()=>setFilterEstado('')}>Todos</button>
                      {estadosOptions.map(e => (
                        <button key={e} className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-50" onClick={()=>setFilterEstado(e)}>{e}</button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-500">Registros:</span>
                    <select className="rounded-md border px-2 py-1 text-sm" value={porPagina} onChange={(e)=>setPorPagina(parseInt(e.target.value))}>
                      {[10,25,50].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                </div>
                <div className="text-sm text-slate-500">Total: {filtered2.length}</div>
              </div>

              {(filterResponsable || filterEstado) && (
                <div className="-mt-2 mb-4 flex flex-wrap items-center gap-2">
                  {filterResponsable && <button className="chip" onClick={()=>setFilterResponsable('')}>Responsable: {filterResponsable} <X className="w-3 h-3"/></button>}
                  {filterEstado && <button className="chip" onClick={()=>setFilterEstado('')}>Estado: {filterEstado} <X className="w-3 h-3"/></button>}
                  <button className="btn btn-ghost text-sm" onClick={()=>{setFilterResponsable(''); setFilterEstado('')}}>Limpiar filtros</button>
                </div>
              )}

              <div className="overflow-hidden rounded-2xl border">
                <table className="w-full table">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="w-[130px]">CÓDIGO</th>
                      <th>PROYECTO</th>
                      <th className="w-[220px]">RESPONSABLE</th>
                      <th className="w-[120px]">F. INICIO</th>
                      <th className="w-[120px]">F. FINAL</th>
                      <th className="w-[220px]">CLIENTES</th>
                      <th className="w-[130px]">ACCIONES</th>
                      <th className="w-[160px]">ESTADO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {current.map(p => (
                      <tr key={p.id} className="align-top">
                        <td className="font-medium">{p.codigo}</td>
                        <td><div className="font-medium leading-tight">{p.proyecto}</div><div className="text-xs text-slate-500">ASSEM</div></td>
                        <td><div className="truncate" title={p.responsable}>{p.responsable}</div></td>
                        <td>{p.fechaInicio}</td>
                        <td>{p.fechaFin}</td>
                        <td>{p.clientes.map((c,i)=><div key={i} className="truncate">{c}</div>)}</td>
                        <td>
                          <div className="flex gap-2">
                            <button className="icon-btn" title="Vincular"><LinkIcon className="h-4 w-4"/></button>
                            <button className="icon-btn" title="Equipo"><Users className="h-4 w-4"/></button>
                            <button className="icon-btn" title="Ver"><Eye className="h-4 w-4"/></button>
                            <button className="icon-btn" title="Editar"><Pencil className="h-4 w-4"/></button>
                          </div>
                        </td>
                        <td>
                          <div className="relative inline-block">
                            <button className={pillClass(p.estado)} onClick={(e)=>{
                              const target = (e.currentTarget.nextSibling as HTMLElement)
                              document.querySelectorAll('.estado-menu').forEach(el=>el.classList.add('hidden'))
                              target.classList.toggle('hidden')
                            }}>
                              {p.estado === 'Completado' ? <CheckCircle2 className="w-4 h-4"/> : p.estado === 'En pausa' ? <PauseCircle className="w-4 h-4"/> : <CircleDot className="w-4 h-4"/>}
                              {p.estado}
                              <ChevronDown className="w-3 h-3 opacity-70"/>
                            </button>
                            <div className="estado-menu absolute left-0 top-full z-30 hidden min-w-56 rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
                              {(['En proceso','En pausa','Completado'] as Estado[]).map(e =>
                                <button key={e} className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-50"
                                  onClick={()=>{ setProyectos(prev=>prev.map(x=>x.id===p.id?{...x,estado:e}:x)); (document.activeElement as HTMLElement)?.blur(); }}>
                                  {e}
                                </button>)}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between px-3 py-3 text-sm">
                <div>Mostrando {(page - 1) * porPagina + 1}–{Math.min((page - 1) * porPagina + porPagina, filtered2.length)} de {filtered2.length}</div>
                <div className="flex items-center gap-1 flex-wrap">
                  <button className="btn btn-outline text-sm" disabled={page===1} onClick={()=>setPage(Math.max(1,page-1))}>Anterior</button>
                  {Array.from({length: pages}, (_, i)=> i+1).map(n =>
                    <button key={n} className={'btn ' + (n===page ? '' : 'btn-outline')} onClick={()=>setPage(n)}>{n}</button>
                  )}
                  <button className="btn btn-outline text-sm" disabled={page===pages} onClick={()=>setPage(Math.min(pages,page+1))}>Siguiente</button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Cronograma modal */}
      {showCrono && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={()=>setShowCrono(false)}>
          <div className="w-full max-w-2xl rounded-2xl bg-white p-4" onClick={(e)=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">Cronograma (demo)</h2>
              <button className="icon-btn" onClick={()=>setShowCrono(false)}><X/></button>
            </div>
            <div className="grid gap-2 text-sm">
              {current.map(p => (
                <div key={p.id} className="grid grid-cols-4 items-center gap-2">
                  <div className="truncate font-medium">{p.codigo}</div>
                  <div className="col-span-2 truncate" title={p.proyecto}>{p.proyecto}</div>
                  <div><span className={pillClass(p.estado)}>{p.estado}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Nuevo proyecto modal */}
      {showNuevo && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={()=>setShowNuevo(false)}>
          <div className="w-full max-w-2xl rounded-2xl bg-white p-4" onClick={(e)=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">Nuevo proyecto</h2>
              <button className="icon-btn" onClick={()=>setShowNuevo(false)}><X/></button>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div><label className="text-xs text-slate-500">Código</label><input id="np_codigo" className="w-full rounded-md border px-3 py-2 text-sm" placeholder="PE 000 - 2025"/></div>
              <div className="md:col-span-2"><label className="text-xs text-slate-500">Proyecto</label><input id="np_proyecto" className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Descripción del proyecto"/></div>
              <div><label className="text-xs text-slate-500">Responsable</label><input id="np_responsable" className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Nombre"/></div>
              <div><label className="text-xs text-slate-500">Clientes (coma)</label><input id="np_clientes" className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Cliente A, Cliente B"/></div>
              <div><label className="text-xs text-slate-500">Fecha inicio</label><input id="np_ini" className="w-full rounded-md border px-3 py-2 text-sm" placeholder="dd-mm-aaaa"/></div>
              <div><label className="text-xs text-slate-500">Fecha final</label><input id="np_fin" className="w-full rounded-md border px-3 py-2 text-sm" placeholder="dd-mm-aaaa"/></div>
              <div className="md:col-span-2">
                <label className="text-xs text-slate-500">Estado</label>
                <select id="np_estado" className="rounded-md border px-2 py-2 text-sm">
                  <option>En proceso</option>
                  <option>En pausa</option>
                  <option>Completado</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button className="btn btn-outline" onClick={()=>setShowNuevo(false)}>Cancelar</button>
              <button className="btn" onClick={onGuardarNuevo}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
