'use client'
import React, { useState, useRef } from "react";
import "./css/BrowseCategorySection.css";
import Image from 'next/image'

const categories = [
  {
    id: "rental-apartments",
    label: "Rental Apartments",
    image: "https://images.unsplash.com/photo-1629584603667-e8ad7c8feb0b?q=80&w=1174&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: "airbnbs",
    label: "Airbnbs",
    image: "https://images.unsplash.com/photo-1553444836-bc6c8d340ba7?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: "commercial-spaces",
    label: "Commercial Spaces",
    image: "https://images.unsplash.com/photo-1685009336777-3422a99d419b?q=80&w=2050&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: "lodgings",
    label: "Lodgings",
    image: "https://images.unsplash.com/photo-1610333684078-c89bd57f2e46?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: "private-houses",
    label: "Private Houses & Homes",
    image: "https://plus.unsplash.com/premium_photo-1742418054084-5b6037976b3f?q=80&w=1172&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: "hostels",
    label: "Hostels",
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

const VISIBLE = 4;

export default function BrowseByCategorySection() {
  const [ index, setIndex ] = useState(0);
  const trackRef = useRef(null);

  const canPrev = index > 0;
  const canNext = index + VISIBLE < categories.length;

  const prev = () => { if (canPrev) setIndex((i) => i - 1); };
  const next = () => { if (canNext) setIndex((i) => i + 1); };

  const progress = ((index + VISIBLE) / categories.length) * 100;

  const handleCategoryClick = (categoryId) => {
    // Placeholder — wire up routing here later
    // e.g. router.push(`/properties?category=${categoryId}`)
    console.log("Navigate to properties with filter:", categoryId);
  };

  return (
    <section className="bbc-section">

      {/* Header row */}
      <div className="bbc-header">
        <div className="bbc-headline-wrap">
          <div className="bbc-headline-bar" />
          <h2 className="bbc-headline">Browse By Category</h2>
        </div>
        <p className="bbc-subtitle">
          Explore our full range of property types. Select a category to view all available listings filtered to what you need.
        </p>

        {/* Progress bar + controls */}
        <div className="bbc-controls-row">
          <div className="bbc-progress-wrap">
            <div className="bbc-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="bbc-arrows">
            <button
              className={`bbc-arrow ${!canPrev ? "bbc-arrow--disabled" : ""}`}
              onClick={prev}
              aria-label="Previous"
              disabled={!canPrev}
            >
              ←
            </button>
            <button
              className={`bbc-arrow bbc-arrow--active ${!canNext ? "bbc-arrow--disabled" : ""}`}
              onClick={next}
              aria-label="Next"
              disabled={!canNext}
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Carousel */}
      <div className="bbc-carousel-outer">
        <div
          className="bbc-carousel-track"
          ref={trackRef}
          style={{ transform: `translateX(calc(-${index} * (var(--card-width) + var(--card-gap))))` }}
        >
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bbc-card"
              onClick={() => handleCategoryClick(cat.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === "Spacebar" || e.code === "Space") {
                  e.preventDefault();
                  handleCategoryClick(cat.id);
                }
              }}

            >
              <div className="bbc-card-img-wrap">
                <Image
                  src={cat.image}
                  alt={cat.label}
                  width={240}
                  height={180}
                  className="bbc-card-img"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.parentElement.classList.add("bbc-card-img-fallback");
                  }}
                />
              </div>
              <p className="bbc-card-label">{cat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}