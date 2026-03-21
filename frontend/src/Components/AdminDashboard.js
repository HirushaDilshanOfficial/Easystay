import { useState, useEffect } from "react";

const API = "http://localhost:5000/api/advertisements";
const C = { pending:"#D97706", approved:"#059669", rejected:"#DC2626", basic:"#64748B", standard:"#2563EB", premium:"#D97706" };
const PKG_PRICES = { basic:999, standard:2499, premium:4999 };

// ─── Minimal SVG Action Icons ─────────────────────────────────────────────────
const Ic = ({ d, size=13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d}/>
  </svg>
);

const XIco     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;


//
export default function AdminDashboard() {
  const [tab, setTab]         = useState("pending");
  const [ads, setAds]         = useState([]);
  const [loading, setLoading] = useState(false);
  const [fStatus, setFStatus] = useState("all");
  const [search, setSearch]   = useState("");
  const [viewAd, setViewAd]   = useState(null);
  const [rejectAd, setRejectAd] = useState(null);
  const [note, setNote]       = useState("");
  const [toast, setToast]     = useState(null);
  const [busy, setBusy]       = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const r  = await fetch(API);
      const d  = await r.json();
      setAds(d.advertisements || []);
    } catch { showT("Failed to load data", "error"); }
    setLoading(false);
  };

  const showT = (msg, type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null), 3500); };

  const approve = async (ad) => {
    setBusy(ad._id+"_ok");
    try {
      const r = await fetch(`${API}/${ad._id}/approve`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({adminNote:""}) });
      if (r.ok) { showT(`"${ad.name}" approved`); load(); setViewAd(null); }
      else showT("Failed", "error");
    } catch { showT("Server error", "error"); }
    setBusy(null);
  };

  const reject = async () => {
    if (!rejectAd) return;
    setBusy(rejectAd._id+"_rej");
    try {
      const r = await fetch(`${API}/${rejectAd._id}/reject`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({adminNote:note}) });
      if (r.ok) { showT(`"${rejectAd.name}" rejected`); load(); setRejectAd(null); setNote(""); setViewAd(null); }
      else showT("Failed", "error");
    } catch { showT("Server error", "error"); }
    setBusy(null);
  };

  const pending = ads.filter(a => a.status === "pending");
  const shown   = ads.filter(a =>
    (fStatus==="all" || a.status===fStatus) &&
    (a.name?.toLowerCase().includes(search.toLowerCase()) ||
     a.phoneNumber?.includes(search) ||
     a.description?.toLowerCase().includes(search.toLowerCase()))
  );

  const NAV = [
    { id:"pending", label:"Pending Review", badge:pending.length },
    { id:"all",     label:"All Advertisements" },
  ];

  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", minHeight:"100vh", background:"#F0F4FF", color:"#1E293B", display:"flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(37,99,235,0.15);border-radius:4px}
        @keyframes fU{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes sI{from{opacity:0;transform:scale(0.98)}to{opacity:1;transform:scale(1)}}
        @keyframes pls{0%,100%{opacity:1}50%{opacity:0.4}}
        .nav-btn:hover{background:rgba(37,99,235,0.07)!important;color:#1E293B!important}
        .tr:hover{background:#EEF2FF!important}
        .ab:hover{filter:brightness(1.15);transform:scale(1.08)}
        .filter-btn:hover{background:rgba(37,99,235,0.06)!important}
        .adcard:hover{transform:translateY(-2px);box-shadow:0 14px 40px rgba(37,99,235,0.13)!important}
        input:focus,textarea:focus{border-color:rgba(37,99,235,0.45)!important;box-shadow:0 0 0 3px rgba(37,99,235,0.08)!important;outline:none}
      `}</style>

      {/* Ambient */}
      <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",
        background:"radial-gradient(ellipse 80% 50% at 50% -5%,rgba(37,99,235,0.07) 0%,transparent 65%)"}}/>

      {/* ── SIDEBAR ── */}
      <aside style={{width:230,flexShrink:0,position:"fixed",top:0,left:0,bottom:0,zIndex:50,
        background:"#FFFFFF",borderRight:"1px solid rgba(37,99,235,0.1)",
        display:"flex",flexDirection:"column",
        boxShadow:"2px 0 20px rgba(37,99,235,0.06)"}}>

        <div style={{padding:"24px 20px 22px",borderBottom:"1px solid rgba(37,99,235,0.08)"}}>
          <div style={{display:"flex",alignItems:"center",gap:11}}>
            <div style={{width:34,height:34,borderRadius:8,background:"linear-gradient(135deg,#2563EB,#1D4ED8)",flexShrink:0,boxShadow:"0 4px 12px rgba(37,99,235,0.3)"}}/>
            <div>
              <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:15,fontWeight:800,color:"#0F172A",lineHeight:1,letterSpacing:"-0.03em"}}>EasySaty</div>
              <div style={{fontSize:10,color:"#94A3B8",marginTop:3,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em"}}>Admin Console</div>
            </div>
          </div>
        </div>

        <div style={{padding:"20px 20px 8px"}}>
          <div style={{fontSize:10,fontWeight:700,color:"#CBD5E1",textTransform:"uppercase",letterSpacing:"0.12em"}}>Navigation</div>
        </div>

        <nav style={{flex:1,padding:"0 12px"}}>
          {NAV.map(({id,label,badge})=>(
            <button key={id} className="nav-btn" onClick={()=>setTab(id)}
              style={{width:"100%",padding:"11px 12px",borderRadius:8,border:"none",cursor:"pointer",
                textAlign:"left",fontSize:13,fontWeight:600,marginBottom:2,
                display:"flex",alignItems:"center",justifyContent:"space-between",
                background:tab===id?"rgba(37,99,235,0.08)":"transparent",
                color:tab===id?"#2563EB":"#64748B",
                borderLeft:tab===id?"2px solid #2563EB":"2px solid transparent",
                transition:"all 0.18s",letterSpacing:"-0.01em"}}>
              <span>{label}</span>
              {badge>0&&(
                <span style={{background:"#D97706",color:"#fff",fontSize:10,fontWeight:800,padding:"2px 8px",borderRadius:20}}>
                  {badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div style={{padding:"16px 20px",borderTop:"1px solid rgba(37,99,235,0.08)"}}>
          <div style={{fontSize:10,color:"#CBD5E1",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>Session</div>
          <div style={{fontSize:13,color:"#2563EB",fontWeight:800,letterSpacing:"-0.01em"}}>Administrator</div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={{marginLeft:230,flex:1,padding:"32px 32px 60px",position:"relative",zIndex:1}}>

        {/* Page Header */}
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:30}}>
          <div>
            <div style={{fontSize:11,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>
              {tab==="pending" ? "Review Queue" : "Ad Management"}
            </div>
            <h1 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:28,fontWeight:800,color:"#0F172A",letterSpacing:"-0.04em",lineHeight:1.1}}>
              {tab==="pending" ? "Pending Approvals" : "All Advertisements"}
            </h1>
            <p style={{fontSize:13,color:"#64748B",marginTop:5,fontWeight:500}}>
              {tab==="pending"
                ? `${pending.length} ad${pending.length!==1?"s":""} awaiting review`
                : `${ads.length} total advertisements in the system`}
            </p>
          </div>
          <button onClick={load}
            style={{padding:"9px 20px",borderRadius:8,cursor:"pointer",marginTop:4,
              background:"#FFFFFF",border:"1px solid rgba(37,99,235,0.18)",color:"#2563EB",
              fontSize:12,fontWeight:700,transition:"all 0.18s",letterSpacing:"-0.01em",
              boxShadow:"0 2px 8px rgba(37,99,235,0.07)"}}>
            Refresh
          </button>
        </div>

        {/* ══ PENDING ══ */}
        {tab==="pending"&&(
          <div style={{animation:"fU 0.35s ease"}}>
            {loading ? <Loader/>
              : pending.length===0 ? <Empty title="All caught up" sub="No pending advertisements to review at this time."/>
              : (
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:18}}>
                {pending.map(ad=>(
                  <div key={ad._id} className="adcard"
                    style={{background:"#FFFFFF",border:"1px solid rgba(37,99,235,0.1)",borderRadius:16,overflow:"hidden",transition:"all 0.22s",boxShadow:"0 2px 10px rgba(37,99,235,0.06)"}}>
                    {ad.imageUrl
                      ?<img src={ad.imageUrl} alt="" style={{width:"100%",height:150,objectFit:"cover"}}/>
                      :<div style={{height:100,background:"#F8FAFF",display:"flex",alignItems:"center",justifyContent:"center"}}>
                        <div style={{width:32,height:32,borderRadius:8,background:"rgba(37,99,235,0.1)"}}/>
                      </div>}
                    <div style={{padding:"18px 20px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                        <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:15,fontWeight:800,color:"#0F172A",letterSpacing:"-0.02em"}}>{ad.name}</div>
                        <PkgBadge pkg={ad.packageType}/>
                      </div>
                      <div style={{fontSize:12,color:"#64748B",marginBottom:12,lineHeight:1.65,fontWeight:500,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>
                        {ad.description}
                      </div>
                      <div style={{display:"flex",gap:18,marginBottom:14,fontSize:12,color:"#94A3B8",fontWeight:600}}>
                        <span>{ad.phoneNumber}</span>
                        <span>LKR {Number(ad.price).toLocaleString()}</span>
                      </div>
                      {ad.paymentSlip&&(
                        <div style={{fontSize:11,color:C.approved,marginBottom:14,fontWeight:700,letterSpacing:"-0.01em"}}>
                          Payment slip attached
                        </div>
                      )}
                      <div style={{display:"flex",gap:8}}>
                        <button onClick={()=>setViewAd(ad)}
                          style={{flex:1,padding:"9px 0",borderRadius:8,border:"1px solid rgba(37,99,235,0.2)",background:"#EFF6FF",color:"#2563EB",fontSize:12,fontWeight:700,cursor:"pointer",transition:"all 0.18s",letterSpacing:"-0.01em"}}>
                          View Details
                        </button>
                        <button onClick={()=>approve(ad)} disabled={!!busy}
                          style={{flex:1,padding:"9px 0",borderRadius:8,border:"none",
                            background:`linear-gradient(135deg,${C.approved},#047857)`,
                            color:"#fff",fontSize:12,fontWeight:700,cursor:busy?"not-allowed":"pointer",opacity:busy?0.7:1,
                            letterSpacing:"-0.01em",boxShadow:`0 3px 10px ${C.approved}35`}}>
                          Approve
                        </button>
                        <button onClick={()=>{setRejectAd(ad);setNote("");}}
                          style={{padding:"9px 14px",borderRadius:8,border:`1px solid ${C.rejected}35`,background:"#FEF2F2",color:C.rejected,fontSize:12,fontWeight:700,cursor:"pointer",letterSpacing:"-0.01em"}}>
                          Reject
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
          <div style={{animation:"fU 0.35s ease"}}>
            <div style={{display:"flex",gap:8,marginBottom:18,alignItems:"center",flexWrap:"wrap"}}>
              <span style={{fontSize:10,fontWeight:800,color:"#CBD5E1",textTransform:"uppercase",letterSpacing:"0.12em",marginRight:4}}>Filter</span>
              {["all","pending","approved","rejected"].map(st=>(
                <button key={st} className="filter-btn" onClick={()=>setFStatus(st)}
                  style={{padding:"6px 16px",borderRadius:20,cursor:"pointer",fontSize:11,fontWeight:700,
                    textTransform:"capitalize",transition:"all 0.18s",letterSpacing:"-0.01em",
                    background:fStatus===st?(st==="all"?"rgba(37,99,235,0.1)":`${C[st]}14`):"#FFFFFF",
                    color:fStatus===st?(st==="all"?"#2563EB":C[st]):"#64748B",
                    border:`1px solid ${fStatus===st?(st==="all"?"rgba(37,99,235,0.3)":`${C[st]}40`):"rgba(37,99,235,0.12)"}`}}>
                  {st==="all"?"All":st.charAt(0).toUpperCase()+st.slice(1)}
                  <span style={{marginLeft:6,opacity:0.6,fontWeight:600}}>
                    ({st==="all"?ads.length:ads.filter(a=>a.status===st).length})
                  </span>
                </button>
              ))}
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or phone..."
                style={{marginLeft:"auto",padding:"8px 16px",borderRadius:8,background:"#FFFFFF",
                  border:"1px solid rgba(37,99,235,0.15)",color:"#1E293B",fontSize:12,fontWeight:500,
                  width:220,transition:"all 0.18s"}}/>
            </div>

            <div style={{background:"#FFFFFF",border:"1px solid rgba(37,99,235,0.1)",borderRadius:16,overflow:"hidden",boxShadow:"0 2px 12px rgba(37,99,235,0.05)"}}>
              <div style={{display:"grid",gridTemplateColumns:"2.4fr 2fr 1.2fr 1.1fr 1.1fr 1.1fr",
                padding:"13px 22px",background:"#F8FAFF",borderBottom:"1px solid rgba(37,99,235,0.08)",
                fontSize:10,fontWeight:800,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.1em"}}>
                {["Advertisement","Description","Phone","Package","Status","Date"].map(h=><span key={h}>{h}</span>)}
              </div>

              {loading ? <Loader/>
               : shown.length===0 ? <Empty title="No advertisements found" sub="Try adjusting your filters."/>
               : shown.map((ad,i)=>(
                <div key={ad._id} className="tr"
                  style={{display:"grid",gridTemplateColumns:"2.4fr 2fr 1.2fr 1.1fr 1.1fr 1.1fr",
                    padding:"15px 22px",borderBottom:i<shown.length-1?"1px solid rgba(37,99,235,0.06)":"none",
                    alignItems:"center",transition:"background 0.15s"}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    {ad.imageUrl
                      ?<img src={ad.imageUrl} alt="" style={{width:36,height:36,borderRadius:8,objectFit:"cover",flexShrink:0}}/>
                      :<div style={{width:36,height:36,borderRadius:8,background:"#EEF2FF",flexShrink:0}}/>}
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:"#0F172A",marginBottom:1,letterSpacing:"-0.01em"}}>{ad.name}</div>
                      <div style={{fontSize:11,color:"#94A3B8",fontWeight:500}}>LKR {Number(ad.price).toLocaleString()}</div>
                    </div>
                  </div>
                  <div style={{fontSize:12,color:"#64748B",fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",paddingRight:12}}>{ad.description}</div>
                  <div style={{fontSize:12,color:"#64748B",fontWeight:500}}>{ad.phoneNumber}</div>
                  <div><PkgBadge pkg={ad.packageType}/></div>
                  <div><SBadge status={ad.status}/></div>
                  <div style={{fontSize:11,color:"#94A3B8",fontWeight:600}}>{new Date(ad.date).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}</div>
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
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
              <div>
                <h2 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:21,fontWeight:800,color:"#0F172A",marginBottom:8,letterSpacing:"-0.03em"}}>{viewAd.name}</h2>
                <SBadge status={viewAd.status}/>
              </div>
              <button onClick={()=>setViewAd(null)}
                style={{background:"#F8FAFF",border:"1px solid rgba(37,99,235,0.12)",borderRadius:8,padding:"7px 9px",cursor:"pointer",color:"#64748B",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <XIco/>
              </button>
            </div>
            {viewAd.imageUrl&&<img src={viewAd.imageUrl} alt="" style={{width:"100%",height:190,objectFit:"cover",borderRadius:12,marginBottom:18}}/>}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
              {[
                ["Package",    <PkgBadge pkg={viewAd.packageType}/>],
                ["Ad Price",   `LKR ${Number(viewAd.price).toLocaleString()}`],
                ["Phone",      viewAd.phoneNumber],
                ["Submitted",  new Date(viewAd.date).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})],
                ["Package Fee",`LKR ${(PKG_PRICES[viewAd.packageType]||0).toLocaleString()}`],
                ["Reviewed",   viewAd.reviewedAt?new Date(viewAd.reviewedAt).toLocaleDateString("en-GB"):"—"],
              ].map(([k,v])=>(
                <div key={k} style={{background:"#F8FAFF",border:"1px solid rgba(37,99,235,0.08)",borderRadius:10,padding:"10px 14px"}}>
                  <div style={{fontSize:10,color:"#94A3B8",fontWeight:800,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:5}}>{k}</div>
                  <div style={{fontSize:13,color:"#0F172A",fontWeight:700}}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{background:"#F8FAFF",border:"1px solid rgba(37,99,235,0.08)",borderRadius:10,padding:"12px 16px",marginBottom:12}}>
              <div style={{fontSize:10,color:"#94A3B8",fontWeight:800,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>Description</div>
              <div style={{fontSize:13,color:"#64748B",lineHeight:1.7,fontWeight:500}}>{viewAd.description}</div>
            </div>
            {viewAd.adminNote&&(
              <div style={{background:"#FEF2F2",border:"1px solid rgba(220,38,38,0.15)",borderRadius:10,padding:"10px 14px",marginBottom:12}}>
                <div style={{fontSize:10,color:C.rejected,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:5}}>Admin Note</div>
                <div style={{fontSize:13,color:"#DC2626",fontWeight:500}}>{viewAd.adminNote}</div>
              </div>
            )}
            {viewAd.paymentSlip&&(
              <div style={{marginBottom:18}}>
                <div style={{fontSize:10,color:"#94A3B8",fontWeight:800,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>Payment Slip</div>
                <img src={viewAd.paymentSlip} alt="slip" style={{width:"100%",maxHeight:170,objectFit:"cover",borderRadius:10,border:"1px solid rgba(37,99,235,0.1)"}}/>
              </div>
            )}
            {viewAd.status==="pending"&&(
              <div style={{display:"flex",gap:10,justifyContent:"flex-end",paddingTop:6}}>
                <button onClick={()=>{setRejectAd(viewAd);setNote("");}}
                  style={{padding:"10px 22px",borderRadius:9,border:`1px solid ${C.rejected}35`,background:"#FEF2F2",color:C.rejected,fontSize:13,fontWeight:700,cursor:"pointer",letterSpacing:"-0.01em"}}>
                  Reject
                </button>
                <button onClick={()=>approve(viewAd)} disabled={!!busy}
                  style={{padding:"10px 26px",borderRadius:9,border:"none",
                    background:`linear-gradient(135deg,${C.approved},#047857)`,
                    color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",letterSpacing:"-0.01em",
                    boxShadow:`0 4px 16px ${C.approved}35`}}>
                  Approve
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
            <div style={{marginBottom:20}}>
              <h2 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:20,fontWeight:800,color:"#0F172A",marginBottom:6,letterSpacing:"-0.03em"}}>Reject Advertisement</h2>
              <p style={{fontSize:13,color:"#64748B",lineHeight:1.65,fontWeight:500}}>
                You are rejecting <strong style={{color:"#0F172A",fontWeight:700}}>{rejectAd.name}</strong>. The submitter will be notified.
              </p>
            </div>
            <label style={{display:"block",fontSize:10,fontWeight:800,color:"#94A3B8",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.1em"}}>
              Reason (Optional)
            </label>
            <textarea value={note} onChange={e=>setNote(e.target.value)}
              placeholder="e.g. Payment slip unclear, incomplete details..."
              style={{width:"100%",padding:"12px 14px",borderRadius:10,background:"#F8FAFF",
                border:"1px solid rgba(37,99,235,0.15)",color:"#1E293B",fontSize:13,fontWeight:500,
                minHeight:88,resize:"vertical",fontFamily:"'Plus Jakarta Sans',sans-serif",
                transition:"all 0.18s",marginBottom:22}}/>
            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button onClick={()=>setRejectAd(null)}
                style={{padding:"10px 22px",borderRadius:9,background:"transparent",border:"1px solid rgba(37,99,235,0.18)",color:"#64748B",fontSize:13,fontWeight:600,cursor:"pointer",letterSpacing:"-0.01em"}}>
                Cancel
              </button>
              <button onClick={reject} disabled={!!busy}
                style={{padding:"10px 26px",borderRadius:9,border:"none",
                  background:"linear-gradient(135deg,#DC2626,#B91C1C)",
                  color:"#fff",fontSize:13,fontWeight:700,cursor:busy?"not-allowed":"pointer",letterSpacing:"-0.01em",
                  boxShadow:"0 4px 14px rgba(220,38,38,0.25)"}}>
                {busy?"Processing...":"Confirm Rejection"}
              </button>
            </div>
          </div>
        </Overlay>
      )}

      {/* TOAST */}
      {toast&&(
        <div style={{position:"fixed",bottom:28,right:28,zIndex:2000,padding:"13px 22px",borderRadius:10,
          background:toast.type==="error"?"#DC2626":"#059669",color:"#fff",
          fontSize:13,fontWeight:700,letterSpacing:"-0.01em",
          boxShadow:"0 8px 28px rgba(0,0,0,0.15)",animation:"sI 0.25s ease"}}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// ─── Micro Components ─────────────────────────────────────────────────────────
function SBadge({status}) {
  const cfg = {
    pending:  { color:"#D97706", bg:"#FFFBEB" },
    approved: { color:"#059669", bg:"#ECFDF5" },
    rejected: { color:"#DC2626", bg:"#FEF2F2" },
  };
  const { color, bg } = cfg[status] || { color:"#64748B", bg:"#F8FAFC" };
  return(
    <span style={{display:"inline-flex",alignItems:"center",padding:"3px 11px",borderRadius:20,
      fontSize:11,fontWeight:700,background:bg,color,border:`1px solid ${color}30`,
      textTransform:"capitalize",letterSpacing:"-0.01em"}}>
      {status}
    </span>
  );
}

function PkgBadge({pkg}) {
  const cfg = {
    basic:    { color:"#64748B", bg:"#F8FAFC" },
    standard: { color:"#2563EB", bg:"#EFF6FF" },
    premium:  { color:"#D97706", bg:"#FFFBEB" },
  };
  const { color, bg } = cfg[pkg] || cfg.basic;
  return(
    <span style={{display:"inline-block",padding:"3px 11px",borderRadius:20,
      fontSize:10,fontWeight:800,background:bg,color,border:`1px solid ${color}30`,
      textTransform:"capitalize",letterSpacing:"0.02em"}}>
      {pkg}
    </span>
  );
}



function Overlay({children,onClose}) {
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.4)",backdropFilter:"blur(10px)",
      zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}
      onClick={onClose}>
      <div style={{background:"#FFFFFF",border:"1px solid rgba(37,99,235,0.12)",borderRadius:18,padding:32,
        maxHeight:"90vh",overflowY:"auto",animation:"sI 0.22s ease",width:"100%",
        boxShadow:"0 24px 60px rgba(15,23,42,0.12)"}}
        onClick={e=>e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function Loader() {
  return(
    <div style={{padding:"60px",textAlign:"center",color:"#94A3B8",fontSize:13,fontWeight:600,animation:"pls 1.5s infinite",letterSpacing:"-0.01em"}}>
      Loading data...
    </div>
  );
}

function Empty({title,sub}) {
  return(
    <div style={{padding:"72px 24px",textAlign:"center"}}>
      <div style={{width:44,height:44,borderRadius:12,background:"#EEF2FF",margin:"0 auto 18px",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{width:18,height:18,borderRadius:4,background:"rgba(37,99,235,0.18)"}}/>
      </div>
      <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:16,color:"#334155",fontWeight:800,marginBottom:6,letterSpacing:"-0.02em"}}>{title}</div>
      <div style={{fontSize:13,color:"#94A3B8",fontWeight:500}}>{sub}</div>
    </div>
  );
}