import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useContext,
} from "react";
import { X, Save, ImageIcon } from "lucide-react";
import UserContext from "@/context/UserContext";
import axios from "axios";
import { BACKENDURL } from "@/config";
import { useNavigate } from "react-router-dom";
import Loading from "@/components/Loading";

interface PostData {
   title: string;
  description: string;
  imagePreview: string | null; // for UI
  imageFile: File | null;      // for backend

}

const AddPost: React.FC = () => {
  const [postData, setPostData] = useState<PostData>({
    title: '',
  description: '',
  imagePreview: null,
  imageFile: null,

  });
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setTabOpen, setLoading, currentUserDetails }: any =
    useContext(UserContext);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

 const handleFile = (file: File) => {
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      setPostData(prev => ({
        ...prev,
        imagePreview: e.target?.result as string,
        imageFile: file,
      }));
    };
    reader.readAsDataURL(file);
  }
};

const handleDrop = useCallback((e: React.DragEvent) => {
  e.preventDefault();
  setIsDragging(false);
  const imageFile = Array.from(e.dataTransfer.files).find(file => file.type.startsWith('image/'));
  if (imageFile) handleFile(imageFile);
}, []);

const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) handleFile(file);
};

  const removeImage = () => {
    setPostData((prev) => ({ ...prev, imagePreview: null, imageFile: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleInputChange = (field: keyof PostData, value: string) => {
    setPostData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
  setLoading(true);

  if (!postData.imageFile) {
    alert("Please select a picture before uploading.");
    setLoading(false);
    return;
  }

  const formData = new FormData();
  formData.append("content", postData.imageFile); // ✅ raw file
  formData.append("title", postData.title);
  formData.append("description", postData.description);

  try {
    await axios.post(`${BACKENDURL}/profile/post`, formData, {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    navigate(`/profile?user=${currentUserDetails.username}`);
  } catch (error) {
    console.error("Upload error:", error);
    alert("Upload failed. Please try again.");
  }

  setLoading(false);
};
useEffect(()=>{
  setTabOpen("newpost")
  if(localStorage.getItem("currentUser")===null){
      navigate("/")
    }
})
const [generating, setGenerating] = useState(false);

async function generateDescription() {
  if (!postData.title.trim()) {
    alert("Add a title first so AI can generate a description.");
    return;
  }
  setGenerating(true);
  try {
    const response = await axios.post(
      `${BACKENDURL}/ai/generate-description`,
      { title: postData.title },
      { withCredentials: true }
    );
    setPostData((prev) => ({
      ...prev,
      description: response.data?.description || "",
    }));
  } catch (error) {
    console.error("AI description generation failed:", error);
    alert("AI generation failed. Check your API key and network, then try again.");
  } finally {
    setGenerating(false);
  }
}


  return (
    <div className="min-h-screen bg-gray-50 pb-30 sm:pb-0">
      {/* Header */}
      <Loading/>
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">New post</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSave}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded cursor-pointer text-sm font-medium transition-colors flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Publish
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Left Column - Image Upload */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Upload Image
              </h2>

              {!postData.imagePreview ? (
                <div
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    isDragging
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Drag and drop an image here
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    or click to browse
                  </p>
                  <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Choose File
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={postData.imagePreview}
                    alt="Upload preview"
                    className="w-full h-auto rounded-xl shadow-md"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute top-3 right-3 bg-white hover:bg-gray-100 p-2 rounded-full shadow-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Post Details
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={postData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Add a title"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {postData.title.length}/100 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Generate with AI
                    <button
                      onClick={generateDescription}
                      disabled={generating}
                      className="ml-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      {generating ? "Generating..." : "Generate"}
                    </button>
                  </label>
                  <textarea
                    value={postData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Tell everyone what your Pin is about"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors resize-none"
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {postData.description.length}/500 characters
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPost;
