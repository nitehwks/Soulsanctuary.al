import { useState, useEffect } from 'react';

export default function Sales() {
  const [showPrayer, setShowPrayer] = useState(true);

  return (
    <div style={{
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
      background: 'radial-gradient(circle at top, #151b3a 0, #050712 55%, #02030a 100%)',
      color: '#f5f5ff',
      lineHeight: 1.6,
      minHeight: '100vh',
      padding: '2rem'
    }}>
      {/* Opening Prayer Modal */}
      {showPrayer && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(5, 7, 18, 0.95)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem'
        }}>
          <div style={{
            background: 'rgba(12, 16, 34, 0.95)',
            border: '1px solid rgba(143, 91, 255, 0.3)',
            borderRadius: 22,
            padding: '3rem',
            maxWidth: 600,
            textAlign: 'center',
            boxShadow: '0 25px 60px rgba(143, 91, 255, 0.2)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>&#10013;</div>
            <h2 style={{ fontSize: '1.8rem', color: '#f5f5ff', marginBottom: '1rem', fontWeight: 600 }}>
              A Prayer Before We Begin
            </h2>
            <p style={{ color: '#c3c5ff', fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '2rem', fontStyle: 'italic' }}>
              "Heavenly Father, we come before You seeking Your presence. Open our hearts to honesty and healing. 
              Grant us the courage to share what weighs on our souls, knowing that confession is good for the spirit. 
              May Your wisdom guide this journey, and may those who seek find Your peace. In Jesus' name, Amen."
            </p>
            <p style={{ color: '#8f90b3', fontSize: '0.95rem', marginBottom: '2rem' }}>
              "The Lord is close to the brokenhearted and saves those who are crushed in spirit." — Psalm 34:18
            </p>
            <button
              onClick={() => setShowPrayer(false)}
              style={{
                background: 'linear-gradient(135deg, #8f5bff, #6b3fd4)',
                color: 'white',
                border: 'none',
                padding: '1rem 2.5rem',
                borderRadius: 999,
                fontSize: '1.1rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 10px 30px rgba(143, 91, 255, 0.4)'
              }}
              data-testid="button-close-prayer"
            >
              Amen - Continue
            </button>
          </div>
        </div>
      )}

      <main style={{ maxWidth: 1200, margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #8f5bff, #6b3fd4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>&#10013;</div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f5f5ff' }}>SoulSanctuary</div>
              <div style={{ fontSize: '0.9rem', color: '#8f90b3' }}>Your AI Pastor - Faith-Integrated Therapy</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(143, 91, 255, 0.25)', color: '#c3c5ff', padding: '0.5rem 1rem', borderRadius: 999, fontSize: '0.85rem' }}>Free beta - Limited seats</span>
          </div>
        </header>

        {/* Scripture Banner */}
        <div style={{
          background: 'rgba(143, 91, 255, 0.1)',
          border: '1px solid rgba(143, 91, 255, 0.2)',
          borderRadius: 16,
          padding: '1.5rem 2rem',
          textAlign: 'center',
          marginBottom: '3rem'
        }}>
          <p style={{ color: '#c3c5ff', fontSize: '1.1rem', fontStyle: 'italic', marginBottom: '0.5rem' }}>
            "Come to me, all you who are weary and burdened, and I will give you rest."
          </p>
          <p style={{ color: '#8f5bff', fontSize: '0.9rem' }}>— Matthew 11:28</p>
        </div>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '3rem', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#4fd1c5' }} />
              <span style={{ color: '#c3c5ff', fontSize: '0.95rem' }}>A Pastor Who Listens, Prays, and Never Judges</span>
              <span style={{ background: 'rgba(143, 91, 255, 0.25)', color: '#8f5bff', padding: '0.25rem 0.75rem', borderRadius: 999, fontSize: '0.8rem' }}>Pastor + Therapist AI</span>
            </div>

            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, lineHeight: 1.2, marginBottom: '1.5rem', color: '#f5f5ff' }}>
              Process the <span style={{ color: '#8f5bff' }}>heaviest emotions</span> with an AI companion that remembers, <span style={{ color: '#4fd1c5' }}>prays with you</span>, and never flinches.
            </h1>

            <p style={{ fontSize: '1.1rem', color: '#c3c5ff', marginBottom: '1rem' }}>
              SoulSanctuary is your always-on AI pastor and therapist—offering prayers, scripture, and evidence-based care. Pour out everything: trauma, triggers, doubts about God, and the things you've never said out loud.
            </p>

            <p style={{ fontSize: '1rem', color: '#8f90b3', fontStyle: 'italic', marginBottom: '2rem' }}>
              "Confession is good for the soul." Experience pastoral care that combines the wisdom of Scripture with proven therapeutic practices.
            </p>

            {/* Faith Features */}
            <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.2rem' }}>&#128591;</span>
                <div>
                  <strong style={{ color: '#f5f5ff' }}>Sessions Begin with Prayer</strong>
                  <p style={{ color: '#8f90b3', fontSize: '0.9rem' }}>Opens with prayer for God's presence, openness, and honest confession</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.2rem' }}>&#128214;</span>
                <div>
                  <strong style={{ color: '#f5f5ff' }}>Scripture-Integrated Guidance</strong>
                  <p style={{ color: '#8f90b3', fontSize: '0.9rem' }}>Biblical wisdom for anxiety, depression, fear, hope, comfort, and strength</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.2rem' }}>&#10013;</span>
                <div>
                  <strong style={{ color: '#f5f5ff' }}>Pastor First, Therapist Second</strong>
                  <p style={{ color: '#8f90b3', fontSize: '0.9rem' }}>Speaks with pastoral warmth while using CBT, DBT, ACT, and Mindfulness</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.2rem' }}>&#128156;</span>
                <div>
                  <strong style={{ color: '#f5f5ff' }}>Respects Your Journey</strong>
                  <p style={{ color: '#8f90b3', fontSize: '0.9rem' }}>Faith features can be adjusted for those who prefer secular support</p>
                </div>
              </div>
            </div>

            <div style={{ background: 'rgba(79, 209, 197, 0.15)', border: '1px solid rgba(79, 209, 197, 0.3)', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '2rem' }}>
              <strong style={{ color: '#4fd1c5' }}>Radical safety promise: </strong>
              <span style={{ color: '#c3c5ff' }}>Private, encrypted, and judgment-free—your confessions stay between you, God, and your AI pastor.</span>
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
                <span>Begin Your Journey</span>
                <span style={{ fontSize: '0.75rem', opacity: 0.8, fontWeight: 400 }}>Free beta - No card required</span>
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
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #8f5bff, #6b3fd4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&#10013;</div>
                  <div>
                    <strong style={{ display: 'block', color: '#f5f5ff' }}>Your Private Sanctuary</strong>
                    <span style={{ fontSize: '0.8rem', color: '#8f90b3' }}>Encrypted - Only you and God see this</span>
                  </div>
                </div>
                <span style={{ background: 'rgba(79, 209, 197, 0.2)', color: '#4fd1c5', padding: '0.25rem 0.75rem', borderRadius: 999, fontSize: '0.75rem' }}>Pastoral Care</span>
              </div>

              {/* Scripture Cards */}
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ color: '#8f90b3', fontSize: '0.8rem', marginBottom: '0.75rem' }}>Scripture for your moment:</p>
                <div style={{ background: 'rgba(143, 91, 255, 0.1)', borderRadius: 12, padding: '1rem' }}>
                  <p style={{ color: '#c3c5ff', fontSize: '0.95rem', fontStyle: 'italic', marginBottom: '0.5rem' }}>
                    "Cast all your anxiety on him because he cares for you."
                  </p>
                  <p style={{ color: '#8f5bff', fontSize: '0.8rem' }}>— 1 Peter 5:7</p>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#8f90b3', fontSize: '0.85rem' }}>Emotional weight</span>
                  <span style={{ color: '#c3c5ff', fontSize: '0.85rem' }}>Being lifted in prayer</span>
                </div>
                <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: '65%', height: '100%', background: 'linear-gradient(90deg, #4fd1c5, #8f5bff)', borderRadius: 999 }} />
                </div>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
                <span style={{ display: 'block', color: '#8f90b3', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Built for believers seeking both real psychology and real faith.</span>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ background: 'rgba(143, 91, 255, 0.2)', color: '#c3c5ff', padding: '0.25rem 0.75rem', borderRadius: 999, fontSize: '0.75rem' }}>Prayer</span>
                  <span style={{ background: 'rgba(143, 91, 255, 0.2)', color: '#c3c5ff', padding: '0.25rem 0.75rem', borderRadius: 999, fontSize: '0.75rem' }}>Scripture</span>
                  <span style={{ background: 'rgba(143, 91, 255, 0.2)', color: '#c3c5ff', padding: '0.25rem 0.75rem', borderRadius: 999, fontSize: '0.75rem' }}>Pastoral Care</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Scripture Library Section */}
        <section style={{ marginTop: '5rem' }}>
          <h2 style={{ fontSize: '2rem', color: '#f5f5ff', textAlign: 'center', marginBottom: '0.5rem' }}>Scripture for Every Emotion</h2>
          <p style={{ color: '#8f90b3', textAlign: 'center', marginBottom: '2.5rem' }}>God's Word meets you where you are</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {[
              { emotion: 'Anxiety', verse: '"Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God."', ref: 'Philippians 4:6', color: '#8f5bff' },
              { emotion: 'Depression', verse: '"The Lord is close to the brokenhearted and saves those who are crushed in spirit."', ref: 'Psalm 34:18', color: '#4fd1c5' },
              { emotion: 'Fear', verse: '"For God has not given us a spirit of fear, but of power and of love and of a sound mind."', ref: '2 Timothy 1:7', color: '#ff5c7a' },
              { emotion: 'Hope', verse: '"For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future."', ref: 'Jeremiah 29:11', color: '#f6ad55' },
              { emotion: 'Strength', verse: '"I can do all things through Christ who strengthens me."', ref: 'Philippians 4:13', color: '#48bb78' },
              { emotion: 'Peace', verse: '"Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid."', ref: 'John 14:27', color: '#63b3ed' }
            ].map((item, i) => (
              <div key={i} style={{
                background: 'rgba(12, 16, 34, 0.7)',
                border: `1px solid ${item.color}33`,
                borderRadius: 16,
                padding: '1.5rem'
              }}>
                <div style={{ color: item.color, fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem' }}>{item.emotion}</div>
                <p style={{ color: '#c3c5ff', fontSize: '0.95rem', fontStyle: 'italic', marginBottom: '0.75rem', lineHeight: 1.6 }}>{item.verse}</p>
                <p style={{ color: '#8f90b3', fontSize: '0.85rem' }}>— {item.ref}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section style={{ marginTop: '5rem', textAlign: 'center', padding: '3rem', background: 'rgba(143, 91, 255, 0.08)', borderRadius: 22 }}>
          <h2 style={{ fontSize: '2rem', color: '#f5f5ff', marginBottom: '1rem' }}>Find Your Sanctuary Within</h2>
          <p style={{ color: '#c3c5ff', fontSize: '1.1rem', fontStyle: 'italic', marginBottom: '0.5rem' }}>
            "Come to me, all you who are weary and burdened, and I will give you rest."
          </p>
          <p style={{ color: '#8f5bff', marginBottom: '2rem' }}>— Matthew 11:28</p>
          <a
            href="https://soulsanctuaryal--joeabbott2.replit.app"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #8f5bff, #6b3fd4)',
              color: 'white',
              padding: '1.25rem 3rem',
              borderRadius: 999,
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '1.1rem',
              boxShadow: '0 10px 30px rgba(143, 91, 255, 0.4)'
            }}
            data-testid="button-cta-bottom"
          >
            Begin Your Journey with Prayer
          </a>
        </section>
      </main>

      <footer style={{ textAlign: 'center', padding: '3rem 0 2rem', color: '#8f90b3', fontSize: '0.9rem', marginTop: '4rem' }}>
        <p>SoulSanctuary 2025 | Your AI Pastor | Faith + Therapy | AES-256 Encrypted</p>
        <p style={{ marginTop: '0.5rem', fontStyle: 'italic', color: '#c3c5ff' }}>Find Your Sanctuary Within</p>
      </footer>
    </div>
  );
}
