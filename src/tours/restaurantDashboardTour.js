// import i18n from "i18next";

// export const restaurantDashboardTourSteps = [
//   {
//     intro: "Welcome to your Restaurant Dashboard 🍽️ Let’s take a quick tour!",
//   },
//   {
//     element: "#tour-today-orders",
//     intro: "See how many orders you received today.",
//     position: "bottom",   // 👈 force position
//   },
//   {
//     element: "#tour-revenue",
//     intro: "Your total revenue generated so far.",
//     position: "bottom",
//   },
//   {
//     element: "#tour-dashboard-customers",
//     intro: "Total customers who ordered from your restaurant.",
//     position: "bottom",
//   },
//   {
//     element: "#tour-rating",
//     intro: "Average rating given by customers.",
//     position: "bottom",
//   },
//   {
//     element: "#tour-recent-orders",
//     intro: "View and track your most recent orders.",
//     position: "top",
//   },
//   {
//     element: "#tour-sales-chart",
//     intro: "Sales trends over time to help you plan better.",
//     position: "top",
//   },
//   {
//     element: "#tour-orders-chart",
//     intro: "Monthly order volume handled by your restaurant.",
//     position: "top",
//   },
//   {
//     element: "#tour-top-selling",
//     intro: "Your most popular dishes based on order volume.",
//     position: "top",
//   },
//   {
//     intro: "That’s it! You’re all set to manage your restaurant like a pro 💪",
//   },
// ];




import i18n from "i18next";

const isArabic = () => {
  const lang =
    i18n.resolvedLanguage ||
    localStorage.getItem("i18nextLng") ||
    i18n.language;

  return lang?.startsWith("ar");
};

export const getRestaurantDashboardTourSteps = () => [
  {
    intro: isArabic()
      ? "مرحبًا بك في لوحة تحكم المطعم 🍽️"
      : "Welcome to your Restaurant Dashboard 🍽️",
  },
  {
    element: "#tour-today-orders",
    intro: isArabic()
      ? "عدد الطلبات اليوم"
      : "See how many orders you received today.",
  },
  {
    element: "#tour-revenue",
    intro: isArabic()
      ? "إجمالي الإيرادات"
      : "Your total revenue generated so far.",
  },
  {
    element: "#tour-dashboard-customers",
    intro: isArabic()
      ? "عدد العملاء"
      : "Total customers who ordered from your restaurant.",
  },
  {
    element: "#tour-rating",
    intro: isArabic()
      ? "متوسط التقييم"
      : "Average rating given by customers.",
  },
  {
    intro: isArabic()
      ? "انتهت الجولة 🎉"
      : "That’s it! You’re all set 🎉",
  },
];