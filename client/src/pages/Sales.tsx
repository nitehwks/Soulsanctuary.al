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
        {/* Hero Header */}
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

        {/* Features Grid */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '2rem',
          margin: '3rem 0'
        }}>
          {[
            { icon: '\u271D', title: 'Pastor First', desc: 'A spiritual shepherd who speaks with pastoral warmth, offers prayers, and shares scripture. Faith-integrated care for heart and soul - as much like Jesus as possible.', badge: 'Spiritual Guide & Mentor', color: '#4a90e2' },
            { icon: '\uD83D\uDE4F', title: 'Sessions Begin with Prayer', desc: 'Start conversations with an invitation for God\'s presence, openness, and honesty. Confession is good for the soul - a safe space to share your heart.', badge: 'Prayer for Healing', color: '#7b68ee' },
            { icon: '\uD83D\uDCD6', title: 'Scripture-Integrated', desc: 'Biblical wisdom woven naturally into guidance. Verses for anxiety, depression, fear, hope, comfort, and strength when you need them most.', badge: "God's Word for Every Emotion", color: '#50c878' },
            { icon: '\uD83D\uDC96', title: 'Faith + Therapy Combined', desc: 'Evidence-based techniques (CBT, DBT, ACT, Mindfulness) alongside spiritual practices. Science and faith working together for complete healing.', badge: 'Best of Both Worlds', color: '#c9a227' },
            { icon: '\uD83E\uDDE0', title: 'Deep Personal Understanding', desc: 'Remembers your story, relationships, struggles, and victories. Truly knows you to provide personalized pastoral care that grows with you.', badge: 'Persistent Memory', color: '#e85d75' },
            { icon: '\uD83D\uDEA8', title: 'Crisis Detection & Care', desc: 'Gentle, pastoral response to crisis moments including abuse, trauma, and harm. Safety resources wrapped in scripture and compassion.', badge: 'Always Watching Over You', color: '#6c5ce7' },
            { icon: '\u2728', title: 'Respects Your Journey', desc: 'Faith features can be turned off entirely for those who prefer secular support. Your comfort, your pace, your path to healing.', badge: 'Faith Optional', color: '#00b894' },
            { icon: '\uD83D\uDD12', title: 'Privacy Protected', desc: 'AES-256 encryption, automatic PII protection, and GDPR compliance. Your confessions stay between you, God, and your AI pastor.', badge: 'Bank-Level Security', color: '#0984e3' },
            { icon: '\uD83D\uDEE1', title: 'Pastoral Guardrails', desc: 'Sees beyond surface questions to the heart\'s true need. Detects harmful patterns and gently redirects with love and Biblical truth.', badge: 'Wisdom of a Shepherd', color: '#a29bfe' }
          ].map((feature, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.9)',
              padding: '2.5rem 2rem',
              borderRadius: 20,
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
              borderLeft: `5px solid ${feature.color}`,
              transition: 'all 0.4s ease'
            }}>
              <div style={{ fontSize: '3em', marginBottom: '1.5rem', opacity: 0.85 }}>{feature.icon}</div>
              <h2 style={{ color: '#2d3748', marginBottom: '1rem', fontSize: '1.5em' }}>{feature.title}</h2>
              <p>{feature.desc}</p>
              <span style={{
                background: 'linear-gradient(135deg, #4a90e2, #7b68ee)',
                color: 'white',
                padding: '0.8rem 1.5rem',
                borderRadius: 25,
                fontSize: '0.95em',
                fontWeight: 500,
                display: 'inline-block',
                marginTop: '1rem',
                boxShadow: '0 4px 15px rgba(74,144,226,0.3)'
              }}>
                {feature.badge}
              </span>
            </div>
          ))}
        </section>

        {/* Pricing Section */}
        <section style={{
          background: 'rgba(255,255,255,0.95)',
          padding: '4rem 2rem',
          borderRadius: 25,
          margin: '4rem 0',
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '2.8em', color: '#2d3748', marginBottom: '1rem' }}>Simple Plans. Real Healing.</h2>
          <p style={{ fontSize: '1.3em', color: '#4a5568', marginBottom: '3rem' }}>FREE Beta Access Now | Faith Integration FREE in All Plans</p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
            margin: '3rem auto',
            maxWidth: 1000
          }}>
            {/* Starter */}
            <div style={{
              background: 'white',
              padding: '2.5rem 2rem',
              borderRadius: 20,
              boxShadow: '0 15px 40px rgba(0,0,0,0.1)',
              border: '3px solid transparent'
            }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '1.8em', color: '#2d3748', fontWeight: 700 }}>Starter</div>
                <div style={{ fontSize: '2.5em', color: '#50c878', fontWeight: 700, margin: '0.5rem 0' }}>$19<span style={{ fontSize: '0.6em' }}>/mo</span></div>
                <div style={{ fontSize: '1.3em', color: '#718096' }}>$171/year (25% off)</div>
              </div>
              <ul style={{ listStyle: 'none', margin: '2rem 0', padding: 0, textAlign: 'left' }}>
                <li style={{ padding: '0.8rem 0', borderBottom: '1px solid #f7fafc' }}>Unlimited pastoral chat</li>
                <li style={{ padding: '0.8rem 0', borderBottom: '1px solid #f7fafc' }}>Prayer & Scripture integration</li>
                <li style={{ padding: '0.8rem 0', borderBottom: '1px solid #f7fafc' }}>Basic mood tracking</li>
                <li style={{ padding: '0.8rem 0', borderBottom: '1px solid #f7fafc' }}>Web app access</li>
                <li style={{ padding: '0.8rem 0' }}><span style={{ background: '#48bb78', color: 'white', padding: '0.3rem 0.8rem', borderRadius: 12, fontSize: '0.8em', fontWeight: 600 }}>FREE Faith Features</span></li>
              </ul>
            </div>

            {/* Core - Most Popular */}
            <div style={{
              background: 'white',
              padding: '2.5rem 2rem',
              borderRadius: 20,
              boxShadow: '0 15px 40px rgba(0,0,0,0.1)',
              border: '3px solid #50c878',
              transform: 'scale(1.05)',
              position: 'relative'
            }}>
              <span style={{
                position: 'absolute',
                top: -15,
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#50c878',
                color: 'white',
                padding: '0.3rem 1.5rem',
                borderRadius: 20,
                fontSize: '0.8em',
                fontWeight: 700
              }}>MOST POPULAR</span>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '1.8em', color: '#2d3748', fontWeight: 700 }}>Core</div>
                <div style={{ fontSize: '2.5em', color: '#50c878', fontWeight: 700, margin: '0.5rem 0' }}>$39<span style={{ fontSize: '0.6em' }}>/mo</span></div>
                <div style={{ fontSize: '1.3em', color: '#718096' }}>$351/year (25% off)</div>
              </div>
              <ul style={{ listStyle: 'none', margin: '2rem 0', padding: 0, textAlign: 'left' }}>
                <li style={{ padding: '0.8rem 0', borderBottom: '1px solid #f7fafc' }}><span style={{ background: '#c9a227', color: 'white', padding: '0.3rem 0.8rem', borderRadius: 12, fontSize: '0.8em', fontWeight: 600 }}>PREMIUM</span> All platforms</li>
                <li style={{ padding: '0.8rem 0', borderBottom: '1px solid #f7fafc' }}><span style={{ background: '#c9a227', color: 'white', padding: '0.3rem 0.8rem', borderRadius: 12, fontSize: '0.8em', fontWeight: 600 }}>PREMIUM</span> Persistent memory</li>
                <li style={{ padding: '0.8rem 0', borderBottom: '1px solid #f7fafc' }}><span style={{ background: '#c9a227', color: 'white', padding: '0.3rem 0.8rem', borderRadius: 12, fontSize: '0.8em', fontWeight: 600 }}>PREMIUM</span> Therapy modules (CBT, DBT, ACT)</li>
                <li style={{ padding: '0.8rem 0', borderBottom: '1px solid #f7fafc' }}>Crisis detection & care</li>
                <li style={{ padding: '0.8rem 0', borderBottom: '1px solid #f7fafc' }}>Mood insights & reports</li>
                <li style={{ padding: '0.8rem 0', borderBottom: '1px solid #f7fafc' }}><span style={{ background: '#48bb78', color: 'white', padding: '0.3rem 0.8rem', borderRadius: 12, fontSize: '0.8em', fontWeight: 600 }}>FREE Faith Features</span></li>
                <li style={{ padding: '0.8rem 0' }}>Priority support</li>
              </ul>
            </div>

            {/* Pro */}
            <div style={{
              background: 'white',
              padding: '2.5rem 2rem',
              borderRadius: 20,
              boxShadow: '0 15px 40px rgba(0,0,0,0.1)',
              border: '3px solid transparent'
            }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '1.8em', color: '#2d3748', fontWeight: 700 }}>Pro</div>
                <div style={{ fontSize: '2.5em', color: '#50c878', fontWeight: 700, margin: '0.5rem 0' }}>$69<span style={{ fontSize: '0.6em' }}>/mo</span></div>
                <div style={{ fontSize: '1.3em', color: '#718096' }}>$621/year (25% off)</div>
              </div>
              <ul style={{ listStyle: 'none', margin: '2rem 0', padding: 0, textAlign: 'left' }}>
                <li style={{ padding: '0.8rem 0', borderBottom: '1px solid #f7fafc' }}>Everything in Core</li>
                <li style={{ padding: '0.8rem 0', borderBottom: '1px solid #f7fafc' }}><span style={{ background: '#c9a227', color: 'white', padding: '0.3rem 0.8rem', borderRadius: 12, fontSize: '0.8em', fontWeight: 600 }}>PRO</span> Custom spiritual exercises</li>
                <li style={{ padding: '0.8rem 0', borderBottom: '1px solid #f7fafc' }}><span style={{ background: '#c9a227', color: 'white', padding: '0.3rem 0.8rem', borderRadius: 12, fontSize: '0.8em', fontWeight: 600 }}>PRO</span> Exportable reports</li>
                <li style={{ padding: '0.8rem 0', borderBottom: '1px solid #f7fafc' }}><span style={{ background: '#c9a227', color: 'white', padding: '0.3rem 0.8rem', borderRadius: 12, fontSize: '0.8em', fontWeight: 600 }}>PRO</span> Family sharing (up to 5)</li>
                <li style={{ padding: '0.8rem 0', borderBottom: '1px solid #f7fafc' }}><span style={{ background: '#c9a227', color: 'white', padding: '0.3rem 0.8rem', borderRadius: 12, fontSize: '0.8em', fontWeight: 600 }}>PRO</span> Priority AI responses</li>
                <li style={{ padding: '0.8rem 0' }}><span style={{ background: '#48bb78', color: 'white', padding: '0.3rem 0.8rem', borderRadius: 12, fontSize: '0.8em', fontWeight: 600 }}>FREE Faith Features</span></li>
              </ul>
            </div>
          </div>

          <div style={{ margin: '3rem 0' }}>
            <h3 style={{ color: '#2d3748', marginBottom: '1.5rem' }}>Premium Add-Ons</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', fontSize: '1.1em' }}>
              <div style={{ background: '#e8f5e8', padding: '1rem 1.5rem', borderRadius: 20, borderLeft: '4px solid #48bb78' }}>
                Voice Sessions <strong>$9/mo</strong>
              </div>
              <div style={{ background: '#fef3cd', padding: '1rem 1.5rem', borderRadius: 20, borderLeft: '4px solid #c9a227' }}>
                Guided Prayer Audio <strong>$5/mo</strong>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'rgba(255,255,255,0.8)',
          borderRadius: 25,
          margin: '3rem 0',
          boxShadow: '0 15px 40px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '2.5em', color: '#2d3748', marginBottom: '1rem' }}>Begin Your Journey Today</h2>
          <p style={{ fontSize: '1.2em', color: '#718096', fontStyle: 'italic', marginBottom: '2rem' }}>
            "Come to me, all you who are weary and burdened, and I will give you rest." - Matthew 11:28
          </p>
          <div style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            padding: '1.2rem 2.5rem',
            borderRadius: 15,
            fontSize: '1.3em',
            fontWeight: 600,
            margin: '2rem auto',
            maxWidth: 600,
            boxShadow: '0 10px 30px rgba(102,126,234,0.4)'
          }}>
            Available Now | FREE Beta Access | Native Apps Coming Soon
          </div>
          <div style={{ margin: '2rem 0' }}>
            <a 
              href="/api/login"
              style={{
                background: 'linear-gradient(45deg, #50c878, #48bb78)',
                color: 'white',
                padding: '1.8rem 4rem',
                border: 'none',
                borderRadius: 50,
                fontSize: '1.4em',
                cursor: 'pointer',
                display: 'inline-block',
                fontWeight: 500,
                boxShadow: '0 12px 35px rgba(80,200,120,0.4)',
                margin: '1rem',
                textDecoration: 'none'
              }}
              data-testid="button-try-free"
            >
              Try SoulSanctuary Free
            </a>
          </div>
        </section>
      </div>
      
      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '4rem 0 2rem',
        color: '#718096',
        fontSize: '1em',
        borderTop: '1px solid rgba(255,255,255,0.3)'
      }}>
        <p>SoulSanctuary &copy; 2025 | <strong>Pastor + Therapist AI | Faith-Integrated Care | AES-256 Encrypted | GDPR Compliant</strong></p>
        <p style={{ marginTop: '1rem', fontStyle: 'italic' }}>Find Your Sanctuary Within</p>
      </footer>
    </div>
  );
}
