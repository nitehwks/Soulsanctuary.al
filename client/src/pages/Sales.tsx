export default function Sales() {
  return (
    <div style={{
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
      background: 'radial-gradient(circle at top, #151b3a 0, #050712 55%, #02030a 100%)',
      color: '#f5f5ff',
      lineHeight: 1.6,
      minHeight: '100vh',
      padding: '2rem'
    }}>
      <main style={{ maxWidth: 1200, margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #8f5bff, #6b3fd4)' }} />
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f5f5ff' }}>SoulSanctuary</div>
              <div style={{ fontSize: '0.9rem', color: '#8f90b3' }}>Faith-integrated AI therapy, encrypted.</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(143, 91, 255, 0.25)', color: '#c3c5ff', padding: '0.5rem 1rem', borderRadius: 999, fontSize: '0.85rem' }}>Free beta - Limited seats</span>
            <span style={{ color: '#8f90b3', fontSize: '0.9rem' }}>Have a licensed therapist? Use both.</span>
          </div>
        </header>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '3rem', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#4fd1c5' }} />
              <span style={{ color: '#c3c5ff', fontSize: '0.95rem' }}>Finally talk about what you really feel with God, without being "too much."</span>
              <span style={{ background: 'rgba(143, 91, 255, 0.25)', color: '#8f5bff', padding: '0.25rem 0.75rem', borderRadius: 999, fontSize: '0.8rem' }}>Faith + Psychology + AI</span>
            </div>

            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, lineHeight: 1.2, marginBottom: '1.5rem', color: '#f5f5ff' }}>
              Process the <span style={{ color: '#8f5bff' }}>heaviest emotions</span> with an AI companion that remembers, prays with you, and never flinches.
            </h1>

            <p style={{ fontSize: '1.1rem', color: '#c3c5ff', marginBottom: '1rem' }}>
              SoulSanctuary is an always-on, faith-integrated AI therapy partner that lets you pour out everything: trauma, triggers, intrusive thoughts, doubts about God, and the stuff you never say out loud—even in counseling.
            </p>

            <p style={{ fontSize: '1rem', color: '#8f90b3', fontStyle: 'italic', marginBottom: '2rem' }}>
              No scripts. No fake "you're fine." Just psychologically-grounded support that holds Scripture and nervous systems together.
            </p>

            <div style={{ background: 'rgba(143, 91, 255, 0.15)', border: '1px solid rgba(143, 91, 255, 0.3)', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '2rem' }}>
              <strong style={{ color: '#8f5bff' }}>Radical safety promise: </strong>
              <span style={{ color: '#c3c5ff' }}>Private, encrypted, and judgment-free—so you can finally stop editing yourself.</span>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <a
                href="https://soulsanctuaryal--joeabbott2.replit.app"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: 'linear-gradient(135deg, #8f5bff, #6b3fd4)',
                  color: 'white',
                  padding: '1rem 2rem',
                  borderRadius: 999,
                  textDecoration: 'none',
                  fontWeight: 600,
                  boxShadow: '0 10px 30px rgba(143, 91, 255, 0.4)'
                }}
                data-testid="button-start-beta"
              >
                <span>Start free beta session</span>
                <span style={{ fontSize: '0.75rem', opacity: 0.8, fontWeight: 400 }}>Takes 60 seconds - No card</span>
              </a>

              <a
                href="#how-it-works"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#c3c5ff',
                  padding: '1rem 1.5rem',
                  borderRadius: 999,
                  textDecoration: 'none'
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4fd1c5' }} />
                <span>See how it processes trauma step-by-step</span>
              </a>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 300,
              height: 300,
              background: 'radial-gradient(circle, rgba(143, 91, 255, 0.3), transparent 70%)',
              borderRadius: '50%',
              filter: 'blur(60px)',
              zIndex: 0
            }} />

            <div style={{
              position: 'relative',
              zIndex: 1,
              background: 'rgba(12, 16, 34, 0.85)',
              backdropFilter: 'blur(26px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 22,
              padding: '1.5rem',
              boxShadow: '0 18px 45px rgba(0, 0, 0, 0.75)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #8f5bff, #6b3fd4)' }} />
                  <div>
                    <strong style={{ display: 'block', color: '#f5f5ff' }}>Your private SoulSanctuary space</strong>
                    <span style={{ fontSize: '0.8rem', color: '#8f90b3' }}>Encrypted session - Only you see this</span>
                  </div>
                </div>
                <span style={{ background: 'rgba(79, 209, 197, 0.2)', color: '#4fd1c5', padding: '0.25rem 0.75rem', borderRadius: 999, fontSize: '0.75rem' }}>Real-time processing</span>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#8f90b3', fontSize: '0.85rem' }}>Today's weight</span>
                  <span style={{ color: '#c3c5ff', fontSize: '0.9rem' }}>"I don't know how much more I can hold."</span>
                </div>
                <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: '88%', height: '100%', background: 'linear-gradient(90deg, #8f5bff, #ff5c7a)', borderRadius: 999 }} />
                </div>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
                <span style={{ display: 'block', color: '#8f90b3', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Built for believers who want both real psychology and real faith.</span>
                <span style={{ background: 'rgba(143, 91, 255, 0.2)', color: '#c3c5ff', padding: '0.25rem 0.75rem', borderRadius: 999, fontSize: '0.75rem' }}>Faith-integrated - No spiritual bypassing</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
