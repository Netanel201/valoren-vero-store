// EDIT THESE SETTINGS BEFORE LAUNCH
const WHATSAPP_NUMBER = "9725XXXXXXXX"; // Replace with your WhatsApp number, digits only.
const CURRENCY = "₪";

// Replace these sample products with your real products, photos and prices.
const products = [
 {id:1,name:"VV Signature Tee",category:"T-Shirts",price:89,tag:"DROP 001",sizes:["XS","S","M","L","XL","XXL"]},
 {id:2,name:"Valoren Essential Hoodie",category:"Hoodies",price:189,tag:"DROP 001",sizes:["S","M","L","XL","XXL"]},
 {id:3,name:"Valoren Cargo Pants",category:"Pants",price:169,tag:"DROP 001",sizes:["S","M","L","XL"]},
 {id:4,name:"VV Classic Cap",category:"Hats",price:79,tag:"DROP 001",sizes:["One Size"]},
 {id:5,name:"Valoren Oversized Tee",category:"T-Shirts",price:99,tag:"DROP 001",sizes:["XS","S","M","L","XL","XXL"]},
 {id:6,name:"VV Everyday Shorts",category:"Pants",price:119,tag:"DROP 001",sizes:["S","M","L","XL"]},
 {id:7,name:"Valoren Beanie",category:"Accessories",price:59,tag:"DROP 001",sizes:["One Size"]},
 {id:8,name:"VV Premium Sweatshirt",category:"Hoodies",price:159,tag:"DROP 001",sizes:["S","M","L","XL","XXL"]}
];
let cart=[], selectedProduct=null;
const grid=document.getElementById("product-grid");
const money=n=>CURRENCY+n.toFixed(0);
function renderProducts(category="All"){
 grid.innerHTML="";
 products.filter(p=>category==="All"||p.category===category).forEach(p=>{
  const card=document.createElement("article");card.className="product-card";
  card.innerHTML=`<div class="product-image"><span>VV</span><small>${p.tag}</small></div><div class="product-meta"><div><h3>${p.name}</h3><p>${p.category}</p></div><span class="price">${money(p.price)}</span></div>`;
  card.addEventListener("click",()=>openProduct(p));grid.appendChild(card);
 });
}
document.querySelectorAll(".filter").forEach(b=>b.addEventListener("click",()=>{
 document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");renderProducts(b.dataset.category);
}));
function openProduct(p){
 selectedProduct=p;document.getElementById("modal-name").textContent=p.name;document.getElementById("modal-category").textContent=p.category;
 document.getElementById("modal-price").textContent=money(p.price);
 const size=document.getElementById("modal-size");size.innerHTML='<option value="">Choose a size</option>'+p.sizes.map(s=>`<option>${s}</option>`).join("");
 document.getElementById("modal-backdrop").classList.add("show");
}
document.getElementById("modal-close").onclick=()=>document.getElementById("modal-backdrop").classList.remove("show");
document.getElementById("modal-backdrop").addEventListener("click",e=>{if(e.target.id==="modal-backdrop")e.currentTarget.classList.remove("show")});
document.getElementById("add-to-cart").onclick=()=>{
 const size=document.getElementById("modal-size").value;if(!size){alert("Please choose a size.");return}
 const color=document.getElementById("modal-color").value;
 cart.push({...selectedProduct,size,color});renderCart();document.getElementById("modal-backdrop").classList.remove("show");openCart();
};
function renderCart(){
 document.getElementById("cart-count").textContent=cart.length;
 document.getElementById("cart-total").textContent=money(cart.reduce((s,p)=>s+p.price,0));
 const box=document.getElementById("cart-items");box.innerHTML="";
 if(!cart.length){box.innerHTML='<p class="muted">Your bag is empty.</p>';return}
 cart.forEach((p,i)=>{const line=document.createElement("div");line.className="cart-line";line.innerHTML=`<span>${p.name}<br><small>${p.size} · ${p.color}</small></span><span>${money(p.price)} <button aria-label="Remove item">REMOVE</button></span>`;line.querySelector("button").onclick=()=>{cart.splice(i,1);renderCart()};box.appendChild(line)});
}
function openCart(){document.getElementById("cart-drawer").classList.add("open");document.getElementById("backdrop").classList.add("show")}
function closeCart(){document.getElementById("cart-drawer").classList.remove("open");document.getElementById("backdrop").classList.remove("show")}
document.getElementById("cart-open").onclick=openCart;document.getElementById("cart-close").onclick=closeCart;document.getElementById("backdrop").onclick=closeCart;
function whatsappUrl(message){return "https://wa.me/"+WHATSAPP_NUMBER+"?text="+encodeURIComponent(message)}
document.getElementById("checkout").onclick=()=>{
 if(!cart.length){alert("Your bag is empty.");return}
 if(WHATSAPP_NUMBER.includes("X")){alert("Add your WhatsApp number in script.js before using orders.");return}
 const lines=cart.map((p,i)=>`${i+1}. ${p.name} | Size: ${p.size} | Color: ${p.color} | ${money(p.price)}`).join("\n");
 const total=cart.reduce((s,p)=>s+p.price,0);
 window.open(whatsappUrl(`Hello VALOREN VERO! I would like to place an order:\n\n${lines}\n\nSubtotal: ${money(total)}\n\nPlease confirm shipping and payment details.`),"_blank");
};
document.getElementById("contact-whatsapp").onclick=e=>{
 if(WHATSAPP_NUMBER.includes("X")){e.preventDefault();alert("Add your WhatsApp number in script.js before using this link.");}
 else e.currentTarget.href=whatsappUrl("Hello VALOREN VERO, I have a question.");
};
renderProducts();