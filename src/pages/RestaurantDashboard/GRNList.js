// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// const API = "http://127.0.0.1:5000/api/v1";

// export default function GRNList() {
//   const [grns, setGrns] = useState([]);
//   const navigate = useNavigate();
//   const token = localStorage.getItem("token");

//   useEffect(() => {
//     fetch(`${API}/grn`, {
//       headers: { Authorization: `Bearer ${token}` }
//     })
//       .then(res => res.json())
//       .then(setGrns);
//   }, [token]);

//   return (
//     <div className="orders-page">
//       <h2 className="page-title">Goods Receipt Notes</h2>

//       <table className="orders-table">
//         <thead>
//           <tr>
//             <th>#</th>
//             <th>GRN No</th>
//             <th>Supplier</th>
//             <th>Order</th>
//             <th>Status</th>
//             <th />
//           </tr>
//         </thead>
//         <tbody>
//           {grns.map((g, i) => (
//             <tr key={g.grn_id}>
//               <td>{i + 1}</td>
//               <td>GRN-{String(g.grn_id).padStart(5, "0")}</td>
//               <td>{g.supplier_name}</td>
//               <td>{g.order_id}</td>
//               <td>{g.status}</td>
//               <td>
//                 <button
//                   onClick={() =>
//                     navigate(`/restaurantdashboard/grn/${g.order_id}`)
//                   }
//                 >
//                   View
//                 </button>
//               </td>
//             </tr>
//           ))}

//           {grns.length === 0 && (
//             <tr>
//               <td colSpan="6" align="center">No GRNs found</td>
//             </tr>
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// }







import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const API = "http://127.0.0.1:5000/api/v1";

export default function GRNList() {
  const [grns, setGrns] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const { t, i18n } = useTranslation();

  const formatNumber = (value) => {
  return new Intl.NumberFormat(
    i18n.language === "ar" ? "ar-QA" : "en-US"
  ).format(value);
};

const formatOrderId = (id) => {
  if (i18n.language !== "ar") return id;

  return String(id).replace(/\d/g, (d) =>
    new Intl.NumberFormat("ar-QA").format(d)
  );
};

const formatGRN = (id) => {
  const formatted = `GRN-${String(id).padStart(5, "0")}`;

  if (i18n.language !== "ar") return formatted;

  return formatted.replace(/\d/g, (d) =>
    new Intl.NumberFormat("ar-QA").format(d)
  );
};
  // ADD this function below useEffect()

const getStatusText = (status) => {
  const value = String(status || "").toUpperCase().replace("STATUS_", "");

  if (value === "CONFIRMED")
    return i18n.language === "ar" ? "تم التأكيد" : "CONFIRMED";

  if (value === "DRAFT")
    return i18n.language === "ar" ? "مسودة" : "DRAFT";

  if (value === "PENDING")
    return i18n.language === "ar" ? "قيد الانتظار" : "PENDING";

  if (value === "REJECTED")
    return i18n.language === "ar" ? "مرفوض" : "REJECTED";

  return value;
};

  useEffect(() => {
    fetch(`${API}/grn`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const rows = Array.isArray(data)
          ? data.map((g) => ({
              ...g,
              supplier_name:
                i18n.language === "ar"
                  ? (
                      g.supplier_name_arabic ||
                      g.company_name_arabic ||
                      g.supplier_name ||
                      g.company_name_english ||
                      "-"
                    )
                  : (
                      g.supplier_name ||
                      g.company_name_english ||
                      g.supplier_name_arabic ||
                      g.company_name_arabic ||
                      "-"
                    )
            }))
          : [];

        setGrns(rows);
      });
  }, [token, i18n.language]);

  return (
    <div className="orders_page">
      <h3 className="page_title">{t("resgoods_receipt_notes")}</h3>

      <div className="table_wrapper">
        <table className="orders_table">
          <thead>
            <tr>
              <th>#</th>
              <th>{t("resgrn_no")}</th>
              <th>{t("ressupplier")}</th>
              <th>{t("resorder")}</th>
              <th>{t("resstatus")}</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {grns.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: 20 }}>
                  {t("resno_grns_found")}
                </td>
              </tr>
            )}

            {grns.map((g, i) => (
              <tr key={g.grn_id}>
                <td>{formatNumber(i + 1)}</td>
                <td dir="ltr" style={{ unicodeBidi: "isolate" }}>
                    {formatGRN(g.grn_id)}
                  </td>
                                  <td>{g.supplier_name}</td>
                                  <td dir="ltr" style={{ unicodeBidi: "isolate" }}>
                    {formatOrderId(g.order_id)}
                  </td>
                  <td>
                    <span className={`status ${g.status}`}>
                      {getStatusText(g.status)}
                    </span>
                  </td>
                <td>
                  <button
                    className="view_btn"
                    onClick={() =>
                      navigate(`/restaurantdashboard/grn/${g.order_id}`)
                    }
                  >
                    {t("resview")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}