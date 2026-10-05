/* ===== CONFIG — trocar aqui ===== */
const CONFIG = {
  whatsapp: '',              // ex.: '5571999999999'. Vazio = abre o direct do Instagram
  instagram: 'camoatelier',
  previa: true,              // false remove a faixa "valores ilustrativos"
  pix: .05,                  // desconto no Pix
  parcelas: 3,               // cartão sem juros
  sinal: .5,                 // entrada para peças sob demanda
  frete: 28, freteGratis: 1500,
  cupons: { PRIMEIRONO: .10 }
};
// img: foto da peça. Sem img, entra uma trama gerada no lugar.
const PECAS = [
  {id:'transe', nome:'Vestido Transe', cat:'vestidos', col:'transe', preco:1690, status:'sob demanda', prazo:'25 dias', fio:'algodão azul 3 mm', det:'aplicação de miçangas azuis', tam:['P','M','G','sob medida'], img:'fotos/03.jpg'},
  {id:'coragem', nome:'Vestido Coragem', cat:'vestidos', col:'', preco:1890, status:'sob demanda', prazo:'30 dias', fio:'algodão vermelho 3 mm', det:'corpo estruturado, franja até o chão', tam:['P','M','G','sob medida'], img:'fotos/00.jpg'},
  {id:'rede', nome:'Vestido Rede', cat:'vestidos', col:'', preco:1390, status:'pronta entrega', prazo:'3 dias', fio:'algodão preto 3 mm', det:'argola no decote, mangas avulsas', tam:['P','M'], img:'fotos/11.jpg'},
  {id:'veu', nome:'Vestido Véu', cat:'vestidos', col:'rosario', preco:1790, status:'sob demanda', prazo:'30 dias', fio:'algodão cru 2 mm', det:'véu removível e franja longa', tam:['P','M','G','sob medida'], img:'fotos/09.jpg'},
  {id:'terco', nome:'Top Terço', cat:'tops', col:'rosario', preco:420, status:'pronta entrega', prazo:'3 dias', fio:'algodão cru 2 mm', det:'franja lateral e contas', tam:['único'], img:'fotos/07.jpg'},
  {id:'reza', nome:'Conjunto Reza', cat:'conjuntos', col:'rosario', preco:1180, status:'sob demanda', prazo:'20 dias', fio:'algodão cru 3 mm', det:'saia longa de franjas', tam:['P','M','G'], img:'fotos/08.jpg'},
  {id:'feira', nome:'Conjunto Feira', cat:'conjuntos', col:'', preco:980, status:'pronta entrega', prazo:'3 dias', fio:'algodão vermelho 3 mm', det:'top e saia com fenda', tam:['P','M'], img:'fotos/06.jpg'},
  {id:'franja', nome:'Saia Franja', cat:'saias', col:'transe', preco:690, status:'pronta entrega', prazo:'3 dias', fio:'algodão branco 3 mm', det:'franja até o tornozelo', tam:['P/M','G/GG'], img:'fotos/05.jpg'},
  {id:'trama', nome:'Regata Trama', cat:'tops', col:'', preco:360, status:'pronta entrega', prazo:'3 dias', fio:'algodão azul 2 mm', det:'ponto fechado, barra reta', tam:['P','M','G'], img:'fotos/02.jpg'}
];

/* ===== utilidades ===== */
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const R = v => 'R$ ' + Math.round(v).toLocaleString('pt-BR');
const q = new URLSearchParams(location.search);
const ler = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch (e) { return d } };
const gravar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch (e) {} };
let sacola = ler('camo-sacola', []), favs = ler('camo-favs', []);
const itens = () => sacola.map((s, i) => ({ ...PECAS.find(p => p.id === s.id), tam: s.tam, i })).filter(p => p.id);

function rnd(s){let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619);return()=>((h=Math.imul(h^h>>>15,2246822507)^Math.imul(h^h>>>13,3266489909))>>>0)/4294967296}
function trama(seed,[fio,conta,fundo]=['#D81B7F','#E8A917','#17120F']){
  const r=rnd(seed),W=300,H=400,n=5+Math.floor(r()*4),s=W/n,K=Math.round((H*(.5+r()*.18))/(s/2))*(s/2);let l='',k='',f='';
  for(let i=-n*2;i<=n*2;i++)l+=`<path d="M${i*s} 0l${K} ${K}M${i*s+K} 0l${-K} ${K}"/>`;
  for(let y=0;y<=K;y+=s/2)for(let x=(y/(s/2))%2?s/2:0;x<=W;x+=s){const b=r()<.22;k+=`<circle cx="${x}" cy="${y}" r="${b?s*.13:s*.06}" fill="${b?conta:fio}"/>`;if(y===K)f+=`<path d="M${x} ${K}v${(H-K)*(.45+r()*.55)}"/>`}
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="${W}" height="${H}" fill="${fundo}"/><g stroke="${fio}" stroke-width="${s*.045}" stroke-linecap="round" fill="none"><clipPath id="c${seed}"><rect width="${W}" height="${K}"/></clipPath><g clip-path="url(#c${seed})">${l}</g>${f}</g>${k}</svg>`}
const arte = p => p.img ? `<img src="${p.img}" alt="${p.nome} — CAMÔ" loading="lazy">` : trama(p.id, p.cores);
const card = p => `<article class="peca"><a href="peca.html?id=${p.id}"><div class="arte">${arte(p)}<span class="etq mono">${p.status}</span></div><h3>${p.nome}</h3><div class="linha"><span>${p.det}</span><b>${R(p.preco)}</b></div></a><button class="fav" data-fav="${p.id}" aria-pressed="${favs.includes(p.id)}" aria-label="favoritar ${p.nome}">♥</button></article>`;

// Envia a mensagem para o ateliê. Com fotos, usa o compartilhamento do aparelho (celular).
async function envia(txt, status, fotos = []) {
  const diz = t => status && (status.textContent = t);
  if (fotos.length && navigator.canShare?.({ files: fotos })) {
    try { await navigator.share({ text: txt, files: fotos }); return diz('pronto — escolha o WhatsApp ou o Instagram da CAMÔ para enviar.') } catch (e) { if (e.name === 'AbortError') return }
  }
  const extra = fotos.length ? ` Anexe ${fotos.length > 1 ? 'as ' + fotos.length + ' fotos' : 'a foto'} na conversa.` : '';
  if (CONFIG.whatsapp) { window.open('https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(txt), '_blank', 'noopener'); return diz('abrimos o WhatsApp com a mensagem pronta.' + extra) }
  try { await navigator.clipboard.writeText(txt); diz('mensagem copiada — é só colar no direct que abriu.' + extra) } catch (e) { diz('abrimos o direct da CAMÔ.' + extra) }
  window.open('https://ig.me/m/' + CONFIG.instagram, '_blank', 'noopener');
}

/* ===== moldura: topo e rodapé em todas as páginas ===== */
const pg = document.body.dataset.pg;
const NAV = [['acervo', 'acervo.html', 'acervo'], ['colecoes', 'colecoes.html', 'coleções'], ['medida', 'sob-medida.html', 'sob medida'], ['atelie', 'atelie.html', 'ateliê']];
document.body.insertAdjacentHTML('afterbegin', `<div class="fio" aria-hidden="true"><b></b></div>
${CONFIG.previa ? '<p class="aviso mono">prévia do site · valores e prazos ilustrativos</p>' : ''}
<header class="topo"><div class="wrap"><a class="marca" href="index.html" aria-label="CAMÔ — início">CAMÔ</a>
<button class="menu mono" aria-expanded="false" aria-controls="nav">menu</button>
<nav class="mono" id="nav" aria-label="principal">${NAV.map(([k, h, t]) => `<a href="${h}"${k === pg ? ' aria-current="page"' : ''}>${t}</a>`).join('')}<a href="acervo.html?f=favoritos">favoritos</a></nav>
<a class="sacola mono" href="sacola.html">sacola (<span id="qtd">0</span>)</a></div></header>`);
document.body.insertAdjacentHTML('beforeend', `<footer><div class="wrap">
<div class="cols"><div><h4>Entre na lista do próximo drop</h4><form id="lista"><input type="email" required placeholder="seu e-mail" aria-label="seu e-mail"><button>entrar</button></form><p class="mono status" style="color:#fff" aria-live="polite"></p></div>
<div class="mono"><a href="acervo.html">acervo</a><a href="colecoes.html">coleções</a><a href="sob-medida.html">sob medida</a><a href="atelie.html">o ateliê</a></div>
<div class="mono"><a href="atelie.html#duvidas">trocas e prazos</a><a href="atelie.html#cuidados">cuidados com a peça</a><a href="https://www.instagram.com/${CONFIG.instagram}/" target="_blank" rel="noopener">instagram @${CONFIG.instagram}</a></div></div>
<span class="marca">CAMÔ</span>
<div class="rod mono"><span>acervo • atelier • sob medida</span><span>☾ designed and handmade by @camllalessa</span></div></div></footer>`);
const contador = () => $('#qtd').textContent = sacola.length; contador();
$('.menu').onclick = e => { const a = $('#nav').classList.toggle('aberto'); e.target.setAttribute('aria-expanded', a) };
$('#lista').onsubmit = e => { e.preventDefault(); e.target.nextElementSibling.textContent = 'anotado. (demonstração: ainda não grava o e-mail)'; e.target.reset() };
document.addEventListener('click', e => {
  const b = e.target.closest('[data-fav]'); if (!b) return;
  const id = b.dataset.fav; favs = favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id]; gravar('camo-favs', favs);
  $$(`[data-fav="${id}"]`).forEach(x => x.setAttribute('aria-pressed', favs.includes(id)));
});

/* ===== páginas ===== */
const PAGINAS = {
  home() {
    $('#faixa').innerHTML = Array(8).fill('<span>nó</span><em>✦</em><span>fé</span><em>✦</em><span>coragem</span><em>✦</em><span>feito à mão</span><em>✦</em>').join('');
    $('#destaques').innerHTML = PECAS.slice(0, 4).map(card).join('');
  },
  acervo() {
    const F = [['tudo', 'tudo'], ['vestidos', 'vestidos'], ['conjuntos', 'conjuntos'], ['tops', 'tops'], ['saias', 'saias'], ['pronta entrega', 'pronta entrega'], ['transe', 'coleção Transe'], ['rosario', 'Rosário'], ['favoritos', '♥ favoritos']];
    let f = q.get('f') || 'tudo', ord = '';
    const pinta = () => {
      $('#filtros').innerHTML = F.map(([v, t]) => `<button aria-pressed="${v === f}" data-f="${v}">${t}</button>`).join('');
      let l = PECAS.filter(p => f === 'tudo' || p.cat === f || p.col === f || p.status === f || (f === 'favoritos' && favs.includes(p.id)));
      if (ord) l = [...l].sort((a, b) => ord === 'menor' ? a.preco - b.preco : b.preco - a.preco);
      $('#grade').innerHTML = l.map(card).join('') || `<p class="vazio">${f === 'favoritos' ? 'Você ainda não favoritou nenhuma peça. Toque no ♥ das que gostar.' : 'Nenhuma peça por aqui agora.'}</p>`;
      $('#conta').textContent = l.length + (l.length === 1 ? ' peça' : ' peças');
    };
    $('#filtros').onclick = e => { const b = e.target.closest('[data-f]'); if (b) { f = b.dataset.f; pinta() } };
    $('#ordem').onchange = e => { ord = e.target.value; pinta() };
    pinta();
  },
  peca() {
    const p = PECAS.find(x => x.id === q.get('id')); if (!p) return location.replace('acervo.html');
    document.title = p.nome + ' — CAMÔ'; let tam = p.tam[0];
    const sob = p.status === 'sob demanda';
    $('#produto').innerHTML = `<div class="arte">${arte(p)}</div><div>
      <p class="mono migalha"><a href="acervo.html">acervo</a> / ${p.cat}</p><h1>${p.nome}</h1>
      <p class="preco">${R(p.preco)}</p>
      <p class="condicoes">${R(p.preco * (1 - CONFIG.pix))} no Pix · ou ${CONFIG.parcelas}x de ${R(p.preco / CONFIG.parcelas)} sem juros${sob ? `<br>Feita sob demanda: ${CONFIG.sinal * 100}% de sinal (${R(p.preco * CONFIG.sinal)}) e o restante na entrega.` : ''}</p>
      <table class="ficha"><tr><td>técnica</td><td>macramê atado à mão</td></tr><tr><td>fio</td><td>${p.fio}</td></tr><tr><td>detalhe</td><td>${p.det}</td></tr><tr><td>disponibilidade</td><td>${p.status} · ${p.prazo}</td></tr><tr><td>cuidado</td><td>lavar à mão, secar à sombra na horizontal</td></tr></table>
      <p class="mono">tamanho</p><div class="tams" id="tams">${p.tam.map((t, i) => `<button aria-pressed="${!i}">${t}</button>`).join('')}</div>
      <div class="acoes"><button class="btn cheio" id="poe">colocar na sacola</button><button class="fav" data-fav="${p.id}" aria-pressed="${favs.includes(p.id)}" aria-label="favoritar">♥</button></div>
      <p class="status" id="st" aria-live="polite"></p>
      <details><summary>Guia de medidas</summary><table class="ficha"><tr><th></th><th>busto</th><th>cintura</th><th>quadril</th></tr><tr><td>P</td><td>82–88</td><td>62–68</td><td>90–96</td></tr><tr><td>M</td><td>88–94</td><td>68–74</td><td>96–102</td></tr><tr><td>G</td><td>94–102</td><td>74–82</td><td>102–110</td></tr></table><p>Medidas em cm. O macramê cede e as amarrações ajustam. Fora da tabela? <a href="sob-medida.html">Peça sob medida.</a></p></details>
      <details><summary>Envio e troca</summary><p>Envio para todo o Brasil; frete grátis acima de ${R(CONFIG.freteGratis)}. Pronta entrega pode ser trocada em até 7 dias. Peças sob demanda passam por prova.</p></details>
      <details><summary>Quer mudar a cor ou o comprimento?</summary><p>Quase tudo pode ser adaptado. <a href="sob-medida.html?peca=${encodeURIComponent(p.nome)}">Conte como você imagina.</a></p></details></div>`;
    $('#tams').onclick = e => { if (e.target.tagName === 'BUTTON') { tam = e.target.textContent; $$('#tams button').forEach(b => b.setAttribute('aria-pressed', b === e.target)) } };
    $('#poe').onclick = () => { sacola.push({ id: p.id, tam }); gravar('camo-sacola', sacola); contador(); $('#st').innerHTML = `Na sacola. <a href="sacola.html">Fechar pedido →</a>` };
    $('#combina').innerHTML = PECAS.filter(x => x.id !== p.id && (x.col && x.col === p.col || x.cat === p.cat)).slice(0, 4).map(card).join('');
  },
  medida() {
    const form = $('#formMedida'), st = $('#stMedida'), solta = $('#solta'), inp = $('#fotos'); let anexos = [];
    if (q.get('peca')) form.ideia.value = `Gostei do ${q.get('peca')} e queria adaptar: `;
    const pinta = () => $('#anexos').innerHTML = anexos.map((f, i) => `<div><img src="${URL.createObjectURL(f)}" alt="referência ${i + 1}"><button type="button" data-tira="${i}" aria-label="tirar foto ${i + 1}">×</button></div>`).join('');
    const junta = fs => {
      for (const f of fs) { if (!f.type.startsWith('image/')) continue; if (f.size > 8e6) { st.textContent = `"${f.name}" passa de 8 MB — escolha uma foto menor.`; continue } if (anexos.length < 4) anexos.push(f); else st.textContent = 'até 4 fotos por pedido.' }
      pinta();
    };
    inp.onchange = () => { junta(inp.files); inp.value = '' };
    ['dragover', 'dragleave', 'drop'].forEach(ev => solta.addEventListener(ev, e => { e.preventDefault(); solta.classList.toggle('sobre', ev === 'dragover'); if (ev === 'drop') junta(e.dataTransfer.files) }));
    $('#anexos').onclick = e => { const t = e.target.dataset.tira; if (t !== undefined) { anexos.splice(+t, 1); pinta() } };
    form.onsubmit = e => {
      e.preventDefault(); const d = Object.fromEntries(new FormData(form));
      const med = ['busto', 'cintura', 'quadril', 'altura'].filter(k => d[k]).map(k => `${k} ${d[k]} cm`).join(', ');
      envia(`Oi, CAMÔ! Sou ${d.nome} e quero uma peça sob medida.\nPeça: ${d.peca}\nOcasião: ${d.ocasiao || '—'}\nPara quando: ${d.data ? d.data.split('-').reverse().join('/') : 'sem data'}\nInvestimento: ${d.faixa}\nMedidas: ${med || 'a tirar'}\nIdeia: ${d.ideia}${anexos.length ? `\nReferências: ${anexos.length} foto(s)` : ''}`, st, anexos);
    };
  },
  sacola() {
    const form = $('#formPedido'); let cupom = '';
    const pinta = () => {
      const its = itens(), sub = its.reduce((a, p) => a + p.preco, 0), d = Object.fromEntries(new FormData(form));
      const temSob = its.some(p => p.status === 'sob demanda');
      $('#vazia').hidden = !!its.length; $('#cheia').hidden = !its.length; if (!its.length) return {};
      $('#opSinal').hidden = !temSob; if (!temSob && d.pag === 'sinal') { form.pag.value = 'pix'; d.pag = 'pix' }
      $('#endereco').hidden = d.entrega !== 'envio';
      const desc = sub * (CONFIG.cupons[cupom] || 0), frete = d.entrega === 'retirada' || sub - desc >= CONFIG.freteGratis ? 0 : CONFIG.frete;
      const pix = d.pag === 'pix' ? (sub - desc) * CONFIG.pix : 0, total = sub - desc - pix + frete;
      $('#itens').innerHTML = its.map(p => `<div class="item"><div class="arte">${arte(p)}</div><div><strong>${p.nome}</strong><small>tam. ${p.tam} · ${p.status} · ${p.prazo}</small><small>${R(p.preco)}</small></div><button type="button" class="x" data-tira="${p.i}" aria-label="tirar ${p.nome}">tirar</button></div>`).join('');
      $('#contas').innerHTML = `<div class="conta"><span>subtotal</span><span>${R(sub)}</span></div>${desc ? `<div class="conta"><span>cupom ${cupom}</span><span>− ${R(desc)}</span></div>` : ''}${pix ? `<div class="conta"><span>desconto Pix</span><span>− ${R(pix)}</span></div>` : ''}<div class="conta"><span>${d.entrega === 'retirada' ? 'retirada no ateliê' : 'frete'}</span><span>${frete ? R(frete) : 'grátis'}</span></div><div class="conta total"><span>total</span><span>${R(total)}</span></div>${d.pag === 'sinal' ? `<div class="conta"><span>hoje (sinal ${CONFIG.sinal * 100}%)</span><span>${R(total * CONFIG.sinal)}</span></div><div class="conta"><span>na entrega</span><span>${R(total * (1 - CONFIG.sinal))}</span></div>` : ''}${d.pag === 'cartao' ? `<div class="conta"><span>no cartão</span><span>${CONFIG.parcelas}x de ${R(total / CONFIG.parcelas)}</span></div>` : ''}`;
      return { its, total, d };
    };
    form.oninput = pinta;
    $('#itens').onclick = e => { const t = e.target.dataset.tira; if (t !== undefined) { sacola.splice(+t, 1); gravar('camo-sacola', sacola); contador(); pinta() } };
    $('#aplica').onclick = () => { const c = $('#cupom').value.trim().toUpperCase(); cupom = CONFIG.cupons[c] ? c : ''; $('#stCupom').textContent = cupom ? 'cupom aplicado.' : 'cupom não encontrado.'; pinta() };
    form.onsubmit = e => {
      e.preventDefault(); const { its, total, d } = pinta();
      const PAG = { pix: 'Pix', cartao: `cartão em até ${CONFIG.parcelas}x (link de pagamento)`, sinal: `sinal de ${CONFIG.sinal * 100}% no Pix + restante na entrega` };
      envia(`Oi, CAMÔ! Quero fechar este pedido:\n${its.map(p => `• ${p.nome} — tam. ${p.tam} — ${R(p.preco)}`).join('\n')}\nTotal: ${R(total)}${cupom ? ` (cupom ${cupom})` : ''}\nPagamento: ${PAG[d.pag]}\nEntrega: ${d.entrega === 'retirada' ? 'retirada no ateliê' : `envio para ${d.rua}, ${d.cidade} — CEP ${d.cep}`}\nNome: ${d.nome} · contato: ${d.fone}${d.obs ? `\nObs.: ${d.obs}` : ''}`, $('#stPedido'));
    };
    pinta();
  }
};
PAGINAS[pg]?.();

/* ===== movimento ===== */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target) } }), { rootMargin: '0px 0px -8% 0px' });
$$('.rev').forEach(e => io.observe(e));
addEventListener('scroll', () => $('.fio').style.setProperty('--p', scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)), { passive: true });
