import { useState } from "react";
import "./newPostPage.scss";
// import ReactQuill from "react-quill";
// import "react-quill/dist/quill.snow.css";
import apiRequest from "../../lib/apiRequest";
import UploadWidget from "../../components/uploadWidget/UploadWidget";
import { useNavigate } from "react-router-dom";

const parseOptionalNumber = (value) => {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

function NewPostPage() {
  const [value, setValue] = useState("");
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.target);
    const inputs = Object.fromEntries(formData);

    if (!inputs.title?.trim()) {
      setError("Please enter a property title.");
      return;
    }

    if (!inputs.address?.trim()) {
      setError("Please enter the property address.");
      return;
    }

    if (!inputs.city?.trim()) {
      setError("Please enter the city.");
      return;
    }

    if (!inputs.price || Number.isNaN(parseInt(inputs.price, 10))) {
      setError("Please enter a valid price.");
      return;
    }

    if (!inputs.bedroom || Number.isNaN(parseInt(inputs.bedroom, 10))) {
      setError("Please enter the number of bedrooms.");
      return;
    }

    if (!inputs.bathroom || Number.isNaN(parseInt(inputs.bathroom, 10))) {
      setError("Please enter the number of bathrooms.");
      return;
    }

    if (!images.length) {
      setError("Please upload at least one property image.");
      return;
    }

    try {
      const res = await apiRequest.post("/posts", {
        postData: {
          title: inputs.title,
          price: parseInt(inputs.price, 10),
          address: inputs.address,
          city: inputs.city,
          bedroom: parseInt(inputs.bedroom, 10),
          bathroom: parseInt(inputs.bathroom, 10),
          type: inputs.type,
          property: inputs.property,
          latitude: inputs.latitude,
          longitude: inputs.longitude,
          images: images,
          availableFrom: inputs.availableFrom
            ? new Date(inputs.availableFrom)
            : null,
        },
        postDetail: {
          desc: value,
          utilities: inputs.utilities,
          pet: inputs.pet,
          income: inputs.income,
          size: parseOptionalNumber(inputs.size),
          school: parseOptionalNumber(inputs.school),
          bus: parseOptionalNumber(inputs.bus),
          restaurant: parseOptionalNumber(inputs.restaurant),
        },
      });
      navigate("/" + res.data.id);
    } catch (err) {
      console.log(err);
      setError(
        err.response?.data?.message ||
          "We couldn't create the property listing. Please check your details and try again."
      );
    }
  };

  return (
    <div className="newPostPage">
      <div className="formContainer">
        <h1>Add New Post</h1>
        <div className="wrapper">
          <form onSubmit={handleSubmit}>
            <div className="item">
              <label htmlFor="title">Title</label>
              <input id="title" name="title" type="text" />
            </div>
            <div className="item">
              <label htmlFor="price">Price</label>
              <input id="price" name="price" type="number" />
            </div>
            <div className="item">
              <label htmlFor="address">Address</label>
              <input id="address" name="address" type="text" />
            </div>
            <div className="item description">
              <label htmlFor="desc">Description</label>
              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                rows={15}
                cols={50}
                style={{
                  padding: "10px",
                  fontSize: "16px",
                  width: "100%",
                }}
              />{" "}
            </div>
            <div className="item">
              <label htmlFor="city">City</label>
              <input id="city" name="city" type="text" />
            </div>
            <div className="item">
              <label htmlFor="bedroom">Bedroom Number</label>
              <input min={1} id="bedroom" name="bedroom" type="number" />
            </div>
            <div className="item">
              <label htmlFor="bathroom">Bathroom Number</label>
              <input min={1} id="bathroom" name="bathroom" type="number" />
            </div>
            <div className="item">
              <label htmlFor="latitude">Latitude</label>
              <input id="latitude" name="latitude" type="text" />
            </div>
            <div className="item">
              <label htmlFor="longitude">Longitude</label>
              <input id="longitude" name="longitude" type="text" />
            </div>
            <div className="item">
              <label htmlFor="type">Type</label>
              <select name="type">
                <option value="rent" defaultChecked>
                  Rent
                </option>
                <option value="buy">Buy</option>
              </select>
            </div>
            <div className="item">
              <label htmlFor="availableFrom">Available From</label>
              <input id="availableFrom" name="availableFrom" type="date" />
            </div>

            <div className="item">
              <label htmlFor="type">Property</label>
              <select name="property">
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="condo">Condo</option>
                <option value="land">Land</option>
              </select>
            </div>

            <div className="item">
              <label htmlFor="utilities">Utilities Policy</label>
              <select name="utilities">
                <option value="owner">Owner is responsible</option>
                <option value="tenant">Tenant is responsible</option>
                <option value="shared">Shared</option>
              </select>
            </div>
            <div className="item">
              <label htmlFor="pet">Pet Policy</label>
              <select name="pet">
                <option value="allowed">Allowed</option>
                <option value="not-allowed">Not Allowed</option>
              </select>
            </div>
            <div className="item">
              <label htmlFor="income">Income Policy</label>
              <input
                id="income"
                name="income"
                type="text"
                placeholder="Income Policy"
              />
            </div>
            <div className="item">
              <label htmlFor="size">Total Size (sqft)</label>
              <input min={0} id="size" name="size" type="number" />
            </div>
            <div className="item">
              <label htmlFor="school">Distance from School (metres)</label>
              <input min={0} id="school" name="school" type="number" />
            </div>
            <div className="item">
              <label htmlFor="bus">Distance from Bus (metres)</label>
              <input min={0} id="bus" name="bus" type="number" />
            </div>
            <div className="item">
              <label htmlFor="restaurant">
                Distance from Restaurant (metres)
              </label>
              <input min={0} id="restaurant" name="restaurant" type="number" />
            </div>
            <button className="sendButton">Add</button>
            {error && <span>{error}</span>}
          </form>
        </div>
      </div>
      <div className="sideContainer">
        {!images.length && (
          <div className="imageSkeleton">
            <div className="imageSkeleton__icon">+</div>
            <p>Upload property photos to preview them here.</p>
          </div>
        )}

        {images.map((image, index) => (
          <img src={image} key={index} alt="" />
        ))}

        <UploadWidget
          uwConfig={{
            multiple: true,
            cloudName: "dvf3kntug",
            uploadPreset: "estate",
            maxImageFileSize: 2000000,
            folder: "posts",
          }}
          setState={setImages}
        />
        <span className="uploadHint">
          Add bright front, interior, and exterior shots for a stronger listing.
        </span>
      </div>
    </div>
  );
}

export default NewPostPage;
