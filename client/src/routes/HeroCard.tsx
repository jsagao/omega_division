
import React from "react";

type Card = {
  id: string;
  image: string;
  title: string;
  kicker?: string;
  source: string;
  age: string;
};

export default function HeroCard({ card }: { card: Card }) {
    return (
      <article className="bg-white rounded-lg overflow-hidden shadow">
        <div className="aspect-[16/9] w-full overflow-hidden">
          <img src={card.image} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="px-4 pt-4 pb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
            {card.title}
          </h1>
          {card.kicker && (
            <p className="mt-2 text-gray-600 text-base md:text-lg">
              {card.kicker}
            </p>
          )}
          <div className="mt-3 text-sm text-gray-500">
            {card.source} • {card.age}
          </div>
        </div>
      </article>
    );
  }