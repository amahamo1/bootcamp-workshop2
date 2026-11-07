"use client";

import { useState } from "react";
import { useAgent } from "@/lib/useTinyFish";

function parsePrice(value) {
  const parsed = Number(String(value ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function parseDistance(value) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number.parseFloat(String(value).replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function parseOffers(result) {
  let payload = result;

  if (typeof payload === "string") {
    try {
      payload = JSON.parse(payload);
    } catch {
      const jsonBlock = payload.match(/```(?:json)?\s*([\s\S]*?)```/i);
      if (jsonBlock) {
        try {
          payload = JSON.parse(jsonBlock[1]);
        } catch {
          return [];
        }
      } else {
        return [];
      }
    }
  }

  const records = Array.isArray(payload)
    ? payload
    : payload?.offers ?? payload?.data?.offers ?? [];

  return records
    .map((offer) => {
      const price = parsePrice(offer.price);
      const retailer = offer.retailer || offer.store_name || offer.store;
      const sourceUrl = offer.source_url || offer.product_url || offer.url;
      let url = null;

      try {
        const parsedUrl = new URL(sourceUrl);
        if (["https:", "http:"].includes(parsedUrl.protocol)) url = parsedUrl.href;
      } catch {
        url = null;
      }

      return {
        retailer,
        product: offer.product_name || offer.product || "Matching item",
        price,
        address: offer.address || null,
        distance: parseDistance(offer.distance_miles ?? offer.distanceMiles ?? offer.distance),
        url,
      };
    })
    .filter((offer) => offer.retailer && offer.price !== null && offer.price >= 0);
}

function formatPrice(price) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export default function PriceFinder() {
  const [product, setProduct] = useState("");
  const [location, setLocation] = useState("");
  const [radius, setRadius] = useState("15");
  const [offers, setOffers] = useState([]);
  const [searchedFor, setSearchedFor] = useState(null);
  const [resultError, setResultError] = useState("");
  const { run, status, error, loading } = useAgent();

  async function handleSubmit(event) {
    event.preventDefault();
    setOffers([]);
    setResultError("");
    setSearchedFor({ product: product.trim(), location: location.trim() });

    const query = `${product.trim()} price near ${location.trim()} retailers`;
    const goal = `Find up to 8 current retailer offers for the exact item "${product.trim()}" near ${location.trim()}, within about ${radius} miles when possible. Check retailer product pages and local store listings. Do not invent prices, addresses, availability, or distances. Include only prices you can verify from a source page. Return price as a number in USD, address as text, distance_miles as a number or null, and source_url as the product or retailer page. Return JSON with an offers array containing retailer, product_name, price, currency, address, distance_miles, and source_url. Return JSON.`;
    const result = await run({
      url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      goal,
    });

    if (result) {
      const parsedOffers = parseOffers(result);
      setOffers(parsedOffers);
      if (parsedOffers.length === 0) {
        setResultError("No verifiable prices came back. Try a more specific item or location.");
      }
    }
  }

  const maxDistance = Number(radius);
  const sortByPrice = (first, second) => first.price - second.price || first.distance - second.distance;
  const nearbyOffers = offers
    .filter((offer) => offer.distance !== null && offer.distance <= maxDistance)
    .sort(sortByPrice);
  const unconfirmedDistanceOffers = offers
    .filter((offer) => offer.distance === null)
    .sort((first, second) => first.price - second.price);
  const visibleOffers = [...nearbyOffers, ...unconfirmedDistanceOffers];
  const cheapest = nearbyOffers[0] || unconfirmedDistanceOffers[0];

  return (
    <main className="price-app">
      <header className="topbar">
        <a className="wordmark" href="#top" aria-label="Nearwise home">
          <span className="wordmark-mark" aria-hidden="true">N</span>
          <span>nearwise</span>
        </a>
        <span className="topbar-note">LOCAL PRICE CHECK</span>
      </header>

      <section className="intro" id="top">
        <p className="eyebrow">A better deal, around the corner</p>
        <h1>Find the low price.<br />Keep it close.</h1>
        <p className="intro-copy">Compare current item prices at nearby retailers, then sort the best buys by price and distance.</p>
      </section>

      <section className="search-panel" aria-labelledby="search-title">
        <div className="search-heading">
          <span className="step-number">01</span>
          <div>
            <h2 id="search-title">What are you looking for?</h2>
            <p>Enter an item and the area to search.</p>
          </div>
        </div>

        <form className="price-form" onSubmit={handleSubmit}>
          <label className="field product-field">
            <span>Item</span>
            <input
              value={product}
              onChange={(event) => setProduct(event.target.value)}
              placeholder="e.g. oat milk, 64 oz"
              required
            />
          </label>
          <label className="field location-field">
            <span>City or ZIP code</span>
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="e.g. Tempe, AZ"
              required
            />
          </label>
          <label className="field radius-field">
            <span>Within</span>
            <select value={radius} onChange={(event) => setRadius(event.target.value)}>
              <option value="5">5 mi</option>
              <option value="10">10 mi</option>
              <option value="15">15 mi</option>
              <option value="25">25 mi</option>
              <option value="50">50 mi</option>
            </select>
          </label>
          <button className="search-button" type="submit" disabled={loading}>
            {loading ? "Checking retailers..." : "Find prices"}
            <span aria-hidden="true">&#8594;</span>
          </button>
        </form>
        <p className="credit-note">Live retailer research uses TinyFish agent credits. Prices and store distances depend on available listings.</p>
      </section>

      <section className="results-section" aria-live="polite" aria-busy={loading}>
        {loading && (
          <div className="progress-line">
            <span className="progress-dot" />
            <p>Checking retailer listings near {location}...</p>
            {status && <span className="status-label">{status.toLowerCase()}</span>}
          </div>
        )}

        {(error || resultError) && <p className="error-message">{error || resultError}</p>}

        {!loading && searchedFor && visibleOffers.length === 0 && !error && !resultError && (
          <div className="empty-results">
            <span className="step-number">02</span>
            <h2>No priced listings found yet.</h2>
            <p>Try a brand, size, or nearby city to get more specific results.</p>
          </div>
        )}

        {visibleOffers.length > 0 && (
          <>
            <div className="results-heading">
              <div>
                <p className="eyebrow">02 / Price report</p>
                <h2>{searchedFor.product}</h2>
                <p className="results-location">Near {searchedFor.location} · {radius} mi radius</p>
              </div>
              <span className="result-count">{visibleOffers.length} {visibleOffers.length === 1 ? "offer" : "offers"}</span>
            </div>
            {unconfirmedDistanceOffers.length > 0 && (
              <p className="distance-note">
                {unconfirmedDistanceOffers.length} listing{unconfirmedDistanceOffers.length === 1 ? "" : "s"} with unconfirmed distance shown after nearby results.
              </p>
            )}

            {cheapest && (
              <div className="best-deal">
                <div className="best-deal-label">
                  <span className="best-deal-icon" aria-hidden="true">&#8595;</span>
                  <span>{nearbyOffers.length ? `LOWEST PRICE WITHIN ${radius} MI` : "LOWEST PRICE / DISTANCE UNCONFIRMED"}</span>
                </div>
                <div className="best-deal-main">
                  <div>
                    <p className="best-price">{formatPrice(cheapest.price)}</p>
                    <p className="best-retailer">at {cheapest.retailer}</p>
                  </div>
                  <p className="best-distance">
                    {cheapest.distance === null ? "Distance not confirmed" : `${cheapest.distance} mi away`}
                  </p>
                </div>
              </div>
            )}

            <ol className="offer-list">
              {visibleOffers.map((offer, index) => (
                <li className="offer-row" key={`${offer.retailer}-${offer.price}-${index}`}>
                  <span className="offer-rank">{String(index + 1).padStart(2, "0")}</span>
                  <div className="offer-details">
                    <div className="offer-title-line">
                      <h3>{offer.retailer}</h3>
                      {index === 0 && <span className="best-tag">BEST PRICE</span>}
                    </div>
                    <p>{offer.product}</p>
                    {offer.address && <p className="offer-address">{offer.address}</p>}
                    {offer.url && <a className="source-link" href={offer.url} target="_blank" rel="noreferrer">View source <span aria-hidden="true">&#8599;</span></a>}
                  </div>
                  <div className="offer-price-block">
                    <strong>{formatPrice(offer.price)}</strong>
                    <span>{offer.distance === null ? "Distance unknown" : `${offer.distance} mi`}</span>
                  </div>
                </li>
              ))}
            </ol>
          </>
        )}
      </section>

      <footer className="page-footer">
        <span>nearwise / local price finder</span>
        <span>Verify final price and availability with the retailer.</span>
      </footer>
    </main>
  );
}