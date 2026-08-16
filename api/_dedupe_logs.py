"""_dedupe_logs.py — build duplicate/related groupings from relatedTo field.

Deterministic. No LLM call. Part of Layer 3 tools.
Reads the LLM's relatedTo output and builds bidirectional groupings.
"""

from collections import defaultdict


def dedupe_logs(results: list[dict]) -> list[dict]:
    """Ensure relatedTo is bidirectional — if A lists B, B lists A.

    Also builds group IDs so the UI can cluster related entries together.

    Args:
        results: List of triage result dicts with 'id' and 'relatedTo' fields.

    Returns:
        Same list with bidirectional relatedTo and a 'groupId' field added.
    """
    # Build adjacency: for each result, ensure bidirectional links
    by_id = {r["id"]: r for r in results}
    id_set = set(by_id.keys())

    for result in results:
        related = result.get("relatedTo", [])
        # Filter out invalid IDs references
        related = [rid for rid in related if rid in id_set and rid != result["id"]]
        result["relatedTo"] = sorted(set(related))

    # Make bidirectional
    for result in results:
        for related_id in result["relatedTo"]:
            other = by_id.get(related_id)
            if other and result["id"] not in other.get("relatedTo", []):
                other["relatedTo"].append(result["id"])
                other["relatedTo"] = sorted(set(other["relatedTo"]))

    # Assign group IDs via connected components (Union-Find)
    parent = {r_id: r_id for r_id in id_set}

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    def union(x, y):
        px, py = find(x), find(y)
        if px != py:
            parent[px] = py

    for result in results:
        for related_id in result["relatedTo"]:
            union(result["id"], related_id)

    groups = defaultdict(list)
    for result in results:
        root = find(result["id"])
        groups[root].append(result["id"])

    for result in results:
        root = find(result["id"])
        result["groupId"] = f"group-{root}"

    return results
