import { useState, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const API = "http://localhost:5000/Advertisement";
const C = { pending:"#F59E0B", approved:"#10B981", rejected:"#EF4444", basic:"#6B7280", standard:"#3B82F6", premium:"#D97706" };
const PKG_PRICES = { basic:999, standard:2499, premium:4999 };

// ─── Icons ────────────────────────────────────────────────────────────────────
const Ic = ({ d, size=16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d}/>
  </svg>
);
const CheckIco  = () => <Ic d="M20 6L9 17l-5-5" size={14}/>;
const XIco      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const EyeIco    = () => <Ic d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" size={14}/>;
const TrendIco  = () => <Ic d="M23 6l-9.5 9.5-5-5L1 18" size={17}/>;
const DollarIco = () => <Ic d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" size={17}/>;
const BoxIco    = () => <Ic d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" size={17}/>;
const ClockIco  = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/></svg>;
const RefIco    = () => <Ic d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" size={14}/>;
const FiltIco   = () => <Ic d="M4 6h16M7 12h10M10 18h4" size={13}/>;
const LayersIco = () => <Ic d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" size={17}/>;

// ─── Custom chart tooltip ─────────────────────────────────────────────────────
const CTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#1E2130", border:"1px solid rgba(255,255,255,0.12)", borderRadius:10, padding:"10px 14px", fontSize:12 }}>
      <div style={{ color:"#6B7280", marginBottom:6, fontWeight:600 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:p.color }}/>
          <span style={{ color:"#9CA3AF" }}>{p.name}:</span>
          <span style={{ color:"#F9FAFB", fontWeight:700 }}>
            {p.name==="Revenue" ? `LKR ${(p.value||0).toLocaleString()}` : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const [tab, setTab]             = useState("overview");
  const [ads, setAds]             = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [fStatus, setFStatus]     = useState("all");
  const [search, setSearch]       = useState("");
  const [viewAd, setViewAd]       = useState(null);
  const [rejectAd, setRejectAd]   = useState(null);
  const [note, setNote]           = useState("");
  const [toast, setToast]         = useState(null);
  const [busy, setBusy]           = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [r1, r2] = await Promise.all([fetch(API), fetch(`${API}/analytics`)]);
      const d1 = await r1.json(); setAds(d1.advertisements || []);
      const d2 = await r2.json(); setAnalytics(d2);
    } catch { showT("Failed to load data","error"); }
    setLoading(false);
  };

  const showT = (msg, type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null),3500); };

  const approve = async (ad) => {
    setBusy(ad._id+"_ok");
    try {
      const r = await fetch(`${API}/${ad._id}/approve`,{ method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({adminNote:""}) });
      if (r.ok) { showT(`"${ad.name}" approved!`); load(); setViewAd(null); }
      else showT("Failed","error");
    } catch { showT("Server error","error"); }
    setBusy(null);
  };

  const reject = async () => {
    if (!rejectAd) return;
    setBusy(rejectAd._id+"_rej");
    try {
      const r = await fetch(`${API}/${rejectAd._id}/reject`,{ method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({adminNote:note}) });
      if (r.ok) { showT(`"${rejectAd.name}" rejected`); load(); setRejectAd(null); setNote(""); setViewAd(null); }
      else showT("Failed","error");
    } catch { showT("Server error","error"); }
    setBusy(null);
  };

  const pending  = ads.filter(a=>a.status==="pending");
  const shown    = ads.filter(a=>(fStatus==="all"||a.status===fStatus)&&(a.name?.toLowerCase().includes(search.toLowerCase())||a.phoneNumber?.includes(search)||a.description?.toLowerCase().includes(search.toLowerCase())));
  const s        = analytics?.summary || {};
  const monthly  = analytics?.monthly || [];
  const byPkg    = analytics?.byPackage || [];
  const pie      = [
    {name:"Pending",  value:s.pending  ||0, color:C.pending  },
    {name:"Approved", value:s.approved ||0, color:C.approved },
    {name:"Rejected", value:s.rejected ||0, color:C.rejected },
  ];
  const approvalRate = s.total ? Math.round(((s.approved||0)/s.total)*100) : 0;

  const statCards = [
    {label:"Total Ads",      val:s.total||0,                                        color:"#6366F1", icon:<BoxIco/>},
    {label:"Pending",        val:s.pending||0,                                       color:C.pending, icon:<ClockIco/>},
    {label:"Approved",       val:s.approved||0,                                      color:C.approved, icon:<CheckIco/>},
    {label:"Rejected",       val:s.rejected||0,                                      color:C.rejected, icon:<XIco/>},
    {label:"Revenue",        val:`LKR ${(s.totalRevenue||0).toLocaleString()}`,      color:C.premium, icon:<DollarIco/>},
  ];

  return (
    <div style={{ fontFamily:"'Syne','DM Sans',sans-serif", minHeight:"100vh", background:"#07090F", color:"#E2E4ED", display:"flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        ::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.09);border-radius:3px}
        @keyframes fU{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes sI{from{opacity:0;transform:scale(0.97)}to{opacity:1;transform:scale(1)}}
        @keyframes pls{0%,100%{opacity:1}50%{opacity:0.4}}
        .tnb:hover{color:#E2E4ED!important;background:rgba(255,255,255,0.07)!important}
        .tr:hover{background:rgba(255,255,255,0.03)!important}
        .ab:hover{filter:brightness(1.18);transform:scale(1.06)}
        .sc:hover{transform:translateY(-4px)!important;border-color:rgba(255,255,255,0.14)!important}
        .fb:hover{background:rgba(255,255,255,0.09)!important;color:#E2E4ED!important}
        .adcard:hover{transform:translateY(-3px);box-shadow:0 12px 36px rgba(0,0,0,0.4)}
        input:focus,textarea:focus{border-color:rgba(99,102,241,0.55)!important;box-shadow:0 0 0 3px rgba(99,102,241,0.12)!important;outline:none}
      `}</style>

      {/* AMBIENT */}
      <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",
        background:"radial-gradient(ellipse 60% 40% at 10% 5%,rgba(99,102,241,0.1) 0%,transparent 55%),radial-gradient(ellipse 40% 30% at 92% 88%,rgba(16,185,129,0.07) 0%,transparent 50%)"}}/>

      {/* ── SIDEBAR ── */}
      <aside style={{width:224,flexShrink:0,position:"fixed",top:0,left:0,bottom:0,zIndex:50,
        background:"rgba(8,10,16,0.97)",borderRight:"1px solid rgba(255,255,255,0.06)",
        display:"flex",flexDirection:"column",padding:"22px 0"}}>

        <div style={{padding:"0 18px 24px",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#6366F1,#4F46E5)",
              display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <LayersIco/>
            </div>
            <div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:800,color:"#F9FAFB",lineHeight:1}}>BoardingHub</div>
              <div style={{fontSize:10,color:"#374151",marginTop:2,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em"}}>Admin Panel</div>
            </div>
          </div>
        </div>

        <nav style={{flex:1,padding:"14px 10px"}}>
          {[
            {id:"overview", label:"Analytics",       icon:"📊", badge:0},
            {id:"pending",  label:"Pending Review",  icon:"⏳", badge:pending.length},
            {id:"all",      label:"All Ads",         icon:"📋", badge:0},
          ].map(({id,label,icon,badge})=>(
            <button key={id} className="tnb" onClick={()=>setTab(id)}
              style={{width:"100%",padding:"10px 12px",borderRadius:9,border:"none",cursor:"pointer",
                textAlign:"left",fontSize:13,fontWeight:600,marginBottom:3,
                display:"flex",alignItems:"center",justifyContent:"space-between",
                background:tab===id?"rgba(99,102,241,0.18)":"transparent",
                color:tab===id?"#A5B4FC":"#374151",
                borderLeft:tab===id?"3px solid #6366F1":"3px solid transparent",
                transition:"all 0.2s"}}>
              <span style={{display:"flex",alignItems:"center",gap:9}}><span>{icon}</span>{label}</span>
              {badge>0&&<span style={{background:"#F59E0B",color:"#000",fontSize:10,fontWeight:800,padding:"1px 7px",borderRadius:20}}>{badge}</span>}
            </button>
          ))}
        </nav>

        <div style={{padding:"14px 18px",borderTop:"1px solid rgba(255,255,255,0.06)"}}>
          <div style={{fontSize:10,color:"#374151",fontWeight:600}}>Logged in as</div>
          <div style={{fontSize:13,color:"#818CF8",fontWeight:700,marginTop:2}}>Administrator</div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={{marginLeft:224,flex:1,padding:"30px 30px 56px",position:"relative",zIndex:1}}>

        {/* Header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:28}}>
          <div>
            <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:25,fontWeight:800,color:"#F9FAFB",marginBottom:3}}>
              {tab==="overview"?"Analytics Overview":tab==="pending"?"Pending Approvals":"All Advertisements"}
            </h1>
            <p style={{fontSize:13,color:"#374151"}}>
              {tab==="overview"?"Live metrics from your advertisement platform"
               :tab==="pending"?`${pending.length} ad${pending.length!==1?"s":""} awaiting review`
               :`${ads.length} total advertisements`}
            </p>
          </div>
          <button onClick={load}
            style={{display:"flex",alignItems:"center",gap:7,padding:"8px 16px",borderRadius:9,cursor:"pointer",
              background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",color:"#4B5563",fontSize:12,fontWeight:600,transition:"all 0.2s"}}>
            <RefIco/> Refresh
          </button>
        </div>

        {/* ══ OVERVIEW ══ */}
        {tab==="overview"&&(
          <div style={{animation:"fU 0.4s ease"}}>

            {/* Stats */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:14,marginBottom:24}}>
              {statCards.map(sc=>(
                <div key={sc.label} className="sc"
                  style={{background:"rgba(255,255,255,0.024)",border:"1px solid rgba(255,255,255,0.07)",
                    borderRadius:16,padding:"16px 18px",borderTop:`3px solid ${sc.color}`,transition:"all 0.25s",cursor:"default"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                    <div style={{fontSize:10,fontWeight:700,color:"#374151",textTransform:"uppercase",letterSpacing:"0.06em"}}>{sc.label}</div>
                    <div style={{color:sc.color,opacity:0.75}}>{sc.icon}</div>
                  </div>
                  <div style={{fontFamily:"'Syne',sans-serif",fontSize:typeof sc.val==="string"?15:28,fontWeight:800,color:"#F9FAFB",lineHeight:1}}>
                    {sc.val}
                  </div>
                </div>
              ))}
            </div>

            {/* Charts row 1 */}
            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:16,marginBottom:16}}>
              {/* Bar - monthly */}
              <div style={{background:"rgba(255,255,255,0.024)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:18,padding:"22px 22px 16px"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:18}}>
                  <TrendIco/><span style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:"#F9FAFB"}}>Monthly Submissions</span>
                </div>
                <ResponsiveContainer width="100%" height={210}>
                  <BarChart data={monthly} barGap={2} barCategoryGap="30%">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false}/>
                    <XAxis dataKey="label" tick={{fill:"#374151",fontSize:11}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fill:"#374151",fontSize:11}} axisLine={false} tickLine={false}/>
                    <Tooltip content={<CTip/>} cursor={{fill:"rgba(255,255,255,0.04)"}}/>
                    <Legend wrapperStyle={{fontSize:11,color:"#4B5563",paddingTop:8}}/>
                    <Bar dataKey="approved" name="Approved" fill={C.approved} radius={[4,4,0,0]}/>
                    <Bar dataKey="pending"  name="Pending"  fill={C.pending}  radius={[4,4,0,0]}/>
                    <Bar dataKey="rejected" name="Rejected" fill={C.rejected} radius={[4,4,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie */}
              <div style={{background:"rgba(255,255,255,0.024)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:18,padding:"22px"}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:"#F9FAFB",marginBottom:2}}>Status Split</div>
                <div style={{fontSize:11,color:"#374151",marginBottom:14}}>
                  Approval rate: <span style={{color:C.approved,fontWeight:700}}>{approvalRate}%</span>
                </div>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie data={pie} cx="50%" cy="50%" innerRadius={38} outerRadius={64} paddingAngle={3} dataKey="value">
                      {pie.map((e,i)=><Cell key={i} fill={e.color} stroke="transparent"/>)}
                    </Pie>
                    <Tooltip content={<CTip/>}/>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{marginTop:8}}>
                  {pie.map(p=>(
                    <div key={p.name} style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:7}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div style={{width:8,height:8,borderRadius:"50%",background:p.color}}/>
                        <span style={{fontSize:12,color:"#4B5563"}}>{p.name}</span>
                      </div>
                      <span style={{fontSize:13,fontWeight:700,color:"#D1D5DB"}}>{p.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Charts row 2 */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              {/* Revenue line */}
              <div style={{background:"rgba(255,255,255,0.024)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:18,padding:"22px 22px 14px"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:18}}>
                  <DollarIco/><span style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:"#F9FAFB"}}>Revenue Trend (LKR)</span>
                </div>
                <ResponsiveContainer width="100%" height={190}>
                  <LineChart data={monthly}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false}/>
                    <XAxis dataKey="label" tick={{fill:"#374151",fontSize:11}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fill:"#374151",fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
                    <Tooltip content={<CTip/>}/>
                    <Line type="monotone" dataKey="revenue" name="Revenue" stroke={C.premium} strokeWidth={2.5}
                      dot={{fill:C.premium,r:4,strokeWidth:0}} activeDot={{r:6}}/>
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Package breakdown */}
              <div style={{background:"rgba(255,255,255,0.024)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:18,padding:"22px"}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:"#F9FAFB",marginBottom:20}}>
                  Package Performance
                </div>
                {byPkg.map(pkg=>{
                  const total=pkg.total||1;
                  const pct=Math.round((pkg.approved/total)*100);
                  return(
                    <div key={pkg.package} style={{marginBottom:18}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <span style={{width:8,height:8,borderRadius:"50%",background:C[pkg.package],display:"inline-block"}}/>
                          <span style={{fontSize:13,fontWeight:600,color:"#D1D5DB",textTransform:"capitalize"}}>{pkg.package}</span>
                        </div>
                        <div style={{fontSize:11,color:"#374151"}}>
                          {pkg.total} ads · <span style={{color:C.approved}}>LKR {(pkg.revenue||0).toLocaleString()}</span>
                        </div>
                      </div>
                      <div style={{height:7,borderRadius:4,background:"rgba(255,255,255,0.07)",overflow:"hidden",marginBottom:5}}>
                        <div style={{height:"100%",borderRadius:4,width:`${pct}%`,background:C[pkg.package],transition:"width 1s ease"}}/>
                      </div>
                      <div style={{display:"flex",gap:10,fontSize:11}}>
                        <span style={{color:C.approved}}>✓ {pkg.approved}</span>
                        <span style={{color:C.pending}}>⏳ {pkg.pending}</span>
                        <span style={{color:C.rejected}}>✗ {pkg.rejected}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ══ PENDING ══ */}
        {tab==="pending"&&(
          <div style={{animation:"fU 0.4s ease"}}>
            {loading ? <Loader/>
              : pending.length===0 ? <Empty icon="✅" title="All caught up!" sub="No pending advertisements to review."/>
              : (
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:18}}>
                {pending.map(ad=>(
                  <div key={ad._id} className="adcard" style={{background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:18,overflow:"hidden",transition:"all 0.25s"}}>
                    {ad.imageUrl
                      ?<img src={ad.imageUrl} alt="" style={{width:"100%",height:155,objectFit:"cover"}}/>
                      :<div style={{height:110,background:"rgba(255,255,255,0.04)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:38}}>🏠</div>}
                    <div style={{padding:"18px 20px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                        <div style={{fontSize:15,fontWeight:700,color:"#F9FAFB"}}>{ad.name}</div>
                        <PkgBadge pkg={ad.packageType}/>
                      </div>
                      <div style={{fontSize:12,color:"#374151",marginBottom:12,lineHeight:1.55,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>
                        {ad.description}
                      </div>
                      <div style={{display:"flex",gap:16,marginBottom:14,fontSize:12,color:"#374151"}}>
                        <span>📞 {ad.phoneNumber}</span>
                        <span>💰 LKR {Number(ad.price).toLocaleString()}</span>
                      </div>
                      {ad.paymentSlip&&<div style={{fontSize:11,color:C.approved,marginBottom:14,fontWeight:600}}>✓ Payment slip attached</div>}
                      <div style={{display:"flex",gap:8}}>
                        <button onClick={()=>setViewAd(ad)}
                          style={{flex:1,padding:"9px 0",borderRadius:9,border:"1px solid rgba(99,102,241,0.35)",background:"rgba(99,102,241,0.1)",color:"#A5B4FC",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                          View Details
                        </button>
                        <button onClick={()=>approve(ad)} disabled={!!busy}
                          style={{flex:1,padding:"9px 0",borderRadius:9,border:"none",background:`linear-gradient(135deg,${C.approved},#047857)`,
                            color:"#fff",fontSize:12,fontWeight:700,cursor:busy?"not-allowed":"pointer",opacity:busy?0.7:1,
                            boxShadow:`0 3px 12px ${C.approved}33`}}>
                          ✓ Approve
                        </button>
                        <button onClick={()=>{setRejectAd(ad);setNote("");}}
                          style={{padding:"9px 13px",borderRadius:9,border:`1px solid ${C.rejected}40`,background:`${C.rejected}12`,color:C.rejected,fontSize:12,fontWeight:700,cursor:"pointer"}}>
                          ✗
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ ALL ADS TABLE ══ */}
        {tab==="all"&&(
          <div style={{animation:"fU 0.4s ease"}}>
            {/* Filters */}
            <div style={{display:"flex",gap:8,marginBottom:18,alignItems:"center",flexWrap:"wrap"}}>
              <span style={{display:"flex",alignItems:"center",gap:5,color:"#374151",fontSize:12}}><FiltIco/>Filter:</span>
              {["all","pending","approved","rejected"].map(st=>(
                <button key={st} className="fb" onClick={()=>setFStatus(st)}
                  style={{padding:"6px 15px",borderRadius:20,border:"none",cursor:"pointer",fontSize:11,fontWeight:700,
                    textTransform:"capitalize",transition:"all 0.2s",
                    background:fStatus===st?(st==="all"?"rgba(99,102,241,0.25)":`${C[st]}22`):"rgba(255,255,255,0.05)",
                    color:fStatus===st?(st==="all"?"#A5B4FC":C[st]):"#374151",
                    border:fStatus===st?`1px solid ${st==="all"?"#6366F1":C[st]}45`:"1px solid transparent"}}>
                  {st==="all"?"All":st.charAt(0).toUpperCase()+st.slice(1)}
                  <span style={{marginLeft:5,opacity:0.65}}>({st==="all"?ads.length:ads.filter(a=>a.status===st).length})</span>
                </button>
              ))}
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, phone..."
                style={{marginLeft:"auto",padding:"7px 14px",borderRadius:9,background:"rgba(255,255,255,0.05)",
                  border:"1px solid rgba(255,255,255,0.09)",color:"#E2E4ED",fontSize:12,width:200,transition:"all 0.2s"}}/>
            </div>

            {/* Table */}
            <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:18,overflow:"hidden"}}>
              <div style={{display:"grid",gridTemplateColumns:"2.4fr 2fr 1.2fr 1.1fr 1.1fr 1.1fr 130px",
                padding:"12px 20px",background:"rgba(255,255,255,0.04)",borderBottom:"1px solid rgba(255,255,255,0.07)",
                fontSize:10,fontWeight:700,color:"#374151",textTransform:"uppercase",letterSpacing:"0.07em"}}>
                {["Advertisement","Description","Phone","Package","Status","Date","Actions"].map(h=><span key={h}>{h}</span>)}
              </div>
              {loading ? <Loader/>
               : shown.length===0 ? <Empty icon="📋" title="No advertisements found" sub="Try adjusting filters."/>
               : shown.map((ad,i)=>(
                <div key={ad._id} className="tr"
                  style={{display:"grid",gridTemplateColumns:"2.4fr 2fr 1.2fr 1.1fr 1.1fr 1.1fr 130px",
                    padding:"14px 20px",borderBottom:i<shown.length-1?"1px solid rgba(255,255,255,0.05)":"none",
                    alignItems:"center",transition:"background 0.15s"}}>
                  <div style={{display:"flex",alignItems:"center",gap:11}}>
                    {ad.imageUrl
                      ?<img src={ad.imageUrl} alt="" style={{width:36,height:36,borderRadius:9,objectFit:"cover",flexShrink:0}}/>
                      :<div style={{width:36,height:36,borderRadius:9,background:"rgba(255,255,255,0.07)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>🏠</div>}
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:"#F9FAFB",marginBottom:1}}>{ad.name}</div>
                      <div style={{fontSize:11,color:"#374151"}}>LKR {Number(ad.price).toLocaleString()}</div>
                    </div>
                  </div>
                  <div style={{fontSize:12,color:"#374151",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",paddingRight:10}}>{ad.description}</div>
                  <div style={{fontSize:12,color:"#4B5563"}}>{ad.phoneNumber}</div>
                  <div><PkgBadge pkg={ad.packageType}/></div>
                  <div><SBadge status={ad.status}/></div>
                  <div style={{fontSize:11,color:"#374151"}}>{new Date(ad.date).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}</div>
                  <div style={{display:"flex",gap:5}}>
                    <ABtn color="#818CF8" title="View"    onClick={()=>setViewAd(ad)}><EyeIco/></ABtn>
                    {ad.status!=="approved"&&<ABtn color={C.approved} title="Approve" loading={busy===ad._id+"_ok"} onClick={()=>approve(ad)}><CheckIco/></ABtn>}
                    {ad.status!=="rejected"&&<ABtn color={C.rejected} title="Reject"  onClick={()=>{setRejectAd(ad);setNote("");}}><XIco/></ABtn>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ══ VIEW MODAL ══ */}
      {viewAd&&(
        <Overlay onClose={()=>setViewAd(null)}>
          <div style={{maxWidth:540,width:"100%"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
              <div>
                <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,color:"#F9FAFB",marginBottom:6}}>{viewAd.name}</h2>
                <SBadge status={viewAd.status}/>
              </div>
              <button onClick={()=>setViewAd(null)} style={{background:"rgba(255,255,255,0.07)",border:"none",borderRadius:8,padding:8,cursor:"pointer",color:"#4B5563"}}>
                <XIco/>
              </button>
            </div>
            {viewAd.imageUrl&&<img src={viewAd.imageUrl} alt="" style={{width:"100%",height:190,objectFit:"cover",borderRadius:12,marginBottom:18}}/>}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
              {[
                ["Package", <PkgBadge pkg={viewAd.packageType}/>],
                ["Ad Price",`LKR ${Number(viewAd.price).toLocaleString()}`],
                ["Phone",viewAd.phoneNumber],
                ["Submitted",new Date(viewAd.date).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})],
                ["Package Fee",`LKR ${(PKG_PRICES[viewAd.packageType]||0).toLocaleString()}`],
                ["Reviewed",viewAd.reviewedAt?new Date(viewAd.reviewedAt).toLocaleDateString("en-GB"):"—"],
              ].map(([k,v])=>(
                <div key={k} style={{background:"rgba(255,255,255,0.04)",borderRadius:10,padding:"10px 14px"}}>
                  <div style={{fontSize:10,color:"#374151",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>{k}</div>
                  <div style={{fontSize:13,color:"#E2E4ED",fontWeight:600}}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{background:"rgba(255,255,255,0.04)",borderRadius:10,padding:"12px 16px",marginBottom:14}}>
              <div style={{fontSize:10,color:"#374151",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:5}}>Description</div>
              <div style={{fontSize:13,color:"#6B7280",lineHeight:1.65}}>{viewAd.description}</div>
            </div>
            {viewAd.adminNote&&(
              <div style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:10,padding:"10px 14px",marginBottom:14}}>
                <div style={{fontSize:10,color:C.rejected,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>Admin Note</div>
                <div style={{fontSize:13,color:"#FCA5A5"}}>{viewAd.adminNote}</div>
              </div>
            )}
            {viewAd.paymentSlip&&(
              <div style={{marginBottom:18}}>
                <div style={{fontSize:10,color:"#374151",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:7}}>Payment Slip</div>
                <img src={viewAd.paymentSlip} alt="slip" style={{width:"100%",maxHeight:170,objectFit:"cover",borderRadius:10,border:"1px solid rgba(255,255,255,0.08)"}}/>
              </div>
            )}
            {viewAd.status==="pending"&&(
              <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
                <button onClick={()=>{setRejectAd(viewAd);setNote("");}}
                  style={{padding:"10px 20px",borderRadius:10,border:`1px solid ${C.rejected}50`,background:`${C.rejected}14`,color:C.rejected,fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
                  <XIco/> Reject
                </button>
                <button onClick={()=>approve(viewAd)} disabled={!!busy}
                  style={{padding:"10px 24px",borderRadius:10,border:"none",background:`linear-gradient(135deg,${C.approved},#047857)`,
                    color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6,
                    boxShadow:`0 4px 16px ${C.approved}30`}}>
                  <CheckIco/> Approve
                </button>
              </div>
            )}
          </div>
        </Overlay>
      )}

      {/* ══ REJECT MODAL ══ */}
      {rejectAd&&(
        <Overlay onClose={()=>setRejectAd(null)}>
          <div style={{maxWidth:400,width:"100%"}}>
            <div style={{fontSize:40,marginBottom:14}}>⛔</div>
            <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:19,fontWeight:800,color:"#F9FAFB",marginBottom:8}}>Reject Advertisement?</h2>
            <p style={{fontSize:13,color:"#374151",marginBottom:22,lineHeight:1.65}}>
              Rejecting <strong style={{color:"#E2E4ED"}}>{rejectAd.name}</strong>. The owner will be notified. Optionally provide a reason.
            </p>
            <label style={{display:"block",fontSize:11,fontWeight:700,color:"#4B5563",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.05em"}}>
              Reason (Optional)
            </label>
            <textarea value={note} onChange={e=>setNote(e.target.value)}
              placeholder="e.g. Payment slip unclear, incomplete details..."
              style={{width:"100%",padding:"12px 14px",borderRadius:10,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",
                color:"#F9FAFB",fontSize:13,minHeight:90,resize:"vertical",fontFamily:"inherit",transition:"all 0.2s",marginBottom:22}}/>
            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button onClick={()=>setRejectAd(null)}
                style={{padding:"10px 20px",borderRadius:10,background:"transparent",border:"1px solid rgba(255,255,255,0.12)",color:"#4B5563",fontSize:13,cursor:"pointer"}}>
                Cancel
              </button>
              <button onClick={reject} disabled={!!busy}
                style={{padding:"10px 24px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#DC2626,#B91C1C)",
                  color:"#fff",fontSize:13,fontWeight:700,cursor:busy?"not-allowed":"pointer",boxShadow:"0 4px 14px rgba(220,38,38,0.33)"}}>
                {busy?"Rejecting...":"Confirm Reject"}
              </button>
            </div>
          </div>
        </Overlay>
      )}

      {/* TOAST */}
      {toast&&(
        <div style={{position:"fixed",bottom:26,right:26,zIndex:2000,padding:"12px 20px",borderRadius:12,
          background:toast.type==="error"?"#DC2626":"#059669",color:"#fff",fontSize:13,fontWeight:700,
          boxShadow:"0 8px 36px rgba(0,0,0,0.5)",animation:"sI 0.3s ease",display:"flex",alignItems:"center",gap:8}}>
          {toast.type==="error"?"✕":"✓"} {toast.msg}
        </div>
      )}
    </div>
  );
}

// ─── Micro components ─────────────────────────────────────────────────────────
function SBadge({status}) {
  const m={pending:["⏳",C.pending],approved:["✓",C.approved],rejected:["✗",C.rejected]};
  const [ic,co]=m[status]||["?","#6B7280"];
  return(
    <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:20,
      fontSize:11,fontWeight:700,background:`${co}20`,color:co,border:`1px solid ${co}40`,textTransform:"capitalize"}}>
      {ic} {status}
    </span>
  );
}

function PkgBadge({pkg}) {
  const c=C[pkg]||"#6B7280";
  return(
    <span style={{display:"inline-block",padding:"3px 10px",borderRadius:20,fontSize:10,fontWeight:700,
      background:`${c}20`,color:c,border:`1px solid ${c}40`,textTransform:"capitalize"}}>
      {pkg}
    </span>
  );
}

function ABtn({color,title,onClick,children,loading}) {
  return(
    <button className="ab" title={title} onClick={onClick} disabled={loading}
      style={{width:28,height:28,borderRadius:7,border:"none",background:`${color}18`,color,
        cursor:loading?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",
        transition:"all 0.2s",flexShrink:0,opacity:loading?0.5:1}}>
      {children}
    </button>
  );
}

function Overlay({children,onClose}) {
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.83)",backdropFilter:"blur(14px)",
      zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}
      onClick={onClose}>
      <div style={{background:"#14161E",border:"1px solid rgba(255,255,255,0.1)",borderRadius:20,padding:30,
        maxHeight:"90vh",overflowY:"auto",animation:"sI 0.25s ease",width:"100%"}}
        onClick={e=>e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function Loader() {
  return<div style={{padding:"52px",textAlign:"center",color:"#374151",fontSize:13,animation:"pls 1.5s infinite"}}>Loading...</div>;
}

function Empty({icon,title,sub}) {
  return(
    <div style={{padding:"68px 24px",textAlign:"center"}}>
      <div style={{fontSize:48,marginBottom:14}}>{icon}</div>
      <div style={{fontSize:15,color:"#374151",fontWeight:700,marginBottom:6}}>{title}</div>
      <div style={{fontSize:12,color:"#1F2937"}}>{sub}</div>
    </div>
  );
}