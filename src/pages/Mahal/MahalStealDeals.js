// import React, { useEffect, useRef, useState } from "react";
// import axios from "axios";

// const API_BASE = "http://192.168.2.21:5000";

// const MahalStealDeals = () => {
//   const scrollRef = useRef(null);

//   const [pause, setPause] = useState(false);
//   const [cart, setCart] = useState({});
//   const [deals, setDeals] = useState([]);
//   const [startIndex, setStartIndex] = useState(0); // ✅ control window
//   const [loading, setLoading] = useState(true);

//   /* ================= FETCH ================= */
//   useEffect(() => {
//     const fetchDeals = async () => {
//       try {
//         const res = await axios.get(`${API_BASE}/api/deals`);

//         const formatted = (res.data || []).map((item) => ({
//           id: item.id,
//           dealTitle: item.deal_title,
//           name: item.name,
//           qty: item.qty,
//           price: item.price,
//           oldPrice: item.old_price,
//           img: item.image
//             ? item.image.startsWith("http")
//               ? item.image.replace("127.0.0.1", "localhost")
//               : `data:image/jpeg;base64,${item.image}`
//             : `${API_BASE}/static/products/default.png`,
//         }));

//         setDeals(formatted);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDeals();
//   }, []);

//   /* ================= AUTO CHANGE (3 sec) ================= */
//   useEffect(() => {
//     if (deals.length === 0) return;

//     const interval = setInterval(() => {
//       if (pause) return;

//       setStartIndex((prev) => {
//         const next = prev + 1;
//         return next >= deals.length ? 0 : next;
//       });
//     }, 300000); // ✅ 3 seconds

//     return () => clearInterval(interval);
//   }, [deals, pause]);

//   /* ================= GET 8 ITEMS ================= */
//   const visibleDeals = deals.slice(startIndex, startIndex + 6);

//   /* loop fix (end lo break avvakunda) */
//   if (visibleDeals.length < 8 && deals.length > 0) {
//     visibleDeals.push(...deals.slice(0, 6 - visibleDeals.length));
//   }

//   /* ================= CART ================= */
//   const addItem = (item) => {
//     setCart((prev) => ({
//       ...prev,
//       [item.id]: (prev[item.id] || 0) + 1,
//     }));
//   };

//   const removeItem = (item) => {
//     setCart((prev) => {
//       const updated = { ...prev };
//       if (updated[item.id] === 1) delete updated[item.id];
//       else updated[item.id] -= 1;
//       return updated;
//     });
//   };

//   /* ================= UI ================= */
//   return (
//     <div className="container mt-5">
//       <h3 className="mm-steal-title">Steal deals for you</h3>

//       <div
//         className="mm-steal-row"
//         ref={scrollRef}
//         onMouseEnter={() => setPause(true)}
//         onMouseLeave={() => setPause(false)}
//       >
//         {loading && <p>Loading deals...</p>}

//         {!loading &&
//           visibleDeals.map((d) => (
//             <div className="mm-deal-card" key={d.id}>
              
//               <div className="mm-deal-title-badge">
//                 {d.dealTitle}
//               </div>

//               <div className="mm-deal-body">
//                 <span className="mm-deal-qty">{d.qty}</span>

//                 <div className="mm-deal-img">
//                   <img
//                     src={d.img}
//                     alt={d.name}
//                     onError={(e) => {
//                       e.target.onerror = null;
//                       e.target.src = `${API_BASE}/products/default.png`;
//                     }}
//                   />
//                 </div>

//                 <h4 className="mm-deal-title">{d.name}</h4>

//                 <div className="mm-deal-price">
//                   <span className="mm-old-price">QAR {d.oldPrice}</span>
//                   <span className="mm-new-price">QAR {d.price}</span>
//                 </div>

//                 {!cart[d.id] ? (
//                   <button
//                     className="mm-add-btn"
//                     onClick={() => addItem(d)}
//                   >
//                     +
//                   </button>
//                 ) : (
//                   <div className="mm-stepper">
//                     <button onClick={() => removeItem(d)}>-</button>
//                     <span>{cart[d.id]}</span>
//                     <button onClick={() => addItem(d)}>+</button>
//                   </div>
//                 )}
//               </div>
//             </div>
//           ))}
//       </div>
//     </div>
//   );
// };

// export default MahalStealDeals;


















// import React, { useEffect, useRef, useState } from "react";
// import axios from "axios";

// const API_BASE = "http://192.168.2.21:5000";

// const MahalStealDeals = () => {
//   const scrollRef = useRef(null);

//   const [pause, setPause] = useState(false);
//   const [cart, setCart] = useState({});
//   const [deals, setDeals] = useState([]);
//   const [startIndex, setStartIndex] = useState(0);
//   const [loading, setLoading] = useState(true);

//   /* ================= FETCH ================= */
//   useEffect(() => {
//     const fetchDeals = async () => {
//       try {
//         const res = await axios.get(`${API_BASE}/api/deals`);

//         const formatted = (res.data || []).map((item) => ({
//           id: item.id,
//           dealTitle: item.deal_title,
//           name: item.name,
//           qty: item.qty,
//           price: item.price,
//           oldPrice: item.old_price,
//           img: item.image
//             ? item.image.startsWith("http")
//               ? item.image.replace("127.0.0.1", "localhost")
//               : `${API_BASE}${item.image}`
//             : null,
//         }));

//         setDeals(formatted);
//       } catch (err) {
//         console.error("❌ FETCH ERROR:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDeals();
//   }, []);

//   /* ================= AUTO CHANGE ================= */
//   useEffect(() => {
//     if (deals.length === 0) return;

//     const interval = setInterval(() => {
//       if (pause) return;

//       setStartIndex((prev) => {
//         const next = prev + 1;
//         return next >= deals.length ? 0 : next;
//       });
//     }, 3000);

//     return () => clearInterval(interval);
//   }, [deals, pause]);

//   /* ================= GET 6 ITEMS ================= */
//   let visibleDeals = deals.slice(startIndex, startIndex + 6);

//   if (visibleDeals.length < 6 && deals.length > 0) {
//     visibleDeals = [
//       ...visibleDeals,
//       ...deals.slice(0, 6 - visibleDeals.length),
//     ];
//   }

//   /* ================= ADD TO CART ================= */
// const addToCart = async (item) => {
//   let token = localStorage.getItem("token");

//   console.log("🔑 RAW TOKEN:", token);

//   if (!token || token.startsWith("//")) {
//     alert("Invalid token. Please login again");
//     localStorage.removeItem("token");
//     return;
//   }

//   try {
//     await axios.post(
//       `${API_BASE}/api/cart/add`,
//       {
//         product_id: Number(item.id),
//         quantity: 1,
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${token.trim()}`,
//         },
//       }
//     );

//     alert("Added to cart ✅");
//   } catch (err) {
//     console.error("❌ ADD TO CART ERROR:", err.response?.data);

//     if (err.response?.status === 401) {
//       alert("Session expired. Please login again");
//       localStorage.removeItem("token");
//     }
//   }
// };
//   /* ================= CART ================= */
//   const addItem = (item) => {
//     addToCart(item);

//     setCart((prev) => ({
//       ...prev,
//       [item.id]: (prev[item.id] || 0) + 1,
//     }));
//   };

//   const removeItem = (item) => {
//     setCart((prev) => {
//       const updated = { ...prev };
//       if (updated[item.id] === 1) delete updated[item.id];
//       else updated[item.id] -= 1;
//       return updated;
//     });
//   };

//   /* ================= UI ================= */
//   return (
//     <div className="container mt-5">
//       <h3 className="mm-steal-title">Steal deals for you</h3>

//       <div
//         className="mm-steal-row"
//         ref={scrollRef}
//         onMouseEnter={() => setPause(true)}
//         onMouseLeave={() => setPause(false)}
//       >
//         {loading && <p>Loading deals...</p>}

//         {!loading &&
//           visibleDeals.map((d) => (
//             <div className="mm-deal-card" key={d.id}>
              
//               <div className="mm-deal-title-badge">
//                 {d.dealTitle}
//               </div>

//               <div className="mm-deal-body">

//                 <span className="mm-deal-qty">{d.qty}</span>

//                 <div className="mm-deal-img">
//                   {d.img && (
//                     <img
//                       src={d.img}
//                       alt={d.name}
//                       style={{
//                         width: "100%",
//                         height: "140px",
//                         objectFit: "cover",
//                         borderRadius: "10px",
//                       }}
//                       onError={(e) => {
//                         e.target.style.display = "none";
//                       }}
//                     />
//                   )}
//                 </div>

//                 <h4 className="mm-deal-title">{d.name}</h4>

//                 <div className="mm-deal-price">
//                   <span className="mm-old-price">
//                     QAR {d.oldPrice}
//                   </span>
//                   <span className="mm-new-price">
//                     QAR {d.price}
//                   </span>
//                 </div>

//                 {!cart[d.id] ? (
//                   <button
//                     className="mm-add-btn"
//                     onClick={() => addItem(d)}
//                   >
//                     +
//                   </button>
//                 ) : (
//                   <div className="mm-stepper">
//                     <button onClick={() => removeItem(d)}>-</button>
//                     <span>{cart[d.id]}</span>
//                     <button onClick={() => addItem(d)}>+</button>
//                   </div>
//                 )}

//               </div>
//             </div>
//           ))}
//       </div>
//     </div>
//   );
// };

// export default MahalStealDeals;




// import React, { useEffect, useRef, useState } from "react";
// import axios from "axios";

// const API_BASE = "http://192.168.2.21:5000";

// const MahalStealDeals = () => {
//   const scrollRef = useRef(null);

//   const [pause, setPause] = useState(false);
//   const [cart, setCart] = useState({});
//   const [deals, setDeals] = useState([]);
//   const [startIndex, setStartIndex] = useState(0);
//   const [loading, setLoading] = useState(true);

//   /* ================= FETCH ================= */
//   useEffect(() => {
//     const fetchDeals = async () => {
//       try {
//         const res = await axios.get(`${API_BASE}/api/deals`);

//         console.log("🔥 API RESPONSE:", res.data);

//         // ✅ HANDLE ANY RESPONSE FORMAT
//         let apiData = [];

//         if (Array.isArray(res.data)) {
//           apiData = res.data;
//         } else if (res.data.deals) {
//           apiData = res.data.deals;
//         } else if (res.data.products) {
//           apiData = res.data.products;
//         } else {
//           console.warn("Unknown API format");
//         }

//         // ✅ FIX MAPPING
//         const formatted = apiData
//           .map((item) => ({
//             id: item.product_id || item.id,   // important
//             dealTitle: item.deal_title || "Deal",
//             name: item.name || item.product_name_english || "No Name",
//             qty: item.qty || "",
//             price: Number(item.price || item.price_per_unit || 0),
//             oldPrice: Number(item.old_price || 0),
//             img: item.image
//               ? item.image.startsWith("http")
//                 ? item.image
//                 : `${API_BASE}${item.image}`
//               : null,
//           }))
//           .filter((item) => item.id); // remove invalid

//         setDeals(formatted);
//       } catch (err) {
//         console.error("❌ FETCH ERROR:", err.response?.data || err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDeals();
//   }, []);

//   /* ================= AUTO SLIDER ================= */
//   useEffect(() => {
//     if (deals.length === 0) return;

//     const interval = setInterval(() => {
//       if (pause) return;

//       setStartIndex((prev) => {
//         const next = prev + 1;
//         return next >= deals.length ? 0 : next;
//       });
//     }, 3000);

//     return () => clearInterval(interval);
//   }, [deals, pause]);

//   /* ================= GET 6 ITEMS ================= */
//   let visibleDeals = deals.slice(startIndex, startIndex + 6);

//   if (visibleDeals.length < 6 && deals.length > 0) {
//     visibleDeals = [
//       ...visibleDeals,
//       ...deals.slice(0, 6 - visibleDeals.length),
//     ];
//   }

//   /* ================= ADD TO CART ================= */
//   const addToCartAPI = (product) => {
//     const token = localStorage.getItem("token");

//     if (!token) {
//       alert("Please login");
//       return;
//     }

//     axios
//       .post(
//         `${API_BASE}/api/cart/add`,
//         {
//           product_id: Number(product.id), // ✅ correct id
//           quantity: 1,
//           price: product.price,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       )
//       .then(() => {
//         console.log("✅ Added to cart");
//       })
//       .catch((err) => {
//         console.error("❌ ADD ERROR:", err.response?.data || err);
//         alert(err.response?.data?.error || "Backend error");
//       });
//   };

//   /* ================= CART ================= */
//   const add = (item) => {
//     addToCartAPI(item);

//     setCart((prev) => ({
//       ...prev,
//       [item.id]: (prev[item.id] || 0) + 1,
//     }));
//   };

//   const remove = (item) => {
//     setCart((prev) => {
//       const updated = { ...prev };
//       if (updated[item.id] === 1) delete updated[item.id];
//       else updated[item.id] -= 1;
//       return updated;
//     });
//   };

//   /* ================= UI ================= */
//   return (
//     <div className="container mt-5">
//       <h3 className="mm-steal-title">Steal deals for you</h3>

//       <div
//         className="mm-steal-row"
//         ref={scrollRef}
//         onMouseEnter={() => setPause(true)}
//         onMouseLeave={() => setPause(false)}
//       >
//         {loading && <p>Loading deals...</p>}

//         {!loading && visibleDeals.length === 0 && (
//           <p>No deals available</p>
//         )}

//         {!loading &&
//           visibleDeals.map((d) => (
//             <div className="mm-deal-card" key={d.id}>
              
//               <div className="mm-deal-title-badge">
//                 {d.dealTitle}
//               </div>

//               <div className="mm-deal-body">

//                 <span className="mm-deal-qty">{d.qty}</span>

//                 <div className="mm-deal-img">
//                   {d.img && (
//                     <img
//                       src={d.img}
//                       alt={d.name}
//                       style={{
//                         width: "100%",
//                         height: "140px",
//                         objectFit: "cover",
//                         borderRadius: "10px",
//                       }}
//                       onError={(e) => {
//                         e.target.style.display = "none";
//                       }}
//                     />
//                   )}
//                 </div>

//                 <h4 className="mm-deal-title">{d.name}</h4>

//                 <div className="mm-deal-price">
//                   <span className="mm-old-price">
//                     QAR {d.oldPrice}
//                   </span>
//                   <span className="mm-new-price">
//                     QAR {d.price}
//                   </span>
//                 </div>

//                 {/* CART */}
//                 {!cart[d.id] ? (
//                   <button className="mm-add" onClick={() => add(d)}>
//                     Add to Cart
//                   </button>
//                 ) : (
//                   <div className="mm-stepper">
//                     <button onClick={() => remove(d)}>-</button>
//                     <span>{cart[d.id]}</span>
//                     <button onClick={() => add(d)}>+</button>
//                   </div>
//                 )}

//               </div>
//             </div>
//           ))}
//       </div>
//     </div>
//   );
// };

// export default MahalStealDeals;
















import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

const API_BASE = "http://192.168.2.21:5000/api";

const MahalStealDeals = () => {
  const scrollRef = useRef(null);

  const [pause, setPause] = useState(false);
  const [cart, setCart] = useState({});
  const [deals, setDeals] = useState([]);
  const [startIndex, setStartIndex] = useState(0);

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const res = await axios.get(`${API_BASE}/gridlist`);

        const products = res.data.products || [];

        // ✅ FILTER OFFERS
        const offers = products.filter(
          (p) =>
            p.offer_type &&
            (
              p.discount_percentage > 0 ||
              p.flat_amount > 0 ||
              p.buy_quantity > 0
            )
        );

        // ✅ MAP TO YOUR OLD UI FORMAT
        const formatted = offers.map((item) => ({
          id: item.id, // ✅ product_id already
          dealTitle: item.label, // same as old UI
          name: item.name,
          qty: item.unit_of_measure || "",
          price: item.price_numeric, // new price
          oldPrice: item.price_numeric, // keep same (or change if needed)
          img: item.img1, // ✅ IMPORTANT (fix UI)
        }));

        setDeals(formatted);

      } catch (err) {
        console.error("❌ FETCH ERROR:", err);
      }
    };

    fetchDeals();
  }, []);

  /* ================= AUTO ================= */
  useEffect(() => {
    if (deals.length === 0) return;

    const interval = setInterval(() => {
      if (pause) return;

      setStartIndex((prev) =>
        prev + 1 >= deals.length ? 0 : prev + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [deals, pause]);

  /* ================= SLICE ================= */
  let visibleDeals = deals.slice(startIndex, startIndex + 6);

  if (visibleDeals.length < 6 && deals.length > 0) {
    visibleDeals = [
      ...visibleDeals,
      ...deals.slice(0, 6 - visibleDeals.length),
    ];
  }

  /* ================= ADD TO CART ================= */
  const addToCart = async (item) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Login required");
        return;
      }

      await axios.post(
        `${API_BASE}/cart/add`,
        {
          product_id: item.id, // ✅ correct
          quantity: 1,
          price: item.price,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("✅ Added");

    } catch (err) {
      console.error("❌ CART ERROR:", err.response?.data);
      alert(err.response?.data?.error || "Error");
    }
  };

  /* ================= CART ================= */
  const addItem = (item) => {
    addToCart(item);

    setCart((prev) => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + 1,
    }));
  };

  const removeItem = (item) => {
    setCart((prev) => {
      const updated = { ...prev };
      if (updated[item.id] === 1) delete updated[item.id];
      else updated[item.id] -= 1;
      return updated;
    });
  };

  /* ================= UI ================= */
  return (
    <div className="container mt-5">
      <h3 className="mm-steal-title">Steal deals for you</h3>

      <div
        className="mm-steal-row"
        ref={scrollRef}
        onMouseEnter={() => setPause(true)}
        onMouseLeave={() => setPause(false)}
      >
        {visibleDeals.map((d) => (
          <div className="mm-deal-card" key={d.id}>
            
            <div className="mm-deal-title-badge">
              {d.dealTitle}
            </div>

            <div className="mm-deal-body">
              <span className="mm-deal-qty">{d.qty}</span>

              <div className="mm-deal-img">
                <img
                  src={
                    d.img && d.img.trim() !== ""
                      ? d.img.startsWith("http")
                        ? d.img
                        : `${API_BASE}/${d.img}`
                      : null
                  }
                  alt={d.name}
                  onError={(e) => {
                    console.log("Image failed:", d.img);
                    e.target.style.display = "none";
                  }}
                />
              </div>

              <h4 className="mm-deal-title">{d.name}</h4>

              <div className="mm-deal-price">
                <span className="mm-old-price">
                  QAR {d.oldPrice}
                </span>
                <span className="mm-new-price">
                  QAR {d.price}
                </span>
              </div>

              {!cart[d.id] ? (
                <button
                  className="mm-add-btn"
                  onClick={() => addItem(d)}
                >
                  Add
                </button>
              ) : (
                <div className="mm-stepper">
                  <button onClick={() => removeItem(d)}>-</button>
                  <span>{cart[d.id]}</span>
                  <button onClick={() => addItem(d)}>+</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MahalStealDeals;