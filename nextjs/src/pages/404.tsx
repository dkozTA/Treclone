export default function Custom404() {
  return (
    <main
      style={{
        alignItems: 'center',
        background: '#f7f9fb',
        color: '#2a3439',
        display: 'flex',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '24px',
      }}
    >
      <div style={{ maxWidth: 420, textAlign: 'center' }}>
        <p
          style={{
            color: '#0053dc',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.08em',
            marginBottom: 8,
            textTransform: 'uppercase',
          }}
        >
          404
        </p>
        <h1 style={{ fontSize: 28, margin: '0 0 12px' }}>Page not found</h1>
        <p style={{ color: '#687783', fontSize: 14, margin: '0 0 24px' }}>
          The page you are looking for does not exist or has been moved.
        </p>
        <a
          href="/"
          style={{
            background: 'linear-gradient(135deg, #0053dc, #3e76fe)',
            borderRadius: 6,
            color: '#ffffff',
            display: 'inline-flex',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.08em',
            padding: '12px 20px',
            textDecoration: 'none',
            textTransform: 'uppercase',
          }}
        >
          Go home
        </a>
      </div>
    </main>
  );
}
