// VALOREN VERO storefront — products are loaded from Supabase.
// Configure config.js before publishing.
const WHATSAPP_NUMBER = "9725XXXXXXXX"; // Replace with your WhatsApp number, digits only.
const CURRENCY = "₪";
const hasSupabaseConfig = window.SUPABASE_URL && !window.SUPABASE_URL.includes("PASTE_") &&
  window.SUPABASE_PUBLISHABLE_KEY && !window.SUPABASE_PUBLISHABLE_KEY.includes("PASTE_");
const db = hasSupabaseConfig ? window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_PUBLISHABLE_KEY) : null;
let products=[], cart=[], selectedProduct=null;
const grid=document.getElementById("product-grid");
const money=n=>CURRENCY+Number(n).toFixed(0);
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function renderProducts(category="All"){
 grid.innerHTML="";
 const list=products.filter(p=>category==="All"||p.category===category);
 if(!list.length){grid.innerHTML='<div class="empty-shop"><span class="empty-mark">VV</span><h3>THE COLLECTION IS COMING.</h3><p>New pieces are on their way.</p></div>';return;}
 list.forEach(p=>{
  const card=document.createElement("article");card.className="product-card";
  const img=p.image_url?`<img src="${esc(p.image_url)}" alt="${esc(p.name)}">`:`<span>VV</span>`;
  card.innerHTML=`<div class="product-image">${img}<small>${esc(p.tag||"VALOREN VERO")}</small></div><div class="product-meta"><div><h3>${esc(p.name)}</h3><p>${esc(p.category)}</p></div><span class="price">${money(p.price)}</span></div>`;
  card.addEventListener("click",()=>openProduct(p));grid.appendChild(card);
 });
}
function updateFilters(){
 const cats=[...new Set(products.map(p=>p.category).filter(Boolean))];
 const filters=document.getElementById("filters");
 filters.innerHTML='<button class="filter active" data-category="All">ALL</button>'+cats.map(c=>`<button class="filter" data-category="${esc(c)}">${esc(c.toUpperCase())}</button>`).join("");
 filters.querySelectorAll(".filter").forEach(b=>b.addEventListener("click",()=>{
  filters.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");renderProducts(b.dataset.category);
 }));
}
async function loadProducts(){
 if(!db){grid.innerHTML='<div class="empty-shop"><span class="empty-mark">VV</span><h3>STORE SETUP REQUIRED</h3><p>Connect the Supabase project to load your collection.</p></div>';return;}
 const {data,error}=await db.from("products").select("*").eq("is_published",true).order("created_at",{ascending:false});
 if(error){grid.innerHTML='<div class="empty-shop"><h3>STORE TEMPORARILY UNAVAILABLE</h3><p>Please try again later.</p></div>';console.error(error);return;}
 products=data||[];updateFilters();renderProducts();
}
function openProduct(p){
 selectedProduct=p;document.getElementById("modal-name").textContent=p.name;document.getElementById("modal-category").textContent=p.category;
 document.getElementById("modal-price").textContent=money(p.price);
 document.getElementById("modal-description").textContent=p.description||"";
 const size=document.getElementById("modal-size");size.innerHTML='<option value="">Choose a size</option>'+(p.sizes||[]).map(s=>`<option>${esc(s)}</option>`).join("");
 const color=document.getElementById("modal-color");color.innerHTML='<option value="">Choose a color</option>'+(p.colors||[]).map(c=>`<option>${esc(c)}</option>`).join("");
 const image=document.getElementById("modal-image");image.innerHTML=p.image_url?`<img src="${esc(p.image_url)}" alt="${esc(p.name)}">`:"<span>VV</span>";
 document.getElementById("modal-backdrop").classList.add("show");
}
document.getElementById("modal-close").onclick=()=>document.getElementById("modal-backdrop").classList.remove("show");
document.getElementById("modal-backdrop").addEventListener("click",e=>{if(e.target.id==="modal-backdrop")e.currentTarget.classList.remove("show")});
document.getElementById("add-to-cart").onclick=()=>{
 const size=document.getElementById("modal-size").value,color=document.getElementById("modal-color").value;
 if(!size){alert("Please choose a size.");return} if(!color){alert("Please choose a color.");return}
 cart.push({...selectedProduct,size,color});renderCart();document.getElementById("modal-backdrop").classList.remove("show");openCart();
};
function renderCart(){
 document.getElementById("cart-count").textContent=cart.length;
 document.getElementById("cart-total").textContent=money(cart.reduce((s,p)=>s+Number(p.price),0));
 const box=document.getElementById("cart-items");box.innerHTML="";
 if(!cart.length){box.innerHTML='<p class="muted">Your bag is empty.</p>';return}
 cart.forEach((p,i)=>{const line=document.createElement("div");line.className="cart-line";line.innerHTML=`<span>${esc(p.name)}<br><small>${esc(p.size)} · ${esc(p.color)}</small></span><span>${money(p.price)} <button aria-label="Remove item">REMOVE</button></span>`;line.querySelector("button").onclick=()=>{cart.splice(i,1);renderCart()};box.appendChild(line)});
}
function openCart(){document.getElementById("cart-drawer").classList.add("open");document.getElementById("backdrop").classList.add("show")}
function closeCart(){document.getElementById("cart-drawer").classList.remove("open");document.getElementById("backdrop").classList.remove("show")}
document.getElementById("cart-open").onclick=openCart;document.getElementById("cart-close").onclick=closeCart;document.getElementById("backdrop").onclick=closeCart;
function whatsappUrl(message){return "https://wa.me/"+WHATSAPP_NUMBER+"?text="+encodeURIComponent(message)}
document.getElementById("checkout").onclick=()=>{
 if(!cart.length){alert("Your bag is empty.");return}
 if(WHATSAPP_NUMBER.includes("X")){alert("Add your WhatsApp number in script.js before using orders.");return}
 const lines=cart.map((p,i)=>`${i+1}. ${p.name} | Size: ${p.size} | Color: ${p.color} | ${money(p.price)}`).join("\n");
 const total=cart.reduce((s,p)=>s+Number(p.price),0);
 window.open(whatsappUrl(`Hello VALOREN VERO! I would like to place an order:\n\n${lines}\n\nSubtotal: ${money(total)}\n\nPlease confirm shipping and payment details.`),"_blank");
};
document.getElementById("contact-whatsapp").onclick=e=>{
 if(WHATSAPP_NUMBER.includes("X")){e.preventDefault();alert("Add your WhatsApp number in script.js before using this link.");}
 else e.currentTarget.href=whatsappUrl("Hello VALOREN VERO, I have a question.");
};
loadProducts();
