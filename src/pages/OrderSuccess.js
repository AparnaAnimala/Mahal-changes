

// import React, { useEffect, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";


// const OrderSuccess = () => {
//   const navigate = useNavigate();

//   const [order, setOrder] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(false);

//   useEffect(() => {
//     const orderId = localStorage.getItem("success_order_id");
//     const token = localStorage.getItem("token");

//     if (!orderId || !token) {
//       setError(true);
//       setLoading(false);
//       return;
//     }

//     const fetchOrder = async () => {
//       try {
//         const res = await fetch(
//           `http://192.168.2.22:5000/api/v1/orders/restaurant/${orderId}`, // ✅ FIXED
//           {
//             headers: {
//               Authorization: `Bearer ${token}`
//             }
//           }
//         );

//         if (!res.ok) throw new Error("Order not found");

//         const data = await res.json();
//         setOrder(data);

//         localStorage.removeItem("success_order_id");

//       } catch (err) {
//         console.error(err);
//         setError(true);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrder();
//   }, []);

//   useEffect(() => {
//     if (error) navigate("/");
//   }, [error, navigate]);

//   if (loading) {
//     return <h3 style={{ textAlign: "center" }}>Loading...</h3>;
//   }

//   if (!order) {
//     return null;
//   }

//   return (
  
//     <section className="order_success_page">
//       <div className="success_card">

//          <div className="success_icon">
//           <i className="fas fa-check"></i>
//         </div>

//         <h2>Order Placed Successfully 🎉</h2>
//         <p>Your order has been confirmed</p>

//         <h6>
//           Order ID: <span>#{order.order_id}</span>
//         </h6>

//         <h6>
//           Payment Method: <span>{order.payment_method}</span>
//         </h6>

//         <h6>
//           Total Amount: <span>QAR {order.total_amount}</span>
//         </h6>

//         <div className="success_actions">
//           <Link to="/CategorieList" className="success_btn">
//             Continue Shopping
//           </Link>
//           <Link
//             to="/restaurantdashboard/orders"
//             className="success_btn outline"
//           >
//             View Orders
//           </Link>
//         </div>

//       </div>
//     </section>
//   );
// };

// export default OrderSuccess;




// import React, { useEffect, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";

// const OrderSuccess = () => {
//   const navigate = useNavigate();

//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(false);

//   useEffect(() => {

//     try {

//       // ✅ GET ALL ORDERS
//       const storedOrders =
//         localStorage.getItem("success_orders");

//       if (!storedOrders) {
//         setError(true);
//         setLoading(false);
//         return;
//       }

//       const parsedOrders = JSON.parse(storedOrders);

//       setOrders(parsedOrders);

//       // ✅ CLEAR STORAGE
//       localStorage.removeItem("success_orders");

//     } catch (err) {

//       console.error(err);

//       setError(true);

//     } finally {

//       setLoading(false);
//     }

//   }, []);

//   useEffect(() => {
//     if (error) navigate("/restaurantoffers");
//   }, [error, navigate]);

//   if (loading) {
//     return (
//       <h3 style={{ textAlign: "center" }}>
//         Loading...
//       </h3>
//     );
//   }

//   if (!orders.length) {
//     return null;
//   }

//   return (

//     <section className="order_success_page">

//       <div className="success_card">

//         <div className="success_icon">
//           <i className="fas fa-check"></i>
//         </div>

//         <h2>Order Placed Successfully 🎉</h2>

//         <p>Your order has been confirmed</p>

//         {/* ✅ MULTIPLE ORDERS */}
//         {orders.map((ord, index) => (

//           <div
//             key={index}
//             style={{
//               borderBottom: "1px solid #eee",
//               paddingBottom: "15px",
//               marginBottom: "15px",
//             }}
//           >

//             <h6>
//               Order ID:
//               <span> #{ord.order_id}</span>
//             </h6>

//             <h6>
//               Payment Method:
//               <span>
//                 {" "}
//                 {ord.payment_method || "COD"}
//               </span>
//             </h6>

//             <h6>
//               Total Amount:
//               <span>
//                 {" "}
//                 QAR {ord.amount || ord.total_amount}
//               </span>
//             </h6>

//           </div>

//         ))}

//         <div className="success_actions">

//           <Link
//             to="/CategorieList"
//             className="success_btn"
//           >
//             Continue Shopping
//           </Link>

//           <Link
//             to="/restaurantdashboard/orders"
//             className="success_btn outline"
//           >
//             View Orders
//           </Link>

//         </div>

//       </div>

//     </section>
//   );
// };

// export default OrderSuccess;






import React, {
  useEffect,
  useState
} from "react";

import {
  Link,
  useNavigate
} from "react-router-dom";

const OrderSuccess = () => {

  const navigate = useNavigate();

  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(false);

  useEffect(() => {

    try {

      // ✅ GET MULTIPLE ORDERS
      const storedOrders =

        localStorage.getItem(
          "success_orders"
        );

      console.log(
        "RAW STORAGE:",
        storedOrders
      );

      // ❌ NO DATA
      if (!storedOrders) {

        setError(true);

        setLoading(false);

        return;
      }

      // ✅ PARSE
      const parsedOrders =
        JSON.parse(storedOrders);

      console.log(
        "PARSED ORDERS:",
        parsedOrders
      );

      // ✅ ARRAY FIX
      if (
        Array.isArray(parsedOrders)
      ) {

        setOrders(parsedOrders);

      }

      // ✅ SINGLE ORDER FIX
      else if (
        parsedOrders &&
        typeof parsedOrders === "object"
      ) {

        setOrders([parsedOrders]);

      }

      else {

        setOrders([]);

      }

      // ✅ CLEAR STORAGE
      localStorage.removeItem(
        "success_orders"
      );

    } catch (err) {

      console.error(err);

      setError(true);

    } finally {

      setLoading(false);

    }

  }, []);

  // ✅ REDIRECT
  useEffect(() => {

    if (error) {

      console.log(
        "No order data"
      );

    }

  }, [error, navigate]);

  // ✅ LOADING
  if (loading) {

    return (

      <h3
        style={{
          textAlign: "center"
        }}
      >
        Loading...
      </h3>

    );
  }

  // ❌ EMPTY
  if (!orders.length) {

    return (

      <section className="order_success_page">

        <div className="success_card">

          <div className="success_icon">
            <i className="fas fa-check"></i>
          </div>

          <h2>
            Order Placed Successfully 🎉
          </h2>

          <p>
            Your order has been confirmed
          </p>

          <h5
            style={{
              color: "#ff6600"
            }}
          >
            No Orders Found
          </h5>

          <div className="success_actions">

            <Link
              to="/restaurantoffers"
              className="success_btn"
            >
              Continue Shopping
            </Link>

          </div>

        </div>

      </section>

    );
  }

  return (

    <section className="order_success_page">

      <div className="success_card">

        <div className="success_icon">
          <i className="fas fa-check"></i>
        </div>

        <h2>
          Order Placed Successfully 🎉
        </h2>

        <p>
          Your order has been confirmed
        </p>

        {/* ✅ MULTIPLE SUPPLIER ORDERS */}
        {orders.map((ord, index) => (

          <div
            key={index}
            style={{
              borderBottom:
                "1px solid #eee",

              paddingBottom: "15px",

              marginBottom: "15px",
            }}
          >

            <h6>

              Order ID:

              <span>
                {" "}
                #
                {
                  ord?.order_id ||
                  ord?.id
                }
              </span>

            </h6>

            <h6>

              Payment Method:

              <span>
                {" "}
                {
                  ord?.payment_method ||
                  "COD"
                }
              </span>

            </h6>

            <h6>

              Total Amount:

              <span>
                {" "}
                QAR {

                  ord?.amount ||

                  ord?.total_amount ||

                  0

                }
              </span>

            </h6>

          </div>

        ))}

        <div className="success_actions">

          <Link
            to="/restaurantoffers"
            className="success_btn"
          >
            Continue Shopping
          </Link>

          <Link
            to="/restaurantdashboard/orders"
            className="success_btn outline"
          >
            View Orders
          </Link>

        </div>

      </div>

    </section>
  );
};

export default OrderSuccess;