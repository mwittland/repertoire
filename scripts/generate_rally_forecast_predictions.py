"""Generate static rally forecast predictions from the local AutoML server."""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen


SEQUENCES_BY_LENGTH = {
    3: (
        ("SE", "R", "tsDrp"),
        ("SE", "R", "tsDrv"),
    ),
    4: (
        ("R", "tsDrp", "D"),
        ("R", "tsDrp", "HB"),
        ("R", "tsDrv", "D"),
        ("R", "tsDrv", "HB"),
    ),
    5: (
        ("tsDrp", "D", "D"),
        ("tsDrp", "D", "HB"),
        ("tsDrv", "HB", "D"),
        ("tsDrv", "HB", "SP"),
    ),
    6: (
        ("D", "D", "D"),
        ("D", "D", "HB"),
        ("D", "HB", "D"),
        ("HB", "HB", "D"),
        ("HB", "HB", "HB"),
        ("tsDrp", "D", "HB"),
        ("tsDrv", "HB", "D"),
    ),
    7: (
        ("D", "D", "D"),
        ("D", "D", "HB"),
        ("D", "HB", "D"),
        ("HB", "HB", "D"),
        ("HB", "HB", "HB"),
        ("HB", "D", "HB"),
    ),
}

SCENARIOS = [
    {
        "currentLength": current_length,
        "skillLevel": skill_level,
        "shotTwoAgo": sequence[0],
        "shotOneAgo": sequence[1],
        "latestShot": sequence[2],
    }
    for skill_level in ("3.5", "4.0", "4.5", "5.0", "Pro")
    for current_length, sequences in SEQUENCES_BY_LENGTH.items()
    for sequence in sequences
]


def predict(endpoint: str) -> list[dict[str, object]]:
    payload = {
        "instances": [
            {
                "current_length": str(scenario["currentLength"]),
                "skill_level": scenario["skillLevel"],
                "shot_two_ago": scenario["shotTwoAgo"],
                "shot_one_ago": scenario["shotOneAgo"],
                "latest_shot": scenario["latestShot"],
            }
            for scenario in SCENARIOS
        ]
    }
    request = Request(
        endpoint,
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urlopen(request) as response:
        body = json.load(response)

    predictions = body["predictions"]
    return [
        {
            **scenario,
            "probabilityRallyReaches11": round(
                float(prediction["scores"][prediction["classes"].index("true")]),
                4,
            ),
        }
        for scenario, prediction in zip(SCENARIOS, predictions, strict=True)
    ]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--endpoint", default="http://localhost:8501/predict")
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    result = {
        "model": {
            "name": "rally-forecast-11-model",
            "vertexModelId": "5306111724007456768",
            "target": "rally_reaches_11",
            "source": "Locally run Vertex AI AutoML export",
        },
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "note": "Static predictions generated offline; the website does not call the model at runtime.",
        "predictions": predict(args.endpoint),
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
