import React from "react";
import "./card.scss";
import { Link } from "react-router-dom";

const formatPrice = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

function Card({
  item,
  compareMode = false,
  isSelected = false,
  toggleCompare,
  showEdit = false,
}) {
  const isComingSoon = item.comingSoon;
  const getAvailableInText = () => {
    if (!item.availableFrom) return null;

    const availableDate = new Date(item.availableFrom);
    const today = new Date();
    const diffTime = availableDate - today;

    if (diffTime <= 0) return null;

    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `Available in ${diffDays} day${diffDays > 1 ? "s" : ""}`;
  };

  const availableInText = getAvailableInText();
  // console.log(item.title, "isBought:", item.isBought);

  return (
    <div
      className={`card ${isSelected ? "selected" : ""} ${
        isComingSoon ? "comingSoon" : ""
      }`}
    >
      {compareMode && (
        <div className="checkboxWrapper">
          <input
            type="checkbox"
            className="compareCheckbox"
            checked={isSelected}
            onChange={() => toggleCompare(item.id)}
          />
          <span className="tooltip">Compare this</span>
        </div>
      )}

      <Link to={`/${item.id}`} className="imageContainer">
        <img src={item.images[0]} alt={item.title} />
        {availableInText && <span className="soonTag">{availableInText}</span>}
        {item.isBought && <div className="soldBanner">SOLD</div>}
      </Link>

      <div className="textContainer">
        <h2 className="title">
          <Link to={`/${item.id}`}>{item.title}</Link>
        </h2>
        <p className="address">
          <img src="/pin.png" alt="" />
          <span>{item.address}</span>
        </p>
        <p className="price">{formatPrice(item.price)}</p>
        <div className="bottom">
          <div className="features">
            <div className="feature">
              <img src="/bed.png" alt="" />
              <span>{item.bedroom} bedroom</span>
            </div>
            <div className="feature">
              <img src="/bath.png" alt="" />
              <span>{item.bathroom} bathroom</span>
            </div>
          </div>
          {showEdit && (
            <div className="actions">
              <Link to={`/edit/${item.id}`} className="editButton">
                Edit Post
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Card;
