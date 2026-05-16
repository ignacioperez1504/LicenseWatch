import React, { useState, useMemo } from 'react';
import { 
  Bell, 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  X, 
  Building2, 
  Monitor, 
  CreditCard,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Layout,
  MapPin,
  Calendar,
  Clock,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const INITIAL_COUNTRIES = [
  { id: '1', iso: 'AR', name: 'Argentina' },
  { id: '2', iso: 'BR', name: 'Brazil' },
  { id: '3', iso: 'CL', name: 'Chile' },
  { id: '4', iso: 'CO', name: 'Colombia' },
  { id: '5', iso: 'CR', name: 'Costa Rica' },
  { id: '6', iso: 'CW', name: 'Curaçao' },
  { id: '7', iso: 'DO', name: 'República Dominicana' },
  { id: '8', iso: 'EC', name: 'Ecuador' },
  { id: '9', iso: 'GT', name: 'Guatemala' },
  { id: '10', iso: 'GY', name: 'Guyana' },
  { id: '11', iso: 'HT', name: 'Haití' },
  { id: '12', iso: 'JM', name: 'Jamaica' },
  { id: '13', iso: 'MX', name: 'México' },
  { id: '14', iso: 'PA', name: 'Panamá' },
  { id: '15', iso: 'PE', name: 'Perú' },
  { id: '16', iso: 'PY', name: 'Paraguay' },
  { id: '17', iso: 'SX', name: 'Sint Maarten' },
  { id: '18', iso: 'US', name: 'Estados Unidos' },
  { id: '19', iso: 'UY', name: 'Uruguay' },
  { id: '20', iso: 'VE', name: 'Venezuela' },
].sort((a, b) => a.name.localeCompare(b.name));

const INITIAL_COMPANIES = {
  '1': [{ id: 'c1', name: 'Argentum Tech' }],
  '18': [{ id: 'c6', name: 'Global Tech US' }],
};

const INITIAL_STATIONS = {
  'c1': [{ id: 's1', name: 'Ezeiza Main', iataCode: 'EZE' }],
  'c6': [{ id: 's2', name: 'Miami Hub', iataCode: 'MIA' }],
};

// Seed licenses: one green, one red
const INITIAL_LICENSES = {
  's1': [{ id: 'l1', name: 'Operación Portuaria A', expiryDate: '2026-12-31', alertDays: 30, notes: 'Renovación anual' }],
  's2': [{ id: 'l2', name: 'Permiso Federal v3', expiryDate: '2026-06-01', alertDays: 30, notes: 'Urgente' }],
};

const getFlagEmoji = (countryCode) => {
  const codePoints = countryCode.toUpperCase().split('').map(char => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
};

const getDaysRemaining = (expiryDate) => {
  if (!expiryDate) return null;
  const diff = new Date(expiryDate) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const getStatusFromDays = (days) => {
  if (days === null) return 'none';
  if (days < 30) return 'red';
  if (days <= 90) return 'yellow';
  return 'green';
};

export default function App() {
  const [countries, setCountries] = useState(INITIAL_COUNTRIES);
  const [companies, setCompanies] = useState(INITIAL_COMPANIES);
  const [stations, setStations] = useState(INITIAL_STATIONS);
  const [licenses, setLicenses] = useState(INITIAL_LICENSES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [expandedCompanies, setExpandedCompanies] = useState(new Set());
  const [expandedStations, setExpandedStations] = useState(new Set());
  
  // Modals
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState(null);
  const [countryForm, setCountryForm] = useState({ name: '', iso: '' });
  
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [companyForm, setCompanyForm] = useState({ name: '' });

  const [isStationModalOpen, setIsStationModalOpen] = useState(false);
  const [editingStation, setEditingStation] = useState(null);
  const [activeCompanyId, setActiveCompanyId] = useState(null);
  const [stationForm, setStationForm] = useState({ name: '', iataCode: '' });

  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState(null);
  const [activeStationId, setActiveStationId] = useState(null);
  const [licenseForm, setLicenseForm] = useState({ name: '', expiryDate: '', alertDays: 30, notes: '' });
  
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Derived Data for Table
  const countryMetrics = useMemo(() => {
    const metrics = {};
    countries.forEach(country => {
      let totalLicenses = 0;
      let worstStatus = 'none';
      
      const countryCompanies = companies[country.id] || [];
      countryCompanies.forEach(company => {
        const companyStations = stations[company.id] || [];
        companyStations.forEach(station => {
          const stationLicenses = licenses[station.id] || [];
          totalLicenses += stationLicenses.length;
          stationLicenses.forEach(lic => {
            const days = getDaysRemaining(lic.expiryDate);
            const status = getStatusFromDays(days);
            if (status === 'red') worstStatus = 'red';
            else if (status === 'yellow' && worstStatus !== 'red') worstStatus = 'yellow';
            else if (status === 'green' && worstStatus === 'none') worstStatus = 'green';
          });
        });
      });
      metrics[country.id] = { count: totalLicenses, status: worstStatus };
    });
    return metrics;
  }, [countries, companies, stations, licenses]);

  const filteredCountries = useMemo(() => {
    return countries.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.iso.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [countries, searchQuery]);

  // Handlers
  const handleCountrySubmit = (e) => {
    e.preventDefault();
    if (editingCountry) {
      setCountries(countries.map(c => c.id === editingCountry.id ? { ...c, ...countryForm, iso: countryForm.iso.toUpperCase() } : c));
    } else {
      const newCountry = { id: Math.random().toString(36).substr(2, 9), ...countryForm, iso: countryForm.iso.toUpperCase() };
      setCountries([...countries, newCountry].sort((a, b) => a.name.localeCompare(b.name)));
    }
    setIsCountryModalOpen(false);
  };

  const handleCompanySubmit = (e) => {
    e.preventDefault();
    const current = companies[selectedCountry.id] || [];
    if (editingCompany) {
      setCompanies({ ...companies, [selectedCountry.id]: current.map(c => c.id === editingCompany.id ? { ...c, name: companyForm.name } : c) });
    } else {
      const newCo = { id: Math.random().toString(36).substr(2, 9), name: companyForm.name };
      setCompanies({ ...companies, [selectedCountry.id]: [...current, newCo] });
    }
    setIsCompanyModalOpen(false);
  };

  const handleStationSubmit = (e) => {
    e.preventDefault();
    const current = stations[activeCompanyId] || [];
    if (editingStation) {
      setStations({ ...stations, [activeCompanyId]: current.map(s => s.id === editingStation.id ? { ...s, ...stationForm, iataCode: stationForm.iataCode.toUpperCase() } : s) });
    } else {
      const newSt = { id: Math.random().toString(36).substr(2, 9), ...stationForm, iataCode: stationForm.iataCode.toUpperCase() };
      setStations({ ...stations, [activeCompanyId]: [...current, newSt] });
    }
    setIsStationModalOpen(false);
  };

  const handleLicenseSubmit = (e) => {
    e.preventDefault();
    const current = licenses[activeStationId] || [];
    if (editingLicense) {
      setLicenses({ ...licenses, [activeStationId]: current.map(l => l.id === editingLicense.id ? { ...l, ...licenseForm } : l) });
    } else {
      const newLic = { id: Math.random().toString(36).substr(2, 9), ...licenseForm };
      setLicenses({ ...licenses, [activeStationId]: [...current, newLic] });
    }
    setIsLicenseModalOpen(false);
  };

  const openLicenseModal = (e, stationId, license = null) => {
    e.stopPropagation();
    setActiveStationId(stationId);
    setEditingLicense(license);
    setLicenseForm(license ? { ...license } : { name: '', expiryDate: '', alertDays: 30, notes: '' });
    setIsLicenseModalOpen(true);
  };

  const toggleExpand = (set, setter, id) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setter(next);
  };

  const handleDelete = () => {
    const { type, item, parentId } = deleteTarget;
    if (type === 'country') {
      setCountries(countries.filter(c => c.id !== item.id));
      if (selectedCountry?.id === item.id) setSelectedCountry(null);
    } else if (type === 'company') {
      setCompanies({ ...companies, [parentId]: companies[parentId].filter(c => c.id !== item.id) });
    } else if (type === 'station') {
      setStations({ ...stations, [parentId]: stations[parentId].filter(s => s.id !== item.id) });
    } else if (type === 'license') {
      setLicenses({ ...licenses, [parentId]: licenses[parentId].filter(l => l.id !== item.id) });
    }
    setIsDeleteConfirmOpen(false);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-surface flex flex-col items-center py-8 z-20">
        <div className="flex items-center gap-3 px-6 mb-12">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg"><Layout className="text-white w-6 h-6" /></div>
          <h1 className="text-xl font-bold text-white">License<span className="text-primary">Watch</span></h1>
        </div>
        <nav className="flex-1 w-full px-4"><button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 text-white border border-white/10 transition-all"><div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />Dashboard</button></nav>
        <div className="px-4 w-full"><div className="relative p-4 rounded-2xl bg-white/5 border border-white/5"><div className="flex items-center justify-between mb-2"><span className="text-xs font-semibold text-muted uppercase">Notifications</span><Bell className="w-4 h-4 text-primary" /></div><p className="text-sm text-slate-400 italic">No alerts today.</p></div></div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative min-w-0">
        <header className="h-20 px-8 flex items-center justify-between border-b border-white/5 bg-background/50 backdrop-blur-md z-10">
          <div className="relative w-96"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" /><input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-surface border border-white/5 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" /></div>
          <button onClick={() => { setEditingCountry(null); setCountryForm({ name: '', iso: '' }); setIsCountryModalOpen(true); }} className="btn-primary"><Plus className="w-4 h-4" /> Add Country</button>
        </header>

        <div className="flex-1 overflow-auto p-8">
          <div className="card">
            <table className="w-full text-left border-collapse">
              <thead><tr className="border-b border-white/5 bg-white/[0.02]"><th className="px-6 py-4 text-xs font-semibold text-muted uppercase">Flag | ISO</th><th className="px-6 py-4 text-xs font-semibold text-muted uppercase">Country</th><th className="px-6 py-4 text-xs font-semibold text-muted uppercase text-center">Companies</th><th className="px-6 py-4 text-xs font-semibold text-muted uppercase text-center">Active Licenses</th><th className="px-6 py-4 text-xs font-semibold text-muted uppercase">Status</th><th className="px-6 py-4 text-xs font-semibold text-muted uppercase text-right">Actions</th></tr></thead>
              <tbody>
                {filteredCountries.map((country) => {
                  const m = countryMetrics[country.id];
                  return (
                    <tr key={country.id} onClick={() => setSelectedCountry(country)} className={cn("table-row-hover", selectedCountry?.id === country.id && "bg-primary/5 border-l-2 border-l-primary")}>
                      <td className="px-6 py-4 font-mono text-xs"><span className="text-xl mr-2">{getFlagEmoji(country.iso)}</span>{country.iso}</td>
                      <td className="px-6 py-4 font-medium">{country.name}</td>
                      <td className="px-6 py-4 text-center text-xs">{companies[country.id]?.length || 0}</td>
                      <td className="px-6 py-4 text-center font-mono text-sm font-bold text-primary">{m.count}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={cn("status-dot", m.status === 'red' && "bg-danger shadow-[0_0_8px_rgba(239,68,68,0.5)]", m.status === 'yellow' && "bg-warning shadow-[0_0_8px_rgba(245,158,11,0.5)]", m.status === 'green' && "bg-accent shadow-[0_0_8px_rgba(34,211,238,0.5)]", m.status === 'none' && "bg-slate-600")} />
                          <span className="text-[10px] uppercase font-bold text-slate-400">{m.status === 'none' ? 'No Data' : m.status === 'red' ? 'Critical' : m.status === 'yellow' ? 'Attention' : 'Healthy'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right"><div className="flex justify-end gap-1"><button onClick={(e) => { e.stopPropagation(); setEditingCountry(country); setCountryForm({ name: country.name, iso: country.iso }); setIsCountryModalOpen(true); }} className="p-2 hover:bg-white/10 rounded-lg text-muted"><Edit2 className="w-4 h-4" /></button><button onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: 'country', item: country }); setIsDeleteConfirmOpen(true); }} className="p-2 hover:bg-danger/20 rounded-lg text-muted hover:text-danger"><Trash2 className="w-4 h-4" /></button></div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Panel */}
        <AnimatePresence>
          {selectedCountry && (
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }} className="absolute right-0 top-0 bottom-0 w-96 glass border-l border-white/10 z-30 flex flex-col shadow-2xl">
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-surface/50"><div className="flex items-center gap-3"><span className="text-2xl">{getFlagEmoji(selectedCountry.iso)}</span><div><h2 className="text-xl font-bold text-white">{selectedCountry.name}</h2><p className="text-xs font-mono text-muted">{selectedCountry.iso}</p></div></div><button onClick={() => setSelectedCountry(null)} className="p-2 hover:bg-white/10 rounded-lg text-muted"><X className="w-5 h-5" /></button></div>
              <div className="flex-1 overflow-auto p-6 space-y-6">
                <section>
                  <div className="flex items-center justify-between mb-4"><h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Building2 className="w-3.5 h-3.5 text-primary" /> EMPRESAS</h3><button onClick={() => { setEditingCompany(null); setCompanyForm({ name: '' }); setIsCompanyModalOpen(true); }} className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-1 rounded border border-primary/20">+ EMPRESA</button></div>
                  <div className="space-y-4">
                    {(companies[selectedCountry.id] || []).map(company => (
                      <div key={company.id} className="group">
                        <div onClick={() => toggleExpand(expandedCompanies, setExpandedCompanies, company.id)} className={cn("flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer", expandedCompanies.has(company.id) ? "bg-primary/10 border-primary/30" : "bg-white/[0.03] border-white/5 hover:border-white/20")}>
                          <div className="flex items-center gap-3">{expandedCompanies.has(company.id) ? <ChevronUp className="w-4 h-4 text-primary" /> : <ChevronDown className="w-4 h-4 text-muted" />}<span className="text-sm font-bold text-slate-100">{company.name}</span></div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={(e) => { e.stopPropagation(); setEditingCompany(company); setCompanyForm({ name: company.name }); setIsCompanyModalOpen(true); }} className="p-1 hover:bg-white/10 rounded text-muted"><Edit2 className="w-3.5 h-3.5" /></button><button onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: 'company', item: company, parentId: selectedCountry.id }); setIsDeleteConfirmOpen(true); }} className="p-1 hover:bg-danger/20 rounded text-muted hover:text-danger"><Trash2 className="w-3.5 h-3.5" /></button></div>
                        </div>
                        <AnimatePresence>{expandedCompanies.has(company.id) && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-black/20 rounded-b-xl -mt-2 pt-4 px-3 pb-3 border-x border-b border-primary/20 space-y-4">
                            <div className="flex items-center justify-between mb-2"><h4 className="text-[9px] font-bold text-muted uppercase flex items-center gap-1.5"><Monitor className="w-3 h-3" /> Estaciones</h4><button onClick={(e) => { e.stopPropagation(); setActiveCompanyId(company.id); setEditingStation(null); setStationForm({ name: '', iataCode: '' }); setIsStationModalOpen(true); }} className="text-[9px] font-bold text-accent">+ ESTACIÓN</button></div>
                            {(stations[company.id] || []).map(station => (
                              <div key={station.id} className="group/st">
                                <div onClick={() => toggleExpand(expandedStations, setExpandedStations, station.id)} className={cn("flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer", expandedStations.has(station.id) ? "bg-accent/10 border-accent/30" : "bg-white/[0.02] border-white/5 hover:border-accent/20")}>
                                  <div className="flex items-center gap-2"><MapPin className={cn("w-3.5 h-3.5", expandedStations.has(station.id) ? "text-accent" : "text-muted")} /><span className="text-xs font-semibold">{station.name}</span>{station.iataCode && <span className="text-[9px] font-mono bg-black/40 px-1.5 py-0.5 rounded text-accent/80 border border-accent/10">{station.iataCode}</span>}</div>
                                  <div className="flex gap-1 opacity-0 group-hover/st:opacity-100 transition-opacity"><button onClick={(e) => { e.stopPropagation(); setActiveCompanyId(company.id); setEditingStation(station); setStationForm({ name: station.name, iataCode: station.iataCode }); setIsStationModalOpen(true); }} className="p-1 hover:bg-white/10 rounded text-muted"><Edit2 className="w-3 h-3" /></button><button onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: 'station', item: station, parentId: company.id }); setIsDeleteConfirmOpen(true); }} className="p-1 hover:bg-danger/20 rounded text-muted hover:text-danger"><Trash2 className="w-3 h-3" /></button></div>
                                </div>
                                <AnimatePresence>{expandedStations.has(station.id) && (
                                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-black/30 rounded-b-lg -mt-1 pt-3 px-3 pb-3 border-x border-b border-accent/20 space-y-3">
                                    <div className="flex items-center justify-between mb-2"><h5 className="text-[8px] font-bold text-muted uppercase flex items-center gap-1"><CreditCard className="w-2.5 h-2.5" /> Licencias</h5><button onClick={(e) => openLicenseModal(e, station.id)} className="text-[8px] font-bold text-white bg-white/10 px-2 py-0.5 rounded">+ LICENCIA</button></div>
                                    <div className="space-y-2">
                                      {(licenses[station.id] || []).length === 0 ? <p className="text-[10px] text-muted italic text-center py-2">Sin licencias activas.</p> : (licenses[station.id] || []).map(lic => {
                                        const days = getDaysRemaining(lic.expiryDate);
                                        const st = getStatusFromDays(days);
                                        return (
                                          <div key={lic.id} className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-between group/lic">
                                            <div className="flex items-center gap-3">
                                              <div className={cn("w-1.5 h-1.5 rounded-full", st === 'red' ? "bg-danger" : st === 'yellow' ? "bg-warning" : st === 'green' ? "bg-accent" : "bg-slate-600")} />
                                              <div><p className="text-xs font-bold text-slate-200">{lic.name}</p><div className="flex items-center gap-3 mt-0.5 text-[10px] text-slate-500 font-mono"><span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{lic.expiryDate || 'Sin fecha'}</span><span className={cn("font-bold", st === 'red' ? "text-danger" : st === 'yellow' ? "text-warning" : "text-accent")}>{days !== null ? `${days} días` : 'N/A'}</span></div></div>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover/lic:opacity-100 transition-opacity"><button onClick={(e) => openLicenseModal(e, station.id, lic)} className="p-1 hover:bg-white/10 rounded text-muted"><Edit2 className="w-3 h-3" /></button><button onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: 'license', item: lic, parentId: station.id }); setIsDeleteConfirmOpen(true); }} className="p-1 hover:bg-danger/20 rounded text-muted hover:text-danger"><Trash2 className="w-3 h-3" /></button></div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </motion.div>
                                )}</AnimatePresence>
                              </div>
                            ))}
                          </motion.div>
                        )}</AnimatePresence>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modals: Country, Company, Station, License */}
      <AnimatePresence>
        {/* Simplified for brevity but functional */}
        {isCountryModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCountryModalOpen(false)} className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            <div className="relative w-full max-w-md card p-8 z-10">
              <h2 className="text-2xl font-bold mb-6 text-white">{editingCountry ? 'Editar País' : 'Nuevo País'}</h2>
              <form onSubmit={handleCountrySubmit} className="space-y-4">
                <input required type="text" value={countryForm.name} placeholder="Nombre del País" onChange={e => setCountryForm({...countryForm, name: e.target.value})} className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none" />
                <input required maxLength={2} type="text" value={countryForm.iso} placeholder="ISO" onChange={e => setCountryForm({...countryForm, iso: e.target.value.toUpperCase()})} className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white font-mono focus:border-primary outline-none" />
                <div className="flex gap-3"><button type="button" onClick={() => setIsCountryModalOpen(false)} className="flex-1 py-3 border border-white/10 rounded-xl text-slate-300">Cancelar</button><button type="submit" className="flex-[2] btn-primary justify-center">Guardar</button></div>
              </form>
            </div>
          </div>
        )}

        {isCompanyModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCompanyModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div className="relative w-full max-w-sm glass p-8 z-10 rounded-3xl">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Building2 className="w-5 h-5 text-primary" /> {editingCompany ? 'Editar Empresa' : 'Nueva Empresa'}</h3>
              <form onSubmit={handleCompanySubmit} className="space-y-4">
                <input required autoFocus type="text" value={companyForm.name} placeholder="Nombre" onChange={e => setCompanyForm({name: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-primary outline-none" />
                <div className="flex gap-3"><button type="button" onClick={() => setIsCompanyModalOpen(false)} className="flex-1 py-3 text-slate-400">Cancelar</button><button type="submit" className="flex-[2] bg-primary text-white py-3 rounded-2xl font-bold">Guardar</button></div>
              </form>
            </div>
          </div>
        )}

        {isStationModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsStationModalOpen(false)} className="absolute inset-0 bg-black/70 backdrop-blur-md" />
            <div className="relative w-full max-w-sm glass p-8 z-10 rounded-3xl">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><MapPin className="w-5 h-5 text-accent" /> {editingStation ? 'Editar Estación' : 'Nueva Estación'}</h3>
              <form onSubmit={handleStationSubmit} className="space-y-4">
                <input required autoFocus type="text" value={stationForm.name} placeholder="Nombre" onChange={e => setStationForm({...stationForm, name: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-accent outline-none" />
                <input maxLength={3} type="text" value={stationForm.iataCode} placeholder="IATA (BOG, MIA...)" onChange={e => setStationForm({...stationForm, iataCode: e.target.value.toUpperCase()})} className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 text-white font-mono focus:border-accent outline-none" />
                <div className="flex gap-3"><button type="button" onClick={() => setIsStationModalOpen(false)} className="flex-1 py-3 text-slate-400">Cancelar</button><button type="submit" className="flex-[2] bg-accent text-white py-3 rounded-2xl font-bold">Guardar</button></div>
              </form>
            </div>
          </div>
        )}

        {isLicenseModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsLicenseModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-lg" />
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="relative w-full max-w-md glass p-8 z-10 rounded-3xl border-white/10 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3"><Clock className="w-6 h-6 text-primary" /> {editingLicense ? 'Editar Licencia' : 'Nueva Licencia'}</h3>
              <form onSubmit={handleLicenseSubmit} className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Nombre del Permiso / Licencia</label>
                  <input required autoFocus type="text" value={licenseForm.name} placeholder="Ej. Permiso de Operación Aérea" onChange={e => setLicenseForm({...licenseForm, name: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-primary outline-none transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Fecha de Vencimiento</label>
                  <input required type="date" value={licenseForm.expiryDate} onChange={e => setLicenseForm({...licenseForm, expiryDate: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-primary outline-none transition-all [color-scheme:dark]" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Alerta (Días)</label>
                  <input required type="number" value={licenseForm.alertDays} onChange={e => setLicenseForm({...licenseForm, alertDays: parseInt(e.target.value)})} className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-primary outline-none transition-all" />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Notas Adicionales</label>
                  <textarea value={licenseForm.notes} placeholder="Detalles de renovación, responsables..." onChange={e => setLicenseForm({...licenseForm, notes: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-primary outline-none h-24 resize-none transition-all" />
                </div>
                <div className="col-span-2 flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsLicenseModalOpen(false)} className="flex-1 py-4 text-slate-400 font-bold hover:text-white transition-colors">Cancelar</button>
                  <button type="submit" className="flex-[2] bg-primary text-white py-4 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:bg-primary-hover active:scale-95 transition-all">{editingLicense ? 'Actualizar' : 'Crear Licencia'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isDeleteConfirmOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
            <div className="relative w-full max-w-sm glass rounded-3xl p-8 z-10 text-center border-danger/20">
              <div className="w-16 h-16 bg-danger/10 text-danger rounded-full flex items-center justify-center mx-auto mb-6"><AlertCircle className="w-8 h-8" /></div>
              <h3 className="text-xl font-bold text-white mb-2">¿Eliminar registro?</h3>
              <p className="text-slate-400 mb-8 text-sm italic">Esta acción borrará permanentemente los datos seleccionados.</p>
              <div className="flex gap-3"><button onClick={() => setIsDeleteConfirmOpen(false)} className="flex-1 py-3 bg-white/5 rounded-xl text-slate-300">Cancelar</button><button onClick={handleDelete} className="flex-1 py-3 bg-danger rounded-xl text-white font-bold">Eliminar</button></div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
