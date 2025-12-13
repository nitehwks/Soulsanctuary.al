export default function Sales() {
  return (
    <div 
      style={{
        fontFamily: "'Georgia', 'Times New Roman', serif",
        lineHeight: 1.7,
        color: '#2c3e50',
        background: 'linear-gradient(135deg, #e8f4f8 0%, #f5f0ff 50%, #fff5f5 100%)',
        minHeight: '100vh'
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 20 }}>
        <header style={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          padding: '4rem 2rem',
          textAlign: 'center',
          borderRadius: 25,
          marginBottom: '4rem',
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: 'linear-gradient(90deg, #4a90e2, #7b68ee, #50c878, #c9a227)'
          }} />
          <h1 style={{ fontSize: '3.5em', color: '#1a365d', marginBottom: '0.5rem', fontWeight: 400 }}>
            SoulSanctuary
          </h1>
          <p style={{ fontSize: '1.6em', color: '#5a67d8', fontStyle: 'italic', marginBottom: '1.5rem' }}>
            Find Your Sanctuary Within
          </p>
          <p style={{ fontSize: '1.2em', color: '#718096', fontStyle: 'italic', marginBottom: '2rem', maxWidth: 700, marginLeft: 'auto', marginRight: 'auto' }}>
            "The Lord is close to the brokenhearted and saves those who are crushed in spirit." - Psalm 34:18
          </p>
          <p style={{ fontSize: '1.3em', maxWidth: 800, margin: '0 auto 2.5rem', color: '#4a5568' }}>
            A Christian AI companion that combines pastoral care with evidence-based therapy. Be lifted up, find healing, and grow in faith and strength.
          </p>
          <span style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            padding: '0.8rem 2.2rem',
            borderRadius: 30,
            fontSize: '1.1em',
            fontWeight: 500,
            display: 'inline-block',
            margin: '1rem 0.5rem',
            boxShadow: '0 5px 20px rgba(102,126,234,0.4)'
          }}>
            Pastor + Therapist AI
          </span>
          <span style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            padding: '0.8rem 2.2rem',
            borderRadius: 30,
            fontSize: '1.1em',
            fontWeight: 500,
            display: 'inline-block',
            margin: '1rem 0.5rem',
            boxShadow: '0 5px 20px rgba(102,126,234,0.4)'
          }}>
            Faith Can Be Adjusted
          </span>
          <br /><br />
          <span style={{
            background: 'linear-gradient(135deg, #48bb78, #38a169)',
            color: 'white',
            padding: '1rem 2.5rem',
            borderRadius: 50,
            fontSize: '1.2em',
            fontWeight: 700,
            display: 'inline-block',
            boxShadow: '0 8px 25px rgba(72,187,120,0.4)'
          }}>
            FREE During Beta
          </span>
        </header>

        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
          margin: '3rem 0'
        }}>
          {[
            { icon: '\u271D', title: 'Pastor First', desc: 'A spiritual shepherd who speaks with pastoral warmth, offers prayers, and shares scripture.', badge: 'Spiritual Guide', color: '#4a90e2' },
            { icon: '\uD83D\uDE4F', title: 'Sessions Begin with Prayer', desc: 'Start conversations with an invitation for God\'s presence, openness, and honesty.', badge: 'Prayer for Healing', color: '#7b68ee' },
            { icon: '\uD83D\uDCD6', title: 'Scripture-Integrated', desc: 'Biblical wisdom woven naturally into guidance for anxiety, depression, fear, hope, and strength.', badge: "God's Word", color: '#50c878' },
            { icon: '\uD83D\uDC96', title: 'Faith + Therapy Combined', desc: 'Evidence-based techniques (CBT, DBT, ACT, Mindfulness) alongside spiritual practices.', badge: 'Best of Both', color: '#c9a227' },
            { icon: '\uD83E\uDDE0', title: 'Deep Personal Understanding', desc: 'Remembers your story, relationships, struggles, and victories. Truly knows you.', badge: 'Persistent Memory', color: '#e85d75' },
            { icon: '\uD83D\uDEA8', title: 'Crisis Detection & Care', desc: 'Gentle, pastoral response to crisis moments with safety resources and compassion.', badge: 'Always Watching', color: '#6c5ce7' },
            { icon: '\u2728', title: 'Respects Your Journey', desc: 'Faith features can be turned off entirely. Your comfort, your pace, your path.', badge: 'Faith Optional', color: '#00b894' },
            { icon: '\uD83D\uDD12', title: 'Privacy Protected', desc: 'AES-256 encryption, PII protection, and GDPR compliance. Your confessions stay private.', badge: 'Bank-Level Security', color: '#0984e3' },
            { icon: '\uD83D\uDEE1', title: 'Pastoral Guardrails', desc: 'Sees beyond surface questions to the heart\'s true need with Biblical truth.', badge: 'Wisdom of a Shepherd', color: '#a29bfe' }
          ].map((feature, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.9)',
              padding: '2rem',
              borderRadius: 20,
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
              borderLeft: `5px solid ${feature.color}`
            }}>
              <div style={{ fontSize: '2.5em', marginBottom: '1rem' }}>{feature.icon}</div>
              <h2 style={{ color: '#2d3748', marginBottom: '0.5rem', fontSize: '1.3em' }}>{feature.title}</h2>
              <p style={{ marginBottom: '1rem', color: '#4a5568' }}>{feature.desc}</p>
              <span style={{
                background: 'linear-gradient(135deg, #4a90e2, #7b68ee)',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: 20,
                fontSize: '0.85em',
                fontWeight: 500
              }}>
                {feature.badge}
              </span>
            </div>
          ))}
        </section>

        <section style={{
          background: 'rgba(255,255,255,0.95)',
          padding: '4rem 2rem',
          borderRadius: 25,
          margin: '4rem 0',
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '2.5em', color: '#2d3748', marginBottom: '1rem' }}>Simple Plans. Real Healing.</h2>
          <p style={{ fontSize: '1.2em', color: '#4a5568', marginBottom: '3rem' }}>FREE Beta Access Now | Faith Integration FREE in All Plans</p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            maxWidth: 900,
            margin: '0 auto'
          }}>
            <div style={{ background: 'white', padding: '2rem', borderRadius: 20, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '1.5em', color: '#2d3748', fontWeight: 700 }}>Starter</div>
              <div style={{ fontSize: '2.5em', color: '#50c878', fontWeight: 700, margin: '0.5rem 0' }}>$19<span style={{ fontSize: '0.5em' }}>/mo</span></div>
              <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', marginTop: '1.5rem' }}>
                <li style={{ padding: '0.5rem 0' }}>Unlimited pastoral chat</li>
                <li style={{ padding: '0.5rem 0' }}>Prayer & Scripture</li>
                <li style={{ padding: '0.5rem 0' }}>Web app access</li>
              </ul>
            </div>

            <div style={{ background: 'white', padding: '2rem', borderRadius: 20, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', border: '3px solid #50c878', transform: 'scale(1.05)' }}>
              <div style={{ background: '#50c878', color: 'white', padding: '0.3rem 1rem', borderRadius: 20, fontSize: '0.8em', marginBottom: '1rem', display: 'inline-block' }}>MOST POPULAR</div>
              <div style={{ fontSize: '1.5em', color: '#2d3748', fontWeight: 700 }}>Core</div>
              <div style={{ fontSize: '2.5em', color: '#50c878', fontWeight: 700, margin: '0.5rem 0' }}>$39<span style={{ fontSize: '0.5em' }}>/mo</span></div>
              <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', marginTop: '1.5rem' }}>
                <li style={{ padding: '0.5rem 0' }}>All platforms</li>
                <li style={{ padding: '0.5rem 0' }}>Persistent memory</li>
                <li style={{ padding: '0.5rem 0' }}>Therapy modules (CBT, DBT)</li>
                <li style={{ padding: '0.5rem 0' }}>Crisis detection</li>
              </ul>
            </div>

            <div style={{ background: 'white', padding: '2rem', borderRadius: 20, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '1.5em', color: '#2d3748', fontWeight: 700 }}>Pro</div>
              <div style={{ fontSize: '2.5em', color: '#50c878', fontWeight: 700, margin: '0.5rem 0' }}>$69<span style={{ fontSize: '0.5em' }}>/mo</span></div>
              <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', marginTop: '1.5rem' }}>
                <li style={{ padding: '0.5rem 0' }}>Everything in Core</li>
                <li style={{ padding: '0.5rem 0' }}>Custom exercises</li>
                <li style={{ padding: '0.5rem 0' }}>Family sharing (5)</li>
                <li style={{ padding: '0.5rem 0' }}>Priority responses</li>
              </ul>
            </div>
          </div>
        </section>

        <section style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'rgba(255,255,255,0.8)',
          borderRadius: 25,
          margin: '3rem 0'
        }}>
          <h2 style={{ fontSize: '2em', color: '#2d3748', marginBottom: '1rem' }}>Begin Your Journey Today</h2>
          <p style={{ fontSize: '1.1em', color: '#718096', fontStyle: 'italic', marginBottom: '2rem' }}>
            "Come to me, all you who are weary and burdened, and I will give you rest." - Matthew 11:28
          </p>
          <a 
            href="/api/login"
            style={{
              background: 'linear-gradient(45deg, #50c878, #48bb78)',
              color: 'white',
              padding: '1.5rem 3rem',
              border: 'none',
              borderRadius: 50,
              fontSize: '1.3em',
              cursor: 'pointer',
              display: 'inline-block',
              fontWeight: 500,
              boxShadow: '0 10px 30px rgba(80,200,120,0.4)',
              textDecoration: 'none'
            }}
            data-testid="button-try-free"
          >
            Try SoulSanctuary Free
          </a>
        </section>
      </div>
      
      <footer style={{
        textAlign: 'center',
        padding: '3rem 0 2rem',
        color: '#718096',
        fontSize: '0.95em'
      }}>
        <p>SoulSanctuary 2025 | Pastor + Therapist AI | AES-256 Encrypted | GDPR Compliant</p>
        <p style={{ marginTop: '0.5rem', fontStyle: 'italic' }}>Find Your Sanctuary Within</p>
      </footer>
    </div>
  );
}
