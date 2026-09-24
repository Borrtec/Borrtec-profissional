const SUPABASE_URL = "https://gccjybhsyptdfwoecnlz.supabase.co";
const SUPABASE_KEY = "sb_publishable_OqtsWn5aPRzCNpKM6gBVBg_QIks8mvW";

window.supabase= window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const DEFAULT_PRODUCTS = [
  {id:1,name:"Anel de Vedação",category:"Borracha",price:12.90,stock:120,desc:"Anel de vedação em borracha de alta resistência.",tone:"black"},
  {id:2,name:"Mangueira de Silicone",category:"Silicone",price:45.90,stock:78,desc:"Mangueira flexível para aplicações industriais.",tone:"blue"},
  {id:3,name:"Perfil de Borracha",category:"Borracha",price:28.50,stock:54,desc:"Perfil resistente para vedação e acabamento.",tone:"bar"},
  {id:4,name:"Junta de Silicone",category:"Silicone",price:36.90,stock:42,desc:"Junta de silicone para aplicações técnicas.",tone:"red"},
  {id:5,name:"Anel Industrial",category:"Peças",price:19.90,stock:86,desc:"Anel para aplicações industriais e automotivas.",tone:"black"},
  {id:6,name:"Tubo de Silicone",category:"Silicone",price:59.90,stock:35,desc:"Tubo de silicone para condução e proteção.",tone:"blue"},
  {id:7,name:"Guarnição de Borracha",category:"Borracha",price:31.50,stock:67,desc:"Guarnição para vedação de portas e equipamentos.",tone:"bar"},
  {id:8,name:"Junta de Vedação",category:"Peças",price:42.90,stock:31,desc:"Junta de alta resistência e longa durabilidade.",tone:"red"}
];

let products = [];
let cart = [];
let users = [];
let orders = [];
let currentUser = null;
async function loadProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("id");

  if (error) {
    console.error("Erro ao carregar produtos:", error);
    products = [];
    return;
  }

  products = data;
}
let adminLogged = false;
let adminTab = "dashboard";
let editingProductId = null;
let activeCategory = "Todos";
let searchTerm = "";

const money = n => n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const save = () => {
  
  localStorage.setItem("borrtec_cart",JSON.stringify(cart));
  

};
const el = id => document.getElementById(id);
const toast = msg => {
  const t=el("toast"); t.textContent=msg; t.classList.add("show");
  clearTimeout(window.toastTimer); window.toastTimer=setTimeout(()=>t.classList.remove("show"),2500);
};

function showPage(page){
  document.querySelectorAll(".bottom-nav button").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
  if(page==="home") renderHome();
  if(page==="products") loadProducts().then(() => renderProducts());
  if(page==="cart") renderCart();
  if(page==="orders") renderOrders();
  if(page==="contact") renderContact();
  if(page==="profile") renderProfile();
  window.scrollTo({top:0,behavior:"smooth"});
}

function renderHome(){
  el("app").innerHTML=`
    <section class="hero">
      <div class="hero-content">
        <span class="eyebrow">Borrtec • Qualidade industrial</span>
        <h1>Qualidade, resistência e confiança em cada detalhe!</h1>
        <p>Soluções em borracha e silicone para o seu negócio, com atendimento próximo, produtos de alta resistência e pedidos de forma simples.</p>
        <div class="hero-actions">
          <button class="primary" onclick="showPage('products')">VER PRODUTOS →</button>
          <button class="outline" onclick="openLogin()">MINHA CONTA</button>
        </div>
      </div>
    </section>
    <div class="section-title"><div><h2>Por que comprar com a Borrtec?</h2><p>Uma experiência pensada para facilitar o seu pedido.</p></div></div>
    <section class="feature-grid">
      <div class="feature" onclick="openDelivery()"><div class="fi">🚚</div><h3>Entrega</h3><p>Consulte prazos, regiões e condições de entrega.</p></div>
      <div class="feature" onclick="openPayment()"><div class="fi">▣</div><h3>Pagamento</h3><p>Formas de pagamento para sua comodidade.</p></div>
      <div class="feature" onclick="openContact()"><div class="fi">♧</div><h3>Atendimento</h3><p>Estamos prontos para ajudar você.</p></div>
      <div class="feature" onclick="openQuality()"><div class="fi">♢</div><h3>Qualidade</h3><p>Produtos e garantia com confiança.</p></div>
    </section>
    <div class="section-title"><div><h2>Produtos em destaque</h2><p>Confira alguns dos nossos produtos.</p></div><button class="link-btn" onclick="showPage('products')">Ver todos →</button></div>
    <section class="products-grid">${products.slice(0,4).map(productCard).join("")}</section>
    <div class="section-title"><div><h2>Atendimento Borrtec</h2><p>Precisa de ajuda com uma peça ou pedido?</p></div></div>
    <section class="info-grid">
      <div class="info-card"><h3>📞 Fale conosco</h3><p>Telefone: (19) 3533-3333</p><button class="primary" onclick="callCompany()">Ligar agora</button></div>
      <div class="info-card"><h3>💬 WhatsApp</h3><p>Atendimento rápido para dúvidas e pedidos.</p><button class="primary" onclick="whatsappCompany()">Abrir WhatsApp</button></div>
      <div class="info-card"><h3>📍 Região</h3><p>Rio Claro e região. Consulte disponibilidade para outras localidades.</p></div>
    </section>`;
}

function productCard(p){
  const imageContent = p.image_url
    ? `<img src="${escapeAttr(p.image_url)}" alt="${escapeAttr(p.name)}" style="width:100%;height:100%;object-fit:contain;border-radius:12px;">`
    : "";

  return `<article class="product-card">
    <div class="product-image" style="height:420px;border-radius:12px;overflow:hidden;">
      ${imageContent}
    </div>

    <div class="product-info">
      <h3>${escapeHtml(p.name)}</h3>
      <div class="desc">${escapeHtml(p.desc)}</div>
      <div class="price">${money(p.price)}</div>

      <div class="product-row">
        <button class="outline" onclick="viewProduct(${p.id})">Detalhes</button>
        <button class="primary" onclick="addToCart(${p.id})">Adicionar</button>
      </div>
    </div>
  </article>`;
}

function renderProducts(){
  const filtered=products.filter(p=>(activeCategory==="Todos"||p.category===activeCategory)&&(!searchTerm||p.name.toLowerCase().includes(searchTerm.toLowerCase())||p.category.toLowerCase().includes(searchTerm.toLowerCase())));
  el("app").innerHTML=`
    <div class="section-title"><div><h2>Produtos</h2><p>Encontre a peça que sua empresa precisa.</p></div></div>
    <div class="searchbar"><span>⌕</span><input id="productSearch" value="${escapeAttr(searchTerm)}" oninput="searchProducts(this.value)" placeholder="Buscar produtos..."></div>
    <div class="category-row">${["Todos","Borracha","Silicone","Peças"].map(c=>`<button class="${activeCategory===c?"active":""}" onclick="setCategory('${c}')">${c}</button>`).join("")}</div>
    <section class="products-grid" style="margin-top:15px">${filtered.length?filtered.map(productCard).join(""):`<div class="empty" style="grid-column:1/-1">Nenhum produto encontrado.</div>`}</section>`;
}

function searchProducts(v){searchTerm=v;renderProducts();setTimeout(()=>{const x=el("productSearch");if(x){x.focus();x.selectionStart=x.selectionEnd=v.length}},0)}
function setCategory(c){activeCategory=c;renderProducts()}
function focusSearch(){showPage("products");setTimeout(()=>el("productSearch")?.focus(),250)}

function viewProduct(id){
  const p=products.find(x=>x.id===id); if(!p)return;
  el("app").innerHTML=`<button class="outline" onclick="showPage('products')">← Voltar</button>
  <div class="cart-layout" style="margin-top:15px">
    <div class="info-card">
  <div class="product-image ${p.tone||""}" style="height:420px;border-radius:12px;overflow:hidden;">
    ${p.image_url ? `<img src="${escapeAttr(p.image_url)}" alt="${escapeAttr(p.name)}" style="width:100%;height:100%;object-fit:contain;border-radius:12px;">` : ""}
  </div>
</div>
    <div class="summary">
      <span class="eyebrow">${escapeHtml(p.category)}</span><h1 style="margin:8px 0">${escapeHtml(p.name)}</h1>
      <div style="color:#ffc400;font-size:18px">★★★★★ <small style="color:#8995a2">(12 avaliações)</small></div>
      <div class="price" style="font-size:28px">${money(p.price)}</div>
      <p style="color:#929daa;line-height:1.6">${escapeHtml(p.desc)}</p>
      <label style="color:#9ba6b2;font-size:12px">Tamanho<select id="sizeSelect" style="display:block;width:100%;margin-top:6px;background:#101a24;border:1px solid #314050;color:#fff;padding:12px;border-radius:10px"><option>Padrão</option><option>Pequeno</option><option>Médio</option><option>Grande</option></select></label>
      <div style="margin:15px 0"><span style="color:#9ba6b2;font-size:12px">Quantidade</span><div class="qty" style="width:max-content;margin-top:6px"><button onclick="changeProductQty(-1)">−</button><span id="productQty">1</span><button onclick="changeProductQty(1)">+</button></div></div>
      <button class="primary full" onclick="addToCart(${p.id},Number(el('productQty').textContent))">ADICIONAR AO CARRINHO</button>
    </div>
  </div>`;
}
function changeProductQty(n){const x=el("productQty");x.textContent=Math.max(1,Number(x.textContent)+n)}

function addToCart(id,qty=1){
  const p=products.find(x=>x.id===id);if(!p)return;
  const existing=cart.find(x=>x.id===id);
  if(existing)existing.qty+=qty;else cart.push({id,qty});
  save();updateCartCount();toast(`${p.name} adicionado ao carrinho!`);
}
function updateCartCount(){el("cartCount").textContent=cart.reduce((a,b)=>a+b.qty,0)}

function renderCart(){
  if(!cart.length){el("app").innerHTML=`<div class="section-title"><div><h2>Meu carrinho</h2><p>Revise seus produtos antes de finalizar.</p></div></div><div class="empty">🛒<br><br>Seu carrinho está vazio.<br><button class="primary" style="margin-top:15px" onclick="showPage('products')">VER PRODUTOS</button></div>`;return}
  const total=cart.reduce((s,i)=>s+(products.find(p=>p.id===i.id)?.price||0)*i.qty,0);
  el("app").innerHTML=`<div class="section-title"><div><h2>Meu carrinho</h2><p>${cart.reduce((a,b)=>a+b.qty,0)} item(ns) selecionado(s).</p></div></div>
  <div class="cart-layout"><div>${cart.map(cartItem).join("")}</div><aside class="summary"><h3>Resumo do pedido</h3><div class="sum-line"><span>Subtotal</span><strong>${money(total)}</strong></div><div class="sum-line"><span>Entrega</span><strong>A calcular</strong></div><div class="sum-line sum-total"><span>Total</span><span>${money(total)}</span></div><button class="primary full" onclick="checkout()">FINALIZAR PEDIDO</button><button class="outline full" onclick="showPage('products')">CONTINUAR COMPRANDO</button></aside></div>`;
}
function cartItem(i){
  const p=products.find(x=>x.id===i.id);if(!p)return"";
  return `<div class="cart-item"><div class="cart-thumb"></div><div class="cart-item-info"><h3>${escapeHtml(p.name)}</h3><p>${money(p.price)}</p><small style="color:#758291">${escapeHtml(p.category)}</small></div><div class="qty"><button onclick="changeCart(${p.id},-1)">−</button><span>${i.qty}</span><button onclick="changeCart(${p.id},1)">+</button></div><button class="small-btn danger" onclick="removeCart(${p.id})">×</button></div>`;
}
function changeCart(id,n){const i=cart.find(x=>x.id===id);if(!i)return;i.qty+=n;if(i.qty<=0)cart=cart.filter(x=>x.id!==id);save();updateCartCount();renderCart()}
function removeCart(id){cart=cart.filter(x=>x.id!==id);save();updateCartCount();renderCart()}

function checkout(){
  if(!currentUser){toast("Entre na sua conta para finalizar o pedido.");openLogin();return}
  if(!cart.length)return;
  const items=cart.map(i=>({id:i.id,name:products.find(p=>p.id===i.id)?.name,qty:i.qty,price:products.find(p=>p.id===i.id)?.price||0}));
  const total=items.reduce((s,i)=>s+i.price*i.qty,0);
  openCheckoutForm(items,total);
}
function openCheckoutForm(items,total){
  const old=document.getElementById("checkoutModal");if(old)old.remove();
  const u=currentUser||{};
  const modal=document.createElement("div");modal.className="modal open";modal.id="checkoutModal";
  modal.innerHTML=`<div class="modal-card" style="max-height:90vh;overflow:auto"><button class="close" onclick="document.getElementById('checkoutModal').remove()">×</button>
    <div class="modal-title"><span class="yellow-icon">✓</span><div><h2>Finalizar pedido</h2><p>Informe como deseja receber e pagar.</p></div></div>
    <div style="background:#101a24;border:1px solid #2e3d4d;border-radius:10px;padding:11px;margin-bottom:12px;font-size:12px"><strong>${items.reduce((a,i)=>a+i.qty,0)} peça(s)</strong> • Total: <strong style="color:#ffc400">${money(total)}</strong></div>
    <label>CPF ou CNPJ<input id="checkoutDocument" inputmode="numeric" value="${escapeAttr(u.document||"")}" placeholder="Digite seu CPF ou CNPJ"></label>
    <label>Como deseja receber?
      <select id="deliveryType" onchange="toggleDeliveryFields()"><option value="delivery">Receber no endereço</option><option value="pickup">Vou buscar na Borrtec</option></select>
    </label>
    <div id="deliveryFields">
      <label>CEP<input id="checkoutCep" inputmode="numeric" placeholder="00000-000" value="${escapeAttr(u.cep||"")}"></label>
      <label>Endereço<input id="checkoutAddress" placeholder="Rua, avenida, número" value="${escapeAttr(u.address||"")}"></label>
      <div class="product-form"><label>Número<input id="checkoutNumber" value="${escapeAttr(u.addressNumber||"")}" placeholder="123"></label><label>Complemento<input id="checkoutComplement" value="${escapeAttr(u.complement||"")}" placeholder="Apto, sala..." ></label></div>
      <div class="product-form"><label>Bairro<input id="checkoutNeighborhood" value="${escapeAttr(u.neighborhood||"")}" placeholder="Bairro"></label><label>Cidade/UF<input id="checkoutCity" value="${escapeAttr(u.city||"Rio Claro - SP")}" placeholder="Cidade - UF"></label></div>
    </div>
    <label>Forma de pagamento<select id="checkoutPayment"><option value="Pix">Pix</option><option value="Cartão de crédito">Cartão de crédito</option><option value="Cartão de débito">Cartão de débito</option><option value="Dinheiro">Dinheiro</option><option value="A combinar">A combinar</option></select></label>
    <button class="primary full" onclick="confirmCheckout()">CONFIRMAR PEDIDO</button>
  </div>`;
  document.body.appendChild(modal);
}
function toggleDeliveryFields(){
  const type=el("deliveryType")?.value;
  const box=el("deliveryFields");if(box)box.style.display=type==="pickup"?"none":"block";
}
 async function confirmCheckout(){
  if(!currentUser || !cart.length) return;

  const documentValue = el("checkoutDocument").value.trim();
  const cleanDoc = documentValue.replace(/\D/g,"");

  if(!cleanDoc || !(cleanDoc.length === 11 || cleanDoc.length === 14)){
    toast("Informe um CPF (11 dígitos) ou CNPJ (14 dígitos).");
    return;
  }

  const deliveryType = el("deliveryType").value;
  let delivery = {type: deliveryType};

  if(deliveryType === "delivery"){
    const cep = el("checkoutCep").value.trim();
    const address = el("checkoutAddress").value.trim();
    const number = el("checkoutNumber").value.trim();
    const neighborhood = el("checkoutNeighborhood").value.trim();
    const city = el("checkoutCity").value.trim();

    if(!cep || !address || !number || !neighborhood || !city){
      toast("Preencha o endereço completo para entrega.");
      return;
    }

    delivery = {
      type: "delivery",
      cep,
      address,
      number,
      complement: el("checkoutComplement").value.trim(),
      neighborhood,
      city
    };
  }else{
    delivery.pickupNote = "Cliente irá buscar na Borrtec";
  }

  const items = cart.map(i => {
    const product = products.find(p => p.id === i.id);

    return {
      id: i.id,
      name: product?.name || "Produto",
      qty: i.qty,
      price: Number(product?.price || 0)
    };
  });

  const total = items.reduce(
    (sum, i) => sum + i.price * i.qty,
    0
  );

  const {data: order, error: orderError} = await supabase
    .from("orders")
    .insert({
      user_id: currentUser.id,
      user_name: currentUser.name,
      status: "Recebido",
      total,
      document: documentValue,
      delivery,
      payment: el("checkoutPayment").value
    })
    .select()
    .single();

  if(orderError){
    console.error("Erro ao criar pedido:", orderError);
    toast("Não foi possível registrar o pedido.");
    return;
  }

  const {error: itemsError} = await supabase
    .from("order_items")
    .insert(
      items.map(i => ({
        order_id: order.id,
        product_id: i.id,
        product_name: i.name,
        quantity: i.qty,
        unit_price: i.price
      }))
    );

  if(itemsError){
    console.error("Erro ao salvar itens do pedido:", itemsError);
    toast("Pedido criado, mas houve erro ao salvar os itens.");
    return;
  }

  const frontendOrder = {
    id: order.id,
    userId: order.user_id,
    userName: order.user_name,
    items,
    total: Number(order.total),
    status: order.status,
    createdAt: new Date(order.created_at).toLocaleString("pt-BR"),
    document: order.document,
    delivery: order.delivery,
    payment: order.payment
  };

  orders.unshift(frontendOrder);

  currentUser.document = documentValue;

  cart = [];
  updateCartCount();

  document.getElementById("checkoutModal")?.remove();

  toast("Pedido enviado para a Borrtec!");

  showPage("orders");
}

async function renderOrders(){
  if(!currentUser){
    el("app").innerHTML=`<div class="empty"><h2>Meus pedidos</h2><p>Entre na sua conta para acompanhar seus pedidos.</p><button class="primary" onclick="openLogin()">ENTRAR</button></div>`;
    return;
  }

  const {data: orderRows, error: ordersError} = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", currentUser.id)
    .order("created_at", {ascending:false});

  if(ordersError){
    console.error("Erro ao carregar pedidos:", ordersError);
    el("app").innerHTML=`<div class="empty"><h2>Meus pedidos</h2><p>Não foi possível carregar seus pedidos.</p></div>`;
    return;
  }

  const orderIds = orderRows.map(o => o.id);

  let itemRows = [];

  if(orderIds.length){
    const {data, error: itemsError} = await supabase
      .from("order_items")
      .select("*")
      .in("order_id", orderIds);

    if(itemsError){
      console.error("Erro ao carregar itens:", itemsError);
    }else{
      itemRows = data || [];
    }
  }

  const mine = orderRows.map(o => ({
    id: o.id,
    userId: o.user_id,
    userName: o.user_name,
    total: Number(o.total || 0),
    status: o.status,
    createdAt: new Date(o.created_at).toLocaleString("pt-BR"),
    document: o.document,
    delivery: o.delivery,
    payment: o.payment,
    items: itemRows
      .filter(i => i.order_id === o.id)
      .map(i => ({
        id: i.product_id,
        name: i.product_name,
        qty: i.quantity,
        price: Number(i.unit_price || 0)
      }))
  }));

  orders = mine;

  el("app").innerHTML=`<div class="section-title"><div><h2>Meus pedidos</h2><p>Olá, ${escapeHtml(currentUser.name)}. Acompanhe suas compras.</p></div></div>${mine.length?mine.map(orderCard).join(""):`<div class="empty">Você ainda não fez nenhum pedido.<br><button class="primary" style="margin-top:15px" onclick="showPage('products')">COMEÇAR A COMPRAR</button></div>`}`;
}

function orderCard(o){
  const statuses=["Recebido","Em preparação","Enviado","Entregue"];const idx=statuses.indexOf(o.status);
  return `<div class="order-card"><div class="order-head"><div><strong>Pedido #${o.id}</strong><div style="color:#7e8a98;font-size:11px;margin-top:5px">${o.createdAt}</div></div><span class="status">${o.status}</span></div><div style="margin-top:12px">${o.items.map(i=>`<div style="display:flex;justify-content:space-between;font-size:12px;margin:7px 0"><span>${i.qty}x ${escapeHtml(i.name)}</span><strong>${money(i.price*i.qty)}</strong></div>`).join("")}</div><div style="margin-top:10px;color:#ffc400;font-weight:900">Total: ${money(o.total)}</div><div class="steps">${statuses.map((s,n)=>`<div class="step ${n<=idx?"done":""}"><div class="dot"></div>${s}</div>`).join("")}</div></div>`;
}

function renderContact(){
  el("app").innerHTML=`<div class="section-title"><div><h2>Fale conosco</h2><p>Estamos prontos para ajudar.</p></div></div><div class="info-grid"><div class="info-card"><h3>💬 WhatsApp</h3><p>Atendimento rápido para dúvidas, orçamento e pedidos.</p><button class="primary" onclick="whatsappCompany()">CONVERSAR</button></div><div class="info-card"><h3>📞 Telefone</h3><p>(19) 3533-3333<br>Seg. a Sex. • 8h às 18h</p><button class="primary" onclick="callCompany()">LIGAR</button></div><div class="info-card"><h3>✉️ E-mail</h3><p>contato@borrtec.com</p></div><div class="info-card"><h3>📍 Endereço</h3><p>Rua Exemplo, 123 - Centro<br>Rio Claro - SP</p></div></div>`;
}
function renderProfile(){
  if(!currentUser){openLogin();return}
  el("app").innerHTML=`<div class="section-title"><div><h2>Minha conta</h2><p>Seus dados de cliente.</p></div></div><div class="profile-box"><div class="profile-row"><div class="profile-field"><small>Nome</small><strong>${escapeHtml(currentUser.name)}</strong></div><div class="profile-field"><small>E-mail</small><strong>${escapeHtml(currentUser.email)}</strong></div><div class="profile-field"><small>Telefone</small><strong>${escapeHtml(currentUser.phone||"Não informado")}</strong></div><div class="profile-field"><small>Pedidos</small><strong>${orders.filter(o=>o.userId===currentUser.id).length}</strong></div></div><button class="outline" style="margin-top:15px" onclick="logout()">SAIR DA CONTA</button></div>`;
}

function openLogin(){closeModal("registerModal");el("loginModal").classList.add("open")}
function showRegister(){closeModal("loginModal");el("registerModal").classList.add("open")}
function openAdminLogin(){el("adminLoginModal").classList.add("open")}
function closeModal(id){el(id).classList.remove("open")}
async function restoreSession(){

  const { data: { session } } = await supabase.auth.getSession();

  if(!session){
    currentUser = null;
    adminLogged = false;
    return;
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if(error){
    console.error("Erro ao restaurar perfil:", error);

    currentUser = {
      id: session.user.id,
      email: session.user.email
    };

    adminLogged = false;
    return;
  }

  currentUser = {
    id: session.user.id,
    email: session.user.email,
    ...profile
  };

  if(profile.role === "admin"){
    adminLogged = true;
  }else{
    adminLogged = false;
  }
}
async function customerLogin(){
  const email = el("loginEmail").value.trim().toLowerCase();
  const pass = el("loginPassword").value;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: pass
  });

  if(error){
    toast("E-mail ou senha incorretos.");
    return;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  if(profileError){
    console.error("Erro ao carregar perfil:", profileError);
    toast("Login realizado, mas não foi possível carregar seu perfil.");
    return;
  }

  currentUser = {
    id: data.user.id,
    email: data.user.email,
    ...profile
  };

  closeModal("loginModal");
  toast(`Bem-vindo(a), ${currentUser.name}!`);
  showPage("home");
}
async function registerCustomer(){

  const name = el("regName").value.trim();
  const email = el("regEmail").value.trim().toLowerCase();
  const phone = el("regPhone").value.trim();
  const documentValue = el("regDocument").value.trim();
  const password = el("regPassword").value;

  if(!name || !email || !password || !documentValue){
    toast("Preencha nome, CPF/CNPJ, e-mail e senha.");
    return;
  }

  const cleanDoc = documentValue.replace(/\D/g,"");

  if(cleanDoc.length !== 11 && cleanDoc.length !== 14){
    toast("CPF deve ter 11 dígitos ou CNPJ 14 dígitos.");
    return;
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        phone,
        document: documentValue
      }
    }
  });

  if(error){
    console.error("Erro ao criar conta:", error);
    toast(error.message || "Não foi possível criar a conta.");
    return;
  }

  if(!data.user){
    toast("Não foi possível criar a conta.");
    return;
  }

  if(data.session){

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if(profileError){
      console.error("Erro ao carregar perfil:", profileError);
      toast("Conta criada, mas não foi possível carregar o perfil.");
      return;
    }

    currentUser = {
      id: data.user.id,
      email: data.user.email,
      ...profile
    };

    closeModal("registerModal");
    toast("Conta criada com sucesso!");
    showPage("home");

  }else{

    closeModal("registerModal");
    toast("Conta criada! Verifique seu e-mail para confirmar o cadastro.");

  }

}
async function logout(){
  await supabase.auth.signOut();
  currentUser = null;
  orders = [];
  save();
  toast("Você saiu da conta.");
  showPage("home");
}

async function adminLogin(){
  const email = el("adminEmail").value.trim().toLowerCase();
  const password = el("adminPassword").value;

  if(!email || !password){
    toast("Informe o e-mail e a senha.");
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if(error){
    console.error("Erro no login administrativo:", error);
    toast("E-mail ou senha incorretos.");
    return;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, name, role")
    .eq("id", data.user.id)
    .single();

  if(profileError || !profile){
    await supabase.auth.signOut();
    toast("Perfil administrativo não encontrado.");
    return;
  }

  if(profile.role !== "admin"){
    await supabase.auth.signOut();
    toast("Esta conta não possui acesso administrativo.");
    return;
  }

  adminLogged = true;

  closeModal("adminLoginModal");
  openAdmin();

  toast("Login administrativo realizado!");
}
function openAdmin(){el("adminPanel").classList.add("open");renderAdmin()}
function closeAdmin(){el("adminPanel").classList.remove("open");adminLogged=false}
async function renderAdmin(){
  if(!adminLogged)return;
  const { data: dashboardOrders, error: dashboardOrdersError } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if(dashboardOrdersError){
    console.error("Erro ao carregar pedidos do dashboard:", dashboardOrdersError);
    return;
  }

  const orderIds = (dashboardOrders || []).map(o => o.id);

let dashboardItems = [];

if(orderIds.length){
  const {data: itemRows, error: dashboardItemsError} = await supabase
    .from("order_items")
    .select("*")
    .in("order_id", orderIds);

  if(dashboardItemsError){
    console.error("Erro ao carregar itens do dashboard:", dashboardItemsError);
  }else{
    dashboardItems = itemRows || [];
  }
}

orders = (dashboardOrders || []).map(o => ({
  id: o.id,
  userId: o.user_id,
  userName: o.user_name || "Cliente",

  items: dashboardItems
    .filter(i => i.order_id === o.id)
    .map(i => ({
      id: i.product_id,
      name: i.product_name,
      qty: i.quantity,
      price: Number(i.unit_price || 0)
    })),

  total: Number(o.total || 0),
  status: o.status || "Recebido",
  createdAt: new Date(o.created_at).toLocaleString("pt-BR"),
  document: o.document,
  delivery: o.delivery,
  payment: o.payment
}));

const total = orders.reduce((s,o) => s + Number(o.total || 0), 0);
const pending = orders.filter(o => o.status !== "Entregue").length;
   
  el("adminPanel").innerHTML=`<header class="admin-top"><div class="admin-brand">BORRTEC • PAINEL ADMIN</div><button class="outline" onclick="closeAdmin()">SAIR</button></header><div class="admin-body">
    <div class="admin-nav">${["dashboard","orders","products","customers"].map(t=>`<button class="${adminTab===t?"active":""}" onclick="adminTab='${t}';renderAdmin()">${({dashboard:"📊 Dashboard",orders:"📦 Pedidos",products:"🛠 Produtos",customers:"👥 Clientes"})[t]}</button>`).join("")}</div>
    ${adminTab==="dashboard"?adminDashboard(total,pending):adminTab==="orders"?adminOrders():adminTab==="products"?adminProducts():adminCustomers()}
  </div>`;
}
function adminDashboard(total,pending){
  const delivered=orders.filter(o=>o.status==="Entregue").length;
  const productSales={};
  orders.forEach(o=>o.items.forEach(i=>productSales[i.name]=(productSales[i.name]||0)+Number(i.qty||0)));
  const top=Object.entries(productSales).sort((a,b)=>b[1]-a[1]).slice(0,5);

  // Soma a quantidade REAL de peças de cada pedido pelo mês em que ele foi criado.
  // createdAt é salvo como "dd/mm/aaaa, hh:mm:ss" no checkout.
  const monthNames=["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const monthly=monthNames.map((name,index)=>({name,index,units:0,revenue:0,orders:0}));
  orders.forEach(o=>{
    const match=String(o.createdAt||"").match(/^(\d{2})\/(\d{2})\/(\d{4})/);
    if(!match)return;
    const month=Number(match[2])-1;
    if(month<0||month>11)return;
    const row=monthly[month];
    row.orders++;
    row.revenue+=Number(o.total||0);
    row.units+=(o.items||[]).reduce((sum,i)=>sum+Number(i.qty||0),0);
  });
  const maxUnits=Math.max(1,...monthly.map(m=>m.units));

  return `<h1 style="margin:5px 0">Visão geral</h1><p style="color:#81909e">Acompanhe a demanda da Borrtec em um só lugar.</p>
  <div class="metric-grid"><div class="metric yellow"><small>Faturamento</small><strong>${money(total)}</strong></div><div class="metric"><small>Pedidos</small><strong>${orders.length}</strong></div><div class="metric"><small>Em andamento</small><strong>${pending}</strong></div><div class="metric"><small>Concluídos</small><strong>${delivered}</strong></div></div>

  <div class="chart-card">
    <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:12px;flex-wrap:wrap">
      <div><h3 style="margin-bottom:4px">📈 Quantidade de vendas mensal</h3><p style="color:#81909e;margin:0;font-size:12px">Quantidade exata de peças vendidas em cada mês.</p></div>
      <strong style="color:#ffc400">${monthly.reduce((s,m)=>s+m.units,0)} peças no período</strong>
    </div>
    <div class="chart" style="margin-top:14px">${monthly.map(m=>`<div class="bar-chart" title="${m.name}: ${m.units} peças | ${money(m.revenue)} | ${m.orders} pedido(s)" style="height:${m.units?Math.max(5,(m.units/maxUnits)*100):2}%"><strong style="position:absolute;top:-20px;left:50%;transform:translateX(-50%);font-size:10px;color:#f4f6fa">${m.units}</strong><span>${m.name}</span></div>`).join("")}</div>
    <div style="overflow:auto;margin-top:34px"><table class="admin-table"><thead><tr><th>Mês</th><th>Peças vendidas</th><th>Pedidos</th><th>Faturamento</th></tr></thead><tbody>${monthly.map(m=>`<tr><td>${m.name}</td><td><strong style="color:#ffc400">${m.units}</strong></td><td>${m.orders}</td><td>${money(m.revenue)}</td></tr>`).join("")}</tbody></table></div>
  </div>

  <div class="admin-grid"><div class="chart-card"><h3>🏆 Produtos mais vendidos</h3>${top.length?top.map((x,i)=>`<div style="display:flex;justify-content:space-between;padding:11px 0;border-bottom:1px solid #25323f"><span>${i+1}. ${escapeHtml(x[0])}</span><strong style="color:#ffc400">${x[1]} un.</strong></div>`).join(""):`<p style="color:#84909d">Ainda não há vendas registradas.</p>`}</div>
  <div class="chart-card"><h3>📦 Pedidos por status</h3>${["Recebido","Em preparação","Enviado","Entregue"].map(s=>{const n=orders.filter(o=>o.status===s).length;return `<div style="display:flex;align-items:center;gap:10px;margin:13px 0"><span style="width:105px;font-size:11px">${s}</span><div style="height:9px;flex:1;background:#182431;border-radius:10px;overflow:hidden"><div style="width:${orders.length?Math.max(4,n/orders.length*100):4}%;height:100%;background:#ffc400"></div></div><strong>${n}</strong></div>`}).join("")}</div></div>`;
}
function adminOrders(){
  setTimeout(loadAdminOrders, 0);

  return `
    <div class="section-title">
      <div>
        <h1>Pedidos</h1>
        <p>Gerencie os pedidos recebidos.</p>
      </div>
    </div>

    <div id="adminOrdersContent">
      <div class="empty">Carregando pedidos...</div>
    </div>
  `;
}

async function loadAdminOrders(){
  const {data: orderRows, error: ordersError} = await supabase
    .from("orders")
    .select("*")
    .order("created_at", {ascending:false});

  const container = el("adminOrdersContent");

  if(!container) return;

  if(ordersError){
    console.error("Erro ao carregar pedidos administrativos:", ordersError);
    container.innerHTML = `
      <div class="empty">
        Não foi possível carregar os pedidos.
      </div>
    `;
    return;
  }

  const orderIds = (orderRows || []).map(o => o.id);

  let itemRows = [];

  if(orderIds.length){
    const {data, error: itemsError} = await supabase
      .from("order_items")
      .select("*")
      .in("order_id", orderIds);

    if(itemsError){
      console.error("Erro ao carregar itens dos pedidos:", itemsError);
    }else{
      itemRows = data || [];
    }
  }

  const adminOrdersData = (orderRows || []).map(o => ({
    id: o.id,
    userId: o.user_id,
    userName: o.user_name || "Cliente",
    total: Number(o.total || 0),
    status: o.status || "Recebido",
    createdAt: new Date(o.created_at).toLocaleString("pt-BR"),
    document: o.document,
    delivery: o.delivery,
    payment: o.payment,
    items: itemRows
      .filter(i => i.order_id === o.id)
      .map(i => ({
        id: i.product_id,
        name: i.product_name,
        qty: i.quantity,
        price: Number(i.unit_price || 0)
      }))
  }));

  if(!adminOrdersData.length){
    container.innerHTML = `
      <div class="empty">
        Nenhum pedido recebido ainda.
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div style="overflow:auto">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Pedido</th>
            <th>Cliente</th>
            <th>Total</th>
            <th>Status</th>
            <th>Ação</th>
          </tr>
        </thead>

        <tbody>
          ${adminOrdersData.map(o => `
            <tr>
              <td>
                #${escapeHtml(String(o.id))}
              </td>

              <td>
                ${escapeHtml(o.userName)}
              </td>

              <td>
                ${money(o.total)}
              </td>

              <td>
                <select
                  onchange="updateOrderStatus('${o.id}',this.value)"
                  style="background:#101a24;color:white;border:1px solid #334151;padding:7px;border-radius:7px"
                >
                  ${["Recebido","Em preparação","Enviado","Entregue"]
                    .map(s => `
                      <option ${o.status===s?"selected":""}>${s}</option>
                    `).join("")}
                </select>
              </td>

              <td>
                <button
                  class="small-btn yellow"
                  onclick="adminViewOrder('${o.id}')"
                >
                  Ver
                </button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
} 


async function updateOrderStatus(id,status){
  const {error} = await supabase
    .from("orders")
    .update({status})
    .eq("id", id);

  if(error){
    console.error("Erro ao atualizar status:", error);
    toast("Não foi possível atualizar o pedido.");
    return;
  }

  toast(`Pedido #${id} atualizado.`);

  adminOrders();
}
async function adminViewOrder(id){
  const {data: o, error} = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if(error || !o){
    console.error("Erro ao carregar pedido:", error);
    toast("Não foi possível carregar o pedido.");
    return;
  }

  const {data: items, error: itemsError} = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", id);

  if(itemsError){
    console.error("Erro ao carregar itens:", itemsError);
  }

  const orderItems = items || [];

  const deliveryText = o.delivery?.type === "pickup"
    ? "Buscar na Borrtec"
    : `${o.delivery?.address || ""}, ${o.delivery?.number || ""} - ${o.delivery?.neighborhood || ""}, ${o.delivery?.city || ""} CEP ${o.delivery?.cep || ""}`;

  alert(
    `Pedido #${o.id}\n` +
    `Cliente: ${o.user_name || "Não informado"}\n` +
    `CPF/CNPJ: ${o.document || "Não informado"}\n` +
    `Recebimento: ${deliveryText}\n` +
    `Pagamento: ${o.payment || "Não informado"}\n\n` +
    `${orderItems.map(i =>
      `${i.quantity}x ${i.product_name} — ${money(Number(i.unit_price || 0) * i.quantity)}`
    ).join("\n")}\n\n` +
    `Total: ${money(Number(o.total || 0))}\n` +
    `Status: ${o.status}`
  );
}
function adminProducts(){
  setTimeout(loadAdminProducts, 0);

  return `
    <div class="section-title">
      <div>
        <h1>Produtos</h1>
        <p>Adicione, edite e acompanhe seu estoque.</p>
      </div>

      <button class="primary" onclick="newProduct()">
        + NOVO PRODUTO
      </button>
    </div>

    <div id="adminProductsContent">
      <div class="empty">Carregando produtos...</div>
    </div>
  `;
}

async function loadAdminProducts(){
  const {data: productRows, error} = await supabase
    .from("products")
    .select("*")
    .order("created_at", {ascending:true});

  const container = el("adminProductsContent");

  if(!container) return;

  if(error){
    console.error("Erro ao carregar produtos administrativos:", error);

    container.innerHTML = `
      <div class="empty">
        Não foi possível carregar os produtos.
      </div>
    `;

    return;
  }

  const adminProductsData = (productRows || []).map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: Number(p.price || 0),
    stock: p.stock ?? 0,
    desc: p.description || "",
    tone: p.tone || "black"
  }));

  if(!adminProductsData.length){
    container.innerHTML = `
      <div class="empty">
        Nenhum produto cadastrado.
      </div>
    `;

    return;
  }

  container.innerHTML = `
    <div style="overflow:auto">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Produto</th>
            <th>Categoria</th>
            <th>Preço</th>
            <th>Estoque</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          ${adminProductsData.map(p => `
            <tr>
              <td>${escapeHtml(p.name)}</td>
              <td>${escapeHtml(p.category)}</td>
              <td>${money(p.price)}</td>
              <td>${p.stock}</td>

              <td>
                <div class="admin-actions">
                  <button
                    class="small-btn yellow"
                    onclick="editProduct(${p.id})"
                  >
                    Editar
                  </button>

                  <button
                    class="small-btn danger"
                    onclick="deleteProduct(${p.id})"
                  >
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}
function adminCustomers(){
  setTimeout(loadAdminCustomers, 0);

  return `
    <div class="section-title">
      <div>
        <h1>Clientes</h1>
        <p>Clientes cadastrados no sistema.</p>
      </div>
    </div>

    <div id="adminCustomersContent">
      <div class="empty">Carregando clientes...</div>
    </div>
  `;
}

async function loadAdminCustomers(){
  const {data: profileRows, error: profilesError} = await supabase
    .from("profiles")
    .select("id, name, email, phone, role")
    .neq("role", "admin")
    .order("created_at", {ascending:false});

  const container = el("adminCustomersContent");

  if(!container) return;

  if(profilesError){
    console.error("Erro ao carregar clientes:", profilesError);

    container.innerHTML = `
      <div class="empty">
        Não foi possível carregar os clientes.
      </div>
    `;

    return;
  }

  const {data: orderRows, error: ordersError} = await supabase
    .from("orders")
    .select("user_id");

  if(ordersError){
    console.error("Erro ao carregar pedidos dos clientes:", ordersError);
  }

  const customerRows = (profileRows || []).map(profile => ({
    id: profile.id,
    name: profile.name || "Não informado",
    email: profile.email || "Não informado",
    phone: profile.phone || "-",
    orders: (orderRows || []).filter(
      order => order.user_id === profile.id
    ).length
  }));

  if(!customerRows.length){
    container.innerHTML = `
      <div class="empty">
        Nenhum cliente cadastrado.
      </div>
    `;

    return;
  }

  container.innerHTML = `
    <div style="overflow:auto">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>E-mail</th>
            <th>Telefone</th>
            <th>Pedidos</th>
          </tr>
        </thead>

        <tbody>
          ${customerRows.map(customer => `
            <tr>
              <td>
                ${escapeHtml(customer.name)}
              </td>

              <td>
                ${escapeHtml(customer.email)}
              </td>

              <td>
                ${escapeHtml(customer.phone)}
              </td>

              <td>
                ${customer.orders}
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}
function newProduct(){editingProductId=null;openProductForm()}
function editProduct(id){editingProductId=id;openProductForm()}
function openProductForm(){
  const p=products.find(x=>x.id===editingProductId)||{
    name:"",
    category:"Borracha",
    price:"",
    stock:"",
    desc:"",
    tone:"black",
    image_url:""
  };

  const modal=document.createElement("div");
  modal.className="modal open";
  modal.id="productFormModal";

  modal.innerHTML=`
    <div class="modal-card">
      <button class="close" onclick="document.getElementById('productFormModal').remove()">×</button>

      <div class="modal-title">
        <span class="yellow-icon">▣</span>
        <div>
          <h2>${editingProductId?"Editar produto":"Novo produto"}</h2>
          <p>Cadastre as informações da peça.</p>
        </div>
      </div>

      <div class="product-form">

        <label>
          Nome
          <input id="pfName" value="${escapeAttr(p.name)}">
        </label>

        <label>
          Categoria
          <select id="pfCat">
            <option ${p.category==="Borracha"?"selected":""}>Borracha</option>
            <option ${p.category==="Silicone"?"selected":""}>Silicone</option>
            <option ${p.category==="Peças"?"selected":""}>Peças</option>
          </select>
        </label>

        <label>
          Preço
          <input id="pfPrice" type="number" step="0.01" value="${p.price}">
        </label>

        <label>
          Estoque
          <input id="pfStock" type="number" value="${p.stock}">
        </label>

        <label>
          Visual
          <select id="pfTone">
            <option value="black" ${p.tone==="black"?"selected":""}>Preto</option>
            <option value="blue" ${p.tone==="blue"?"selected":""}>Azul</option>
            <option value="red" ${p.tone==="red"?"selected":""}>Vermelho</option>
            <option value="bar" ${p.tone==="bar"?"selected":""}>Perfil</option>
          </select>
        </label>

        <label>
          Foto do produto
          <input id="pfImage" type="file" accept="image/*">
        </label>

        <label>
          Descrição
          <input id="pfDesc" value="${escapeAttr(p.desc)}">
        </label>

        <button class="primary full-row" onclick="saveProductForm()">SALVAR PRODUTO</button>

      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

async function saveProductForm(){

  const name = el("pfName").value.trim();
  const price = Number(el("pfPrice").value);
  const stock = Number(el("pfStock").value);
  const category = el("pfCat").value;
  const tone = el("pfTone").value;
  const description = el("pfDesc").value.trim();
  const imageFile = el("pfImage")?.files?.[0] || null;

  if(!name || !price){
    toast("Informe nome e preço.");
    return;
  }

  const currentProduct = products.find(p => p.id === editingProductId);
  let image_url = currentProduct?.image_url || null;

  /*
    Se o administrador escolheu uma nova imagem,
    envia para o Storage.
  */
  if(imageFile){

    const fileExt = imageFile.name.split(".").pop().toLowerCase();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase
      .storage
      .from("product-images")
      .upload(filePath, imageFile, {
        cacheControl: "3600",
        upsert: false
      });

    if(uploadError){
      console.error("Erro ao enviar imagem:", uploadError);
      toast("Não foi possível enviar a imagem.");
      return;
    }

    const { data: publicUrlData } = supabase
      .storage
      .from("product-images")
      .getPublicUrl(filePath);

    image_url = publicUrlData.publicUrl;
  }

  const productData = {
    name,
    category,
    price,
    stock,
    tone,
    description,
    image_url
  };

  let result;

  if(editingProductId){

    result = await supabase
      .from("products")
      .update(productData)
      .eq("id", editingProductId)
      .select()
      .single();

  }else{

    result = await supabase
      .from("products")
      .insert(productData)
      .select()
      .single();
  }

  if(result.error){

    console.error("Erro ao salvar produto:", result.error);
    toast("Não foi possível salvar o produto.");
    return;
  }

  const savedProduct = result.data;

  const frontendProduct = {
    id: savedProduct.id,
    name: savedProduct.name,
    category: savedProduct.category,
    price: Number(savedProduct.price || 0),
    stock: savedProduct.stock ?? 0,
    desc: savedProduct.description || "",
    tone: savedProduct.tone || "black",
    image_url: savedProduct.image_url || null
  };

  if(editingProductId){

    const index = products.findIndex(p => p.id === editingProductId);

    if(index !== -1){
      products[index] = frontendProduct;
    }

    toast("Produto atualizado!");

  }else{

    products.push(frontendProduct);
    toast("Produto adicionado!");
  }

  document.getElementById("productFormModal")?.remove();

  renderAdmin();
}
async function deleteProduct(id){

  if(!confirm("Excluir este produto?")) return;

  const product = products.find(p => p.id === id);

  // Exclui a imagem do Storage, se existir
  if(product?.image_url){
    try{
      const imageUrl = new URL(product.image_url);
      const marker = "/storage/v1/object/public/product-images/";

      const index = imageUrl.pathname.indexOf(marker);

      if(index !== -1){
        const filePath = decodeURIComponent(
          imageUrl.pathname.substring(index + marker.length)
        );

        const { error: storageError } = await supabase
          .storage
          .from("product-images")
          .remove([filePath]);

        if(storageError){
          console.error("Erro ao excluir imagem:", storageError);
        }
      }
    }catch(err){
      console.error("Erro ao processar imagem:", err);
    }
  }

  // Exclui o produto do banco
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if(error){
    console.error("Erro ao excluir produto:", error);
    toast("Não foi possível excluir o produto.");
    return;
  }

  products = products.filter(p => p.id !== id);
  cart = cart.filter(i => i.id !== id);

  updateCartCount();

  toast("Produto excluído!");

  renderAdmin();
}

function toggleMenu(){el("sideMenu").classList.toggle("open")}
function toggleRobot(){el("robotBox").classList.toggle("open")}
function robotAction(action){
  const messages=el("robotMessages");
  const labels={products:"Quero procurar um produto",cart:"Quero ver meu carrinho",orders:"Quero acompanhar meu pedido",contact:"Quero falar com atendimento"};
  messages.innerHTML+=`<div class="user-msg">${labels[action]}</div>`;
  const reply={products:"Claro! Vou abrir nosso catálogo para você. 🔎",cart:"Vamos conferir seu carrinho. 🛒",orders:"Para acompanhar pedidos, entre na sua conta e acesse Meus pedidos. 📦",contact:"Posso abrir os canais de atendimento da Borrtec. 💬"}[action];
  setTimeout(()=>{messages.innerHTML+=`<div class="bot-msg">${reply}</div>`;messages.scrollTop=messages.scrollHeight},250);
  if(action==="products")showPage("products");
  if(action==="cart")showPage("cart");
  if(action==="orders")showPage("orders");
  if(action==="contact")openContact();
}
function openContact(){showPage("contact")}
function openDelivery(){alert("Entrega: consulte prazo e disponibilidade. Nesta primeira versão, o cálculo real de frete ainda será conectado ao backend.")}
function openPayment(){alert("Pagamento: nesta primeira versão, o pedido é registrado para o administrador. Integração com Pix/cartão será adicionada na próxima etapa.")}
function openQuality(){alert("Qualidade Borrtec: produtos de alta resistência, matéria-prima de procedência e garantia de fábrica.")}
function callCompany(){window.location.href="tel:+551935333333"}
function whatsappCompany(){window.open("https://wa.me/5519999999999?text=Olá!%20Gostaria%20de%20informações%20sobre%20um%20produto%20da%20Borrtec.","_blank")}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function escapeAttr(s){return escapeHtml(s).replace(/`/g,"&#096;")}

async function initApp(){
  await restoreSession();
  updateCartCount();

  if(adminLogged){
    openAdmin();
  }else{
    renderHome();
  }
}

initApp();