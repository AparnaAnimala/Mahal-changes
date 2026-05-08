import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const API = "http://127.0.0.1:5000/api/v1";

export default function OrderIssueList() {
  const [orders, setOrders] = useState([]);
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

  return id.replace(/\d/g, (d) =>
    new Intl.NumberFormat("ar-QA").format(d)
  );
};

  useEffect(() => {
    fetch(`${API}/orders/restaurant/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const deliveredOrders = Array.isArray(data)
          ? data
              .filter(o => o.status === "DELIVERED")
              .map(o => ({
                ...o,
                supplier_name:
                  i18n.language === "ar"
                    ? (
                        o.supplier_name_arabic ||
                        o.company_name_arabic ||
                        o.supplier_company_name_arabic ||
                        o.supplier_name ||
                        o.company_name_english ||
                        "-"
                      )
                    : (
                        o.supplier_name ||
                        o.company_name_english ||
                        o.supplier_company_name ||
                        o.company_name ||
                        "-"
                      )
              }))
          : [];

        setOrders(deliveredOrders);
      })
      .catch(() => setOrders([]));
  }, [token, i18n.language]);

  return (
    <div className="orders_page">
      <h3 className="page_title">{t("resorder_issues")}</h3>

      <div className="table_wrapper">
        <table className="orders_table">
          <thead>
            <tr>
              <th>#</th>
              <th>{t("resorder_id")}</th>
              <th>{t("ressupplier")}</th>
              <th>{t("resstatus")}</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: 20 }}>
                  {t("resno_delivered_orders")}
                </td>
              </tr>
            )}

            {orders.map((o, i) => (
              <tr key={o.order_id}>
                <td>{formatNumber(i + 1)}</td>
                <td>{formatOrderId(o.order_id)}</td>
                <td>{o.supplier_name}</td>
                <td>
                  <span className={`status ${o.status}`}>
                    {t(`status_${o.status.toLowerCase()}`, o.status)}
                  </span>
                </td>
                <td>
                  <button
                    className="view_btn"
                    onClick={() =>
                      navigate(`/restaurantdashboard/issues/${o.order_id}`)
                    }
                  >
                    {t("resreport_view")}
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