// src/components/WppLink.jsx
const PHONE = "5511982546099"; // VITA FIT — official number (no plus sign)

function buildWaMessage({ produto, dose, forma, qtd, cidade, uf } = {}) {
  const txt = produto
    ? `Olá, gostaria de fazer um pedido de *${produto}* — Dose: ${dose ?? ""} — Forma: ${forma ?? ""} — Qtde: ${qtd ?? ""} — Cidade/UF: ${cidade ?? ""}/${uf ?? ""}`
    : "Olá, quero consultar preços.";
  return encodeURIComponent(txt.replace(/\s+/g, " ").trim());
}

function getWaUrl(params) {
  const text = buildWaMessage(params);
  // Prefer wa.me for all; it deep-links better on mobile and is COOP-safe.
  return `https://wa.me/${PHONE}?text=${text}`;
}

export function WppLink({ children = "Falar no WhatsApp", params, className = "", ariaLabel = "Abrir conversa no WhatsApp" }) {
  const href = getWaUrl(params);
  const onClick = (e) => {
    // Ensure user-gesture open, no-opener, new tab; if blocked, escape iframe via _top
    e.preventDefault();
    const url = href;
    const win = window.open(url, "_blank", "noopener,noreferrer");
    if (win && !win.closed) return;
    const a = document.createElement("a");
    a.href = url;
    a.target = "_top";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <a
      href={href}
      onClick={onClick}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </a>
  );
}

// Optional helper to build message outside this component
export const buildWhatsAppUrl = (params) => getWaUrl(params);