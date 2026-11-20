const configured=window.SUPABASE_URL&&!window.SUPABASE_URL.includes("PASTE_")&&window.SUPABASE_PUBLISHABLE_KEY&&!window.SUPABASE_PUBLISHABLE_KEY.includes("PASTE_");
const client=configured?window.supabase.createClient(window.SUPABASE_URL,window.SUPABASE_PUBLISHABLE_KEY):null;
const $=id=>document.getElementById(id);
let currentImageUrl=null,allProducts=[];
function say(id,msg){$(id).textContent=msg}
function safe(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
async function checkSession(){
 if(!client){say("login-message","Setup needed: add your Supabase URL and Publishable key to config.js.");return;}
 const {data:{session}}=await client.auth.getSession();
 if(session){$("login-panel").hidden=true;$("dashboard").hidden=false;await loadAdminProducts();}
}
$("login-form").addEventListener("submit",async e=>{
 e.preventDefault();say("login-message","Signing in...");
 const {error}=await client.auth.signInWithPassword({email:$("email").value.trim(),password:$("password").value});
 if(error){say("login-message",error.message);return}
 $("login-panel").hidden=true;$("dashboard").hidden=false;await loadAdminProducts();
});
$("logout").onclick=async()=>{await client.auth.signOut();$("dashboard").hidden=true;$("login-panel").hidden=false;$("password").value="";};
async function loadAdminProducts(){
 say("form-message","");
 const {data,error}=await client.from("products").select("*").order("created_at",{ascending:false});
 if(error){say("form-message","Could not load products: "+error.message);return}
 allProducts=data||[];renderList();
}
function renderList(){
 $("total-count").textContent=allProducts.length;
 $("published-count").textContent=allProducts.filter(p=>p.is_published).length;
 $("draft-count").textContent=allProducts.filter(p=>!p.is_published).length;
 $("product-total").textContent=allProducts.length+" ITEMS";
 const list=$("product-list");
 if(!allProducts.length){list.innerHTML='<p class="muted">No products yet. Add your first piece using the form.</p>';return}
 list.innerHTML=allProducts.map(p=>`<article class="product-row"><div class="thumb">${p.image_url?`<img src="${safe(p.image_url)}" alt="" style="width:100%;height:100%;object-fit:cover">`:"VV"}</div><div><h3>${safe(p.name)}</h3><p>${safe(p.category)} · ₪${Number(p.price).toFixed(2)}</p><p>${safe((p.sizes||[]).join(", "))} · ${safe((p.colors||[]).join(", "))}</p><span class="status">${p.is_published?"PUBLISHED":"DRAFT"}</span></div><div class="row-actions"><button class="secondary edit" data-id="${p.id}">EDIT</button><button class="secondary toggle" data-id="${p.id}">${p.is_published?"HIDE":"PUBLISH"}</button><button class="secondary danger delete" data-id="${p.id}">DELETE</button></div></article>`).join("");
 list.querySelectorAll(".edit").forEach(b=>b.onclick=()=>editProduct(b.dataset.id));
 list.querySelectorAll(".toggle").forEach(b=>b.onclick=()=>toggleProduct(b.dataset.id));
 list.querySelectorAll(".delete").forEach(b=>b.onclick=()=>deleteProduct(b.dataset.id));
}
function selectedValues(id){return [...$(id).querySelectorAll('input[type="checkbox"]:checked')].map(x=>x.value)}
function setChecks(id,values){$(id).querySelectorAll('input[type="checkbox"]').forEach(x=>x.checked=(values||[]).includes(x.value))}
function resetForm(){
 $("product-form").reset();$("product-id").value="";$("stock").value="10";currentImageUrl=null;$("image-preview").textContent="IMAGE PREVIEW";$("form-title").textContent="ADD A PRODUCT";$("save-button").textContent="SAVE PRODUCT";say("form-message","");
}
$("reset-button").onclick=resetForm;
$("image").addEventListener("change",()=>{
 const file=$("image").files[0];if(!file)return;
 if(file.size>5*1024*1024){say("form-message","Image must be smaller than 5 MB.");$("image").value="";return}
 const url=URL.createObjectURL(file);$("image-preview").innerHTML=`<img src="${url}" alt="Preview">`;
});
function editProduct(id){
 const p=allProducts.find(x=>String(x.id)===String(id));if(!p)return;
 $("product-id").value=p.id;$("name").value=p.name;$("price").value=p.price;$("category").value=p.category;
 $("description").value=p.description||"";$("colors").value=(p.colors||[]).join(", ");$("stock").value=p.stock_default??10;
 $("published").checked=!!p.is_published;setChecks("sizes",p.sizes||[]);
 currentImageUrl=p.image_url||null;$("image").value="";
 $("image-preview").innerHTML=currentImageUrl?`<img src="${safe(currentImageUrl)}" alt="Current image">`:"IMAGE PREVIEW";
 $("form-title").textContent="EDIT PRODUCT";$("save-button").textContent="UPDATE PRODUCT";window.scrollTo({top:0,behavior:"smooth"});
}
async function uploadImage(file){
 const ext=(file.name.split(".").pop()||"jpg").toLowerCase().replace(/[^a-z0-9]/g,"")||"jpg";
 const path=`${crypto.randomUUID()}.${ext}`;
 const {error}=await client.storage.from("product-images").upload(path,file,{upsert:false,contentType:file.type});
 if(error)throw error;
 const {data}=client.storage.from("product-images").getPublicUrl(path);
 return data.publicUrl;
}
$("product-form").addEventListener("submit",async e=>{
 e.preventDefault();if(!client)return;
 const sizes=selectedValues("sizes"),colors=$("colors").value.split(",").map(x=>x.trim()).filter(Boolean);
 if(!sizes.length){say("form-message","Choose at least one size.");return}
 if(!colors.length){say("form-message","Add at least one color.");return}
 $("save-button").disabled=true;say("form-message","Saving product...");
 try{
  const file=$("image").files[0];let imageUrl=currentImageUrl;if(file)imageUrl=await uploadImage(file);
  const payload={name:$("name").value.trim(),price:Number($("price").value),category:$("category").value,description:$("description").value.trim(),image_url:imageUrl,sizes,colors,stock_default:Number($("stock").value||0),is_published:$("published").checked};
  const id=$("product-id").value;const result=id?await client.from("products").update(payload).eq("id",id):await client.from("products").insert(payload);
  if(result.error)throw result.error;
  resetForm();await loadAdminProducts();say("form-message","Product saved successfully.");
 }catch(err){say("form-message","Error: "+err.message)}
 finally{$("save-button").disabled=false}
});
async function toggleProduct(id){
 const p=allProducts.find(x=>String(x.id)===String(id));if(!p)return;
 const {error}=await client.from("products").update({is_published:!p.is_published}).eq("id",id);
 if(error){alert(error.message);return}await loadAdminProducts();
}
async function deleteProduct(id){
 const p=allProducts.find(x=>String(x.id)===String(id));if(!p||!confirm(`Delete "${p.name}" permanently?`))return;
 const {error}=await client.from("products").delete().eq("id",id);
 if(error){alert(error.message);return}await loadAdminProducts();
}
checkSession();
