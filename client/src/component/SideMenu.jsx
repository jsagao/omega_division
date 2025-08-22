import { Link } from "react-router-dom";
import Search from "./Search";

export default function SideMenu() {
  return (
    <div className="px-4 h-max sticky top-8">
      <h2 className="mb-4 text-sm font-medium">Search</h2>
      <Search />

      <h2 className="mb-4 mt-6 text-sm font-medium">Filter</h2>
      <div className="flex flex-col gap-2 text-sm">
        {["Newest", "Most Popular", "Trending", "Oldest"].map((label) => (
          <label key={label} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="sort"
              value={label.toLowerCase().replace(" ", "-")}
              className="appearance-none w-4 h-4 border-[1.5px] border-blue-800 cursor-pointer rounded-sm checked:bg-blue-800"
            />
            {label}
          </label>
        ))}
      </div>

      <h2 className="mb-4 mt-6 text-sm font-medium">Categories</h2>
      <nav className="flex flex-col gap-2 text-sm">
        <Link className="underline" to="/posts">
          All
        </Link>
        <Link className="underline" to="/posts?cat=web-design">
          Web Design
        </Link>
        <Link className="underline" to="/posts?cat=development">
          Development
        </Link>
        <Link className="underline" to="/posts?cat=databases">
          Databases
        </Link>
        <Link className="underline" to="/posts?cat=search-engines">
          Search Engines
        </Link>
        <Link className="underline" to="/posts?cat=marketing">
          Marketing
        </Link>
      </nav>
    </div>
  );
}
