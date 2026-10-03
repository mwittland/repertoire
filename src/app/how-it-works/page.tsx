import Link from "next/link";
import { HowItWorksMap } from "@/components/how-it-works-map";
import { listShots } from "@/lib/shots/queries";
import { listDrills } from "@/lib/drills/queries";
import type { ShotType } from "@/lib/discovery/types";

const shotTypeDescriptions: Array<{ type: ShotType; description: string }> = [
  { type: "Dink", description: "A soft shot that lands in the opponent's kitchen, designed to stay low and create patience." },
  { type: "Drop", description: "A softer shot from deeper court that falls into the kitchen before the opponent can attack." },
  { type: "Drive", description: "A firm, fast shot that travels through the court with pace and pressure." },
  { type: "Reset", description: "A controlled softening shot that takes pace out of a difficult ball and returns you to a neutral rally." },
  { type: "Attack", description: "An intentional offensive shot aimed at creating a weak reply or forcing an error." },
  { type: "Putaway", description: "A finishing shot played when the opening is already there and the goal is to end the point." },
  { type: "Lob", description: "A high shot over the opponent that changes depth, spacing, and the rhythm of the rally." },
];

export default async function HowItWorksPage() {
  const [shots, drills] = await Promise.all([listShots(), listDrills()]);
  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <header className="max-w-3xl py-16 sm:py-20">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--coral)]">
            The Repertoire method
          </p>
          <h1 className="mt-4 text-6xl leading-none">How it works.</h1>
          <p className="mt-7 text-lg leading-8 text-[var(--muted)]">
            Repertoire turns a changing pickleball point into a clear shot or practice choice, then gives you a simple way to repeat it until it becomes part of your game.
          </p>
        </header>

        <section className="grid gap-5 border-t border-[var(--line)] py-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--coral)]">01 / Discover</p>
            <h2 className="mt-3 text-4xl">Start with the moment you are in.</h2>
          </div>
          <div className="max-w-2xl text-lg leading-8 text-[var(--muted)]">
            <p>Choose your position on the court and the height of the ball. Repertoire compares that point with shot and drill regions in the catalog and returns the options whose ranges include it.</p>
            <p className="mt-5">The result is not a single prescribed answer. It is a focused set of shots and drills that fit the geometry of the moment, so you can choose what matches your intention and skill.</p>
          </div>
        </section>

        <section className="grid gap-5 border-t border-[var(--line)] py-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--coral)]">02 / Repertoire</p>
            <h2 className="mt-3 text-4xl">Keep the shots you want to own.</h2>
          </div>
          <div className="max-w-2xl text-lg leading-8 text-[var(--muted)]">
            <p>Add shots to your repertoire and drills to your routine when they are worth practicing. Your personal sets stay separate from the full catalog.</p>
            <p className="mt-5">As you practice, use confidence for saved shots and mastery for routine drills. A low score is useful information, not a verdict: it tells you what deserves another repetition.</p>
          </div>
        </section>

        <section className="border-t border-[var(--line)] py-12">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--coral)]">03 / Shot language</p>
            <h2 className="mt-3 text-4xl">Every shot has a job. Every drill has a purpose.</h2>
          </div>
          <div className="mt-8 grid gap-x-8 gap-y-7 md:grid-cols-2 lg:grid-cols-3">
            {shotTypeDescriptions.map(({ type, description }) => (
              <article key={type} className="border-t-2 border-[var(--teal)] pt-4">
                <h3 className="text-2xl">{type}</h3>
                <p className="mt-2 leading-7 text-[var(--muted)]">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-t border-[var(--line)] py-12">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--coral)]">05 / Ratings</p>
            <h2 className="mt-3 text-4xl">Read the three signals.</h2>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <RatingExplanation title="Aggression" description="How much pressure and pace the shot is intended to create. A higher score means a more offensive choice." color="var(--coral)" />
            <RatingExplanation title="Difficulty" description="How demanding the shot is to execute consistently. A higher score means more timing, control, or precision is required." color="#648ac0" />
            <RatingExplanation title="Confidence & mastery" description="Confidence records readiness for saved shots; mastery records progress for routine drills. Both run from 0 to 100." color="var(--teal)" />
          </div>
        </section>

        <section className="border-t border-[var(--line)] py-12">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--coral)]">04 / Drill types</p>
            <h2 className="mt-3 text-4xl">Choose the practice setup that fits you.</h2>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <RatingExplanation title="Solo" description="Drills you can do completely by yourself with just a paddle and balls." color="var(--teal)" />
            <RatingExplanation title="Wall" description="Drills that require a wall or rebound surface." color="var(--teal)" />
            <RatingExplanation title="Ball Machine" description="Drills designed around feeds from a ball machine." color="var(--teal)" />
            <RatingExplanation title="Partner+" description="Drills requiring at least one other player." color="var(--teal)" />
          </div>
        </section>

        <HowItWorksMap shots={shots} drills={drills} showSubjectToggle />

        <section className="flex flex-col gap-5 border-t border-[var(--line)] py-16 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl">Ready to find your next option?</h2>
            <p className="mt-2 text-[var(--muted)]">Put the method into a real point or practice session.</p>
          </div>
          <Link href="/discover" className="rounded-xl bg-[var(--ink)] px-5 py-4 font-bold text-white transition hover:bg-[var(--teal)]">
            Open discovery
          </Link>
        </section>
      </div>
    </main>
  );
}

function RatingExplanation({ title, description, color }: { title: string; description: string; color: string }) {
  return (
    <article className="border-t-2 pt-4" style={{ borderColor: color }}>
      <h3 className="text-2xl">{title}</h3>
      <p className="mt-2 leading-7 text-[var(--muted)]">{description}</p>
    </article>
  );
}
