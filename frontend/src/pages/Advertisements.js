import { useState, useEffect, useRef, useCallback } from "react";
import api from '../api';

const PACKAGES = [
  {
    id: "basic",
    name: "Basic",
    price: 999,
    duration: "7 Days",
    color: "#64748B",
    features: ["Photo Upload", "Basic Listing", "Phone Visibility", "7-Day Exposure"],
    badge: null,
  },
  {
    id: "standard",
    name: "Standard",
    price: 2499,
    duration: "14 Days",
    color: "#2563EB",
    features: ["Photo Uploads", "Featured Listing", "Phone + WhatsApp", "14-Day Exposure", "Priority Support"],
    badge: "Popular",
  },
  {
    id: "premium",
    name: "Premium",
    price: 4999,
    duration: "30 Days",
    color: "#D97706",
    features: ["Photo Uploads", "Top Banner Slot", "All Contact Options", "30-Day Exposure", "24/7 Support"],
    badge: "Best Value",
  },
];

//  Validation Rules 
const VALIDATORS = {
  name: (v) => {
    if (!v.trim()) return "Advertisement name is required";
    if (v.trim().length < 3) return "Name must be at least 3 characters";
    if (v.trim().length > 50) return "Name must be under 50 characters";
    return null;
  },
  phoneNumber: (v) => {
    if (!v.trim()) return "Phone number is required";
    const cleaned = v.replace(/[\s\-()]/g, "");
    const sriLankan = /^(?:\+94|0094|0)(7[0-9]{8})$/;
    if (!sriLankan.test(cleaned)) return "Enter a valid Sri Lankan number (e.g. 0771234567)";
    return null;
  },
  price: (v) => {
    if (!String(v).trim()) return "Price is required";
    const n = Number(v);
    if (isNaN(n) || n <= 0) return "Price must be a positive number";
    if (n < 500) return "Price must be at least LKR 500";
    if (n > 1000000) return "Price cannot exceed LKR 1,000,000";
    return null;
  },
  description: (v) => {
    if (!v.trim()) return "Description is required";
    if (v.trim().length < 20) return `At least 20 characters needed (${v.trim().length}/20)`;
    if (v.trim().length > 1000) return "Description must be under 1000 characters";
    return null;
  },
};

const validateStep2 = (form) => ({
  name: VALIDATORS.name(form.name),
  phoneNumber: VALIDATORS.phoneNumber(form.phoneNumber),
  description: VALIDATORS.description(form.description),
});

const hasErrors = (errs) => Object.values(errs).some(Boolean);

// Icons 
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
const AlertIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="0.5" fill="currentColor"/>
  </svg>
);

//Reusable Field Component 
const Field = ({ label, error, touched, required, children, hint }) => (
  <div>
    <label style={{
      display: "block", fontSize: 12, fontWeight: 600, marginBottom: 7,
      textTransform: "uppercase", letterSpacing: "0.05em",
      color: touched && error ? "#F87171" : "#6B7280",
    }}>
      {label} {required && <span style={{ color: "#EF4444" }}>*</span>}
    </label>
    {children}
    {touched && error ? (
      <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:6, fontSize:12, color:"#F87171", animation:"errorPop 0.2s ease" }}>
        <AlertIcon /> {error}
      </div>
    ) : hint ? (
      <div style={{ marginTop:5, fontSize:11, color:"#94A3B8" }}>{hint}</div>
    ) : null}
  </div>
);

// ─── Main Component 
export default function Advertisement({ hideHeader = false, ownerId: propOwnerId }) {
  const [ownerId]                           = useState(propOwnerId || localStorage.getItem('ownerId') || '');
  const [view, setView]                     = useState("dashboard");
  const [step, setStep]                     = useState(1);
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading]               = useState(false);
  const [submitting, setSubmitting]         = useState(false);
  const [toast, setToast]                   = useState(null);
  const [deleteConfirm, setDeleteConfirm]   = useState(null);
  const [editingId, setEditingId]           = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [form, setForm] = useState({
    name: "", description: "", phoneNumber: "", price: "",
    imageUrl: "", paymentSlip: "", packageType: "",
  });
  const [errors, setErrors]                 = useState({});
  const [touched, setTouched]               = useState({});
  const [step3Attempted, setStep3Attempted] = useState(false);
  const [imageFile, setImageFile]             = useState(null);
  const [slipFile, setSlipFile]               = useState(null);
  const [imagePreview, setImagePreview]     = useState(null);
  const [slipPreview, setSlipPreview]       = useState(null);
  const imageRef = useRef();
  const slipRef  = useRef();

  useEffect(() => { fetchAds(); }, [ownerId]);

  const fetchAds = useCallback(async () => {
    setLoading(true);
    try {
      const url = ownerId ? `/advertisements?ownerId=${ownerId}` : "/advertisements";
      const res  = await api.get(url);
      setAdvertisements(res.data.advertisements || []);
    } catch { showToast("Failed to load advertisements", "error"); }
    setLoading(false);
  }, [ownerId]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const resetForm = () => {
    setForm({ name:"", description:"", phoneNumber:"", price:"", imageUrl:"", paymentSlip:"", packageType:"" });
    setSelectedPackage(null); setImagePreview(null); setSlipPreview(null);
    setImageFile(null); setSlipFile(null);
    setStep(1); setEditingId(null); setErrors({}); setTouched({}); setStep3Attempted(false);
  };

  const touchField   = (field) => setTouched(t => ({ ...t, [field]: true }));
  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    if (VALIDATORS[field]) setErrors(e => ({ ...e, [field]: VALIDATORS[field](value) }));
  };
  const handleBlur = (field) => {
    touchField(field);
    if (VALIDATORS[field]) setErrors(e => ({ ...e, [field]: VALIDATORS[field](form[field]) }));
  };
  const touchAllStep2 = () => {
    const fields = ["name", "phoneNumber", "price", "description"];
    setTouched(t => ({ ...t, ...Object.fromEntries(fields.map(f => [f, true])) }));
  };
  const handleStep2Continue = () => {
    touchAllStep2();
    const errs = validateStep2(form);
    setErrors(e => ({ ...e, ...errs }));
    if (!hasErrors(errs)) setStep(3);
  };

  const handleFileRead = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast("File size must be under 5MB", "error"); return; }
    
    if (field === "imageUrl") setImageFile(file);
    else setSlipFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      const val = reader.result;
      if (field === "imageUrl") { setImagePreview(val); }
      else { setSlipPreview(val); setErrors(e => ({ ...e, paymentSlip: null })); }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    const step2Errs = validateStep2(form);
    if (hasErrors(step2Errs)) {
      touchAllStep2(); setErrors(e => ({ ...e, ...step2Errs }));
      showToast("Please fix form errors before submitting", "error"); setStep(2); return;
    }
    if (!slipPreview) { setStep3Attempted(true); showToast("Payment slip is required", "error"); return; }
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (key !== 'imageUrl' && key !== 'paymentSlip') {
          formData.append(key, form[key]);
        }
      });
      formData.append('date', new Date().toISOString());
      if (imageFile) formData.append('imageUrl', imageFile);
      if (slipFile) formData.append('paymentSlip', slipFile);
      if (ownerId) formData.append('ownerId', ownerId);

      const res = editingId 
        ? await api.put(`/advertisements/${editingId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        : await api.post("/advertisements", formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      
      showToast(editingId ? "Advertisement updated!" : "Advertisement published!");
      resetForm(); setView("dashboard"); fetchAds();
    } catch (err) { 
      const msg = err.response?.data?.message || "Something went wrong";
      showToast(msg, "error"); 
    }
    setSubmitting(false);
  };

  const handleEdit = (ad) => {
    setEditingId(ad._id);
    const pkg = PACKAGES.find(p => p.id === ad.packageType) || PACKAGES[1];
    setSelectedPackage(pkg);
    setForm({ name:ad.name, description:ad.description, phoneNumber:ad.phoneNumber, price:ad.price, imageUrl:ad.imageUrl||"", paymentSlip:ad.paymentSlip||"", packageType:pkg.id });
    if (ad.imageUrl)    setImagePreview(ad.imageUrl);
    if (ad.paymentSlip) setSlipPreview(ad.paymentSlip);
    setErrors({}); setTouched({}); setStep3Attempted(false);
    setStep(2); setView("create");
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/advertisements/${id}`);
      showToast("Advertisement deleted"); fetchAds();
    } catch { showToast("Delete failed", "error"); }
    setDeleteConfirm(null);
  };

  const getPkg     = (pkgId) => PACKAGES.find(p => p.id === pkgId) || PACKAGES[0];
  const stepLabels = ["Choose Package", "Ad Details", "Payment"];
  const step2Valid = !hasErrors(validateStep2(form));

  const borderColor = (field) => {
    if (touched[field] && errors[field])                return "rgba(239,68,68,0.6)";
    if (touched[field] && !errors[field] && form[field]) return "rgba(5,150,105,0.5)";
    return "rgba(37,99,235,0.15)";
  };
  const inputGlow = (field) => {
    if (touched[field] && errors[field])                return "0 0 0 3px rgba(239,68,68,0.12)";
    if (touched[field] && !errors[field] && form[field]) return "0 0 0 3px rgba(5,150,105,0.1)";
    return undefined;
  };

  return (
    <div style={{ fontFamily:"'Figtree',sans-serif", minHeight:"100vh", background:"#F0F4FF", color:"#1E293B", position:"relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Figtree:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;} body{-webkit-font-smoothing:antialiased;}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:rgba(37,99,235,0.2);border-radius:3px}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        @keyframes errorPop{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-5px)}40%,80%{transform:translateX(5px)}}
        .tr:hover{background:#EEF2FF!important}
        .ib:hover{transform:scale(1.1);filter:brightness(1.1)}
        .ab:hover{transform:translateY(-2px);box-shadow:0 10px 30px rgba(37,99,235,0.5)!important}
        .pb:hover:not(:disabled){transform:translateY(-1px);filter:brightness(1.08)}
        .pc:hover{transform:translateY(-4px)!important}
        input:focus,textarea:focus{outline:none}
        input::placeholder,textarea::placeholder{color:#CBD5E1}
        .field-error{animation:shake 0.35s ease}
        .char-count{font-size:11px;color:#94A3B8;text-align:right;margin-top:4px}
        .char-count.warn{color:#F59E0B} .char-count.over{color:#EF4444}
      `}</style>

      <div style={{ position:"fixed",inset:0,zIndex:0,pointerEvents:"none",
        background:"radial-gradient(ellipse 80% 50% at 50% -5%,rgba(37,99,235,0.08) 0%,transparent 65%)" }}/>

      {/* HEADER */}
      {!hideHeader && (
        <header style={{ position:"sticky",top:0,zIndex:100,height:64,padding:"0 32px",
          background:"rgba(255,255,255,0.92)",backdropFilter:"blur(24px)",
          borderBottom:"1px solid rgba(37,99,235,0.12)",
          display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <div style={{ display:"flex",alignItems:"center",gap:10,fontFamily:"'Sora',sans-serif",
            fontSize:21,fontWeight:800,letterSpacing:"-0.02em",
            background:"linear-gradient(135deg,#1D4ED8,#2563EB)",
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>
            <div style={{ width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#1D4ED8,#2563EB)",
              display:"flex",alignItems:"center",justifyContent:"center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </div>
            EasyStay
          </div>
          <nav style={{ display:"flex",gap:4 }}>
            {[["dashboard","📋  My Ads"],["create","＋  New Ad"]].map(([v,label]) => (
              <button key={v} onClick={() => { setView(v); if(v==="dashboard") resetForm(); }}
                style={{ padding:"8px 18px",borderRadius:8,border:"none",cursor:"pointer",fontSize:13,fontWeight:700,transition:"all 0.2s",
                  background: view===v ? "rgba(37,99,235,0.1)" : "transparent",
                  color: view===v ? "#2563EB" : "#94A3B8",
                  borderBottom: view===v ? "2px solid #2563EB" : "2px solid transparent" }}>
                {label}
              </button>
            ))}
          </nav>
        </header>
      )}

      <div style={{ maxWidth:1200,margin:"0 auto",padding:"36px 24px",position:"relative",zIndex:1 }}>

        {/* ═══ DASHBOARD ═══ */}
        {view === "dashboard" && (
          <div style={{ animation:"fadeUp 0.4s ease" }}>

            {/* Page title — NO stats cards here */}
            <div style={{ marginBottom:28 }}>
              <h1 style={{ fontFamily:"'Sora',sans-serif",fontSize:36,fontWeight:800,color:"#1E293B",letterSpacing:"-0.03em",marginBottom:6 }}>
                Your Advertisements
              </h1>
              <p style={{ fontSize:14,color:"#64748B" }}>Create and manage your boarding house advertisements</p>
            </div>

            {/* Table toolbar */}
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
              <h2 style={{ fontSize:15,fontWeight:800,color:"#1E293B" }}>
                All Advertisements
                <span style={{ color:"#94A3B8",fontWeight:400,marginLeft:6 }}>({advertisements.length})</span>
              </h2>
              <button className="ab" onClick={() => { setView("create"); resetForm(); }}
                style={{ display:"flex",alignItems:"center",gap:8,padding:"11px 20px",borderRadius:11,border:"none",cursor:"pointer",
                  background:"linear-gradient(135deg,#2563EB,#1D4ED8)",color:"#fff",fontSize:13,fontWeight:800,
                  boxShadow:"0 4px 18px rgba(37,99,235,0.35)",transition:"all 0.2s" }}>
                <PlusIcon /> Create Advertisement
              </button>
            </div>

            {/* Table */}
            <div style={{ background:"#FFFFFF",border:"1px solid rgba(37,99,235,0.12)",borderRadius:20,overflow:"hidden" }}>
              <div style={{ display:"grid",gridTemplateColumns:"2fr 3fr 1.3fr 1.2fr 1.2fr 100px",
                padding:"13px 24px",background:"#F1F5FF",borderBottom:"1px solid rgba(37,99,235,0.12)",
                fontSize:11,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.09em" }}>
                {["Advertisement","Description","Phone","Package","Date","Actions"].map(h => <span key={h}>{h}</span>)}
              </div>

              {loading ? (
                <div style={{ padding:56,textAlign:"center",color:"#94A3B8",fontSize:14 }}>
                  <div style={{ animation:"pulse 1.5s infinite" }}>Loading advertisements...</div>
                </div>
              ) : advertisements.length === 0 ? (
                <div style={{ padding:"72px 24px",textAlign:"center" }}>
                  <div style={{ fontSize:52,marginBottom:16 }}>🏠</div>
                  <div style={{ fontSize:16,color:"#64748B",marginBottom:8,fontWeight:600 }}>No advertisements yet</div>
                  <div style={{ fontSize:13,color:"#94A3B8" }}>Click "Create Advertisement" to get started</div>
                </div>
              ) : (
                advertisements.map((ad,i) => {
                  const pkg = getPkg(ad.packageType);
                  return (
                    <div key={ad._id} className="tr"
                      style={{ display:"grid",gridTemplateColumns:"2fr 3fr 1.3fr 1.2fr 1.2fr 100px",
                        padding:"15px 24px",
                        borderBottom: i<advertisements.length-1 ? "1px solid rgba(37,99,235,0.07)" : "none",
                        alignItems:"center",transition:"background 0.15s" }}>
                      <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                        {ad.imageUrl
                          ? <img src={ad.imageUrl} alt="" style={{ width:40,height:40,borderRadius:10,objectFit:"cover" }}/>
                          : <div style={{ width:40,height:40,borderRadius:10,background:"#EEF2FF",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>🏠</div>
                        }
                        <div>
                          <div style={{ fontSize:14,fontWeight:700,color:"#1E293B",marginBottom:2 }}>{ad.name}</div>
                          <div style={{ fontSize:12,color:"#94A3B8" }}>LKR {Number(ad.price).toLocaleString()}</div>
                        </div>
                      </div>
                      <div style={{ fontSize:13,color:"#64748B",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",paddingRight:16 }}>{ad.description}</div>
                      <div style={{ fontSize:13,color:"#64748B",display:"flex",alignItems:"center",gap:5 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.81a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.02z"/>
                        </svg>
                        {ad.phoneNumber}
                      </div>
                      <div>
                        <span style={{ display:"inline-flex",alignItems:"center",padding:"4px 11px",borderRadius:20,
                          fontSize:11,fontWeight:700,background:`${pkg.color}18`,color:pkg.color,border:`1px solid ${pkg.color}35` }}>
                          {pkg.name}
                        </span>
                      </div>
                      <div style={{ fontSize:12,color:"#64748B" }}>
                        {new Date(ad.date).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}
                      </div>
                      <div style={{ display:"flex",gap:8 }}>
                        {[[<EditIcon/>, "#3B82F6", () => handleEdit(ad), "Edit"],
                          [<TrashIcon/>, "#EF4444", () => setDeleteConfirm(ad._id), "Delete"]].map(([icon,color,action,title]) => (
                          <button key={title} className="ib" title={title} onClick={action}
                            style={{ width:32,height:32,borderRadius:8,border:"none",background:`${color}12`,color,
                              cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s" }}>
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
              <h1 style={{ fontFamily:"'Sora',sans-serif",fontSize:30,fontWeight:800,color:"#1E293B",marginBottom:6,letterSpacing:"-0.03em" }}>
                {editingId ? "Edit Advertisement" : "Create Advertisement"}
              </h1>
              <p style={{ fontSize:14,color:"#64748B" }}>
                {editingId ? "Update your advertisement details below" : "Complete all 3 steps to publish your boarding house ad"}
              </p>
            </div>

            <div style={{ maxWidth:740,margin:"0 auto" }}>
              {/* Step Bar */}
              <div style={{ marginBottom:40 }}>
                <div style={{ display:"flex",alignItems:"flex-start" }}>
                  {stepLabels.map((label,i) => (
                    <div key={i} style={{ display:"flex",flexDirection:"column",alignItems:"center",flex: i<2?1:0 }}>
                      <div style={{ display:"flex",alignItems:"center",width:"100%" }}>
                        <div style={{ width:38,height:38,borderRadius:"50%",flexShrink:0,
                          display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,transition:"all 0.3s",
                          background: step>i+1?"#2563EB":step===i+1?"rgba(37,99,235,0.1)":"#EEF2FF",
                          color: step>i+1?"#fff":step===i+1?"#2563EB":"#94A3B8",
                          border: step===i+1?"2px solid #2563EB":step>i+1?"2px solid #2563EB":"2px solid #DBEAFE" }}>
                          {step>i+1 ? <CheckIcon/> : i+1}
                        </div>
                        {i<2 && <div style={{ flex:1,height:2,margin:"0 8px",
                          background: step>i+1?"#2563EB":"#DBEAFE",transition:"background 0.35s" }}/>}
                      </div>
                      <div style={{ fontSize:11,fontWeight:600,marginTop:7,whiteSpace:"nowrap",color:step===i+1?"#2563EB":"#94A3B8" }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Step 1: Package ── */}
              {step === 1 && (
                <div style={{ background:"#FFFFFF",border:"1px solid rgba(37,99,235,0.12)",borderRadius:20,padding:32,animation:"slideIn 0.3s ease" }}>
                  <h2 style={{ fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:800,color:"#1E293B",marginBottom:6,letterSpacing:"-0.02em" }}>Choose a Package</h2>
                  <p style={{ fontSize:13,color:"#64748B",marginBottom:28 }}>Select the advertising tier that suits your listing</p>
                  <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:32 }}>
                    {PACKAGES.map(pkg => (
                      <div key={pkg.id} className="pc" onClick={() => setSelectedPackage(pkg)}
                        style={{ border: selectedPackage?.id===pkg.id?`2px solid ${pkg.color}`:"2px solid #E2E8F0",
                          borderRadius:16,padding:20,cursor:"pointer",transition:"all 0.25s",position:"relative",
                          background: selectedPackage?.id===pkg.id?`${pkg.color}10`:"#FAFCFF",
                          boxShadow: selectedPackage?.id===pkg.id?`0 0 28px ${pkg.color}25`:"none" }}>
                        {pkg.badge && (
                          <div style={{ position:"absolute",top:12,right:12,padding:"3px 10px",borderRadius:20,
                            fontSize:10,fontWeight:700,background:`${pkg.color}22`,color:pkg.color,border:`1px solid ${pkg.color}45` }}>
                            {pkg.badge}
                          </div>
                        )}
                        <div style={{ fontSize:17,fontWeight:800,color:"#1E293B",marginBottom:2 }}>{pkg.name}</div>
                        <div style={{ fontSize:28,fontWeight:800,color:pkg.color,margin:"8px 0 2px",letterSpacing:"-0.03em" }}>
                          LKR {pkg.price.toLocaleString()}
                        </div>
                        <div style={{ fontSize:12,color:"#94A3B8",marginBottom:16 }}>{pkg.duration}</div>
                        {pkg.features.map(f => (
                          <div key={f} style={{ display:"flex",alignItems:"center",gap:8,fontSize:12,color:"#64748B",marginBottom:7 }}>
                            <span style={{ color:pkg.color }}><CheckIcon/></span>{f}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  <div style={{ display:"flex",justifyContent:"space-between" }}>
                    <button onClick={() => { setView("dashboard"); resetForm(); }}
                      style={{ padding:"11px 22px",borderRadius:10,background:"transparent",border:"1px solid #BFDBFE",color:"#64748B",fontSize:14,cursor:"pointer" }}>
                      Cancel
                    </button>
                    <button className="pb" disabled={!selectedPackage}
                      onClick={() => { setForm(f => ({ ...f,packageType:selectedPackage.id,price:selectedPackage.price })); setStep(2); }}
                      style={{ padding:"11px 26px",borderRadius:10,border:"none",cursor:selectedPackage?"pointer":"not-allowed",fontSize:14,fontWeight:700,transition:"all 0.2s",
                        background: selectedPackage?"linear-gradient(135deg,#2563EB,#1D4ED8)":"#F1F5FF",
                        color: selectedPackage?"#fff":"#94A3B8",
                        boxShadow: selectedPackage?"0 4px 16px rgba(37,99,235,0.35)":"none" }}>
                      Continue →
                    </button>
                  </div>
                </div>
              )}

              {/* ── Step 2: Details ── */}
              {step === 2 && (
                <div style={{ background:"#FFFFFF",border:"1px solid rgba(37,99,235,0.12)",borderRadius:20,padding:32,animation:"slideIn 0.3s ease" }}>
                  <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:20 }}>
                    <span style={{ display:"inline-flex",alignItems:"center",padding:"4px 12px",borderRadius:20,
                      fontSize:12,fontWeight:700,background:`${selectedPackage?.color}18`,color:selectedPackage?.color,border:`1px solid ${selectedPackage?.color}35` }}>
                      {selectedPackage?.name} Package
                    </span>
                    <span style={{ fontSize:13,color:"#94A3B8" }}>· LKR {selectedPackage?.price?.toLocaleString()}</span>
                  </div>
                  <h2 style={{ fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:800,color:"#1E293B",marginBottom:6,letterSpacing:"-0.02em" }}>Advertisement Details</h2>
                  <p style={{ fontSize:13,color:"#64748B",marginBottom:26 }}>Fill in all required fields accurately</p>

                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:18 }}>
                    <div className={touched.name && errors.name ? "field-error" : ""}>
                      <Field label="Advertisement Name" error={errors.name} touched={touched.name} required>
                        <input type="text" placeholder="e.g. Sunrise Boarding House" value={form.name}
                          onChange={e => handleChange("name",e.target.value)} onBlur={() => handleBlur("name")}
                          style={{ width:"100%",padding:"12px 15px",borderRadius:10,background:"#FFFFFF",
                            border:`1px solid ${borderColor("name")}`,boxShadow:inputGlow("name"),color:"#1E293B",fontSize:14,transition:"all 0.2s" }}/>
                      </Field>
                    </div>
                    <div className={touched.phoneNumber && errors.phoneNumber ? "field-error" : ""}>
                      <Field label="Phone Number" error={errors.phoneNumber} touched={touched.phoneNumber} required hint="Sri Lankan numbers only (e.g. 0771234567)">
                        <input type="text" placeholder="e.g. 0771234567" value={form.phoneNumber}
                          onChange={e => handleChange("phoneNumber",e.target.value)} onBlur={() => handleBlur("phoneNumber")}
                          style={{ width:"100%",padding:"12px 15px",borderRadius:10,background:"#FFFFFF",
                            border:`1px solid ${borderColor("phoneNumber")}`,boxShadow:inputGlow("phoneNumber"),color:"#1E293B",fontSize:14,transition:"all 0.2s" }}/>
                      </Field>
                    </div>
                    <div>
                      <label style={{ display:"block",fontSize:12,fontWeight:600,color:"#64748B",marginBottom:7,textTransform:"uppercase",letterSpacing:"0.09em" }}>Package Price</label>
                      <div style={{ position:"relative" }}>
                        <span style={{ position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:13,color:"#64748B",fontWeight:600 }}>LKR</span>
                        <input type="text" readOnly value={Number(form.price).toLocaleString()}
                          style={{ width:"100%",padding:"12px 15px 12px 50px",borderRadius:10,background:"#F8FAFF",border:"1px solid rgba(37,99,235,0.12)",color:"#9CA3AF",fontSize:14,cursor:"not-allowed" }}/>
                        <span style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",
                          fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20,
                          background:`${selectedPackage?.color}18`,color:selectedPackage?.color,border:`1px solid ${selectedPackage?.color}30` }}>
                          🔒 {selectedPackage?.name}
                        </span>
                      </div>
                      <div style={{ marginTop:5,fontSize:11,color:"#94A3B8" }}>
                        Fixed by your selected package · <span style={{ color:"#2563EB" }}>{selectedPackage?.duration}</span>
                      </div>
                    </div>
                    <div style={{ gridColumn:"1/-1" }} className={touched.description && errors.description ? "field-error" : ""}>
                      <Field label="Description" error={errors.description} touched={touched.description} required>
                        <textarea placeholder="Describe your boarding house — location, rooms, amenities, rules, nearby facilities..."
                          value={form.description} onChange={e => handleChange("description",e.target.value)} onBlur={() => handleBlur("description")}
                          style={{ width:"100%",padding:"12px 15px",borderRadius:10,minHeight:100,background:"#FFFFFF",
                            border:`1px solid ${borderColor("description")}`,boxShadow:inputGlow("description"),
                            color:"#1E293B",fontSize:14,resize:"vertical",fontFamily:"inherit",transition:"all 0.2s" }}/>
                        <div className={`char-count ${form.description.length>900?"over":form.description.length>700?"warn":""}`}>
                          {form.description.length}/1000 characters
                          {form.description.length<20 && form.description.length>0 && (
                            <span style={{ color:"#F59E0B" }}> · {20-form.description.length} more needed</span>
                          )}
                        </div>
                      </Field>
                    </div>
                    <div style={{ gridColumn:"1/-1" }}>
                      <label style={{ display:"block",fontSize:10,fontWeight:700,color:"#94A3B8",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.1em" }}>
                        Advertisement Photo <span style={{ fontWeight:400,textTransform:"none",letterSpacing:0 }}>(optional)</span>
                      </label>
                      <div onClick={() => imageRef.current.click()}
                        style={{ border: imagePreview?"2px solid rgba(59,130,246,0.4)":"2px dashed #BFDBFE",borderRadius:12,padding:"24px 20px",textAlign:"center",cursor:"pointer",transition:"all 0.2s",background:imagePreview?"rgba(37,99,235,0.04)":"#FAFCFF" }}>
                        <input type="file" ref={imageRef} accept="image/*" style={{ display:"none" }} onChange={e => handleFileRead(e,"imageUrl")}/>
                        {imagePreview ? (
                          <div>
                            <img src={imagePreview} alt="preview" style={{ maxHeight:180,maxWidth:"100%",borderRadius:8,objectFit:"cover" }}/>
                            <div style={{ fontSize:12,color:"#3B82F6",marginTop:10,fontWeight:600 }}>✓ Photo uploaded — click to change</div>
                          </div>
                        ) : (
                          <>
                            <div style={{ color:"#94A3B8",marginBottom:8 }}><UploadIcon/></div>
                            <div style={{ fontSize:13,color:"#64748B" }}>Click to upload a photo</div>
                            <div style={{ fontSize:11,color:"#94A3B8",marginTop:4 }}>PNG, JPG up to 5MB</div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {Object.values(touched).some(Boolean) && hasErrors(validateStep2(form)) && (
                    <div style={{ marginTop:18,padding:"12px 16px",borderRadius:10,background:"#FEF2F2",border:"1px solid #FECACA",fontSize:13,color:"#DC2626",display:"flex",alignItems:"center",gap:8 }}>
                      <AlertIcon/> Please fix the highlighted fields before continuing
                    </div>
                  )}

                  <div style={{ display:"flex",justifyContent:"space-between",marginTop:28 }}>
                    <button onClick={() => setStep(1)} style={{ padding:"11px 22px",borderRadius:10,background:"transparent",border:"1px solid #BFDBFE",color:"#64748B",fontSize:14,cursor:"pointer" }}>← Back</button>
                    <button className="pb" onClick={handleStep2Continue}
                      style={{ padding:"11px 26px",borderRadius:10,border:"none",fontSize:14,fontWeight:700,transition:"all 0.2s",cursor:"pointer",
                        background: step2Valid?"linear-gradient(135deg,#2563EB,#1D4ED8)":"#F1F5FF",
                        color: step2Valid?"#fff":"#94A3B8",
                        boxShadow: step2Valid?"0 4px 16px rgba(37,99,235,0.35)":"none" }}>
                      Continue →
                    </button>
                  </div>
                </div>
              )}

              {/* ── Step 3: Payment ── */}
              {step === 3 && (
                <div style={{ background:"#FFFFFF",border:"1px solid rgba(37,99,235,0.12)",borderRadius:20,padding:32,animation:"slideIn 0.3s ease" }}>
                  <h2 style={{ fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:800,color:"#1E293B",marginBottom:6,letterSpacing:"-0.02em" }}>Payment Slip</h2>
                  <p style={{ fontSize:13,color:"#64748B",marginBottom:26 }}>Upload your payment confirmation to activate the ad</p>
                  <div style={{ background:"#F1F5FF",border:"1px solid rgba(37,99,235,0.12)",borderRadius:14,padding:20,marginBottom:26 }}>
                    <div style={{ fontSize:10,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:14 }}>Order Summary</div>
                    {[["Advertisement Name",form.name],["Package",`${selectedPackage?.name} · ${selectedPackage?.duration}`],["Phone",form.phoneNumber]].map(([k,v]) => (
                      <div key={k} style={{ display:"flex",justifyContent:"space-between",marginBottom:10,fontSize:13 }}>
                        <span style={{ color:"#64748B" }}>{k}</span><span style={{ color:"#334155",fontWeight:600 }}>{v}</span>
                      </div>
                    ))}
                    <div style={{ borderTop:"1px solid rgba(37,99,235,0.12)",paddingTop:12,marginTop:4,display:"flex",justifyContent:"space-between" }}>
                      <span style={{ fontSize:15,fontWeight:800,color:"#1E293B" }}>Total Due</span>
                      <span style={{ fontSize:22,fontWeight:800,color:"#2563EB",letterSpacing:"-0.03em" }}>LKR {selectedPackage?.price?.toLocaleString()}</span>
                    </div>
                  </div>
                  <div style={{ background:"#EFF6FF",border:"1px solid #BFDBFE",borderRadius:12,padding:"12px 16px",marginBottom:22,fontSize:13,color:"#1D4ED8" }}>
                    💳 Transfer to: <strong>Commercial Bank · 1234-5678-9012</strong> · EasyStay (Pvt) Ltd
                  </div>
                  <div>
                    <label style={{ display:"block",fontSize:12,fontWeight:600,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.09em",
                      color: step3Attempted&&!slipPreview?"#F87171":"#6B7280" }}>
                      Payment Slip <span style={{ color:"#EF4444" }}>*</span>
                    </label>
                    <div onClick={() => slipRef.current.click()}
                      style={{ border: slipPreview?"2px solid rgba(5,150,105,0.5)":step3Attempted&&!slipPreview?"2px dashed rgba(239,68,68,0.5)":"2px dashed #BFDBFE",
                        borderRadius:12,padding:"28px 20px",textAlign:"center",cursor:"pointer",transition:"all 0.2s",
                        background: slipPreview?"rgba(5,150,105,0.04)":step3Attempted&&!slipPreview?"rgba(239,68,68,0.04)":"#FAFCFF" }}>
                      <input type="file" ref={slipRef} accept="image/*,.pdf" style={{ display:"none" }} onChange={e => handleFileRead(e,"paymentSlip")}/>
                      {slipPreview ? (
                        <div>
                          <img src={slipPreview} alt="slip" style={{ maxHeight:160,maxWidth:"100%",borderRadius:8,objectFit:"cover" }}/>
                          <div style={{ fontSize:12,color:"#10B981",marginTop:10,fontWeight:700 }}>✓ Payment slip uploaded — click to change</div>
                        </div>
                      ) : (
                        <>
                          <div style={{ color:step3Attempted&&!slipPreview?"#EF4444":"#94A3B8",marginBottom:8 }}><UploadIcon/></div>
                          <div style={{ fontSize:13,color:step3Attempted&&!slipPreview?"#F87171":"#64748B" }}>
                            {step3Attempted&&!slipPreview?"Payment slip is required — click to upload":"Click to upload payment slip"}
                          </div>
                          <div style={{ fontSize:11,color:"#94A3B8",marginTop:4 }}>PNG, JPG or PDF · Max 5MB</div>
                        </>
                      )}
                    </div>
                    {step3Attempted&&!slipPreview&&(
                      <div style={{ display:"flex",alignItems:"center",gap:5,marginTop:6,fontSize:12,color:"#F87171",animation:"errorPop 0.2s ease" }}>
                        <AlertIcon/> A payment slip is required to publish your advertisement
                      </div>
                    )}
                  </div>
                  <div style={{ display:"flex",justifyContent:"space-between",marginTop:28 }}>
                    <button onClick={() => setStep(2)} style={{ padding:"11px 22px",borderRadius:10,background:"transparent",border:"1px solid #BFDBFE",color:"#64748B",fontSize:14,cursor:"pointer" }}>← Back</button>
                    <button className="pb" disabled={submitting}
                      onClick={() => { setStep3Attempted(true); if(slipPreview) handleSubmit(); }}
                      style={{ padding:"11px 28px",borderRadius:10,border:"none",fontSize:14,fontWeight:700,transition:"all 0.2s",
                        background: !submitting?(editingId?"linear-gradient(135deg,#059669,#047857)":"linear-gradient(135deg,#2563EB,#1D4ED8)"):"#F1F5FF",
                        color: !submitting?"#fff":"#94A3B8",
                        cursor: submitting?"not-allowed":"pointer",
                        boxShadow: !submitting?"0 4px 18px rgba(37,99,235,0.38)":"none" }}>
                      {submitting?"Publishing...":editingId?"✓ Save Changes":"Publish Advertisement"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* DELETE MODAL */}
      {deleteConfirm && (
        <div style={{ position:"fixed",inset:0,background:"rgba(15,23,42,0.5)",backdropFilter:"blur(10px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center" }}
          onClick={() => setDeleteConfirm(null)}>
          <div style={{ background:"#FFFFFF",border:"1px solid #BFDBFE",borderRadius:20,padding:36,maxWidth:400,width:"90%",animation:"slideIn 0.25s ease" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ fontSize:44,marginBottom:16 }}>🗑️</div>
            <div style={{ fontSize:22,fontWeight:800,color:"#1E293B",marginBottom:8,letterSpacing:"-0.02em",fontFamily:"'Sora',sans-serif" }}>Delete Advertisement?</div>
            <div style={{ fontSize:14,color:"#64748B",marginBottom:28,lineHeight:1.6 }}>
              This action cannot be undone. The advertisement and all its data will be permanently removed.
            </div>
            <div style={{ display:"flex",gap:12,justifyContent:"flex-end" }}>
              <button onClick={() => setDeleteConfirm(null)}
                style={{ padding:"10px 22px",borderRadius:10,background:"transparent",border:"1px solid #BFDBFE",color:"#64748B",fontSize:14,cursor:"pointer" }}>
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm)}
                style={{ padding:"10px 24px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#DC2626,#B91C1C)",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",
                  boxShadow:"0 4px 16px rgba(220,38,38,0.35)" }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div style={{ position:"fixed",bottom:28,right:28,zIndex:2000,padding:"14px 20px",borderRadius:12,
          background: toast.type==="error"?"#DC2626":"#059669",
          color:"#fff",fontSize:14,fontWeight:600,boxShadow:"0 8px 36px rgba(0,0,0,0.2)",
          animation:"slideIn 0.3s ease",display:"flex",alignItems:"center",gap:8 }}>
          {toast.type==="error"?"✕":"✓"} {toast.msg}
        </div>
      )}
    </div>
  );
}