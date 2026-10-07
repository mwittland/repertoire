import Link from "next/link";
import { HowItWorksMap } from "@/components/how-it-works-map";
import type { ShotType } from "@/lib/discovery/types";
import { listShots } from "@/lib/shots/queries";

const shotTypes: Array<{ name: ShotType; description: string }> = [
  {
    name: "Dink",
    description:
      "A soft, low shot into the kitchen that creates patience and a difficult attack.",
  },
  {
    name: "Drop",
    description:
      "A softer shot from deep court that falls into the kitchen before it can be attacked.",
  },
  {
    name: "Drive",
    description: "A firm, fast shot that applies pace and pressure.",
  },
  {
    name: "Reset",
    description:
      "A controlled softening shot that takes pace out of a difficult ball.",
  },
  {
    name: "Attack",
    description:
      "An intentional offensive shot designed to create a weak reply.",
  },
  {
    name: "Putaway",
    description: "A finishing shot played when the opening is already there.",
  },
  {
    name: "Lob",
    description:
      "A high shot over the opponent that changes depth and spacing.",
  },
];

export default async function HelpPage() {
  const shots = await listShots();

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <header className="max-w-3xl py-16">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--coral)]">
            Help and guidance
          </p>
          <h1 className="mt-4 text-6xl leading-none">Understand the system.</h1>
          <p className="mt-6 text-lg leading-8 text-[var(--muted)]">
            Repertoire connects the moment you are in with useful shots, then
            helps you practice the options you want to own.
          </p>
        </header>

        <HelpSection eyebrow="01 / Shot types" title="Every shot has a job">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {shotTypes.map((shot) => (
              <Explanation
                key={shot.name}
                title={shot.name}
                text={shot.description}
                color="var(--teal)"
              />
            ))}
          </div>
        </HelpSection>

        <HelpSection eyebrow="02 / Ratings" title="Read the signals">
          <div className="grid gap-5 md:grid-cols-3">
            <Explanation
              title="Aggression"
              text="How much pressure and pace a shot is intended to create."
              color="var(--coral)"
            />
            <Explanation
              title="Difficulty"
              text="How demanding a shot is to execute consistently. Higher means more timing, control, or precision."
              color="#648ac0"
            />
            <Explanation
              title="Mastery"
              text="Your current ability to execute a shot."
              color="#d8a43f"
            />
          </div>
        </HelpSection>

        <HelpSection
          eyebrow="03 / Catalog map"
          title="See the catalog at a glance"
        >
          <p>
            The map shows the full shot catalog.
          </p>
          <div className="mx-auto w-full max-w-5xl">
            <HowItWorksMap
              shots={shots}
              mapModes={["coverage"]}
              initialMapMode="coverage"
              showShotTypeFilter
              shotTypeFilterAtBottom
              showShotTypeColors
              showMasteryLegend={false}
              showHandednessFilter={false}
              showBallHeightFilter={false}
              hideSidePanel
              hideHeader
              heading="Explore the shot catalog."
              description="Filter the shot regions by type."
            />
          </div>
        </HelpSection>

        <section className="flex flex-wrap items-center justify-between gap-5 border-t border-[var(--line)] py-12">
          <p className="text-lg text-[var(--muted)]">
            Ready to put it into practice?
          </p>
          <Link
            href="/repertoire/quiz"
            className="rounded-xl bg-[var(--ink)] px-5 py-4 font-bold text-white"
          >
            Take the profile quiz
          </Link>
        </section>
      </div>
    </main>
  );
}

function HelpSection({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-[var(--line)] py-12">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--coral)]">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-4xl">{title}</h2>
      <div className="mt-6 max-w-4xl space-y-4 text-lg leading-8 text-[var(--muted)]">
        {children}
      </div>
    </section>
  );
}

function Explanation({
  title,
  text,
  color,
}: {
  title: string;
  text: string;
  color: string;
}) {
  return (
    <article className="border-t-2 pt-4" style={{ borderColor: color }}>
      <h3 className="text-2xl text-[var(--ink)]">{title}</h3>
      <p className="mt-2 text-base leading-7 text-[var(--muted)]">{text}</p>
    </article>
  );
}
