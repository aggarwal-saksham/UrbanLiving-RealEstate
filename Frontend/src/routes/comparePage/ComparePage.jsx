import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import apiRequest from "../../lib/apiRequest";
import "./comparePage.scss";

const ComparePage = () => {
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    const ids = searchParams.get("ids");
    if (ids) {
      apiRequest
        .get(`/posts/multiple?ids=${ids}`)
        .then((res) => setProperties(res.data))
        .catch((err) => console.error(err));
    }
  }, [searchParams]);

  const fields = [
    { label: "Title", key: "title" },
    { label: "Price", key: "price" },
    { label: "Bedroom", key: "bedroom" },
    { label: "Bathroom", key: "bathroom" },
    { label: "Address", key: "address" },
    { label: "Utilities", key: "utilities", nested: true },
    { label: "Pet Policy", key: "pet", nested: true },
    { label: "Income Policy", key: "income", nested: true },
    { label: "Size", key: "size", nested: true },
    {
      label: "School Distance",
      key: "school",
      nested: true,
      formatDistance: true,
    },
    {
      label: "Bus Stop Distance",
      key: "bus",
      nested: true,
      formatDistance: true,
    },
    {
      label: "Restaurant Distance",
      key: "restaurant",
      nested: true,
      formatDistance: true,
    },
  ];

  const formatDistance = (value) => {
    if (value > 999) return `${value / 1000} km`;
    return `${value} m`;
  };

  return (
    <div className="comparePage">
      <h1>Compare Properties</h1>
      <div className="compareTable">
        {fields.map(({ label, key, nested, formatDistance: isDistance }) => {
          const values = properties.map((item) => {
            let value = nested ? item.postDetail?.[key] : item[key];

            if (key === "utilities") {
              value =
                value === "owner"
                  ? "Owner is responsible"
                  : "Tenant is responsible";
            }

            if (key === "pet") {
              value = value === "allowed" ? "Pets allowed" : "Pets not allowed";
            }

            if (isDistance) {
              value = formatDistance(value);
            }

            if (key === "size" && value !== undefined) {
              value = value + " sqft";
            }

            return value || "-";
          });

          const isDifferent = new Set(values).size > 1;

          return (
            <div className="compareRow" key={key}>
              <div className="compareLabel">{label}</div>
              {values.map((value, index) => (
                <div
                  className={`compareCell ${isDifferent ? "highlight" : ""}`}
                  key={properties[index].id + key}
                >
                  {value}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ComparePage;
