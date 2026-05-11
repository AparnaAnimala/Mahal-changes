

// import React from "react";
// import Slider from "react-slick";
// import { useTranslation } from "react-i18next";

// import img1 from "../../images/testimonial_img_1.jpg";
// import img2 from "../../images/testimonial_img_2.jpg";
// import img3 from "../../images/testimonial_img_3.jpg";

// const TestimonialTwo = () => {
//   const { t, i18n } = useTranslation();
//   const isArabic = i18n.language === "ar";

//   const testimonials = [
//     { img: img1, ...t("testimonial_supplier.users", { returnObjects: true })[0], rating: 5 },
//     { img: img2, ...t("testimonial_supplier.users", { returnObjects: true })[1], rating: 4.5 },
//     { img: img3, ...t("testimonial_supplier.users", { returnObjects: true })[2], rating: 4 },
//   ];

//   const settings = {
//     arrows: true,
//     infinite: true,
//     speed: 600,
//     slidesToShow: 2,
//     slidesToScroll: 1,
//     autoplay: true,
//     autoplaySpeed: 3500,
//     rtl: isArabic, // 🔥 important for Arabic slider
//     responsive: [
//       { breakpoint: 1200, settings: { slidesToShow: 2 } },
//       { breakpoint: 768, settings: { slidesToShow: 1 } },
//     ],
//   };

//   return (
//   <section
//       className="mahal-testimonial-split"
//       dir={i18n.language === "ar" ? "rtl" : "ltr"}
//     >
//       <div className="container">
//      <div className="row align-items-center">

//           {/* LEFT */}
//           <div className="col-xl-4 col-lg-5 mb-4 mb-lg-0">
//             <div className="mahal-testimonial-left">

//               <span className="mahal-pill">
//                 {t("testimonial_supplier.subtitle")}
//               </span>

//               <h2 className="mahal-title">
//                 {t("testimonial_supplier.title1")}{" "}
//                 <span>{t("testimonial_supplier.title2")}</span>
//               </h2>

//               <p className="mahal-desc">
//                 {t("testimonial_supplier.desc")}
//               </p>

//               <a href="/Registration" className="mahal-btn-primary mt-3">
//                 {t("testimonial_supplier.cta")}
//               </a>

//             </div>
//           </div>

//           {/* RIGHT */}
//           <div className="col-xl-8 col-lg-7">
//             <Slider {...settings}>
//               {testimonials.map((item, index) => (
//                 <div key={index} className="px-2">
//                   <div className="mahal-testimonial-card">

//                     <div className="user">
//                       <img src={item.img} alt={item.name} />
//                       <div>
//                         <h4>{item.name}</h4>
//                         <span>{item.role}</span>
//                       </div>
//                     </div>

//                     <p className="review">
//                       {t("testimonial_supplier.review")}
//                     </p>

//                     <div className="rating">
//                       {[...Array(Math.floor(item.rating))].map((_, i) => (
//                         <i key={i} className="fas fa-star"></i>
//                       ))}
//                       {item.rating % 1 !== 0 && (
//                         <i className="fas fa-star-half-alt"></i>
//                       )}
//                       <span>{item.rating}</span>
//                     </div>

//                   </div>
//                 </div>
//               ))}
//             </Slider>
//           </div>

//         </div>
//       </div>
//     </section>
//   );
// };

// export default TestimonialTwo;


import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import { useTranslation } from "react-i18next";

import img1 from "../../images/testimonial_img_1.jpg";
import img2 from "../../images/testimonial_img_2.jpg";
import img3 from "../../images/testimonial_img_3.jpg";

const TestimonialTwo = () => {

  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  // ✅ DYNAMIC REVIEWS
  const [reviews, setReviews] = useState([]);

  // ✅ FETCH REVIEWS
  useEffect(() => {

    fetch("http://127.0.0.1:5000/api/reviews/all")

      .then((res) => res.json())

      .then((data) => {
        setReviews(data || []);
      })

      .catch((err) => {
        console.error("Review fetch error", err);
      });

  }, []);

  const settings = {
    arrows: true,
    infinite: true,
    speed: 600,
    slidesToShow: 2,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3500,
    rtl: isArabic,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <section
      className="mahal-testimonial-split"
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >

      <div className="container">

        <div className="row align-items-center">

          {/* LEFT */}
          <div className="col-xl-4 col-lg-5 mb-4 mb-lg-0">

            <div className="mahal-testimonial-left">

              <span className="mahal-pill">
                {t("testimonial_supplier.subtitle")}
              </span>

              <h2 className="mahal-title">
                {t("testimonial_supplier.title1")}{" "}
                <span>{t("testimonial_supplier.title2")}</span>
              </h2>

              <p className="mahal-desc">
                {t("testimonial_supplier.desc")}
              </p>

              <a
                href="/Registration"
                className="mahal-btn-primary mt-3"
              >
                {t("testimonial_supplier.cta")}
              </a>

            </div>

          </div>

          {/* RIGHT */}
          <div className="col-xl-8 col-lg-7">

            <Slider {...settings}>

              {reviews.map((item, index) => {

                // ✅ RANDOM IMAGE
                const userImg =
                  index % 3 === 0
                    ? img1
                    : index % 3 === 1
                    ? img2
                    : img3;

                return (
                  <div key={index} className="px-2">

                    <div className="mahal-testimonial-card">

                      <div className="user">

                        <img
                          src={userImg}
                          alt="review"
                        />

                        <div>

                          <h4>
                            {item.product_name || "MAHAL Product"}
                          </h4>

                          <span>
                            MAHAL Customer
                          </span>

                        </div>

                      </div>

                      <p className="review">

                        {item.review_text ||
                          "Excellent shopping experience with MAHAL."}

                      </p>

                      <div className="rating">

                        {[...Array(item.rating || 5)].map((_, i) => (
                          <i
                            key={i}
                            className="fas fa-star"
                          ></i>
                        ))}

                        <span>
                          {item.rating || 5}
                        </span>

                      </div>

                    </div>

                  </div>
                );
              })}

            </Slider>

          </div>

        </div>

      </div>

    </section>
  );
};

export default TestimonialTwo;