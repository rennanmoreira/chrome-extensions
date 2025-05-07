// content.js
// Exibe mensagem fullscreen se estiver na página de bloqueio
if (window.location.pathname === '/blocked.html') {
  document.documentElement.innerHTML = '';
  const div = document.createElement('div');
  div.style.position = 'fixed';
  div.style.top = 0;
  div.style.left = 0;
  div.style.width = '100vw';
  div.style.height = '100vh';
  div.style.background = '#222';
  div.style.color = '#fff';
  div.style.zIndex = 999999;
  div.style.display = 'flex';
  div.style.flexDirection = 'column';
  div.style.justifyContent = 'center';
  div.style.alignItems = 'center';
  div.style.fontSize = '2rem';
  div.innerHTML = `<h1>Não procrastine!</h1><p>Falta pouco para terminar seus projetos e construir um futuro melhor.</p>`;
  document.body.appendChild(div);
}
