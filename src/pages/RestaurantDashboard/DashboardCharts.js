

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { useTranslation } from "react-i18next";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);
const DashboardCharts = ({ salesTourId, ordersTourId }) => {

  const { t } = useTranslation();

  const labels = [
  t("resjan"),
  t("resfeb"),
  t("resmar"),




  t("resapr"),
  t("resmay"),
  t("resjun"),
];
  

  const salesData = {
    labels,
    datasets: [
      {
        label: t("ressales_label"),
        data: [12000, 19000, 15000, 22000, 18000, 26000],
        borderColor: "#ff7a00",
        backgroundColor: "rgba(255, 122, 0, 0.2)",
        tension: 0.4,
      },
    ],
  };

  const ordersData = {
    labels,
    datasets: [
      {
        label: t("resorders"),
        data: [45, 60, 52, 70, 66, 80],
        backgroundColor: "#ff7a00",
      },
    ],
  };

  return (
    <div className="row mt-4">

      {/* SALES CHART */}
      <div className="col-lg-6">
        <div className="card" id={salesTourId}>
          <div className="card-header">
            <h5>{t("ressales_overview")}</h5>
          </div>
          <div className="card-body">
            <Line data={salesData} />
          </div>
        </div>
      </div>

      {/* ORDERS CHART */}
      <div className="col-lg-6">
        <div className="card" id={ordersTourId}>
          <div className="card-header">
           <h5>{t("resorders_overview")}</h5>
          </div>
          <div className="card-body">
            <Bar data={ordersData} />
          </div>
        </div>
      </div>

    </div>
  );
};


export default DashboardCharts;
