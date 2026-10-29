import React, { useEffect, useMemo, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://cravebite-backend-spring.onrender.com";
const DELIVERY_FEE = 40;

const categories = [
  { id: "breakfast", name: "Breakfast", image: "/images/idli.svg" },
  { id: "biryani", name: "Biryani", image: "/images/biryani.svg" },
  { id: "curries", name: "Curries", image: "/images/restaurant.svg" },
  { id: "snacks", name: "Snacks", image: "/images/dosa.svg" },
  { id: "dessert", name: "Dessert", image: "/images/dessert.svg" }
];

const money = value => "₹" + Number(value || 0).toLocaleString("en-IN");

function App() {
  const [liveMenu, setLiveMenu] = useState([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState("");
  const [cart, setCart] = useState([]);
  const [category, setCategory] = useState("all");
  const [restaurant, setRestaurant] = useState("all");
  const [vegOnly, setVegOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutState, setCheckoutState] = useState("");
  const [checkoutDetails, setCheckoutDetails] = useState({
    customerName: "", customerEmail: "", customerPhone: "", deliveryAddress: ""
  });

  const loadMenu = async () => {
    setMenuLoading(true);
    try {
      const response = await fetch(API_BASE_URL + "/api/menu");
      if (!response.ok) throw new Error("Menu request failed");
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Unexpected menu response");
      setLiveMenu(data);
      setMenuError("");
    } catch {
      setLiveMenu([]);
      setMenuError("The menu is temporarily unavailable. Please try again later.");
    } finally {
      setMenuLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, []);

  const restaurants = useMemo(
    () => [...new Set(liveMenu.map(item => item.restaurantName || item.restaurant).filter(Boolean))],
    [liveMenu]
  );

  const filtered = useMemo(() => liveMenu.filter(item => {
    const itemCategory = String(item.category || "").toLowerCase();
    const itemName = String(item.name || "");
    const itemRestaurant = String(item.restaurantName || item.restaurant || "");
    const isVegetarian = item.vegetarian === true || String(item.type || "").toLowerCase() === "veg";
    return (category === "all" || itemCategory === category)
      && (restaurant === "all" || itemRestaurant === restaurant)
      && (!vegOnly || isVegetarian)
      && (itemName + " " + String(item.description || "") + " " + itemRestaurant)
        .toLowerCase().includes(search.trim().toLowerCase());
  }), [liveMenu, category, restaurant, vegOnly, search]);

  const addToCart = item => {
    if (!item.available) return;
    setCart(current => {
      const found = current.find(row => row.id === item.id);
      return found
        ? current.map(row => row.id === item.id ? { ...row, qty: row.qty + 1 } : row)
        : [...current, { ...item, qty: 1 }];
    });
    setCheckoutState("");
  };

  const changeQty = (id, delta) => setCart(current =>
    current.map(item => item.id === id ? { ...item, qty: item.qty + delta } : item)
      .filter(item => item.qty > 0)
  );

  const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * item.qty, 0);
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const total = subtotal + (count ? DELIVERY_FEE : 0);

  const checkout = async event => {
    event.preventDefault();
    if (!cart.length) return;
    setCheckoutState("Submitting order…");
    try {
      const response = await fetch(API_BASE_URL + "/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...checkoutDetails,
          items: cart.map(item => ({ menuItemId: item.id, quantity: item.qty }))
        })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Order request failed");
      if (!result.orderId) throw new Error("The server did not confirm an order reference");
      setCheckoutState("Order placed successfully. Reference: " + result.orderId);
      setCart([]);
      setCheckoutDetails({ customerName: "", customerEmail: "", customerPhone: "", deliveryAddress: "" });
    } catch {
      setCheckoutState("Your order was not confirmed. Please try again after service connectivity is restored.");
    }
  };

  const selectCategory = value => {
    setCategory(value);
    document.getElementById("menu")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div>
      <header className="navbar">
        <div className="nav-container">
          <a className="logo" href="#home" aria-label="CraveBite home">
            <i className="bx bxs-bowl-hot" /><span>CraveBite</span>
          </a>
          <div className="search-bar">
            <i className="bx bx-search" />
            <input aria-label="Search menu" value={search}
              onChange={event => setSearch(event.target.value)}
              onFocus={() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })}
              placeholder="Search dishes or restaurants…" />
          </div>
          <div className="nav-actions">
            <button className="btn-text" onClick={() => document.getElementById("customer-details")?.scrollIntoView({ behavior: "smooth" })}>Account details</button>
            <button className="btn-primary-small" onClick={() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })}>Browse menu</button>
            <button className="cart-btn" aria-label={`Open cart, ${count} items`} onClick={() => setCartOpen(true)}>
              <i className="bx bx-cart-alt" /><span className="cart-badge">{count}</span>
            </button>
          </div>
        </div>
      </header>

      <main id="home">
        <section className="hero">
          <div className="hero-content">
            <span className="badge"><i className="bx bxs-hot" /> FOOD, MADE HAPPEN</span>
            <h1>Find your next <span>favourite</span> meal.</h1>
            <p>Explore the available menu, choose your dishes, and place your delivery order.</p>
            <div className="hero-btns">
              <button className="btn-primary" onClick={() => selectCategory("all")}>Browse menu <i className="bx bx-right-arrow-alt" /></button>
            </div>
          </div>
          <div className="hero-image">
            <div className="image-wrapper"><img src="/images/food-hero.svg" alt="" className="main-hero-img" /></div>
          </div>
        </section>

        <section className="categories-section" aria-labelledby="category-heading">
          <div className="section-header"><h2 id="category-heading">Browse categories</h2></div>
          <div className="category-list">
            <button className={category === "all" ? "category-card selected" : "category-card"} onClick={() => selectCategory("all")}>
              <i className="bx bx-grid-alt" style={{ fontSize: 45, color: "var(--primary-color)" }} /><h3>All dishes</h3>
            </button>
            {categories.map(item => (
              <button key={item.id} className={category === item.id ? "category-card selected" : "category-card"} onClick={() => selectCategory(item.id)}>
                <img src={item.image} alt="" /><h3>{item.name}</h3>
              </button>
            ))}
          </div>
        </section>

        <section className="menu-section" id="menu" aria-labelledby="menu-heading">
          <div className="section-header menu-header-complex">
            <div className="menu-title-area">
              <h2 id="menu-heading">Available menu</h2>
              <div className="veg-toggle-container">
                <span className="veg-label">Vegetarian only</span>
                <label className="switch">
                  <input type="checkbox" checked={vegOnly} onChange={event => setVegOnly(event.target.checked)} />
                  <span className="slider round" />
                </label>
              </div>
            </div>
            <div className="filters-container">
              <label className="sr-only" htmlFor="restaurant-filter">Filter by restaurant</label>
              <select id="restaurant-filter" className="restaurant-dropdown" value={restaurant} onChange={event => setRestaurant(event.target.value)}>
                <option value="all">All restaurants</option>
                {restaurants.map(name => <option value={name} key={name}>{name}</option>)}
              </select>
              <div className="filters" aria-label="Filter by category">
                {["all", ...categories.map(item => item.id)].map(value => (
                  <button key={value} className={"filter-btn " + (category === value ? "active" : "")} onClick={() => setCategory(value)}>
                    {value === "all" ? "All" : categories.find(item => item.id === value)?.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {menuError ? (
            <div className="menu-state" role="alert">
              <p>{menuError}</p><button className="btn-primary" onClick={loadMenu}>Retry</button>
            </div>
          ) : menuLoading ? (
            <p className="menu-state" role="status">Loading menu…</p>
          ) : filtered.length ? (
            <div className="menu-grid">
              {filtered.map(item => (
                <FoodCard key={item.id} item={{
                  ...item,
                  restaurant: item.restaurantName || item.restaurant || "",
                  image: item.imageUrl || item.image || "",
                  type: item.type || (item.vegetarian ? "veg" : "nonveg")
                }} onAdd={addToCart} />
              ))}
            </div>
          ) : (
            <div className="menu-state" role="status">
              <p>{liveMenu.length ? "No available dishes match these filters." : "No menu items are currently available."}</p>
              {category !== "all" || restaurant !== "all" || vegOnly || search ? <button className="btn-secondary" onClick={() => { setCategory("all"); setRestaurant("all"); setVegOnly(false); setSearch(""); }}>Clear filters</button> : null}
            </div>
          )}
        </section>

        <section className="cart-overlay" aria-hidden={!cartOpen} style={{ display: cartOpen ? "block" : "none" }} onClick={() => setCartOpen(false)} />
        <aside className={"cart-sidebar " + (cartOpen ? "active" : "")} aria-label="Shopping cart" aria-hidden={!cartOpen}>
          <div className="cart-header"><h2>Your cart</h2><button className="close-cart" aria-label="Close cart" onClick={() => setCartOpen(false)}><i className="bx bx-x" /></button></div>
          <div className="cart-items-container">
            {!cart.length ? <div className="empty-cart"><i className="bx bx-shopping-bag" /><p>Your cart is empty.</p></div> : cart.map(item => (
              <div className="cart-item" key={item.id}>
                {item.imageUrl || item.image ? <img src={item.imageUrl || item.image} alt="" /> : null}
                <div className="cart-item-info"><div className="cart-item-title">{item.name}</div><div className="cart-item-price">{money(item.price)}</div></div>
                <div className="cart-item-actions"><button className="qty-btn" aria-label={`Remove one ${item.name}`} onClick={() => changeQty(item.id, -1)}>-</button><span className="cart-item-qty">{item.qty}</span><button className="qty-btn" aria-label={`Add one ${item.name}`} onClick={() => changeQty(item.id, 1)}>+</button></div>
              </div>
            ))}
          </div>
          <div className="cart-footer">
            <div className="cart-summary"><div className="summary-row"><span>Subtotal</span><span>{money(subtotal)}</span></div><div className="summary-row"><span>Delivery fee</span><span>{money(count ? DELIVERY_FEE : 0)}</span></div><div className="summary-row total"><span>Total</span><span>{money(total)}</span></div></div>
            {cart.length > 0 && <form id="customer-details" className="order-details" onSubmit={checkout}>
              <label>Full name<input required autoComplete="name" value={checkoutDetails.customerName} onChange={event => setCheckoutDetails({ ...checkoutDetails, customerName: event.target.value })} /></label>
              <label>Email address<input required type="email" autoComplete="email" value={checkoutDetails.customerEmail} onChange={event => setCheckoutDetails({ ...checkoutDetails, customerEmail: event.target.value })} /></label>
              <label>Phone number<input required type="tel" autoComplete="tel" value={checkoutDetails.customerPhone} onChange={event => setCheckoutDetails({ ...checkoutDetails, customerPhone: event.target.value })} /></label>
              <label>Delivery address<input required autoComplete="street-address" value={checkoutDetails.deliveryAddress} onChange={event => setCheckoutDetails({ ...checkoutDetails, deliveryAddress: event.target.value })} /></label>
              <button className="btn-primary checkout-btn" type="submit" disabled={checkoutState === "Submitting order…"}>{checkoutState === "Submitting order…" ? "Submitting…" : "Place order"} <i className="bx bx-right-arrow-alt" /></button>
            </form>}
            {checkoutState && <p className="checkout-status" role="status">{checkoutState}</p>}
          </div>
        </aside>
      </main>
    </div>
  );
}

function FoodCard({ item, onAdd }) {
  const [imageFailed, setImageFailed] = useState(false);
  return (
    <article className="food-card">
      <div className="food-img-wrap">
        {item.image && !imageFailed ? <img src={item.image} alt={item.name} onError={() => setImageFailed(true)} /> : <div className="food-image-unavailable" aria-label="No image available" />}
        <div className={"diet-indicator " + item.type}><span className="diet-dot" /></div>
      </div>
      <div className="food-info"><div className="restaurant-name">{item.restaurant}</div><h3 className="food-title">{item.name}</h3><p className="food-desc">{item.description}</p>
        <div className="food-bottom"><span className="food-price">{money(item.price)}</span><button className="add-to-cart" onClick={() => onAdd(item)} aria-label={"Add " + item.name + " to cart"}><i className="bx bx-plus" /></button></div>
      </div>
    </article>
  );
}

export default App;
