"use client";

import { useMemo, useState, useEffect } from "react";
import { ShoppingBasket, Search, Leaf, ArrowRight, Plus, Minus, X, MapPin, Sprout, Truck, ShieldCheck, User, LogIn, LogOut, UserPlus } from "lucide-react";

type Product = {id:string;name:string;description:string;category:string;pricePaise:number;unit:string;image:string;stock:number;featured:boolean;farmerId:string;farmerName:string;farmerLocation:string};
type Farmer = {id:string;name:string;farmName:string;location:string;description:string};
type CartLine = {product:Product;quantity:number};

const categories = ["All produce","Vegetables","Leafy greens","Fruits","Grains"];
const money = (paise:number) => new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2}).format(paise/100);

export default function Market({products,farmers}:{products:Product[];farmers:Farmer[]}) {
  const [cart,setCart] = useState<Record<string,CartLine>>({});
  const [category,setCategory] = useState("All produce");
  const [search,setSearch] = useState("");
  const [cartOpen,setCartOpen] = useState(false);
  const [checkout,setCheckout] = useState(false);
  const [notice,setNotice] = useState("");
  const [form,setForm] = useState({customerName:"",email:"",phone:"",address:"",deliveryPinCode:"",notes:""});
  const [user,setUser] = useState<{id:string;name:string|null;email:string;role:string}|null>(null);
  const [authChecked,setAuthChecked] = useState(false);
  const lines = Object.values(cart);
  const count = lines.reduce((n,l)=>n+l.quantity,0);
  const subtotal = lines.reduce((n,l)=>n+l.product.pricePaise*l.quantity,0);
  const visible = useMemo(()=>products.filter(p=>(category==="All produce"||p.category===category)&&(p.name+" "+p.description+" "+p.farmerName).toLowerCase().includes(search.toLowerCase())),[products,category,search]);

  useEffect(()=>{
    (async()=>{
      try{
        const res=await fetch("/api/auth/me");
        if(res.ok){
          const data=await res.json();
          setUser({id:data.id,name:data.name,email:data.email,role:data.role});
        }
      }catch{}
      setAuthChecked(true);
    })();
  },[]);

  function change(p:Product,delta:number) {
    setCart(old=>{const next={...old};const qty=(next[p.id]?.quantity||0)+delta;if(qty<=0)delete next[p.id];else if(qty<=p.stock)next[p.id]={product:p,quantity:qty};return next;});
  }
  async function signOut(){
    await fetch("/api/auth/signout",{method:"POST"});
    setUser(null);
  }
  async function placeOrder(e:React.FormEvent) {
    e.preventDefault();setNotice("");
    try {
      const res=await fetch("/api/orders",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,items:lines.map(l=>({productId:l.product.id,quantity:l.quantity}))})});
      const data=await res.json();
      if(!res.ok)throw new Error(data.error||"Could not place order");
      setNotice(`Order ${data.orderId} created. Payment is not collected yet; the market team will contact you to confirm payment.`);
      setCart({});setCheckout(false);setCartOpen(false);
    } catch(err) {setNotice(err instanceof Error?err.message:"Something went wrong.");}
  }
  return <main>
    <div className="announcement"><Leaf size={14}/> Fresh from nearby farms · Supporting growers, one basket at a time</div>
    <header className="header wrap">
      <a className="brand" href="#"><span className="brand-icon"><Sprout size={24}/></span><span>harvest<span className="brand-light">market</span><small>GOOD FOOD, GROWN NEARBY</small></span></a>
      <nav><a href="#shop">Shop</a><a href="#farmers">Our farmers</a><a href="#promise">Our promise</a></nav>
      <div className="auth-controls">
        {!authChecked ? (
          <span className="auth-loading">…</span>
        ) : user ? (
          <>
            <span className="auth-user">Hi, {user.name||user.email}</span>
            <button className="signout-button" onClick={signOut}><LogOut size={16}/> Sign out</button>
          </>
        ) : (
          <>
            <a href="/auth/signin" className="signin-button"><LogIn size={16}/> Sign in</a>
            <a href="/auth/signup" className="register-button"><UserPlus size={16}/> Register</a>
          </>
        )}
      </div>
      <button className="cart-button" onClick={()=>setCartOpen(true)}><ShoppingBasket size={18}/> Basket <span>{count}</span></button>
    </header>

    <section className="hero wrap">
      <div className="hero-copy"><div className="eyebrow"><span/> FROM OUR FIELDS TO YOUR TABLE</div><h1>Good food.<br/><em>Good roots.</em></h1><p>Discover seasonal produce grown with care by farmers in your community. Fresh, honest, and closer than you think.</p><div className="hero-actions"><a className="primary-button" href="#shop">Shop the harvest <ArrowRight size={17}/></a><a className="text-link" href="#farmers">Meet our farmers</a></div><div className="hero-proof"><span className="proof-icons"><Leaf/><Sprout/><ShieldCheck/></span><span>Locally grown · Thoughtfully sourced</span></div></div>
      <div className="hero-art"><img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1300&q=90" alt="Fresh seasonal produce arranged at a farmers market"/><div className="hero-sticker"><Sprout size={21}/><span>Picked with care<small>Shared with love</small></span></div><div className="hero-caption">SEASONAL. LOCAL. DELICIOUS.</div></div>
    </section>

    <section className="benefits"><div className="wrap benefit-grid"><div><Leaf/><span><b>Grown with care</b><small>Know where your food comes from</small></span></div><div><Sprout/><span><b>Support local farms</b><small>Every basket supports a grower</small></span></div><div><Truck/><span><b>Fresh to your door</b><small>Delivery details at checkout</small></span></div></div></section>

    <section className="shop-section wrap" id="shop"><div className="section-heading"><div><div className="eyebrow">THE GOOD STUFF</div><h2>Fresh from the farm</h2><p>Good things grow with the seasons. Find your favorites.</p></div><span className="product-count">{visible.length} products</span></div>
      <div className="shop-tools"><div className="category-tabs">{categories.map(c=><button key={c} className={category===c?"tab active":"tab"} onClick={()=>setCategory(c)}>{c}</button>)}</div><label className="search"><Search size={17}/><input placeholder="Find something fresh..." value={search} onChange={e=>setSearch(e.target.value)}/></label></div>
      <div className="product-grid">{visible.map(p=><article className="product-card" key={p.id}><div className="product-image"><img src={p.image} alt={p.name} loading="lazy"/>{p.featured&&<span className="product-tag">FARM FAVORITE</span>}<button className="add-button" aria-label={`Add ${p.name} to basket`} disabled={p.stock===0} onClick={()=>change(p,1)}><Plus size={20}/></button></div><div className="product-info"><div className="product-meta">{p.category.toUpperCase()} <span>· {p.stock>0?"IN SEASON":"SOLD OUT"}</span></div><h3>{p.name}</h3><p className="farmer-name"><Sprout size={13}/>{p.farmerName}</p><div className="product-bottom"><div><b>{money(p.pricePaise)}</b><small> / {p.unit}</small></div>{cart[p.id]&&<div className="mini-quantity"><button onClick={()=>change(p,-1)}><Minus size={13}/></button><span>{cart[p.id].quantity}</span><button onClick={()=>change(p,1)} disabled={cart[p.id].quantity>=p.stock}><Plus size={13}/></button></div>}</div></div></article>)}</div>
      {visible.length===0&&<div className="empty">No produce found. Try another search or category.</div>}
    </section>

    <section className="farmers-section" id="farmers"><div className="wrap"><div className="section-heading"><div><div className="eyebrow">PEOPLE BEHIND THE PRODUCE</div><h2>Know your farmer</h2><p>Good food begins with good people and the land they tend.</p></div></div><div className="farmer-grid">{farmers.map((f,i)=><article className="farmer-card" key={f.id}><div className={`farmer-art farmer-art-${i%3}`}><Sprout size={35}/><span>GROWN CLOSE TO HOME</span></div><div className="farmer-content"><div className="farmer-location"><MapPin size={14}/>{f.location}</div><h3>{f.farmName}</h3><p>{f.description}</p><div className="farmer-byline">Grown by <b>{f.name}</b></div></div></article>)}</div></div></section>

    <section className="promise wrap" id="promise"><div className="promise-mark"><Sprout size={38}/></div><div><div className="eyebrow">A LITTLE CLOSER TO NATURE</div><h2>Better food starts with knowing its roots.</h2><p>We're bringing local farmers and everyday kitchens closer together. Every purchase helps build a more connected, thoughtful food community.</p></div><a href="#shop" className="primary-button">Find your favorites <ArrowRight size={16}/></a></section>
    <footer><div className="wrap footer-inner"><a className="brand footer-brand" href="#"><span className="brand-icon"><Sprout size={22}/></span><span>harvest<span className="brand-light">market</span><small>GOOD FOOD, GROWN NEARBY</small></span></a><span>Rooted in community. Growing together.</span><span>© {new Date().getFullYear()} Harvest Market</span></div></footer>

    {cartOpen&&<div className="overlay" onMouseDown={e=>{if(e.target===e.currentTarget){setCartOpen(false);setCheckout(false)}}}><aside className="cart-drawer"><div className="drawer-heading"><div><div className="eyebrow">YOUR HARVEST</div><h2>{checkout?"Delivery details":"Your basket"}</h2></div><button className="icon-button" onClick={()=>{setCartOpen(false);setCheckout(false)}}><X/></button></div>
      {!checkout?<>{lines.length===0?<div className="empty">Your basket is waiting for something fresh.<a href="#shop" onClick={()=>setCartOpen(false)}>Explore the harvest →</a></div>:<><div className="cart-lines">{lines.map(l=><div className="cart-line" key={l.product.id}><img src={l.product.image} alt=""/><div className="cart-line-main"><b>{l.product.name}</b><small>{money(l.product.pricePaise)} / {l.product.unit}</small><div className="quantity"><button onClick={()=>change(l.product,-1)}><Minus size={13}/></button><span>{l.quantity}</span><button onClick={()=>change(l.product,1)} disabled={l.quantity>=l.product.stock}><Plus size={13}/></button></div></div><strong>{money(l.product.pricePaise*l.quantity)}</strong></div>)}</div><div className="cart-total"><div><span>Subtotal</span><b>{money(subtotal)}</b></div><div><span>Delivery</span><span>Calculated at confirmation</span></div><div className="total-row"><b>Estimated total</b><b>{money(subtotal)}</b></div><button className="primary-button full-button" onClick={()=>setCheckout(true)}>Continue to delivery <ArrowRight size={17}/></button><p className="secure-note"><ShieldCheck size={14}/> No payment is taken in this demo checkout.</p></div></>}</>:<form className="checkout-form" onSubmit={placeOrder}><p className="form-intro">Tell us where to bring your fresh harvest. Fields marked * are required.</p>{([["customerName","Full name *"],["email","Email address *"],["phone","Phone number *"],["address","Delivery address *"],["deliveryPinCode","PIN code *"],["notes","Delivery notes (optional)"]] as const).map(([key,label])=><label className="field" key={key}>{label}{key==="address"||key==="notes"?<textarea required={key!=="notes"} rows={key==="address"?3:2} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}/>:<input required value={form[key]} type={key==="email"?"email":"text"} pattern={key==="deliveryPinCode"?"[0-9]{6}":undefined} minLength={key==="phone"?10:undefined} onChange={e=>setForm({...form,[key]:e.target.value})}/>}</label>)}<div className="cart-total"><div className="total-row"><b>Order total</b><b>{money(subtotal)}</b></div><button className="primary-button full-button" type="submit">Place order request <ArrowRight size={17}/></button><button type="button" className="back-button" onClick={()=>setCheckout(false)}>Back to basket</button><p className="secure-note">Order requests are recorded; payment must be confirmed separately.</p></div></form>}
      </aside></div>}
    {notice&&<div className="toast" role="status"><span>{notice}</span><button onClick={()=>setNotice("")}><X size={17}/></button></div>}
  </main>;
}