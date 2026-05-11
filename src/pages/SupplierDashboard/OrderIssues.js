import React, { useEffect, useState } from "react";
import ResolveIssueModal from "./ResolveIssueModal";
import ViewIssueModal from "./ViewIssueModal";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

const API = "http://192.168.2.22:5000/api/v1";

const OrderIssues = () => {
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [viewIssue, setViewIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const issueIdFromUrl = searchParams.get("issueId");

  const token = localStorage.getItem("token");
  const { t, i18n } = useTranslation();

  const autoReadIssueNotification = (issue) => {
    fetch(`${API}/orders/supplier/notifications/auto-read`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        reference_id: issue.issue_report_id,
        type: "ORDER_ISSUE",
      }),
    }).then(() => {
      window.dispatchEvent(new Event("refreshNotifications"));
    });
  };

  const loadIssues = () => {
    setLoading(true);
    fetch(`${API}/supplier/issues`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) {
          setIssues([]);
          return;
        }

        const sortedIssues = [...data].sort((a, b) => {
          if (a.status === "ISSUE_RESOLVED" && b.status !== "ISSUE_RESOLVED") return 1;
          if (a.status !== "ISSUE_RESOLVED" && b.status === "ISSUE_RESOLVED") return -1;
          return 0;
        });

        setIssues(sortedIssues);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadIssues();
  }, []);

  useEffect(() => {
    if (!issueIdFromUrl || issues.length === 0) return;

    const match = issues.find(
      i => i.issue_report_id === issueIdFromUrl
    );

    if (match) {
      setViewIssue(match);
    }
  }, [issueIdFromUrl, issues]);

  useEffect(() => {
    if (!issueIdFromUrl) return;

    fetch(`${API}/orders/supplier/notifications/auto-read`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        reference_id: issueIdFromUrl,
        type: "ORDER_ISSUE",
      }),
    }).then(() => {
      window.dispatchEvent(new Event("refreshNotifications"));
    });
  }, [issueIdFromUrl, token]);

  const handleResolved = (updatedIssue) => {
    fetch(`${API}/orders/supplier/notifications/auto-read`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        reference_id: updatedIssue.issue_report_id,
        type: "ORDER_ISSUE",
      }),
    }).then(() => {
      window.dispatchEvent(new Event("refreshNotifications"));
    });

    setIssues((prev) =>
      prev.map((i) =>
        i.issue_report_id === updatedIssue.issue_report_id
          ? updatedIssue
          : i
      )
    );

    setViewIssue(updatedIssue);
    setSelectedIssue(null);
  };

  if (loading) return <div>{t("loading_issues")}</div>;

  const isArabic = i18n.language?.startsWith("ar");
  const formatOrderId = (id) => {
    if (!isArabic) return id;

    const prefix = String(id).replace(/[0-9]/g, "");
    const numbers = String(id).replace(/\D/g, "");

    return prefix + formatNumber(numbers);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat(
      isArabic ? "ar-EG" : "en-US"
    ).format(num);
  };

  return (
    <div className="order_issues_page">
      <h3 className="page_title">{t("order_issues")}</h3>

      <div className="table_wrapper">
        <table className="orders_table">
          <thead>
            <tr>
              <th>{t("report_id")}</th>
              <th>{t("order_id")}</th>
              <th>{t("restaurant")}</th>
              <th>{t("issue")}</th>
              <th>{t("description")}</th>
              <th>{t("status")}</th>
              <th>{t("action")}</th>
            </tr>
          </thead>

          <tbody>
            {issues.map((i) => (
              <tr key={i.issue_report_id}>
                <td>{formatOrderId(i.issue_report_id)}</td>
                <td>{formatOrderId(i.order_id)}</td>

                {/* 🔥 restaurant bilingual */}
                <td>
                  {i18n.language === "ar"
                    ? i.restaurant_name_arabic || i.restaurant_name_english
                    : i.restaurant_name_english}
                </td>

                <td>{i.issue_type}</td>
                <td>{i.description || "—"}</td>

                <td>
                  <span className={`issue_status ${i.status.toLowerCase()}`}>
                    {t(i.status.toLowerCase())}
                  </span>
                </td>

                <td>
                  {i.status !== "ISSUE_RESOLVED" ? (
                    <button
                      className="btn resolve"
                      onClick={() => {
                        autoReadIssueNotification(i);
                        setSelectedIssue(i);
                      }}
                    >
                      {t("resolve")}
                    </button>
                  ) : (
                    <button
                      className="btn view"
                      onClick={() => {
                        autoReadIssueNotification(i);
                        setViewIssue(i);
                      }}
                    >
                      {t("view")}
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {issues.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  {t("no_issues")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedIssue && (
        <ResolveIssueModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
          onResolved={handleResolved}
        />
      )}

      {viewIssue && (
        <ViewIssueModal
          issue={viewIssue}
          onClose={() => setViewIssue(null)}
        />
      )}
    </div>
  );
};

export default OrderIssues;