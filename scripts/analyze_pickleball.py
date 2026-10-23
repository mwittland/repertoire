"""Generate the public pickleball analytics summary from Kaggle CSV extracts."""

from __future__ import annotations

import argparse
import csv
import json
import statistics
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any


SHOT_LABELS = {
    "A": "ATP",
    "D": "Dink",
    "E": "Ernie",
    "HB": "Hand Battle",
    "L": "Lob",
    "O": "Other",
    "R": "Return",
    "Res": "Reset",
    "SE": "Serve",
    "SP": "Speed Up",
    "U": "Unknown",
    "tsApp": "Transition Zone - Approach",
    "tsDrp": "3rd Shot Drop",
    "tsDrv": "3rd Shot Drive",
    "tsLob": "3rd Shot Lob",
    "tzRep": "Transition Zone - Repel",
}

THIRD_SHOT_TYPES = ("tsDrp", "tsDrv", "tsLob")
ENDING_TYPES = ("Winner", "Error", "Unforced Error", "Other")


def read_csv(root: Path, filename: str) -> list[dict[str, str]]:
    with (root / filename).open(newline="", encoding="utf-8-sig") as file:
        return list(csv.DictReader(file))


def percentage(value: int, total: int) -> float:
    return round(value * 100 / total, 1) if total else 0


def distribution(counter: Counter[str], total: int, labels: dict[str, str] | None = None) -> list[dict[str, Any]]:
    return [
        {
            "code": key,
            "label": (labels or {}).get(key, key),
            "count": count,
            "percent": percentage(count, total),
        }
        for key, count in counter.most_common()
    ]


def summarize(root: Path) -> dict[str, Any]:
    games = read_csv(root, "game.csv")
    rallies = read_csv(root, "rally.csv")
    shots = read_csv(root, "shot.csv")

    shots_by_rally: defaultdict[str, list[dict[str, str]]] = defaultdict(list)
    for shot in shots:
        shots_by_rally[shot["rally_id"]].append(shot)

    rally_lengths = [
        int(rally["rally_len"])
        for rally in rallies
        if rally["rally_len"].isdigit()
    ]
    rally_length_buckets = Counter(
        "1-3" if length <= 3 else
        "4-6" if length <= 6 else
        "7-10" if length <= 10 else
        "11-20" if length <= 20 else
        "21+"
        for length in rally_lengths
    )

    ordered_sequences: dict[str, list[str]] = {}
    third_shot_rows: list[tuple[str, str]] = []
    for rally in rallies:
        sequence = sorted(
            shots_by_rally.get(rally["rally_id"], []),
            key=lambda shot: int(shot["shot_nbr"]),
        )
        shot_types = [shot["shot_type"] or "Missing" for shot in sequence]
        if shot_types:
            ordered_sequences[rally["rally_id"]] = shot_types
        third_shot = next(
            (shot["shot_type"] for shot in sequence if shot["shot_nbr"] == "3"),
            None,
        )
        if third_shot in THIRD_SHOT_TYPES:
            third_shot_rows.append((third_shot, rally["ending_type"] or "Missing"))

    third_shot_outcomes = []
    for shot_type in THIRD_SHOT_TYPES:
        rows = [ending for current_type, ending in third_shot_rows if current_type == shot_type]
        outcomes = Counter(rows)
        third_shot_outcomes.append(
            {
                "code": shot_type,
                "label": SHOT_LABELS[shot_type],
                "rallies": len(rows),
                "outcomes": [
                    {
                        "label": ending,
                        "count": outcomes[ending],
                        "percent": percentage(outcomes[ending], len(rows)),
                    }
                    for ending in ENDING_TYPES
                    if outcomes[ending]
                ],
            }
        )

    sequence_counter = Counter(
        " → ".join(SHOT_LABELS.get(shot_type, shot_type) for shot_type in sequence[:3])
        for sequence in ordered_sequences.values()
        if len(sequence) >= 3
    )
    top_sequences = [
        {"sequence": sequence, "count": count}
        for sequence, count in sequence_counter.most_common(8)
    ]

    game_dates = sorted(
        game["dt_played"]
        for game in games
        if (
            len(game["dt_played"]) == 10
            and game["dt_played"][4] == "-"
            and not game["dt_played"].startswith("0001")
        )
    )
    return {
        "source": {
            "dataset": "cakesofspan/pklmarts-competitive-pickleball-extracts",
            "version": "6",
            "dateRange": {
                "start": game_dates[0] if game_dates else None,
                "end": game_dates[-1] if game_dates else None,
            },
        },
        "overview": {
            "games": len(games),
            "rallies": len(rallies),
            "shots": len(shots),
            "annotatedRallies": len(ordered_sequences),
            "annotationCoveragePercent": percentage(len(ordered_sequences), len(rallies)),
            "averageRallyLength": round(statistics.mean(rally_lengths), 2),
            "medianRallyLength": statistics.median(rally_lengths),
            "p90RallyLength": sorted(rally_lengths)[int(0.9 * len(rally_lengths)) - 1],
            "longestRally": max(rally_lengths),
        },
        "rallyLengths": [
            {"label": label, "count": rally_length_buckets[label]}
            for label in ("1-3", "4-6", "7-10", "11-20", "21+")
        ],
        "shotTypes": distribution(
            Counter(shot["shot_type"] or "Missing" for shot in shots),
            len(shots),
            SHOT_LABELS,
        ),
        "rallyEndings": distribution(
            Counter(rally["ending_type"] or "Missing" for rally in rallies),
            len(rallies),
        ),
        "skillLevels": distribution(
            Counter(game["skill_lvl"] for game in games),
            len(games),
        ),
        "thirdShotOutcomes": third_shot_outcomes,
        "topSequences": top_sequences,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=Path, required=True, help="Directory containing the Kaggle CSV files")
    parser.add_argument("--output", type=Path, required=True, help="Output JSON path")
    args = parser.parse_args()

    summary = summarize(args.input)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(summary, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
