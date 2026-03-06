import { useState, useEffect, useRef } from "react";

const API_BASE = "http://localhost:5000/Advertisement";

const PACKAGES = [
  {
    id: "basic",
    name: "Basic",
    price: 999,
    duration: "7 Days",
    color: "#6B7280",
    features: ["1 Photo Upload", "Basic Listing", "Phone Visibility", "7-Day Exposure"],
    badge: null,
  },
  {
    id: "standard",
    name: "Standard",
    price: 2499,
    duration: "14 Days",
    color: "#2563EB",
    features: ["3 Photo Uploads", "Featured Listing", "Phone + WhatsApp", "14-Day Exposure", "Priority Support"],
    badge: "Popular",
  },
  {
    id: "premium",
    name: "Premium",
    price: 4999,
    duration: "30 Days",
    color: "#D97706",
    features: ["Unlimited Photos", "Top Banner Slot", "All Contact Options", "30-Day Exposure", "24/7 Support", "Analytics"],
    badge: "Best Value",
  },
];

const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
    <path d="M2 7L5.5 10.5L12 3.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const UploadIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

export default function AdvertisementManagement() {
  const [view, setView] = useState("dashboard");
  const [step, setStep] = useState(1);
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", phoneNumber: "", price: "", imageUrl: "", paymentSlip: "", packageType: "" });
  const [imagePreview, setImagePreview] = useState(null);
  const [slipPreview, setSlipPreview] = useState(null);
  const imageRef = useRef();
  const slipRef = useRef();

  useEffect(() => { fetchAds(); }, []);

  const fetchAds = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_BASE);
      const data = await res.json();
      setAdvertisements(data.advertisements || []);
    } catch { showToast("Failed to load advertisements", "error"); }
    setLoading(false);
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const resetForm = () => {
    setForm({ name: "", description: "", phoneNumber: "", price: "", imageUrl: "", paymentSlip: "", packageType: "" });
    setSelectedPackage(null); setImagePreview(null); setSlipPreview(null); setStep(1); setEditingId(null);
  };

  const handleFileRead = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const val = reader.result;
      if (field === "imageUrl") { setImagePreview(val); setForm(f => ({ ...f, imageUrl: val })); }
      else { setSlipPreview(val); setForm(f => ({ ...f, paymentSlip: val })); }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const url = editingId ? `${API_BASE}/${editingId}` : API_BASE;
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, date: new Date() }),
      });
      if (res.ok) {
        showToast(editingId ? "Advertisement updated!" : "Advertisement published!");
        resetForm(); setView("dashboard"); fetchAds();
      } else showToast("Something went wrong", "error");
    } catch { showToast("Server connection failed", "error"); }
    setSubmitting(false);
  };

  const handleEdit = (ad) => {
    setEditingId(ad._id);
    const pkg = PACKAGES.find(p => p.id === ad.packageType) || PACKAGES[1];
    setSelectedPackage(pkg);
    setForm({ name: ad.name, description: ad.description, phoneNumber: ad.phoneNumber, price: ad.price, imageUrl: ad.imageUrl || "", paymentSlip: ad.paymentSlip || "", packageType: pkg.id });
    if (ad.imageUrl) setImagePreview(ad.imageUrl);
    if (ad.paymentSlip) setSlipPreview(ad.paymentSlip);
    setStep(2); setView("create");
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      if (res.ok) { showToast("Advertisement deleted"); fetchAds(); }
      else showToast("Delete failed", "error");
    } catch { showToast("Server error", "error"); }
    setDeleteConfirm(null);
  };

  const getPkg = (pkgId) => PACKAGES.find(p => p.id === pkgId) || PACKAGES[0];
  const counts = { basic: 0, standard: 0, premium: 0 };
  advertisements.forEach(a => { if (counts[a.packageType] !== undefined) counts[a.packageType]++; });
  const stepLabels = ["Choose Package", "Ad Details", "Payment"];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", background: "#0D0F14", color: "#E8EAED", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        .tr:hover{background:rgba(255,255,255,0.035)!important}
        .ib:hover{transform:scale(1.1);filter:brightness(1.2)}
        .ab:hover{transform:translateY(-2px);box-shadow:0 10px 30px rgba(37,99,235,0.5)!important}
        .pb:hover{transform:translateY(-1px);filter:brightness(1.12)}
        .pc:hover{transform:translateY(-4px)!important}
        input:focus,textarea:focus{border-color:rgba(59,130,246,0.55)!important;box-shadow:0 0 0 3px rgba(59,130,246,0.12)!important;outline:none}
      `}</style>

      {/* Ambient BG */}
      <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none",
        background:"radial-gradient(ellipse 80% 50% at 50% -5%, rgba(37,99,235,0.13) 0%, transparent 65%), radial-gradient(ellipse 50% 40% at 85% 85%, rgba(217,119,6,0.07) 0%, transparent 55%)" }} />

      {/* HEADER */}
      <header style={{ position:"sticky", top:0, zIndex:100, height:64, padding:"0 32px",
        background:"rgba(13,15,20,0.88)", backdropFilter:"blur(24px)",
        borderBottom:"1px solid rgba(255,255,255,0.07)",
        display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, fontFamily:"'Playfair Display',serif",
          fontSize:20, fontWeight:700, background:"linear-gradient(135deg,#F59E0B,#FDE68A)",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
          <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#D97706,#F59E0B)",
            display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          </div>
          BoardingHub
        </div>
        <nav style={{ display:"flex", gap:4 }}>
          {[["dashboard","📋  My Ads"],["create","＋  New Ad"]].map(([v, label]) => (
            <button key={v} onClick={() => { setView(v); if(v==="dashboard") resetForm(); }}
              style={{ padding:"8px 18px", borderRadius:8, border:"none", cursor:"pointer", fontSize:13, fontWeight:600, transition:"all 0.2s",
                background: view===v ? "rgba(37,99,235,0.18)" : "transparent",
                color: view===v ? "#60A5FA" : "#6B7280",
                borderBottom: view===v ? "2px solid #3B82F6" : "2px solid transparent" }}>
              {label}
            </button>
          ))}
        </nav>
      </header>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"36px 24px", position:"relative", zIndex:1 }}>

        {/* ═══ DASHBOARD ═══ */}
        {view === "dashboard" && (
          <div style={{ animation:"fadeUp 0.4s ease" }}>
            <div style={{ marginBottom:32 }}>
              <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:30, fontWeight:700, color:"#F9FAFB", marginBottom:6 }}>
                Advertisement Management
              </h1>
              <p style={{ fontSize:14, color:"#4B5563" }}>Create and manage your Advertisements</p>
            </div>

            {/* Stats */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))", gap:14, marginBottom:32 }}>
              {[
                { label:"Total Ads", val:advertisements.length, color:"#3B82F6", icon:"📢" },
                { label:"Basic Package", val:counts.basic, color:"#6B7280", icon:"📌" },
                { label:"Standard Package", val:counts.standard, color:"#2563EB", icon:"⭐" },
                { label:"Premium Package", val:counts.premium, color:"#D97706", icon:"👑" },
              ].map(s => (
                <div key={s.label} style={{ background:"rgba(255,255,255,0.025)", border:`1px solid rgba(255,255,255,0.07)`,
                  borderRadius:16, padding:"18px 22px", borderLeft:`3px solid ${s.color}` }}>
                  <div style={{ fontSize:11, color:"#4B5563", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:8 }}>
                    {s.icon} {s.label}
                  </div>
                  <div style={{ fontSize:32, fontWeight:800, color:"#F9FAFB" }}>{s.val}</div>
                </div>
              ))}
            </div>

            {/* Table Bar */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <h2 style={{ fontSize:15, fontWeight:600, color:"#D1D5DB" }}>
                All Advertisements
                <span style={{ color:"#374151", fontWeight:400, marginLeft:6 }}>({advertisements.length})</span>
              </h2>
              <button className="ab" onClick={() => { setView("create"); resetForm(); }}
                style={{ display:"flex", alignItems:"center", gap:8, padding:"11px 20px", borderRadius:11, border:"none", cursor:"pointer",
                  background:"linear-gradient(135deg,#2563EB,#1D4ED8)", color:"#fff", fontSize:13, fontWeight:700,
                  boxShadow:"0 4px 18px rgba(37,99,235,0.35)", transition:"all 0.2s" }}>
                <PlusIcon /> Create Advertisement
              </button>
            </div>

            {/* Table */}
            <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:20, overflow:"hidden" }}>
              {/* Head */}
              <div style={{ display:"grid", gridTemplateColumns:"2fr 3fr 1.3fr 1.2fr 1.2fr 100px",
                padding:"13px 24px", background:"rgba(255,255,255,0.04)", borderBottom:"1px solid rgba(255,255,255,0.07)",
                fontSize:11, fontWeight:700, color:"#374151", textTransform:"uppercase", letterSpacing:"0.07em" }}>
                {["Advertisement","Description","Phone","Package","Date","Actions"].map(h => <span key={h}>{h}</span>)}
              </div>

              {loading ? (
                <div style={{ padding:56, textAlign:"center", color:"#374151", fontSize:14 }}>
                  <div style={{ animation:"pulse 1.5s infinite" }}>Loading advertisements...</div>
                </div>
              ) : advertisements.length === 0 ? (
                <div style={{ padding:"72px 24px", textAlign:"center" }}>
                  <div style={{ fontSize:52, marginBottom:16 }}>🏠</div>
                  <div style={{ fontSize:16, color:"#4B5563", marginBottom:8, fontWeight:600 }}>No advertisements yet</div>
                  <div style={{ fontSize:13, color:"#374151" }}>Click "Create Advertisement" to get started</div>
                </div>
              ) : (
                advertisements.map((ad, i) => {
                  const pkg = getPkg(ad.packageType);
                  return (
                    <div key={ad._id} className="tr" style={{ display:"grid", gridTemplateColumns:"2fr 3fr 1.3fr 1.2fr 1.2fr 100px",
                      padding:"15px 24px", borderBottom: i < advertisements.length-1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                      alignItems:"center", transition:"background 0.15s" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                        {ad.imageUrl
                          ? <img src={ad.imageUrl} alt="" style={{ width:40, height:40, borderRadius:10, objectFit:"cover" }} />
                          : <div style={{ width:40, height:40, borderRadius:10, background:"rgba(255,255,255,0.07)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🏠</div>
                        }
                        <div>
                          <div style={{ fontSize:14, fontWeight:600, color:"#F9FAFB", marginBottom:2 }}>{ad.name}</div>
                          <div style={{ fontSize:12, color:"#374151" }}>LKR {Number(ad.price).toLocaleString()}</div>
                        </div>
                      </div>
                      <div style={{ fontSize:13, color:"#6B7280", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", paddingRight:16 }}>
                        {ad.description}
                      </div>
                      <div style={{ fontSize:13, color:"#6B7280", display:"flex", alignItems:"center", gap:5 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.81a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.02z"/>
                        </svg>
                        {ad.phoneNumber}
                      </div>
                      <div>
                        <span style={{ display:"inline-flex", alignItems:"center", padding:"4px 11px", borderRadius:20,
                          fontSize:11, fontWeight:700, background:`${pkg.color}20`, color:pkg.color, border:`1px solid ${pkg.color}40` }}>
                          {pkg.name}
                        </span>
                      </div>
                      <div style={{ fontSize:12, color:"#374151" }}>
                        {new Date(ad.date).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })}
                      </div>
                      <div style={{ display:"flex", gap:8 }}>
                        {[[<EditIcon/>, "#3B82F6", () => handleEdit(ad), "Edit"],
                          [<TrashIcon/>, "#EF4444", () => setDeleteConfirm(ad._id), "Delete"]].map(([icon, color, action, title]) => (
                          <button key={title} className="ib" title={title} onClick={action}
                            style={{ width:32, height:32, borderRadius:8, border:"none", background:`${color}18`, color:color,
                              cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s" }}>
                            {icon}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ═══ CREATE / EDIT WIZARD ═══ */}
        {view === "create" && (
          <div style={{ animation:"fadeUp 0.4s ease" }}>
            <div style={{ marginBottom:32 }}>
              <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:700, color:"#F9FAFB", marginBottom:6 }}>
                {editingId ? "Edit Advertisement" : "Create Advertisement"}
              </h1>
              <p style={{ fontSize:14, color:"#4B5563" }}>
                {editingId ? "Update your advertisement details below" : "Complete all 3 steps to publish your boarding house ad"}
              </p>
            </div>

            <div style={{ maxWidth:740, margin:"0 auto" }}>
              {/* Step Bar */}
              <div style={{ marginBottom:40 }}>
                <div style={{ display:"flex", alignItems:"flex-start" }}>
                  {stepLabels.map((label, i) => (
                    <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center", flex: i<2 ? 1 : 0 }}>
                      <div style={{ display:"flex", alignItems:"center", width:"100%" }}>
                        <div style={{ width:38, height:38, borderRadius:"50%", flexShrink:0,
                          display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, transition:"all 0.3s",
                          background: step > i+1 ? "#2563EB" : step === i+1 ? "rgba(37,99,235,0.18)" : "rgba(255,255,255,0.05)",
                          color: step > i+1 ? "#fff" : step === i+1 ? "#60A5FA" : "#374151",
                          border: step === i+1 ? "2px solid #3B82F6" : step > i+1 ? "2px solid #2563EB" : "2px solid rgba(255,255,255,0.1)" }}>
                          {step > i+1 ? <CheckIcon /> : i+1}
                        </div>
                        {i < 2 && <div style={{ flex:1, height:2, margin:"0 8px",
                          background: step > i+1 ? "#2563EB" : "rgba(255,255,255,0.07)", transition:"background 0.35s" }} />}
                      </div>
                      <div style={{ fontSize:11, fontWeight:600, marginTop:7, whiteSpace:"nowrap",
                        color: step === i+1 ? "#E8EAED" : "#374151" }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Step 1: Package ── */}
              {step === 1 && (
                <div style={{ background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:20, padding:32, animation:"slideIn 0.3s ease" }}>
                  <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700, color:"#F9FAFB", marginBottom:6 }}>Choose a Package</h2>
                  <p style={{ fontSize:13, color:"#4B5563", marginBottom:28 }}>Select the advertising tier that suits your listing</p>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:32 }}>
                    {PACKAGES.map(pkg => (
                      <div key={pkg.id} className="pc" onClick={() => setSelectedPackage(pkg)}
                        style={{ border: selectedPackage?.id === pkg.id ? `2px solid ${pkg.color}` : "2px solid rgba(255,255,255,0.08)",
                          borderRadius:16, padding:20, cursor:"pointer", transition:"all 0.25s", position:"relative",
                          background: selectedPackage?.id === pkg.id ? `${pkg.color}10` : "rgba(255,255,255,0.02)",
                          boxShadow: selectedPackage?.id === pkg.id ? `0 0 28px ${pkg.color}25` : "none" }}>
                        {pkg.badge && (
                          <div style={{ position:"absolute", top:12, right:12, padding:"3px 10px", borderRadius:20,
                            fontSize:10, fontWeight:700, background:`${pkg.color}30`, color:pkg.color, border:`1px solid ${pkg.color}50` }}>
                            {pkg.badge}
                          </div>
                        )}
                        <div style={{ fontSize:16, fontWeight:700, color:"#F9FAFB", marginBottom:2 }}>{pkg.name}</div>
                        <div style={{ fontSize:26, fontWeight:800, color:pkg.color, margin:"8px 0 2px" }}>
                          LKR {pkg.price.toLocaleString()}
                        </div>
                        <div style={{ fontSize:12, color:"#374151", marginBottom:16 }}>{pkg.duration}</div>
                        {pkg.features.map(f => (
                          <div key={f} style={{ display:"flex", alignItems:"center", gap:8, fontSize:12, color:"#6B7280", marginBottom:7 }}>
                            <span style={{ color:pkg.color }}><CheckIcon /></span>{f}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    <button onClick={() => { setView("dashboard"); resetForm(); }}
                      style={{ padding:"11px 22px", borderRadius:10, background:"transparent", border:"1px solid rgba(255,255,255,0.12)", color:"#6B7280", fontSize:14, cursor:"pointer" }}>
                      Cancel
                    </button>
                    <button className="pb" disabled={!selectedPackage} onClick={() => { setForm(f => ({ ...f, packageType: selectedPackage.id, price: selectedPackage.price })); setStep(2); }}
                      style={{ padding:"11px 26px", borderRadius:10, border:"none", cursor: selectedPackage ? "pointer":"not-allowed", fontSize:14, fontWeight:700, transition:"all 0.2s",
                        background: selectedPackage ? "linear-gradient(135deg,#2563EB,#1D4ED8)" : "rgba(255,255,255,0.06)",
                        color: selectedPackage ? "#fff" : "#374151",
                        boxShadow: selectedPackage ? "0 4px 16px rgba(37,99,235,0.35)" : "none" }}>
                      Continue →
                    </button>
                  </div>
                </div>
              )}

              {/* ── Step 2: Details ── */}
              {step === 2 && (
                <div style={{ background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:20, padding:32, animation:"slideIn 0.3s ease" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
                    <span style={{ display:"inline-flex", alignItems:"center", padding:"4px 12px", borderRadius:20,
                      fontSize:12, fontWeight:700, background:`${selectedPackage?.color}20`, color:selectedPackage?.color,
                      border:`1px solid ${selectedPackage?.color}40` }}>
                      {selectedPackage?.name} Package
                    </span>
                    <span style={{ fontSize:13, color:"#374151" }}>· LKR {selectedPackage?.price?.toLocaleString()}</span>
                  </div>
                  <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700, color:"#F9FAFB", marginBottom:6 }}>Advertisement Details</h2>
                  <p style={{ fontSize:13, color:"#4B5563", marginBottom:26 }}>Provide information about your advertisement</p>

                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>
                    {[
                      { label:"Advertisement Name *", field:"name", placeholder:"e.g. Sunrise Boarding House", full:false, type:"text" },
                      { label:"Phone Number *", field:"phoneNumber", placeholder:"e.g. 0771234567", full:false, type:"text" },
                      { label:"Monthly Price (LKR) *", field:"price", placeholder:"e.g. 12000", full:false, type:"number" },
                    ].map(({ label, field, placeholder, full, type }) => (
                      <div key={field} style={full ? { gridColumn:"1/-1" } : {}}>
                        <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#6B7280", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.05em" }}>{label}</label>
                        <input type={type} placeholder={placeholder} value={form[field]}
                          onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                          style={{ width:"100%", padding:"12px 15px", borderRadius:10, background:"rgba(255,255,255,0.05)",
                            border:"1px solid rgba(255,255,255,0.1)", color:"#F9FAFB", fontSize:14, transition:"all 0.2s" }} />
                      </div>
                    ))}
                    <div style={{ gridColumn:"1/-1" }}>
                      <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#6B7280", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.05em" }}>Description *</label>
                      <textarea placeholder="Describe your boarding house — location, rooms, amenities, rules, nearby facilities..."
                        value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                        style={{ width:"100%", padding:"12px 15px", borderRadius:10, minHeight:100, background:"rgba(255,255,255,0.05)",
                          border:"1px solid rgba(255,255,255,0.1)", color:"#F9FAFB", fontSize:14, resize:"vertical", fontFamily:"inherit", transition:"all 0.2s" }} />
                    </div>
                    <div style={{ gridColumn:"1/-1" }}>
                      <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#6B7280", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.05em" }}>Advertisement Photo</label>
                      <div onClick={() => imageRef.current.click()}
                        style={{ border: imagePreview ? "2px solid rgba(59,130,246,0.4)" : "2px dashed rgba(255,255,255,0.12)",
                          borderRadius:12, padding:"24px 20px", textAlign:"center", cursor:"pointer", transition:"all 0.2s",
                          background: imagePreview ? "rgba(37,99,235,0.06)" : "rgba(255,255,255,0.02)" }}>
                        <input type="file" ref={imageRef} accept="image/*" style={{ display:"none" }} onChange={e => handleFileRead(e, "imageUrl")} />
                        {imagePreview ? (
                          <div>
                            <img src={imagePreview} alt="preview" style={{ maxHeight:180, maxWidth:"100%", borderRadius:8, objectFit:"cover" }} />
                            <div style={{ fontSize:12, color:"#3B82F6", marginTop:10, fontWeight:600 }}>✓ Photo uploaded — click to change</div>
                          </div>
                        ) : (
                          <>
                            <div style={{ color:"#374151", marginBottom:8 }}><UploadIcon /></div>
                            <div style={{ fontSize:13, color:"#4B5563" }}>Click to upload a photo</div>
                            <div style={{ fontSize:11, color:"#374151", marginTop:4 }}>PNG, JPG up to 5MB</div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display:"flex", justifyContent:"space-between", marginTop:28 }}>
                    <button onClick={() => setStep(1)}
                      style={{ padding:"11px 22px", borderRadius:10, background:"transparent", border:"1px solid rgba(255,255,255,0.12)", color:"#6B7280", fontSize:14, cursor:"pointer" }}>
                      ← Back
                    </button>
                    <button className="pb" disabled={!form.name || !form.description || !form.phoneNumber || !form.price}
                      onClick={() => setStep(3)}
                      style={{ padding:"11px 26px", borderRadius:10, border:"none", fontSize:14, fontWeight:700, transition:"all 0.2s",
                        background: (form.name && form.description && form.phoneNumber && form.price) ? "linear-gradient(135deg,#2563EB,#1D4ED8)" : "rgba(255,255,255,0.06)",
                        color: (form.name && form.description && form.phoneNumber && form.price) ? "#fff" : "#374151",
                        cursor: (form.name && form.description && form.phoneNumber && form.price) ? "pointer" : "not-allowed",
                        boxShadow: (form.name && form.description && form.phoneNumber && form.price) ? "0 4px 16px rgba(37,99,235,0.35)" : "none" }}>
                      Continue →
                    </button>
                  </div>
                </div>
              )}

              {/* ── Step 3: Payment ── */}
              {step === 3 && (
                <div style={{ background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:20, padding:32, animation:"slideIn 0.3s ease" }}>
                  <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700, color:"#F9FAFB", marginBottom:6 }}>Payment Slip</h2>
                  <p style={{ fontSize:13, color:"#4B5563", marginBottom:26 }}>Upload your payment confirmation to activate the ad</p>

                  {/* Order Summary */}
                  <div style={{ background:"rgba(255,255,255,0.035)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:20, marginBottom:26 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:"#374151", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:14 }}>Order Summary</div>
                    {[
                      ["Advertisement Name", form.name],
                      ["Package", `${selectedPackage?.name} · ${selectedPackage?.duration}`],
                      ["Phone", form.phoneNumber],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display:"flex", justifyContent:"space-between", marginBottom:10, fontSize:13 }}>
                        <span style={{ color:"#4B5563" }}>{k}</span>
                        <span style={{ color:"#D1D5DB", fontWeight:600 }}>{v}</span>
                      </div>
                    ))}
                    <div style={{ borderTop:"1px solid rgba(255,255,255,0.08)", paddingTop:12, marginTop:4, display:"flex", justifyContent:"space-between" }}>
                      <span style={{ fontSize:15, fontWeight:700, color:"#F9FAFB" }}>Total Due</span>
                      <span style={{ fontSize:20, fontWeight:800, color:"#F59E0B" }}>LKR {selectedPackage?.price?.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Bank details hint */}
                  <div style={{ background:"rgba(37,99,235,0.08)", border:"1px solid rgba(37,99,235,0.2)", borderRadius:12, padding:"12px 16px", marginBottom:22, fontSize:13, color:"#93C5FD" }}>
                    💳 Transfer to: <strong>Commercial Bank · 1234-5678-9012</strong> · BoardingHub (Pvt) Ltd
                  </div>

                  <div>
                    <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#6B7280", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.05em" }}>Payment Slip *</label>
                    <div onClick={() => slipRef.current.click()}
                      style={{ border: slipPreview ? "2px solid rgba(5,150,105,0.5)" : "2px dashed rgba(255,255,255,0.12)",
                        borderRadius:12, padding:"28px 20px", textAlign:"center", cursor:"pointer", transition:"all 0.2s",
                        background: slipPreview ? "rgba(5,150,105,0.06)" : "rgba(255,255,255,0.02)" }}>
                      <input type="file" ref={slipRef} accept="image/*,.pdf" style={{ display:"none" }} onChange={e => handleFileRead(e, "paymentSlip")} />
                      {slipPreview ? (
                        <div>
                          <img src={slipPreview} alt="slip" style={{ maxHeight:160, maxWidth:"100%", borderRadius:8, objectFit:"cover" }} />
                          <div style={{ fontSize:12, color:"#10B981", marginTop:10, fontWeight:700 }}>✓ Payment slip uploaded — click to change</div>
                        </div>
                      ) : (
                        <>
                          <div style={{ color:"#374151", marginBottom:8 }}><UploadIcon /></div>
                          <div style={{ fontSize:13, color:"#4B5563" }}>Click to upload payment slip</div>
                          <div style={{ fontSize:11, color:"#374151", marginTop:4 }}>PNG, JPG or PDF accepted</div>
                        </>
                      )}
                    </div>
                  </div>

                  <div style={{ display:"flex", justifyContent:"space-between", marginTop:28 }}>
                    <button onClick={() => setStep(2)}
                      style={{ padding:"11px 22px", borderRadius:10, background:"transparent", border:"1px solid rgba(255,255,255,0.12)", color:"#6B7280", fontSize:14, cursor:"pointer" }}>
                      ← Back
                    </button>
                    <button className="pb" disabled={!slipPreview || submitting} onClick={handleSubmit}
                      style={{ padding:"11px 28px", borderRadius:10, border:"none", fontSize:14, fontWeight:700, transition:"all 0.2s",
                        background: (slipPreview && !submitting) ? (editingId ? "linear-gradient(135deg,#059669,#047857)" : "linear-gradient(135deg,#2563EB,#1D4ED8)") : "rgba(255,255,255,0.06)",
                        color: (slipPreview && !submitting) ? "#fff" : "#374151",
                        cursor: (slipPreview && !submitting) ? "pointer" : "not-allowed",
                        boxShadow: (slipPreview && !submitting) ? "0 4px 18px rgba(37,99,235,0.38)" : "none" }}>
                      {submitting ? "Publishing..." : editingId ? "✓ Save Changes" : "🚀 Publish Advertisement"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ═══ DELETE MODAL ═══ */}
      {deleteConfirm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.78)", backdropFilter:"blur(10px)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }}
          onClick={() => setDeleteConfirm(null)}>
          <div style={{ background:"#161820", border:"1px solid rgba(255,255,255,0.1)", borderRadius:20, padding:36, maxWidth:400, width:"90%", animation:"slideIn 0.25s ease" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ fontSize:44, marginBottom:16 }}>🗑️</div>
            <div style={{ fontSize:20, fontWeight:700, color:"#F9FAFB", marginBottom:8, fontFamily:"'Playfair Display',serif" }}>Delete Advertisement?</div>
            <div style={{ fontSize:14, color:"#6B7280", marginBottom:28, lineHeight:1.6 }}>
              This action cannot be undone. The advertisement and all its data will be permanently removed.
            </div>
            <div style={{ display:"flex", gap:12, justifyContent:"flex-end" }}>
              <button onClick={() => setDeleteConfirm(null)}
                style={{ padding:"10px 22px", borderRadius:10, background:"transparent", border:"1px solid rgba(255,255,255,0.12)", color:"#6B7280", fontSize:14, cursor:"pointer" }}>
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm)}
                style={{ padding:"10px 24px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#DC2626,#B91C1C)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer",
                  boxShadow:"0 4px 16px rgba(220,38,38,0.35)" }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ TOAST ═══ */}
      {toast && (
        <div style={{ position:"fixed", bottom:28, right:28, zIndex:2000, padding:"14px 20px", borderRadius:12,
          background: toast.type === "error" ? "#DC2626" : "#059669",
          color:"#fff", fontSize:14, fontWeight:600, boxShadow:"0 8px 36px rgba(0,0,0,0.45)",
          animation:"slideIn 0.3s ease", display:"flex", alignItems:"center", gap:8 }}>
          {toast.type === "error" ? "✕" : "✓"} {toast.msg}
        </div>
      )}
    </div>
  );
}