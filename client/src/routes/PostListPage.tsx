import React, { useState } from "react";
import PostList from "../component/PostList";
import SideMenu from "../component/SideMenu";

export default function PostListPage(): React.ReactElement {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <h1 className="mb-8 text-2xl text-white">Development Blog</h1>

      {/* Mobile toggle button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="bg-gold text-sm text-navy-900 px-4 py-2 rounded-2xl mb-4 md:hidden font-medium hover:bg-gold-light"
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
