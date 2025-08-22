import { Link } from "react-router-dom";
import React from "react";

export default function LatestItem({ title, source, age }: { title: string; source: string; age: string }) {
    return (
      <Link to="#" className="block py-3 hover:bg-gray-50 rounded">
        <div className="font-medium leading-snug">{title}</div>
        <div className="text-xs text-gray-500">{source} • {age}</div>
      </Link>
    );
  }