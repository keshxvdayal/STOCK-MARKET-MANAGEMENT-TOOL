// import React from 'react';
import Slider from 'react-slick';
import { Card } from "./dashboard";

const staticData = [
    { Stocks: [{ Stock: "AAPL", Close: 150, High: 155, Low: 145, Open: 148, Volume: 1000 }] },
    { Stocks: [{ Stock: "GOOGL", Close: 2500, High: 2550, Low: 2450, Open: 2480, Volume: 1200 }] },
];

export default function ConsecutiveCarousel() {
    const sliderSettings = {
        dots: true,
        infinite: false,
        speed: 500,
        slidesToShow: 5,
        slidesToScroll: 5,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 4,
                    slidesToScroll: 4,
                    infinite: true,
                    dots: true
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    };

    return (
    <div className="row g-6 mb-6">
        <Slider {...sliderSettings}>
          {staticData.map((day, i) =>
            day.Stocks.map((stock, j) => (
              <div key={`${i}-${j}`} >
                <Card symbol={stock.Stock} closingPrices={Object.values(stock).slice(1)} />
              </div>
            ))
          )}
        </Slider>
    </div>
    );
}
