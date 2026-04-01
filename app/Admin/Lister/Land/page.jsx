export default function ListerLand() {
  return (
    <main style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#0f0f0f",
      fontFamily: "'Georgia', serif",
    }}>
      <div style={{
        textAlign: "center",
        padding: "3rem",
        border: "1px solid #2a2a2a",
        borderRadius: "4px",
        maxWidth: "480px",
      }}>
        <p style={{
          fontSize: "0.75rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "#c9a84c",
          marginBottom: "1.5rem",
        }}>
          Golden Rentals
        </p>
        <h1 style={{
          fontSize: "2rem",
          fontWeight: "400",
          color: "#f5f5f5",
          margin: "0 0 1rem 0",
          lineHeight: 1.3,
        }}>
          Welcome, Lister.
        </h1>
        <p style={{
          fontSize: "1rem",
          color: "#888",
          lineHeight: 1.7,
          margin: 0,
        }}>
          Your dashboard is being prepared. More tools are on the way.
        </p>
      </div>
    </main>
  );
}