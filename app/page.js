export default async function Home() {
  const sheetId = process.env.NEXT_PUBLIC_SHEET_ID;
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

  let previewData = "Loading...";
  try {
    const res = await fetch(url, { next: { revalidate: 10 } });
    const text = await res.text();
    // We just want to see the raw text to prove the tunnel works!
    previewData = text.slice(0, 800); 
  } catch (err) {
    previewData = "Failed to connect to Google Sheets.";
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui', background: '#0a0a0a', color: '#ffffff', minHeight: '100vh' }}>
      <h1 style={{ color: '#0070f3' }}>Majed Games Database</h1>
      <p style={{ color: '#888' }}>Vercel Engine: <strong>ONLINE</strong></p>
      <p style={{ color: '#888' }}>Google Sheets Tunnel: <strong>CONNECTED</strong></p>
      
      <div style={{ marginTop: '2rem', background: '#1a1a1a', padding: '1rem', borderRadius: '8px' }}>
        <h3 style={{ marginTop: 0 }}>Raw Trophy Data Preview:</h3>
        <pre style={{ overflowX: 'auto', fontSize: '12px', color: '#00ff00' }}>
          {previewData}...
        </pre>
      </div>
    </div>
  );
}
