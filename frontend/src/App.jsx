import React, { useMemo, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://cravebite-backend-spring.onrender.com";
const DELIVERY_FEE = 40;

const foodData = [];

const categories = [
  {id:"breakfast",name:"Breakfast",image:"/images/idli.svg"},
  {id:"biryani",name:"Biryani",image:"/images/biryani.svg"},
  {id:"curries",name:"Curries",image:"/images/restaurant.svg"},
  {id:"snacks",name:"Snacks",image:"/images/dosa.svg"},
  {id:"dessert",name:"Dessert",image:"/images/dessert.svg"}
];

const restaurants = [...new Set(liveMenu.map(item => item.restaurantName || item.restaurant).filter(Boolean))];

function App() {
  const [cart,setCart] = useState([]);
  const [liveMenu,setLiveMenu] = useState([]);
  const [menuLoading,setMenuLoading] = useState(true);
  const [menuError,setMenuError] = useState("");
  const [checkoutDetails,setCheckoutDetails] = useState({customerName:"",customerEmail:"",customerPhone:"",deliveryAddress:""});
  const [liveMenu,setLiveMenu] = useState([]);
  const [category,setCategory] = useState("all");
  const [restaurant,setRestaurant] = useState("all");
  const [vegOnly,setVegOnly] = useState(false);
  const [search,setSearch] = useState("");
  const [cartOpen,setCartOpen] = useState(false);
  const [checkoutState,setCheckoutState] = useState("");

  React.useEffect(() => {
    let active = true;
    fetch(API_BASE_URL + "/api/menu")
      .then(response => { if (!response.ok) throw new Error("Menu service unavailable"); return response.json(); })
      .then(items => { if (active) { setLiveMenu(Array.isArray(items) ? items : []); setMenuError(""); } })
      .catch(() => { if (active) { setLiveMenu([]); setMenuError("Menu is currently unavailable. Please try again later."); } })
      .finally(() => { if (active) setMenuLoading(false); });
    return () => { active = false; };
  }, []);
  const [loadingMenu,setLoadingMenu] = useState(true);
  const [menuError,setMenuError] = useState("");
  const [checkoutDetails,setCheckoutDetails] = useState({customerName:"",customerEmail:"",customerPhone:"",deliveryAddress:""});

  React.useEffect(() => {
    let cancelled = false;
    fetch(API_BASE_URL+"/api/menu")
      .then(response => { if(!response.ok) throw new Error("Menu request failed"); return response.json(); })
      .then(items => {
        if(cancelled) return;
        setLiveMenu(Array.isArray(items) ? items : []);
        setMenuError("");
      })
      .catch(() => { if(!cancelled){ setLiveMenu([]); setMenuError("Menu is currently unavailable. Please try again later."); } })
      .finally(() => { if(!cancelled) setLoadingMenu(false); });
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => liveMenu.filter(item =>
    (category==="all" || item.category===category) &&
    (restaurant==="all" || (item.restaurantName||item.restaurant)===restaurant) &&
    (!vegOnly || item.type==="veg" || item.vegetarian===true) &&
    (!search || item.name.toLowerCase().includes(search.toLowerCase()) || String(item.restaurantName||item.restaurant||"").toLowerCase().includes(search.toLowerCase()))
  ),[liveMenu,category,restaurant,vegOnly,search]);

  const addToCart = item => setCart(current => {
    const found=current.find(x=>x.id===item.id);
    return found ? current.map(x=>x.id===item.id?{...x,qty:x.qty+1}:x) : [...current,{...item,qty:1}];
  });

  const changeQty=(id,delta)=>setCart(current=>current.map(x=>x.id===id?{...x,qty:x.qty+delta}:x).filter(x=>x.qty>0));
  const subtotal=cart.reduce((sum,item)=>sum+item.price*item.qty,0);
  const total=subtotal+(subtotal?DELIVERY_FEE:0);
  const count=cart.reduce((sum,item)=>sum+item.qty,0);

  const checkout=async()=>{
    if(!cart.length){setCheckoutState("Your cart is empty.");return;}
    setCheckoutState("Placing order...");
    try{
      const response=await fetch(API_BASE_URL+"/api/orders",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          ...checkoutDetails,
          totalAmount:total,
          items:cart.map(item=>({menuItemName:item.name,quantity:item.qty}))
        })
      });
      if(!response.ok) throw new Error("Order request failed");
      const orderResult=await response.json();
      setCheckoutState("Order placed. Reference: "+(orderResult.orderId||"confirmed"));
      setCart([]);
    }catch(error){
      setCheckoutState("Unable to place the order. Check the backend connection and try again.");
    }
  };

  return <div>
    <header className="navbar"><div className="nav-container">
      <div className="logo"><i className="bx bxs-bowl-hot"></i><span>CraveBite</span></div>
      <div className="search-bar"><i className="bx bx-search"></i><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search for dosas, biryani, restaurants..." /></div>
      <div className="nav-actions"><button className="btn-text">Login</button><button className="btn-primary-small">Sign Up</button><div className="cart-btn" onClick={()=>setCartOpen(true)}><i className="bx bx-cart-alt"></i><span className="cart-badge">{count}</span></div></div>
    </div></header>

    <main>
      <section className="hero"><div className="hero-content">
        <span className="badge"><i className="bx bxs-hot"></i> Namma Bengaluru's Finest</span>
        <h1>"Awaken your senses with the <span>authentic flavors</span> of South India."</h1>
        <p>From crispy dosas to aromatic biryanis, satisfy your cravings with Bengaluru's legendary food delivered to your door.</p>
        <div className="hero-btns"><button className="btn-primary" onClick={()=>document.querySelector(".menu-section")?.scrollIntoView({behavior:"smooth"})}>Order Now</button></div>
      </div><div className="hero-image"><div className="image-wrapper">
        <img src="/images/food-hero.svg" alt="Delicious food" className="main-hero-img"/>
      </div></div></section>

      <section className="categories-section"><div className="section-header"><h2>Explore Cravings</h2></div>
        <div className="category-list"><div className="category-card" onClick={()=>setCategory("all")}><i className="bx bx-grid-alt" style={{fontSize:60,color:"var(--primary-color)"}}></i><h3>All</h3></div>
        {categories.map(c=><div className="category-card" key={c.id} onClick={()=>setCategory(c.id)}><img src={c.image} alt={c.name}/><h3>{c.name}</h3></div>)}</div>
      </section>

      <section className="menu-section"><div className="section-header menu-header-complex">
        <div className="menu-title-area"><h2>Discover Local Favorites</h2><div className="veg-toggle-container"><span className="veg-label">Veg Only</span><label className="switch"><input type="checkbox" checked={vegOnly} onChange={e=>setVegOnly(e.target.checked)}/><span className="slider round"></span></label></div></div>
        <div className="filters-container"><select className="restaurant-dropdown" value={restaurant} onChange={e=>setRestaurant(e.target.value)}><option value="all">All Restaurants in Bangalore</option>{restaurants.map(r=><option key={r}>{r}</option>)}</select>
        <div className="filters">{["all","breakfast","biryani","curries","snacks","dessert"].map(c=><button key={c} className={"filter-btn "+(category===c?"active":"")} onClick={()=>setCategory(c)}>{c==="all"?"All":c[0].toUpperCase()+c.slice(1)}</button>)}</div></div>
      </div>
      <div className="menu-grid">{loadingMenu?<p>Loading available menu…</p>:menuError?<p role="alert">{menuError}</p>:filtered.length?filtered.map(item=><FoodCard key={item.id} item={{...item,restaurant:item.restaurantName||item.restaurant,image:item.imageUrl||item.image,type:item.type||"veg",rating:item.rating||""}} onAdd={addToCart}/>):<p>No available menu items match your filters.</p>}</div></section>
    </main>

    <div className={"cart-overlay "+(cartOpen?"active":"")} onClick={()=>setCartOpen(false)}></div>
    <aside className={"cart-sidebar "+(cartOpen?"active":"")}><div className="cart-header"><h2>Your Cart</h2><button className="close-cart" onClick={()=>setCartOpen(false)}><i className="bx bx-x"></i></button></div>
      <div className="cart-items-container">{cart.length===0?<div className="empty-cart"><i className="bx bx-shopping-bag"></i><p>Your cart is empty</p></div>:cart.map(item=><div className="cart-item" key={item.id}><img src={item.image} alt={item.name}/><div className="cart-item-info"><div className="cart-item-title">{item.name}</div><div className="cart-item-price">₹{item.price}</div></div><div className="cart-item-actions"><button className="qty-btn" onClick={()=>changeQty(item.id,-1)}>-</button><span className="cart-item-qty">{item.qty}</span><button className="qty-btn" onClick={()=>changeQty(item.id,1)}>+</button></div></div>)}</div>
      <div className="cart-footer"><div className="cart-summary"><div className="summary-row"><span>Subtotal</span><span>₹{subtotal}</span></div><div className="summary-row"><span>Delivery Fee</span><span>₹{subtotal?DELIVERY_FEE:0}</span></div><div className="summary-row total"><span>Total</span><span>₹{total}</span></div></div>{cart.length>0&&<form className="order-details" onSubmit={e=>{e.preventDefault();checkout();}}><label>Full name<input required value={checkoutDetails.customerName} onChange={e=>setCheckoutDetails({...checkoutDetails,customerName:e.target.value})}/></label><label>Email<input type="email" required value={checkoutDetails.customerEmail} onChange={e=>setCheckoutDetails({...checkoutDetails,customerEmail:e.target.value})}/></label><label>Phone<input required value={checkoutDetails.customerPhone} onChange={e=>setCheckoutDetails({...checkoutDetails,customerPhone:e.target.value})}/></label><label>Delivery address<input required value={checkoutDetails.deliveryAddress} onChange={e=>setCheckoutDetails({...checkoutDetails,deliveryAddress:e.target.value})}/></label><button className="btn-primary checkout-btn" type="submit">Place order <i className="bx bx-right-arrow-alt"></i></button></form>}{checkoutState&&<p style={{marginTop:12,textAlign:"center"}} role="status">{checkoutState}</p>}</div>
    </aside>
  </div>;
}

function FoodCard({item,onAdd}){
  return <div className="food-card"><div className="food-img-wrap"><img src={item.image} alt={item.name}/><div className={"diet-indicator "+item.type}><span className="diet-dot"></span></div><div className="food-rating"><i className="bx bxs-star"></i>{item.rating}</div></div><div className="food-info"><div className="restaurant-name">{(item.restaurantName||item.restaurant)}</div><h3 className="food-title">{item.name}</h3><p className="food-desc">{item.description}</p><div className="food-bottom"><span className="food-price">₹{item.price}</span><button className="add-to-cart" onClick={()=>onAdd(item)}><i className="bx bx-plus"></i></button></div></div></div>;
}

export default App;