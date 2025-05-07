// content.js
// Este script é injetado em todas as páginas, mas só faz algo quando estamos na página de bloqueio

// Verifica se estamos na página de bloqueio
if (window.location.href.includes(chrome.runtime.getURL("blocked.html"))) {
  // Garantir que a página de bloqueio ocupe toda a tela
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
}
