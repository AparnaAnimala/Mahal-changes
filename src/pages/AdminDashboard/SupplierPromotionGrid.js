// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// const API = "http://192.168.2.21:5000/api/admin/promotions";

// export default function SupplierPromotionGrid() {

//   const [grids, setGrids] = useState([null, null, null, null, null, null]);
//   const navigate = useNavigate();

//   const city = localStorage.getItem("selected_city") || "Doha";

//   const loadGrid = async (position, index) => {
//     try {
//       const res = await axios.get(`${API}/grid/${city}/${position}`);

//       const banner = res.data.length > 0 ? res.data[0] : null;

//       setGrids(prev => {
//         const updated = [...prev];
//         updated[index] = banner;
//         return updated;
//       });

//     } catch {
//       setGrids(prev => {
//         const updated = [...prev];
//         updated[index] = null;
//         return updated;
//       });
//     }
//   };

//   useEffect(() => {

//     const positions = [
//       "LEFT_SLIDER_1",
//       "LEFT_SLIDER_2",
//       "LEFT_SLIDER_3",
//       "RIGHT_SLIDER_1",
//       "RIGHT_SLIDER_2",
//       "RIGHT_SLIDER_3"
//     ];

//     positions.forEach((pos, i) => loadGrid(pos, i));

//     const interval = setInterval(() => {
//       positions.forEach((pos, i) => loadGrid(pos, i));
//     }, 15000);

//     return () => clearInterval(interval);

//   }, [city]);

//   return null; // optional (if only using Banner.jsx)
// }


import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "http://127.0.0.1:5000/api/admin/promotions";

export default function SupplierPromotionGrid() {

  const [grids, setGrids] = useState([
    null, null, null,
    null, null, null
  ]);

  const navigate = useNavigate();

  // ============================
  // LOAD SINGLE GRID
  // ============================
  const loadGrid = async (position, index) => {
    try {
      const res = await axios.get(
        `${API}/grid/default/${position}`
      );

      const banner = res.data.length > 0 ? res.data[0] : null;

      setGrids(prev => {
        const updated = [...prev];
        updated[index] = banner;
        return updated;
      });

    } catch {
      setGrids(prev => {
        const updated = [...prev];
        updated[index] = null;
        return updated;
      });
    }
  };

  // ============================
  // LOAD ALL 6
  // ============================
  useEffect(() => {

    const positions = [
      "LEFT_SLIDER_1",
      "LEFT_SLIDER_2",
      "LEFT_SLIDER_3",
      "RIGHT_SLIDER_1",
      "RIGHT_SLIDER_2",
      "RIGHT_SLIDER_3"
    ];

    positions.forEach((pos, i) => loadGrid(pos, i));

    const interval = setInterval(() => {
      positions.forEach((pos, i) => loadGrid(pos, i));
    }, 15000);

    return () => clearInterval(interval);

  }, []);

  // ============================
  // BANNER COMPONENT (FIXED)
  // ============================
  const Banner = ({ banner }) => {

    const hasBanner = !!banner;

    const handleClick = () => {
      if (!hasBanner) return; // ❌ NO REDIRECT
      navigate(`/supplier-promotions/${banner.promotion_id}`);
    };

    return (
      <div
        className="banne_3_add_item"
        style={{
          backgroundImage: hasBanner && banner.processed_image_url
            ? `url(${banner.processed_image_url}?v=${banner.banner_id})`
            : "none",
          cursor: hasBanner ? "pointer" : "default",
          opacity: hasBanner ? 1 : 0.6 // subtle UX indicator
        }}
        onClick={handleClick}
      >
        <div className="text">

          <h4>
            {hasBanner ? banner.banner_title : ""}
          </h4>

          <h2>
            {hasBanner ? banner.banner_subtitle : ""}
          </h2>

          {hasBanner && (
            <button
              className="common_btn"
              onClick={(e) => {
                e.stopPropagation(); // prevent double trigger
                navigate(`/supplier-promotions/${banner.promotion_id}`);
              }}
            >
              shop now
            </button>
          )}

        </div>
      </div>
    );
  };

  // ============================
  // RENDER
  // ============================
  return (
    <div className="col-xl-4">
      <div className="row">

        {grids.map((banner, index) => (
          <div key={index} className="col-xl-12 col-md-6">
            <Banner banner={banner} />
          </div>
        ))}

      </div>
    </div>
  );
}