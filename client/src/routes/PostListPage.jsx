import PostList from "../component/PostList";
import SideMenu from "../component/SideMenu";
import { useState } from "react";

export default function PostListPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <h1 className="mb-8 text-2xl">Development Blog</h1>

      {/* Mobile toggle button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="bg-blue-800 text-sm text-white px-4 py-2 rounded-2xl mb-4 md:hidden"
      >
        {open ? "Close" : "Filter or Search"}
      </button>

      {/* Content + Sidebar */}
      <div className="flex flex-col-reverse md:flex-row gap-8">
        {/* Main content grows to fill space */}
        <main className="flex-1 min-w-0">
          <PostList />
        </main>

        {/* Sidebar: full width on mobile (toggled), fixed on md+ */}
        <aside className={`${open ? "block" : "hidden"} md:block md:w-72 lg:w-80 px-0`}>
          <SideMenu />
        </aside>
      </div>
    </div>
  );
}
