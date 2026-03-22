import { useState, useEffect, useRef } from "react";

const API = "http://localhost:5000/api/advertisements";

const PKG_COLOR = { premium: "#D97706", standard: "#2563EB", basic: "#6B7280" };
const PKG_LABEL = { premium: "Premium", standard: "Standard", basic: "Basic" };

// Detail Modal
function AdDetailModal({ ad, onClose }) {
  const c = PKG_COLOR[ad.packageType] || "#D97706";
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.72)", backdropFilter: "blur(12px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 24, overflow: "hidden",
          maxWidth: 520, width: "100%", maxHeight: "90vh", overflowY: "auto",
          animation: "adPopIn 0.3s cubic-bezier(0.22,1,0.36,1)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.25)",
        }}
      >
        {ad.imageUrl ? (
          <img src={ad.imageUrl} alt={ad.name}
            style={{ width: "100%", height: 210, objectFit: "cover", display: "block" }} />
        ) : (
          <div style={{
            height: 150,
            background: `linear-gradient(135deg, ${c}20, ${c}08)`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52,
          }}>🏠</div>
        )}

        <div style={{ padding: "26px 28px 32px" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "4px 13px", borderRadius: 20, marginBottom: 12,
            background: `${c}15`, color: c, border: `1px solid ${c}35`,
            fontSize: 11, fontWeight: 800,
          }}>
            {PKG_LABEL[ad.packageType]}
          </span>

          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 24, fontWeight: 700, color: "#0F172A",
            marginBottom: 10, lineHeight: 1.25,
          }}>
            {ad.name}
          </h2>

          <p style={{ fontSize: 14, color: "#4B5563", lineHeight: 1.75, marginBottom: 22 }}>
            {ad.description}
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
            {[
              ["📞 Contact", ad.phoneNumber],
              ["📅 Listed", new Date(ad.date).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })],
            ].map(([label, val]) => (
              <div key={label} style={{ background: "#F8FAFC", borderRadius: 10, padding: "10px 14px" }}>
                <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{val}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <a href={`tel:${ad.phoneNumber}`} style={{
              flex: 1, display: "block", textAlign: "center", padding: "13px",
              borderRadius: 12, background: `linear-gradient(135deg, ${c}, ${c}BB)`,
              color: "#fff", fontSize: 14, fontWeight: 700,
              textDecoration: "none", boxShadow: `0 6px 20px ${c}38`,
            }}>
              📞 Call Now
            </a>
            <button onClick={onClose} style={{
              padding: "13px 18px", borderRadius: 12, border: "1px solid #E5E7EB",
              background: "#F9FAFB", color: "#6B7280", fontSize: 13,
              fontWeight: 600, cursor: "pointer",
            }}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


//  AdvertisementBanner
//  Usage: just drop <AdvertisementBanner /> anywhere in your dashboard JSX

export default function BoardingListingDashboard() {
  const [ads, setAds]         = useState([]);
  const [idx, setIdx]         = useState(0);
  const [slide, setSlide]     = useState("idle");   // "idle" | "leaving" | "entering"
  const [detail, setDetail]   = useState(null);
  const [loading, setLoading] = useState(true);
  const timerRef              = useRef(null);

  // Fetch approved ads 
  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`${API}?status=approved`);
        const data = await res.json();
        // Sort: premium first, then standard, then basic
        const sorted = (data.advertisements || []).sort((a, b) => {
          const rank = { premium: 0, standard: 1, basic: 2 };
          return (rank[a.packageType] ?? 3) - (rank[b.packageType] ?? 3);
        });
        setAds(sorted);
      } catch (e) {
        console.error("AdvertisementBanner: fetch failed", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Auto-rotate every 6 s 
  const goTo = (next) => {
    if (slide !== "idle") return;
    clearInterval(timerRef.current);
    setSlide("leaving");
    setTimeout(() => {
      setIdx(next);
      setSlide("entering");
      setTimeout(() => setSlide("idle"), 380);
    }, 300);
  };

  useEffect(() => {
    if (ads.length < 2) return;
    timerRef.current = setInterval(() => goTo((idx + 1) % ads.length), 6000);
    return () => clearInterval(timerRef.current);
  }, [idx, ads.length, slide]);

  // Nothing to render
  if (!loading && ads.length === 0) return null;

  const ad  = ads[idx];
  const col = ad ? PKG_COLOR[ad.packageType] || "#D97706" : "#D97706";

  const contentStyle = {
    opacity:   slide === "idle" ? 1 : 0,
    transform: slide === "leaving"  ? "translateX(-36px)" :
               slide === "entering" ? "translateX(28px)"  : "translateX(0)",
    transition: "opacity 0.3s ease, transform 0.3s cubic-bezier(0.22,1,0.36,1)",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        @keyframes adPopIn   { from{opacity:0;transform:scale(0.94)} to{opacity:1;transform:scale(1)} }
        @keyframes adShimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes adLiveDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.85)} }
        .ad-arrow:hover { background:rgba(255,255,255,0.28)!important; transform:translateY(-50%) scale(1.1)!important; }
        .ad-cta:hover   { filter:brightness(1.1); transform:translateY(-2px); }
        .ad-dot:hover   { opacity:1!important; }
      `}</style>

      {/* BANNER SHELL*/}
      <div style={{
        position: "relative", borderRadius: 22, overflow: "hidden",
        marginBottom: 32, minHeight: 360,
        boxShadow: "0 20px 56px rgba(0,0,0,0.16)",
        fontFamily: "'DM Sans', sans-serif",
      }}>

        {/* Loading skeleton */}
        {loading && (
          <div style={{
            height: 360, borderRadius: 22,
            background: "linear-gradient(90deg,#1C2033 0%,#252B3E 50%,#1C2033 100%)",
            backgroundSize: "200% 100%",
            animation: "adShimmer 1.6s ease-in-out infinite",
          }} />
        )}

        {/*  Actual banner */}
        {!loading && ad && (
          <div style={{
            height: 360,
            background: ad.imageUrl
              ? `linear-gradient(to right, rgba(5,7,14,0.92) 35%, rgba(5,7,14,0.55) 60%, rgba(5,7,14,0.12) 100%),
                 url(${ad.imageUrl}) center / cover no-repeat`
              : `linear-gradient(135deg, #0C1120 0%, #14202E 55%, #0C1120 100%)`,
            display: "flex",
            alignItems: "center",
          }}>

            {/* No-image placeholder art */}
            {!ad.imageUrl && (
              <div style={{
                position: "absolute", right: 60, top: "50%", transform: "translateY(-50%)",
                width: 240, height: 240, borderRadius: "50%",
                background: `radial-gradient(circle, ${col}22 0%, transparent 70%)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 88, userSelect: "none", pointerEvents: "none",
              }}>🏠</div>
            )}

            {/* Text content — slides on transition */}
            <div style={{ padding: "40px 52px", maxWidth: 530, ...contentStyle }}>

              {/* Package + PROMOTED badge */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                padding: "5px 14px", borderRadius: 20, marginBottom: 18,
                background: `${col}24`, color: col, border: `1px solid ${col}55`,
                fontSize: 12, fontWeight: 800,
              }}>
                {PKG_LABEL[ad.packageType]}
                <span style={{
                  background: col, color: "#fff",
                  fontSize: 9, fontWeight: 900,
                  padding: "2px 8px", borderRadius: 20,
                  letterSpacing: "0.07em",
                }}>PROMOTED</span>
              </div>

              {/* Name */}
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 34, fontWeight: 800, color: "#F8FAFC",
                lineHeight: 1.2, marginBottom: 10, letterSpacing: "-0.01em",
              }}>
                {ad.name}
              </h2>

              {/* Description */}
              <p style={{
                fontSize: 14, color: "rgba(255,255,255,0.58)",
                lineHeight: 1.8, marginBottom: 20, maxWidth: 420,
                display: "-webkit-box", WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical", overflow: "hidden",
              }}>
                {ad.description}
              </p>

              {/* Phone */}
              <div style={{ marginBottom: 26 }}>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.52)", display: "flex", alignItems: "center", gap: 6 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.81a16 16 0 0 0 6.29 6.29"/>
                  </svg>
                  {ad.phoneNumber}
                </span>
              </div>

              {/* CTA */}
              <button
                className="ad-cta"
                onClick={() => setDetail(ad)}
                style={{
                  padding: "13px 30px", borderRadius: 12, border: "none", cursor: "pointer",
                  background: `linear-gradient(135deg, ${col}, ${col}CC)`,
                  color: "#fff", fontSize: 14, fontWeight: 700,
                  boxShadow: `0 6px 22px ${col}45`,
                  transition: "all 0.22s",
                }}
              >
                View Details →
              </button>
            </div>
          </div>
        )}

        {/* ── Left / Right nav arrows ── */}
        {!loading && ads.length > 1 && [
          { side: "left",  label: "‹", next: (idx - 1 + ads.length) % ads.length },
          { side: "right", label: "›", next: (idx + 1) % ads.length },
        ].map(({ side, label, next }) => (
          <button
            key={side}
            className="ad-arrow"
            onClick={() => goTo(next)}
            style={{
              position: "absolute", top: "50%", transform: "translateY(-50%)",
              [side]: 16, width: 42, height: 42, borderRadius: "50%", border: "none",
              background: "rgba(255,255,255,0.14)", backdropFilter: "blur(8px)",
              color: "#fff", fontSize: 22, fontWeight: 600,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s", lineHeight: 1, zIndex: 10,
            }}
          >{label}</button>
        ))}

        {/* ── Dot indicators ── */}
        {!loading && ads.length > 1 && (
          <div style={{
            position: "absolute", bottom: 18, left: "50%", transform: "translateX(-50%)",
            display: "flex", gap: 7, alignItems: "center", zIndex: 10,
          }}>
            {ads.map((a, i) => {
              const dc = PKG_COLOR[a.packageType] || "#D97706";
              return (
                <button
                  key={i}
                  className="ad-dot"
                  onClick={() => goTo(i)}
                  style={{
                    width: i === idx ? 24 : 8, height: 8, borderRadius: 4,
                    border: "none", padding: 0, cursor: "pointer",
                    background: i === idx ? dc : "rgba(255,255,255,0.3)",
                    boxShadow: i === idx ? `0 0 8px ${dc}88` : "none",
                    transition: "all 0.35s", opacity: i === idx ? 1 : 0.6,
                  }}
                />
              );
            })}
          </div>
        )}

        {/* ── Top-left: "Promoted Ads" pill ── */}
        {!loading && ads.length > 0 && (
          <div style={{
            position: "absolute", top: 18, left: 18, zIndex: 10,
            padding: "5px 13px", borderRadius: 20,
            background: "rgba(0,0,0,0.48)", backdropFilter: "blur(8px)",
            fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 700,
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: "50%",
              background: "#10B981", display: "inline-block",
              animation: "adLiveDot 2s ease-in-out infinite",
            }} />
            Promoted Ads
          </div>
        )}

        {/* ── Top-right: slide counter ── */}
        {!loading && ads.length > 0 && (
          <div style={{
            position: "absolute", top: 18, right: 18, zIndex: 10,
            padding: "5px 12px", borderRadius: 20,
            background: "rgba(0,0,0,0.48)", backdropFilter: "blur(8px)",
            fontSize: 11, color: "rgba(255,255,255,0.65)", fontWeight: 600,
          }}>
            {idx + 1} / {ads.length}
          </div>
        )}
      </div>

      {/* ── Detail modal ── */}
      {detail && <AdDetailModal ad={detail} onClose={() => setDetail(null)} />}
    </>
  );
}