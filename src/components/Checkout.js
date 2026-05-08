import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const API = "http://192.168.2.21:5000/api";

const CheckItems = () => {
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);

  const selectedAddress = addresses.find(a => a.id === selectedId);

  const [coords, setCoords] = useState(null);

  // ✅ CREDIT STATES
  // const [paymentMethod, setPaymentMethod] = useState("COD");
  // const [paymentMethod, setPaymentMethod] = useState("");
  const [creditInfo, setCreditInfo] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    altPhone: "",
    pincode: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    landmark: "",
    type: "Home",
  });
useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) return;

  fetch(`${API}/restaurant/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then((user) => {
      const newId = Date.now();

      // ✅ form set
      setFormData({
        name: user?.name || "",
        phone: user?.phone || "",
        altPhone: "",
        pincode: "",
        address1: "",
        address2: "",
        city: "",
        state: "",
        landmark: "",
        type: "Home",
      });

      // ✅ address create HERE (IMPORTANT)
      setAddresses([
        {
          id: newId,
          name: user?.name || "Current Location",
          phone: user?.phone || "",
          address: "Detecting location...",
          isDefault: true,
        },
      ]);

      setSelectedId(newId);
    })
    .catch((err) => console.log(err));
}, []);
  /* ================= CREDIT FETCH ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${API}/restaurant/credit-info`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setCreditInfo)
      .catch(() => {});
  }, []);

  /* ================= AUTO LOCATION ================= */
 useEffect(() => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;

      setCoords({
        lat: latitude,
        lng: longitude,
      });

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        );
        const data = await res.json();

        const addressText = data.display_name || "Current Location";

        // ✅ ONLY UPDATE ADDRESS
        setAddresses((prev) =>
          prev.map((addr) => ({
            ...addr,
            address: addressText,
          }))
        );
      } catch (err) {
        console.log(err);
      }
    });
  }
}, []);
  /* ================= USER AUTO FILL ================= */
useEffect(() => {
  try {
    const userData = localStorage.getItem("user");

    if (userData) {
      const user = JSON.parse(userData);

      setFormData((prev) => ({
        ...prev,
        name: user?.name || "",
        phone: user?.phone || "",
        city: user?.city || "",
      }));
    }
  } catch (err) {
    console.log("User parse error", err);
  }
}, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const deleteAddress = (id) => {
    setAddresses(addresses.filter((addr) => addr.id !== id));
  };

  const setDefault = (id) => {
    setAddresses(
      addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
    setSelectedId(id);
  };

  /* ================= SUBMIT ================= */
// const handleSubmit = async (e) => {
//   e.preventDefault();

//   try {
//     const TOKEN = localStorage.getItem("token");

//     if (!TOKEN) {
//       alert("Login expired");
//       return;
//     }

//     if (!coords) {
//       alert("Location not detected yet");
//       return;
//     }

//     if (!paymentMethod) {
//       alert("Select payment method");
//       return;
//     }

//     // =============================
//     // 🚀 STEP 1: CREATE ORDER
//     // =============================
//     const res = await fetch(`${API}/checkout`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${TOKEN}`,
//       },
//       body: JSON.stringify({
//         name: formData.name,
//         phone: formData.phone,
//         address:
//           selectedAddress?.address ||
//           `${formData.address1}, ${formData.city}`,
//         note: formData.landmark,
//         latitude: coords.lat,
//         longitude: coords.lng,
//         payment_method:
//         paymentMethod === "CREDIT"
//           ? "CREDIT"
//           : paymentMethod === "COD"
//           ? "COD"
//           : "ONLINE",
//       }),
//     });

//     const data = await res.json();

//     if (!res.ok) {
//       alert(data.error || "Checkout failed");
//       return;
//     }

//     if (!data.orders_created || data.orders_created.length === 0) {
//       alert("Order not created");
//       return;
//     }

//     const firstOrder = data.orders_created[0];

//     console.log("✅ ORDER CREATED:", firstOrder.order_id);

//     // =============================
//     // ✅ STORE ORDER
//     // =============================
//     localStorage.setItem("order_id", firstOrder.order_id);
//     localStorage.setItem("total_amount", firstOrder.amount);

//     // =============================
//     // 🚀 CREDIT FLOW
//     // =============================
//     if (paymentMethod === "CREDIT") {
//       if (creditInfo?.credit_available <= 0) {
//         alert("Insufficient credit balance");
//         return;
//       }

//       if (creditInfo?.overdue_amount > 0) {
//         alert("You have overdue payments.");
//         return;
//       }

//       localStorage.setItem("success_order_id", firstOrder.order_id);
//       navigate("/success");
//       return;
//     }

//     // =============================
//     // 🚀 COD FLOW (NEW 🔥)
//     // =============================
//     if (paymentMethod === "COD") {
//       const payRes = await fetch(`${API}/payment/`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${TOKEN}`,
//         },
//         body: JSON.stringify({
//           order_id: firstOrder.order_id,
//           payment_method: "cod",
//           amount: firstOrder.amount,
//         }),
//       });

//       const payData = await payRes.json();

//       if (!payRes.ok) {
//         alert(payData.error || "Payment failed");
//         return;
//       }

//       // ✅ SUCCESS
//       localStorage.setItem("success_order_id", firstOrder.order_id);
//       localStorage.removeItem("order_id");
//       localStorage.removeItem("total_amount");

//       navigate("/success");
//       return;
//     }

//     // =============================
//     // 🚀 FUTURE ONLINE PAYMENTS
//     // =============================
//     navigate("/payment");

//   } catch (err) {
//     console.error(err);
//     alert("Checkout failed");
//   }
// };


const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const TOKEN = localStorage.getItem("token");

    // ✅ LOGIN CHECK
    if (!TOKEN) {
      alert("Login expired");
      return;
    }

    // ✅ USER INPUT VALIDATION
    if (!formData.name || !formData.phone) {
      alert("Name and phone are required");
      return;
    }

    // ✅ ADDRESS FIX
    const finalAddress =
      selectedAddress?.address ||
      (formData.address1 && formData.city
        ? `${formData.address1}, ${formData.city}`
        : null);

    if (!finalAddress) {
      alert("Please enter address");
      return;
    }

    // ✅ LOCATION CHECK
    if (!coords) {
      alert("Location not detected yet");
      return;
    }

    // 🚀 CREATE ORDER
    const res = await fetch(`${API}/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({
        name: formData.name,
        phone: formData.phone,
        address: finalAddress, // ✅ fixed
        note: formData.landmark || "",
        latitude: coords?.lat || 0,
        longitude: coords?.lng || 0,
      }),
    });

    const data = await res.json();

    // ❌ API ERROR
    if (!res.ok) {
      console.error("Checkout error:", data);
      alert(data?.error || "Checkout failed");
      return;
    }

    const firstOrder = data?.orders_created?.[0];

    if (!firstOrder) {
      alert("Order not created");
      return;
    }

    console.log("✅ ORDER CREATED:", firstOrder);

    // ✅ STORE ORDER
    localStorage.setItem("order_id", firstOrder.order_id);
    localStorage.setItem("total_amount", firstOrder.amount);

    // 🚀 NAVIGATE
    navigate("/payment");

  } catch (err) {
    console.error("❌ Checkout crash:", err);
    alert("Checkout failed. Try again.");
  }
};
  /* ================= CART ================= */
  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];

  const subtotalFromCart = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const savedSummary = JSON.parse(localStorage.getItem("cart_summary")) || {
    subtotal: subtotalFromCart,
    delivery: 0,
    discount: 0,
    total: subtotalFromCart,
  };

  const { subtotal, delivery, discount, total } = savedSummary;

  return (
    <section className="checkout pt_100 pb-80">
      <div className="container">
        <div className="row">

          <div className="col-lg-8">
                        {/* ✅ CREDIT BOX */}
              {creditInfo && (
                <div className="credit_summary_box">

                  <div className="credit_summary_header">
                    <i className="fas fa-wallet"></i>
                    <span>Business Credit</span>
                  </div>

                  <div className="credit_summary_grid">

                    <div>
                      <small>Limit</small>
                      <strong>QAR  {creditInfo.credit_limit}</strong>
                    </div>

                    <div>
                      <small>Used</small>
                      <strong>QAR  {creditInfo.credit_used}</strong>
                    </div>

                    <div>
                      <small>Available</small>
                      <strong className="credit_available">
                        QAR  {creditInfo.credit_available}
                      </strong>
                    </div>

                    <div>
                      <small>Credit Period</small>
                      <strong>{creditInfo.credit_days} days</strong>
                    </div>

                    {creditInfo.next_due_date && (
                      <div>
                        <small>Next Due</small>
                        <strong>
                          {new Date(creditInfo.next_due_date).toLocaleDateString()}
                        </strong>
                      </div>
                    )}

                    {creditInfo.overdue_amount > 0 && (
                      <div className="credit_overdue">
                        Overdue:QAR  {creditInfo.overdue_amount}
                      </div>
                    )}

                  </div>
                </div>
              )}

            <div className="shipping_address_box">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3>Shipping Address</h3>
                <button
                  className="add_address_btn"
                  onClick={() => {
                    setShowForm(!showForm);
                    setEditId(null);
                  }}
                >
                  + Add New Address
                </button>
              </div>

              {/* ADDRESS LIST */}
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`address_card ${selectedId === addr.id ? "active" : ""}`}
                >
                  <div className="address_row">

                    <div className="address_left">
                      <input
                        type="radio"
                        checked={selectedId === addr.id}
                        onChange={() => setSelectedId(addr.id)}
                      />

                      <div className="address_content">
                        <div className="address_header">
                          <h5>{addr.name}</h5>
                          {addr.isDefault && (
                            <span className="default_badge">Default</span>
                          )}
                        </div>

                        <p className="address_text">{addr.address}</p>
                        <small className="phone_text">
                          Phone: {addr.phone}
                        </small>
                      </div>
                    </div>

                    <div className="address_right">
                      <button onClick={() => setEditId(addr.id)}>Edit</button>
                      <button onClick={() => deleteAddress(addr.id)}>Delete</button>
                      {!addr.isDefault && (
                        <button onClick={() => setDefault(addr.id)}>
                          Make Default
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              ))}



              {/* FORM */}
              <div className={`address_form_wrapper ${showForm ? "open" : ""}`}>
                {showForm && (

                  <form className="checkout_form mt-4" onSubmit={handleSubmit}>
                    <div className="row">

                      <div className="col-md-6">
                        <input name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" />
                      </div>

                      <div className="col-md-6">
                        <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" />
                      </div>

                      <div className="col-md-6">
                        <input name="altPhone" value={formData.altPhone} onChange={handleChange} placeholder="Alt Phone" />
                      </div>

                      <div className="col-md-6">
                        <input name="pincode" value={formData.pincode} onChange={handleChange} placeholder="Pincode" />
                      </div>

                      <div className="col-12">
                        <input name="address1" value={formData.address1} onChange={handleChange} placeholder="Address 1" />
                      </div>

                      <div className="col-12">
                        <input name="address2" value={formData.address2} onChange={handleChange} placeholder="Address 2" />
                      </div>

                      <div className="col-md-6">
                        <input name="city" value={formData.city} onChange={handleChange} placeholder="City" />
                      </div>

                      <div className="col-md-6">
                        <input name="state" value={formData.state} onChange={handleChange} placeholder="State" />
                      </div>

                      <div className="col-md-6">
                        <input name="landmark" value={formData.landmark} onChange={handleChange} placeholder="Landmark" />
                      </div>

                      <div className="col-12 mt-3">
                        <label>
                          <input type="radio" name="type" value="Home" onChange={handleChange} /> Home
                        </label>
                        <label>
                          <input type="radio" name="type" value="Office" onChange={handleChange} /> Office
                        </label>
                      </div>

                      <div className="col-12 mt-4">
                        <button type="submit" className="common_btn">
                          Save Address
                        </button>
                      </div>

                    </div>
                  </form>

                )}
              </div>
            {/* ✅ PAYMENT METHOD */}
            {/* <div className="checkout_input_box mt-4">
              <label>Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="COD">Cash on Delivery</option>
                <option value="CREDIT">Credit</option>
              </select>
            </div> */}

            {/* <div className="payment-methods mt-4">

              {/* CREDIT */}
              {/* <label
                className={`payment-option ${paymentMethod === "CREDIT" ? "active" : ""}`}
                onClick={() => setPaymentMethod("CREDIT")}
              >
                <input type="radio" checked={paymentMethod === "CREDIT"} readOnly />
                <span>Pay using Credit</span>
              </label> */}

              {/* COD */}
              {/* <label
                className={`payment-option ${paymentMethod === "COD" ? "active" : ""}`}
                onClick={() => setPaymentMethod("COD")}
              >
                <input type="radio" checked={paymentMethod === "COD"} readOnly />
                <span>Cash on Delivery</span>
              </label> */}

              {/* 🔥 NEW ONLINE OPTION */}
              {/* <label
                className={`payment-option ${paymentMethod === "ONLINE" ? "active" : ""}`}
                onClick={() => setPaymentMethod("ONLINE")}
              >
                <input type="radio" checked={paymentMethod === "ONLINE"} readOnly />
                <span>Online Payment</span>
              </label> */}

            {/* </div> */} 

            <button
  onClick={handleSubmit}
  className="common_btn mt-3"
>
  Proceed
</button>

            {/* {creditInfo?.overdue_amount > 0 && (
              <p style={{ color: "red", marginTop: "10px" }}>
                ⚠️ Your account has overdue amount of QAR {creditInfo.overdue_amount}.  
                Please clear dues to use credit.
              </p>
            )} */}
            </div>

          </div>

          {/* CART */}
           <div className="col-lg-4 col-md-8">
            <div className="cart_sidebar">
              <h3>Total Cart ({cartItems.length})</h3>
              <div className="cart_sidebar_info">
                <h4>Subtotal : <span>QAR {subtotal.toFixed(2)}</span></h4>
                <p>Delivery : <span>QAR {delivery}</span></p>
                <p>Discount : <span>-QAR {discount}</span></p>
                <h5>Total : <span>QAR {total.toFixed(2)}</span></h5>

                
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CheckItems;


// import React, { useState, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";

// const API = "http://192.168.2.21:5000/api";

// const CheckItems = () => {
//   const navigate = useNavigate();

//   const [addresses, setAddresses] = useState([]);
//   const [selectedId, setSelectedId] = useState(null);
//   const [showForm, setShowForm] = useState(false);
//   const [editId, setEditId] = useState(null);

//   const selectedAddress = addresses.find(a => a.id === selectedId);

//   const [coords, setCoords] = useState(null);

//   // ✅ CREDIT STATES
//   // const [paymentMethod, setPaymentMethod] = useState("COD");
//   const [paymentMethod, setPaymentMethod] = useState("");
//   const [creditInfo, setCreditInfo] = useState(null);

//   const [formData, setFormData] = useState({
//     name: "",
//     phone: "",
//     altPhone: "",
//     pincode: "",
//     address1: "",
//     address2: "",
//     city: "",
//     state: "",
//     landmark: "",
//     type: "Home",
//   });

//   /* ================= CREDIT FETCH ================= */
//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (!token) return;

//     fetch(`${API}/restaurant/credit-info`, {
//       headers: { Authorization: `Bearer ${token}` },
//     })
//       .then((res) => res.json())
//       .then(setCreditInfo)
//       .catch(() => {});
//   }, []);

//   /* ================= AUTO LOCATION ================= */
//   useEffect(() => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(async (pos) => {
//         const { latitude, longitude } = pos.coords;

//         setCoords({
//           lat: latitude,
//           lng: longitude,
//         });

//         try {
//           const res = await fetch(
//             `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
//           );
//           const data = await res.json();

//           const addressText = data.display_name || "Current Location";

//           const newId = Date.now();

//           setAddresses([
//             {
//               id: newId,
//               name: "Current Location",
//               phone: "",
//               address: addressText,
//               isDefault: true,
//             },
//           ]);

//           setSelectedId(newId);
//         } catch {}
//       });
//     }
//   }, []);

//   /* ================= USER AUTO FILL ================= */
//   useEffect(() => {
//     const user = JSON.parse(localStorage.getItem("user"));
//     if (user) {
//       setFormData((prev) => ({
//         ...prev,
//         name: user.name || "",
//         phone: user.phone || "",
//         city: user.city || "",
//       }));
//     }
//   }, []);

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const deleteAddress = (id) => {
//     setAddresses(addresses.filter((addr) => addr.id !== id));
//   };

//   const setDefault = (id) => {
//     setAddresses(
//       addresses.map((addr) => ({
//         ...addr,
//         isDefault: addr.id === id,
//       }))
//     );
//     setSelectedId(id);
//   };

//   /* ================= SUBMIT ================= */
// const handleSubmit = async (e) => {
//   e.preventDefault();

//   try {
//     const TOKEN = localStorage.getItem("token");

//     if (!TOKEN) {
//       alert("Login expired");
//       return;
//     }

//     if (!coords) {
//       alert("Location not detected yet");
//       return;
//     }

//     if (!paymentMethod) {
//       alert("Select payment method");
//       return;
//     }

//     // =============================
//     // 🚀 STEP 1: CREATE ORDER
//     // =============================
//     const res = await fetch(`${API}/checkout`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${TOKEN}`,
//       },
//       body: JSON.stringify({
//         name: formData.name,
//         phone: formData.phone,
//         address:
//           selectedAddress?.address ||
//           `${formData.address1}, ${formData.city}`,
//         note: formData.landmark,
//         latitude: coords.lat,
//         longitude: coords.lng,
//         payment_method:
//         paymentMethod === "CREDIT"
//           ? "CREDIT"
//           : paymentMethod === "COD"
//           ? "COD"
//           : "ONLINE",
//       }),
//     });

//     const data = await res.json();

//     if (!res.ok) {
//       alert(data.error || "Checkout failed");
//       return;
//     }

//     if (!data.orders_created || data.orders_created.length === 0) {
//       alert("Order not created");
//       return;
//     }

//     const firstOrder = data.orders_created[0];

//     console.log("✅ ORDER CREATED:", firstOrder.order_id);

//     // =============================
//     // ✅ STORE ORDER
//     // =============================
//     localStorage.setItem("order_id", firstOrder.order_id);
//     localStorage.setItem("total_amount", firstOrder.amount);

//     // =============================
//     // 🚀 CREDIT FLOW
//     // =============================
//     if (paymentMethod === "CREDIT") {
//       if (creditInfo?.credit_available <= 0) {
//         alert("Insufficient credit balance");
//         return;
//       }

//       if (creditInfo?.overdue_amount > 0) {
//         alert("You have overdue payments.");
//         return;
//       }

//       localStorage.setItem("success_order_id", firstOrder.order_id);
//       navigate("/success");
//       return;
//     }

//     // =============================
//     // 🚀 COD FLOW (NEW 🔥)
//     // =============================
//     if (paymentMethod === "COD") {
//       const payRes = await fetch(`${API}/payment/`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${TOKEN}`,
//         },
//         body: JSON.stringify({
//           order_id: firstOrder.order_id,
//           payment_method: "cod",
//           amount: firstOrder.amount,
//         }),
//       });

//       const payData = await payRes.json();

//       if (!payRes.ok) {
//         alert(payData.error || "Payment failed");
//         return;
//       }

//       // ✅ SUCCESS
//       localStorage.setItem("success_order_id", firstOrder.order_id);
//       localStorage.removeItem("order_id");
//       localStorage.removeItem("total_amount");

//       navigate("/success");
//       return;
//     }

//     // =============================
//     // 🚀 FUTURE ONLINE PAYMENTS
//     // =============================
//     navigate("/payment");

//   } catch (err) {
//     console.error(err);
//     alert("Checkout failed");
//   }
// };
//   /* ================= CART ================= */
//   const cartItems = JSON.parse(localStorage.getItem("cart")) || [];

//   const subtotalFromCart = cartItems.reduce(
//     (sum, item) => sum + item.price * item.quantity,
//     0
//   );

//   const savedSummary = JSON.parse(localStorage.getItem("cart_summary")) || {
//     subtotal: subtotalFromCart,
//     delivery: 0,
//     discount: 0,
//     total: subtotalFromCart,
//   };

//   const { subtotal, delivery, discount, total } = savedSummary;

//   return (
//     <section className="checkout pt_100 pb-80">
//       <div className="container">
//         <div className="row">

//           <div className="col-lg-8">
//                         {/* ✅ CREDIT BOX */}
//               {creditInfo && (
//                 <div className="credit_summary_box">

//                   <div className="credit_summary_header">
//                     <i className="fas fa-wallet"></i>
//                     <span>Business Credit</span>
//                   </div>

//                   <div className="credit_summary_grid">

//                     <div>
//                       <small>Limit</small>
//                       <strong>QAR  {creditInfo.credit_limit}</strong>
//                     </div>

//                     <div>
//                       <small>Used</small>
//                       <strong>QAR  {creditInfo.credit_used}</strong>
//                     </div>

//                     <div>
//                       <small>Available</small>
//                       <strong className="credit_available">
//                         QAR  {creditInfo.credit_available}
//                       </strong>
//                     </div>

//                     <div>
//                       <small>Credit Period</small>
//                       <strong>{creditInfo.credit_days} days</strong>
//                     </div>

//                     {creditInfo.next_due_date && (
//                       <div>
//                         <small>Next Due</small>
//                         <strong>
//                           {new Date(creditInfo.next_due_date).toLocaleDateString()}
//                         </strong>
//                       </div>
//                     )}

//                     {creditInfo.overdue_amount > 0 && (
//                       <div className="credit_overdue">
//                         Overdue:QAR  {creditInfo.overdue_amount}
//                       </div>
//                     )}

//                   </div>
//                 </div>
//               )}

//             <div className="shipping_address_box">
//               <div className="d-flex justify-content-between align-items-center mb-3">
//                 <h3>Shipping Address</h3>
//                 <button
//                   className="add_address_btn"
//                   onClick={() => {
//                     setShowForm(!showForm);
//                     setEditId(null);
//                   }}
//                 >
//                   + Add New Address
//                 </button>
//               </div>

//               {/* ADDRESS LIST */}
//               {addresses.map((addr) => (
//                 <div
//                   key={addr.id}
//                   className={`address_card ${selectedId === addr.id ? "active" : ""}`}
//                 >
//                   <div className="address_row">

//                     <div className="address_left">
//                       <input
//                         type="radio"
//                         checked={selectedId === addr.id}
//                         onChange={() => setSelectedId(addr.id)}
//                       />

//                       <div className="address_content">
//                         <div className="address_header">
//                           <h5>{addr.name}</h5>
//                           {addr.isDefault && (
//                             <span className="default_badge">Default</span>
//                           )}
//                         </div>

//                         <p className="address_text">{addr.address}</p>
//                         <small className="phone_text">
//                           Phone: {addr.phone}
//                         </small>
//                       </div>
//                     </div>

//                     <div className="address_right">
//                       <button onClick={() => setEditId(addr.id)}>Edit</button>
//                       <button onClick={() => deleteAddress(addr.id)}>Delete</button>
//                       {!addr.isDefault && (
//                         <button onClick={() => setDefault(addr.id)}>
//                           Make Default
//                         </button>
//                       )}
//                     </div>

//                   </div>
//                 </div>
//               ))}



//               {/* FORM */}
//               <div className={`address_form_wrapper ${showForm ? "open" : ""}`}>
//                 {showForm && (

//                   <form className="checkout_form mt-4" onSubmit={handleSubmit}>
//                     <div className="row">

//                       <div className="col-md-6">
//                         <input name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" />
//                       </div>

//                       <div className="col-md-6">
//                         <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" />
//                       </div>

//                       <div className="col-md-6">
//                         <input name="altPhone" value={formData.altPhone} onChange={handleChange} placeholder="Alt Phone" />
//                       </div>

//                       <div className="col-md-6">
//                         <input name="pincode" value={formData.pincode} onChange={handleChange} placeholder="Pincode" />
//                       </div>

//                       <div className="col-12">
//                         <input name="address1" value={formData.address1} onChange={handleChange} placeholder="Address 1" />
//                       </div>

//                       <div className="col-12">
//                         <input name="address2" value={formData.address2} onChange={handleChange} placeholder="Address 2" />
//                       </div>

//                       <div className="col-md-6">
//                         <input name="city" value={formData.city} onChange={handleChange} placeholder="City" />
//                       </div>

//                       <div className="col-md-6">
//                         <input name="state" value={formData.state} onChange={handleChange} placeholder="State" />
//                       </div>

//                       <div className="col-md-6">
//                         <input name="landmark" value={formData.landmark} onChange={handleChange} placeholder="Landmark" />
//                       </div>

//                       <div className="col-12 mt-3">
//                         <label>
//                           <input type="radio" name="type" value="Home" onChange={handleChange} /> Home
//                         </label>
//                         <label>
//                           <input type="radio" name="type" value="Office" onChange={handleChange} /> Office
//                         </label>
//                       </div>

//                       <div className="col-12 mt-4">
//                         <button type="submit" className="common_btn">
//                           Save Address
//                         </button>
//                       </div>

//                     </div>
//                   </form>

//                 )}
//               </div>
//             {/* ✅ PAYMENT METHOD */}
//             {/* <div className="checkout_input_box mt-4">
//               <label>Payment Method</label>
//               <select
//                 value={paymentMethod}
//                 onChange={(e) => setPaymentMethod(e.target.value)}
//               >
//                 <option value="COD">Cash on Delivery</option>
//                 <option value="CREDIT">Credit</option>
//               </select>
//             </div> */}

//             <div className="payment-methods mt-4">

//               {/* CREDIT */}
//               <label
//                 className={`payment-option ${paymentMethod === "CREDIT" ? "active" : ""}`}
//                 onClick={() => setPaymentMethod("CREDIT")}
//               >
//                 <input type="radio" checked={paymentMethod === "CREDIT"} readOnly />
//                 <span>Pay using Credit</span>
//               </label>

//               {/* COD */}
//               <label
//                 className={`payment-option ${paymentMethod === "COD" ? "active" : ""}`}
//                 onClick={() => setPaymentMethod("COD")}
//               >
//                 <input type="radio" checked={paymentMethod === "COD"} readOnly />
//                 <span>Cash on Delivery</span>
//               </label>

//               {/* 🔥 NEW ONLINE OPTION */}
//               <label
//                 className={`payment-option ${paymentMethod === "ONLINE" ? "active" : ""}`}
//                 onClick={() => setPaymentMethod("ONLINE")}
//               >
//                 <input type="radio" checked={paymentMethod === "ONLINE"} readOnly />
//                 <span>Online Payment</span>
//               </label>

//             </div>

//             <button
//               onClick={handleSubmit}
//               className="common_btn mt-3"
//               disabled={!paymentMethod}
//             >
//               Proceed
//             </button>

//             {creditInfo?.overdue_amount > 0 && (
//               <p style={{ color: "red", marginTop: "10px" }}>
//                 ⚠️ Your account has overdue amount of QAR {creditInfo.overdue_amount}.  
//                 Please clear dues to use credit.
//               </p>
//             )}
//             </div>

//           </div>

//           {/* CART */}
//            <div className="col-lg-4 col-md-8">
//             <div className="cart_sidebar">
//               <h3>Total Cart ({cartItems.length})</h3>
//               <div className="cart_sidebar_info">
//                 <h4>Subtotal : <span>${subtotal.toFixed(2)}</span></h4>
//                 <p>Delivery : <span>${delivery}</span></p>
//                 <p>Discount : <span>-${discount}</span></p>
//                 <h5>Total : <span>${total.toFixed(2)}</span></h5>

                
//               </div>
//             </div>
//           </div>

//         </div>
//       </div>
//     </section>
//   );
// };

// export default CheckItems;