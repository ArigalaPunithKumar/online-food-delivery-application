import React, { useMemo, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://cravebite-backend-spring.onrender.com";
const DELIVERY_FEE = 40;

const foodData = [
  {id:1,name:"Benne Masala Dosa",restaurant:"Vidyarthi Bhavan",description:"Legendary crispy, thick dosa roasted in rich butter with spicy potato filling.",price:85,category:"breakfast",type:"veg",rating:4.9,image:"/images/dosa.svg"},
  {id:2,name:"Meghana Special Biryani",restaurant:"Meghana Foods",description:"Aromatic basmati rice cooked with tender chicken and secret spices.",price:320,category:"biryani",type:"non-veg",rating:4.8,image:"/images/biryani.svg"},
  {id:3,name:"Butter Masala Dosa",restaurant:"CTR",description:"Crisp dosa served with signature coconut chutney and sambar.",price:75,category:"breakfast",type:"veg",rating:4.8,image:"/images/dosa.svg"},
  {id:4,name:"Mutton Ghee Roast",restaurant:"Empire Restaurant",description:"Spicy and tangy Mangalorean style mutton roasted in pure ghee.",price:380,category:"curries",type:"non-veg",rating:4.7,image:"/images/biryani.svg"},
  {id:5,name:"Idli Vada Sambar Dip",restaurant:"MTR",description:"Soft idlis and crispy vada submerged in flavorful lentil sambar.",price:90,category:"breakfast",type:"veg",rating:4.6,image:"/images/idli.svg"},
  {id:6,name:"Chicken Kabab",restaurant:"Empire Restaurant",description:"Crispy, deep-fried chicken marinated in a blend of South Indian spices.",price:210,category:"snacks",type:"non-veg",rating:4.7,image:"/images/biryani.svg"},
  {id:7,name:"Paneer Butter Masala",restaurant:"Meghana Foods",description:"Rich and creamy curry made with fresh cottage cheese.",price:240,category:"curries",type:"veg",rating:4.5,image:"/images/dosa.svg"},
  {id:8,name:"Gobi Manchurian",restaurant:"Empire Restaurant",description:"Indo-Chinese style crispy cauliflower tossed in a spicy sauce.",price:150,category:"snacks",type:"veg",rating:4.4,image:"/images/idli.svg"},
  {id:9,name:"Andhra Chicken Meal",restaurant:"Nagarjuna",description:"Spicy Andhra style chicken served with rice, pappu, and rasam.",price:290,category:"biryani",type:"non-veg",rating:4.9,image:"/images/biryani.svg"},
  {id:10,name:"Death By Chocolate",restaurant:"Corner House",description:"Iconic DBC with vanilla ice cream, chocolate sponge, peanuts and hot fudge.",price:260,category:"dessert",type:"veg",rating:5,image:"/images/dessert.svg"}
];

const categories = [
  {id:"breakfast",name:"Breakfast",image:"/images/idli.svg"},
  {id:"biryani",name:"Biryani",image:"/images/biryani.svg"},
  {id:"curries",name:"Curries",image:"/images/restaurant.svg"},
  {id:"snacks",name:"Snacks",image:"/images/dosa.svg"},
  {id:"dessert",name:"Dessert",image:"/images/dessert.svg"}
];

const restaurants = [...new Set(foodData.map(item => item.restaurant))];

function App() {
  const [cart,setCart] = useState([]);
  const [category,setCategory] = useState("all");
  const [restaurant,setRestaurant] = useState("all");
  const [vegOnly,setVegOnly] = useState(false);
  const [search,setSearch] = useState("");
  const [cartOpen,setCartOpen] = useState(false);
  const [checkoutState,setCheckoutState] = useState("");

  const filtered = useMemo(() => foodData.filter(item =>
    (category==="all" || item.category===category) &&
    (restaurant==="all" || item.restaurant===restaurant) &&
    (!vegOnly || item.type==="veg") &&
    (!search || item.name.toLowerCase().includes(search.toLowerCase()) || item.restaurant.toLowerCase().includes(search.toLowerCase()))
  ),[category,restaurant,vegOnly,search]);

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
          customerName:"Guest Customer",
          customerEmail:"",
          customerPhone:"",
          deliveryAddress:"Bengaluru",
          totalAmount:total,
          items:cart.map(item=>({menuItemName:item.name,quantity:item.qty}))
        })
      });
      if(!response.ok) throw new Error("Order request failed");
      setCheckoutState("Order placed successfully.");
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
      <div className="menu-grid">{filtered.map(item=><FoodCard key={item.id} item={item} onAdd={addToCart}/>)}</div></section>
    </main>

    <div className={"cart-overlay "+(cartOpen?"active":"")} onClick={()=>setCartOpen(false)}></div>
    <aside className={"cart-sidebar "+(cartOpen?"active":"")}><div className="cart-header"><h2>Your Cart</h2><button className="close-cart" onClick={()=>setCartOpen(false)}><i className="bx bx-x"></i></button></div>
      <div className="cart-items-container">{cart.length===0?<div className="empty-cart"><i className="bx bx-shopping-bag"></i><p>Your cart is empty</p></div>:cart.map(item=><div className="cart-item" key={item.id}><img src={item.image} alt={item.name}/><div className="cart-item-info"><div className="cart-item-title">{item.name}</div><div className="cart-item-price">₹{item.price}</div></div><div className="cart-item-actions"><button className="qty-btn" onClick={()=>changeQty(item.id,-1)}>-</button><span className="cart-item-qty">{item.qty}</span><button className="qty-btn" onClick={()=>changeQty(item.id,1)}>+</button></div></div>)}</div>
      <div className="cart-footer"><div className="cart-summary"><div className="summary-row"><span>Subtotal</span><span>₹{subtotal}</span></div><div className="summary-row"><span>Delivery Fee</span><span>₹{subtotal?DELIVERY_FEE:0}</span></div><div className="summary-row total"><span>Total</span><span>₹{total}</span></div></div><button className="btn-primary checkout-btn" onClick={checkout}>Checkout <i className="bx bx-right-arrow-alt"></i></button>{checkoutState&&<p style={{marginTop:12,textAlign:"center"}}>{checkoutState}</p>}</div>
    </aside>
  </div>;
}

function FoodCard({item,onAdd}){
  return <div className="food-card"><div className="food-img-wrap"><img src={item.image} alt={item.name}/><div className={"diet-indicator "+item.type}><span className="diet-dot"></span></div><div className="food-rating"><i className="bx bxs-star"></i>{item.rating}</div></div><div className="food-info"><div className="restaurant-name">{item.restaurant}</div><h3 className="food-title">{item.name}</h3><p className="food-desc">{item.description}</p><div className="food-bottom"><span className="food-price">₹{item.price}</span><button className="add-to-cart" onClick={()=>onAdd(item)}><i className="bx bx-plus"></i></button></div></div></div>;
}

export default App;