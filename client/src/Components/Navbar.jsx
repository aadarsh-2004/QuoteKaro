import BellIcon from "../Utils/BellIcon.jsx";
import CreditsBtn from "../Utils/ChooseTemplateBtn.jsx";
import { auth } from "../../firebase";
import { useNavigate, Link } from "react-router-dom";
import { FileSignature } from "lucide-react";
function Navbar() {
  const navigate = useNavigate();

  const getUserInfo = () => {
    const user = auth.currentUser;
    if (user) {
      return {
        name: user.displayName || "User",
        email: user.email || "",
        avatar: user.photoURL || null,
      };
    }
    return {
      name: "User",
      email: "",
      avatar: null,
    };
  };

  const userInfo = getUserInfo();

  const handleAvatarClick = () => {
    navigate("/profile");
  };

  return (
    <nav className="md:hidden bg-transparent border-b border-gray-200 text-white">
      <div className="max-w-8xl mx-auto px-4 py-1">
        <div className="flex justify-between items-center h-16">
          {/* LOGO */}
          <div className="flex justify-center gap-2">
            {/* <FileSignature className="w-4 h-4 text-white" /> */}
            <img src="/bgremovelogo.png" alt="logo" className="w-38 h-38" />

            {/* <a href="/dashboard">
            <h1 className="text-lg pt-1 font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">QuoteKaro</h1>
          </a> */}
          </div>
          {/* Right Icons */}
          <div className="flex items-center space-x-3">
            {/* Bell */}
            <Link to="/notifications">
              <BellIcon />
            </Link>
            {/* Credits - Desktop only */}
            <div className="hidden md:block">
              <CreditsBtn />
            </div>

            {/* Avatar */}
            <button
              onClick={handleAvatarClick}
              className="w-8 h-8 rounded-full overflow-hidden focus:outline-none"
              title="Profile"
            >
              {userInfo.avatar ? (
                <img
                  src={userInfo.avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center font-semibold text-sm uppercase">
                  {userInfo.name.charAt(0)}
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
