import React, { Suspense, useEffect, useState } from "react";
import "./profilePage.scss";
import List from "../../components/list/List";
import Chat from "../../components/chat/Chat";
import apiRequest from "../../lib/apiRequest";
import { Await, Link, useLoaderData, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

const ProfilePage = () => {
  const data = useLoaderData();
  const { currentUser, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const autoOpenUserId = searchParams.get("chatWith");

  // Add this to the top of the component
  const [selectedIds, setSelectedIds] = useState([]);

  const toggleCompare = (id) => {
    id = String(id);
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const handleCompare = () => {
    if (selectedIds.length > 3) {
      toast.error("You can only compare up to 3 properties!");
      return;
    }

    const searchParams = new URLSearchParams();
    searchParams.set("ids", selectedIds.join(","));
    navigate(`/compare?${searchParams.toString()}`);
  };

  const handleLogout = async () => {
    try {
      await apiRequest.post("/auth/logout");
      updateUser(null);
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="profilePage">
      <div className="details">
        <div className="wrapper">
          <div className="title">
            <h1>User Information</h1>
            <Link to="/profile/update">
              <button>Update Profile</button>
            </Link>
          </div>
          <div className="info">
            <span>
              Avatar:
              <img src={currentUser.avatar || "/noavatar.jpg"} alt="" />
            </span>
            <span>
              Username: <b>{currentUser.username}</b>
            </span>
            <span>
              Email: <b>{currentUser.email}</b>
            </span>
            <button onClick={handleLogout}>Logout</button>
          </div>
          <div className="title">
            <h1>My List</h1>
            <Link to="/add">
              <button>Create New Post</button>
            </Link>
          </div>
          <Suspense fallback={<p>Loading...</p>}>
            <Await
              resolve={data.postResponse}
              errorElement={<p>Error loading posts</p>}
            >
              {(postResponse) => (
                <List posts={postResponse.data.userPosts} showEdit={true} />
              )}
            </Await>
          </Suspense>
          <div className="title">
            <h1>Saved List</h1>
          </div>
          <Suspense fallback={<p>Loading...</p>}>
            <Await
              resolve={data.postResponse}
              errorElement={<p>Error loading posts</p>}
            >
              {(postResponse) => (
                <List
                  posts={postResponse.data.savedPosts}
                  compareMode={true}
                  selectedIds={selectedIds}
                  toggleCompare={toggleCompare}
                />
              )}
            </Await>
          </Suspense>
          <div className="title">
            <h1>Bought Properties</h1>
          </div>
          <Suspense fallback={<p>Loading...</p>}>
            <Await
              resolve={data.postResponse}
              errorElement={<p>Error loading posts</p>}
            >
              {(postResponse) => <List posts={postResponse.data.boughtPosts} />}
            </Await>
          </Suspense>

          {selectedIds.length >= 2 && (
            <button className="compareNowBtn" onClick={handleCompare}>
              Compare {selectedIds.length} Properties
            </button>
          )}
        </div>
      </div>
      <div className="chatContainer">
        <div className="wrapper">
          <Suspense fallback={<p>Loading...</p>}>
            <Await
              resolve={data.chatResponse}
              errorElement={<p>Error loading chats</p>}
            >
              {(chatResponse) => (
                <Chat
                  chats={chatResponse.data}
                  autoOpenUserId={autoOpenUserId}
                />
              )}
            </Await>
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
