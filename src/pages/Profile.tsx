import { useState, useRef } from "react";
import { useStore } from "../store";
import { User as UserIcon, Camera, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Profile() {
  const { currentUser, updateUserProfile, users, shopName } = useStore();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState(currentUser?.username || "");
  const [profileImage, setProfileImage] = useState(currentUser?.profileImage || "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!currentUser) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024 * 2) {
        setError("Image size must be less than 2MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setError("");
    setSuccess("");
    
    if (!username.trim()) {
      setError("Username cannot be empty");
      return;
    }
    
    if (
      username !== currentUser.username &&
      users.some(u => u.username === username && u.id !== currentUser.id)
    ) {
      setError("Username is already taken");
      return;
    }
    
    updateUserProfile(username, profileImage);
    setSuccess("Profile updated successfully! Redirecting...");
    
    setTimeout(() => {
      setSuccess("");
      navigate("/");
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center">
          <UserIcon className="h-6 w-6 mr-3 text-indigo-600" />
          Edit Profile
        </h2>
      </div>

      <div className="p-8 max-w-2xl w-full">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm font-bold border border-red-100">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-bold border border-emerald-100">
            {success}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-8 items-start">
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-indigo-100 flex items-center justify-center relative">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-indigo-500 uppercase">
                    {username ? username[0] : currentUser.email[0]}
                  </span>
                )}
                
                <div 
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">Click image to change (Max 2MB)</p>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>

          <div className="flex-1 w-full space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-3"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                type="email"
                value={currentUser.email}
                disabled
                className="w-full bg-slate-100 border border-slate-200 text-slate-500 cursor-not-allowed text-sm rounded-lg p-3"
              />
              <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-bold">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Company / Shop Name
              </label>
              <input
                type="text"
                value={shopName || ""}
                disabled
                className="w-full bg-slate-100 border border-slate-200 text-slate-500 cursor-not-allowed text-sm rounded-lg p-3 font-medium"
              />
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={handleSave}
                className="flex items-center px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-bold text-sm shadow-sm"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
