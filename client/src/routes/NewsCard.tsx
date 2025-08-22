import React from "react";

type Card = {
    id: string;
    image: string;
    title: string;
    kicker?: string;
    source: string;
    age: string;
  };

export default function NewsCard({ card, compact = false }: { card: Card; compact?: boolean }) {
    return (
      <article className="bg-white rounded-lg overflow-hidden shadow">
        <div className={compact ? "aspect-[16/9]" : "aspect-[16/9]"} >
          <img src={card.image} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="p-3">
          <h3 className="font-semibold leading-snug">{card.title}</h3>
          <div className="mt-2 flex flex-wrap gap-1">
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {card.source} • {card.age}
          </div>
        </div>
      </article>
    );
  }