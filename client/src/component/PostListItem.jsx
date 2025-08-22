// src/component/PostListItem.jsx
import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import Image from "./Image";

const CATEGORY_FALLBACKS = {
  programming: "/featured1.jpeg",
  "data-science": "/featured3.jpeg",
  business: "/featured5.jpeg",
  technology: "/featured6.jpeg",
  development: "/featured2.jpeg",
  travel: "/featured4.jpeg",
  general: "/featured2.jpeg",
};

function thumbSrcFor(post) {
  const cover = (post?.cover_image_url || "").trim();
  if (cover) return cover;
  const key = (post?.category || "general").toLowerCase();
  return CATEGORY_FALLBACKS[key] || CATEGORY_FALLBACKS.general;
}

function authorSlug(author = "anonymous") {
  return encodeURIComponent(author.toLowerCase().replace(/\s+/g, "-"));
}

export default function PostListItem({ post, onDelete }) {
  const { user } = useUser();
  const isAdmin = user?.publicMetadata?.role === "admin";

  const title = post?.title || "Untitled";
  const author = post?.author || "anonymous";
  const category = post?.category || "general";

  return (
    <article
      className="p-4 border rounded-lg bg-white flex items-center gap-4
             transition transform hover:-translate-y-1 hover:shadow-lg"
    >
      {/* Thumbnail */}
      <Link to={`/posts/${post.id}`} className="shrink-0 w-28 h-20 overflow-hidden rounded-md">
        <Image
          src={thumbSrcFor(post)}
          alt={title}
          className="w-28 h-20 object-cover"
          width={112}
          height={80}
        />
      </Link>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <Link
          to={`/posts/${post.id}`}
          className="block text-base md:text-lg font-semibold text-indigo-700 hover:underline truncate"
          title={title}
        >
          {title}
        </Link>

        {/* Meta: Author • Category */}
        <div className="mt-1 text-xs sm:text-sm text-gray-600 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>By</span>
          <Link
            to={`/posts?author=${encodeURIComponent(author)}`}
            className="font-medium text-indigo-700 hover:underline"
          >
            {author}
          </Link>
          <span className="text-gray-300">|</span>
          <Link
            to={`/category/${encodeURIComponent(category.toLowerCase())}`}
            className="text-indigo-700 hover:underline"
          >
            {category}
          </Link>
        </div>

        {/* Excerpt */}
        <p className="mt-1 text-sm text-gray-600 line-clamp-2">{post?.excerpt || ""}</p>
      </div>

      {/* Admin-only delete */}
      {isAdmin && onDelete && (
        <button
          onClick={onDelete}
          className="ml-2 px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-500"
        >
          Delete
        </button>
      )}
    </article>
  );
}
