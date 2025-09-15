import React, { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, X } from 'lucide-react';

interface Post {
    id: string;
    username: string;
    userAvatar: string;
    location?: string;
    image: string;
    caption: string;
    likes: number;
    timestamp: string;
    comments: Comment[];
    isLiked: boolean;
    isBookmarked: boolean;
}

interface Comment {
  id: string;
  username: string;
  text: string;
  timestamp: string;
}

const InstagramHomepage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      username: 'john_doe',
      userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      location: 'New York, NY',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop',
      caption: 'Beautiful sunset at the mountains! 🌅 #nature #photography',
      likes: 1234,
      timestamp: '2 hours ago',
      isLiked: false,
      isBookmarked: false,
      comments: [
        { id: '1', username: 'jane_smith', text: 'Absolutely stunning! 😍', timestamp: '1h' },
        { id: '2', username: 'mike_photo', text: 'Great shot! What camera did you use?', timestamp: '45m' },
        { id: '3', username: 'nature_lover', text: 'This gives me major wanderlust vibes!', timestamp: '30m' },
        { id: '4', username: 'photographer_ace', text: 'The colors are incredible! 🔥', timestamp: '20m' }
      ]
    },
    {
      id: '2',
      username: 'travel_wanderer',
      userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      location: 'Paris, France',
      image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=600&h=600&fit=crop',
      caption: 'Exploring the streets of Paris ✨ There\'s magic in every corner of this city!',
      likes: 892,
      timestamp: '4 hours ago',
      isLiked: true,
      isBookmarked: true,
      comments: [
        { id: '5', username: 'paris_lover', text: 'I miss this city so much! 💕', timestamp: '2h' },
        { id: '6', username: 'photographer_pro', text: 'The lighting is perfect!', timestamp: '1h' },
        { id: '7', username: 'travel_buddy', text: 'Adding this to my bucket list!', timestamp: '45m' }
      ]
    },
    {
      id: '3',
      username: 'food_enthusiast',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      location: 'Tokyo, Japan',
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&h=600&fit=crop',
      caption: 'Homemade ramen that took 12 hours to make 🍜 Worth every minute!',
      likes: 2156,
      timestamp: '6 hours ago',
      isLiked: false,
      isBookmarked: false,
      comments: [
        { id: '8', username: 'ramen_master', text: 'Recipe please! 🙏', timestamp: '3h' },
        { id: '9', username: 'foodie_life', text: 'This looks incredible!', timestamp: '2h' },
        { id: '10', username: 'chef_tokyo', text: '12 hours well spent! The broth must be amazing', timestamp: '1h' },
        { id: '11', username: 'noodle_fan', text: 'My mouth is watering 🤤', timestamp: '45m' }
      ]
    }
  ]);
  
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [newComment, setNewComment] = useState<string>('');

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    ));
  };

  const handleBookmark = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isBookmarked: !post.isBookmarked }
        : post
    ));
  };

  const addComment = (postId: string) => {
    if (!newComment.trim()) return;
    
    const newCommentObj: Comment = {
      id: Date.now().toString(),
      username: 'you',
      text: newComment.trim(),
      timestamp: 'now'
    };

    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, comments: [...post.comments, newCommentObj] }
        : post
    ));

    // Update selected post if it's the same post
    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost({
        ...selectedPost,
        comments: [...selectedPost.comments, newCommentObj]
      });
    }

    setNewComment('');
  };

  const openComments = (post: Post) => {
    setSelectedPost(post);
  };

  const closeComments = () => {
    setSelectedPost(null);
    setNewComment('');
  };

  const formatLikes = (likes: number): string => {
    if (likes >= 1000000) {
      return `${(likes / 1000000).toFixed(1)}M`;
    } else if (likes >= 1000) {
      return `${(likes / 1000).toFixed(1)}K`;
    }
    return likes.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
    
      {/* Main Feed */}
      <main className="max-w-md mx-auto bg-white">
        {posts.map((post) => (
          <article key={post.id} className="border-b border-gray-100 last:border-b-0" onClick={(e) => e.stopPropagation()}>
            {/* Post Header */}
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center space-x-3">
                <img
                  src={post.userAvatar}
                  alt={post.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-sm text-gray-900">{post.username}</p>
                  {post.location && (
                    <p className="text-xs text-gray-500">{post.location}</p>
                  )}
                </div>
              </div>
              <MoreHorizontal className="w-5 h-5 text-gray-700 cursor-pointer" />
            </div>

            {/* Post Image */}
            <div className="aspect-square">
              <img
                src={post.image}
                alt="Post content"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Post Actions */}
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center space-x-4">
                <Heart
                  className={`w-6 h-6 cursor-pointer transition-colors ${
                    post.isLiked ? 'text-red-500 fill-red-500' : 'text-gray-700 hover:text-red-500'
                  }`}
                  onClick={() => handleLike(post.id)}
                />
                <MessageCircle 
                  className="w-6 h-6 text-gray-700 cursor-pointer hover:text-blue-500 transition-colors"
                  onClick={() => openComments(post)}
                />
                <Send className="w-6 h-6 text-gray-700 cursor-pointer hover:text-blue-500 transition-colors" />
              </div>
              <Bookmark
                className={`w-6 h-6 cursor-pointer transition-colors ${
                  post.isBookmarked ? 'text-gray-900 fill-gray-900' : 'text-gray-700 hover:text-gray-900'
                }`}
                onClick={() => handleBookmark(post.id)}
              />
            </div>

            {/* Post Info */}
            <div className="px-3 pb-2">
              <p className="font-semibold text-sm text-gray-900 mb-1">
                {formatLikes(post.likes)} likes
              </p>
              <div className="text-sm">
                <span className="font-semibold text-gray-900 mr-2">{post.username}</span>
                <span className="text-gray-700">{post.caption}</span>
              </div>
              {post.comments.length > 0 && (
                <button 
                  className="text-sm text-gray-500 mt-1 hover:text-gray-700 transition-colors"
                  onClick={() => openComments(post)}
                >
                  View all {post.comments.length} comments
                </button>
              )}
              
              {/* Show first two comments */}
              <div className="mt-1">
                {post.comments.slice(0, 2).map((comment) => (
                  <div key={comment.id} className="text-sm">
                    <span className="font-semibold text-gray-900 mr-2">{comment.username}</span>
                    <span className="text-gray-700">{comment.text}</span>
                  </div>
                ))}
              </div>
              
              <p className="text-xs text-gray-400 mt-1 uppercase tracking-wide">
                {post.timestamp}
              </p>
            </div>

            {/* Add Comment */}
            <div className="flex items-center border-t border-gray-100 p-3">
              <input
                type="text"
                placeholder="Add a comment..."
                className="flex-1 text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addComment(post.id);
                  }
                }}
              />
              <button 
                className={`text-sm font-semibold ml-2 transition-colors ${
                  newComment.trim() ? 'text-blue-500 hover:text-blue-700' : 'text-gray-400'
                }`}
                onClick={() => addComment(post.id)}
                disabled={!newComment.trim()}
              >
                Post
              </button>
            </div>
          </article>
        ))}
      </main>

      {/* Comments Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full max-w-md mx-auto max-h-[80vh] flex flex-col rounded-t-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Comments</h3>
              <button onClick={closeComments}>
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Original Post */}
              <div className="flex space-x-3 pb-4 border-b border-gray-100">
                <img
                  src={selectedPost.userAvatar}
                  alt={selectedPost.username}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="text-sm">
                    <span className="font-semibold text-gray-900 mr-2">{selectedPost.username}</span>
                    <span className="text-gray-700">{selectedPost.caption}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{selectedPost.timestamp}</p>
                </div>
              </div>

              {/* Comments */}
              {selectedPost.comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <img
                    src={comment.username === 'you' 
                      ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face'
                      : 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&h=150&fit=crop&crop=face'
                    }
                    alt={comment.username}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="text-sm">
                      <span className="font-semibold text-gray-900 mr-2">{comment.username}</span>
                      <span className="text-gray-700">{comment.text}</span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      <p className="text-xs text-gray-400">{comment.timestamp}</p>
                      <button className="text-xs text-gray-500 font-semibold hover:text-gray-700 transition-colors">
                        Reply
                      </button>
                      <Heart className="w-3 h-3 text-gray-500 cursor-pointer hover:text-red-500 transition-colors" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Comment Input */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                <img
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face"
                  alt="Your avatar"
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 flex items-center border border-gray-200 rounded-full px-4 py-2">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    className="flex-1 text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addComment(selectedPost.id);
                      }
                    }}
                  />
                  <button
                    className={`ml-2 text-sm font-semibold transition-colors ${
                      newComment.trim() ? 'text-blue-500 hover:text-blue-700' : 'text-gray-400'
                    }`}
                    onClick={() => addComment(selectedPost.id)}
                    disabled={!newComment.trim()}
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstagramHomepage;