async function scanNow() {
  const btn = document.getElementById('scan-btn');
  btn.disabled = true;
  btn.textContent = 'Scansione in corso...';

  try {
    const res = await fetch('/api/scan', { method: 'POST' });
    if (!res.ok) throw new Error('scan failed');
    window.location.reload();
  } catch (err) {
    alert('Errore durante la scansione. Controlla il server.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Scansiona ora';
  }
}

document.getElementById('scan-btn')?.addEventListener('click', scanNow);
