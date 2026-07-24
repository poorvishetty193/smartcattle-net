"use client";

import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import ViewToggle from "./components/ViewToggle";
import FilterBar from "./components/FilterBar";
import CowCard from "./components/CowCard";
import AddCowCard from "./components/AddCowCard";

import { cows } from "./data/cows";

export default function HerdPage() {
  return (
    <main className="min-h-screen bg-[#F5FBF5] p-8">

      {/* Header */}

      <section className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <Header total={cows.length} />

        <div className="flex items-center gap-4">
          <SearchBar />
          <ViewToggle />
        </div>

      </section>

      {/* Filters */}

      <FilterBar />

      {/* Cow Grid */}

      <section className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">

        {cows.map((cow) => (
          <CowCard
            key={cow.id}
            cow={cow}
          />
        ))}

        <AddCowCard />

      </section>

    </main>
  );
}