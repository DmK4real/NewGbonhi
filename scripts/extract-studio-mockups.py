from __future__ import annotations

import gc
import json
from pathlib import Path
from typing import Dict, List, Optional, Tuple

from psd_tools import PSDImage

PSD_SOURCE = Path(
    r"c:\Users\domin\Downloads\EN_4500x5400_All-products.psd\EN_4500x5400_All-products.psd"
)
OUTPUT_DIR = Path("src/assets/studio/mockups")
MANIFEST_PATH = Path("src/data/studioMockups.json")

BASE_LAYER_KEYS = {"RAGLAN", "TANK", "SHIRT"}
IGNORE_LAYER_KEYS = {"GUIDE"}

GROUP_NAME_FIXES = {
    "Women Ragaln": "Women's Raglan",
    "Women Raglan": "Women's Raglan",
    "Classic T-shirt Women": "Women's Classic T-shirt",
}

COLOR_META = {
    "ASPHALT": {"id": "asphalt", "label": "Asphalt", "swatch": "#4b4b50"},
    "ATHLETIC HEATHER GRAY": {
        "id": "athletic-heather-gray",
        "label": "Athletic Heather Gray",
        "swatch": "#b1b1b1",
    },
    "BABY BLUE": {"id": "baby-blue", "label": "Baby Blue", "swatch": "#9fc4eb"},
    "BLACK": {"id": "black", "label": "Black", "swatch": "#111111"},
    "BROWN": {"id": "brown", "label": "Brown", "swatch": "#6b4a36"},
    "CANBERRY": {"id": "cranberry", "label": "Cranberry", "swatch": "#8f2c41"},
    "CRANBERRY": {"id": "cranberry", "label": "Cranberry", "swatch": "#8f2c41"},
    "DARK HEAETHER GREY": {
        "id": "dark-heather-grey",
        "label": "Dark Heather Grey",
        "swatch": "#5e5e62",
    },
    "DARK HEATHER": {
        "id": "dark-heather-grey",
        "label": "Dark Heather Grey",
        "swatch": "#5e5e62",
    },
    "DARK HEATHER GREY": {
        "id": "dark-heather-grey",
        "label": "Dark Heather Grey",
        "swatch": "#5e5e62",
    },
    "DARK HEATHER GRAY": {
        "id": "dark-heather-gray",
        "label": "Dark Heather Gray",
        "swatch": "#5e5e62",
    },
    "GREEN": {"id": "green", "label": "Green", "swatch": "#3c6f3c"},
    "GRASS": {"id": "grass", "label": "Grass", "swatch": "#53a15a"},
    "HEATHER BLUE": {"id": "heather-blue", "label": "Heather Blue", "swatch": "#7fa2c7"},
    "HEATHER GRAY": {"id": "heather-gray", "label": "Heather Gray", "swatch": "#9a9a9a"},
    "HEATHER GREY": {"id": "heather-grey", "label": "Heather Grey", "swatch": "#9a9a9a"},
    "HEATHER GREY BLACK": {
        "id": "heather-grey-black",
        "label": "Heather Grey / Black",
        "swatch": "#5d5d5d",
    },
    "HEATHER GREY NAVY": {
        "id": "heather-grey-navy",
        "label": "Heather Grey / Navy",
        "swatch": "#5f667a",
    },
    "KELLY": {"id": "kelly", "label": "Kelly", "swatch": "#4aa34a"},
    "KELLY GREEN": {"id": "kelly-green", "label": "Kelly Green", "swatch": "#3ea145"},
    "LEMON": {"id": "lemon", "label": "Lemon", "swatch": "#ebd35f"},
    "NAVY": {"id": "navy", "label": "Navy", "swatch": "#1f2e56"},
    "NEON PINK": {"id": "neon-pink", "label": "Neon Pink", "swatch": "#ff4ca8"},
    "OLIVE": {"id": "olive", "label": "Olive", "swatch": "#566145"},
    "ORANGE": {"id": "orange", "label": "Orange", "swatch": "#d56d33"},
    "PINK": {"id": "pink", "label": "Pink", "swatch": "#d08cac"},
    "PURPLE": {"id": "purple", "label": "Purple", "swatch": "#6e4e9e"},
    "RED": {"id": "red", "label": "Red", "swatch": "#be1d2e"},
    "ROAYL BLUE": {"id": "royal-blue", "label": "Royal Blue", "swatch": "#2f56cf"},
    "ROYAL BLUE": {"id": "royal-blue", "label": "Royal Blue", "swatch": "#2f56cf"},
    "SAPPHIRE": {"id": "sapphire", "label": "Sapphire", "swatch": "#2c4d98"},
    "SILVER": {"id": "silver", "label": "Silver", "swatch": "#b3b3b3"},
    "SLATE": {"id": "slate", "label": "Slate", "swatch": "#5f646c"},
    "WHITE": {"id": "white", "label": "White", "swatch": "#f7f7f7"},
}


def normalize_key(value: str) -> str:
    return " ".join(value.replace("_", " ").replace("/", " ").strip().upper().split())


def slugify(value: str) -> str:
    return (
        value.strip()
        .lower()
        .replace("&", "and")
        .replace("/", "-")
        .replace("'", "")
        .replace(" ", "-")
    )


def humanize_color(key: str) -> str:
    return " ".join(part.capitalize() for part in key.split())


def set_visible_recursive(layer, visible: bool) -> None:
    layer.visible = visible
    if layer.is_group():
        for child in layer:
            set_visible_recursive(child, visible)


def find_design_layer(group):
    for child in group:
        if child.is_group():
            if normalize_key(child.name) == "GUIDE":
                for guide_layer in child:
                    if "DESIGN" in normalize_key(guide_layer.name):
                        return guide_layer
            nested = find_design_layer(child)
            if nested is not None:
                return nested
        elif "DESIGN" in normalize_key(child.name):
            return child
    return None


def color_meta(color_name: str) -> Dict[str, str]:
    key = normalize_key(color_name)
    if key in COLOR_META:
        return COLOR_META[key]
    return {"id": slugify(key), "label": humanize_color(key), "swatch": "#808080"}


def split_template_view(group_name: str) -> Tuple[str, str]:
    cleaned = " ".join(group_name.strip().split())
    upper = cleaned.upper()
    if upper.endswith(" FRONT"):
        root = cleaned[: -len(" FRONT")].strip()
        return GROUP_NAME_FIXES.get(root, root), "front"
    if upper.endswith(" BACK"):
        root = cleaned[: -len(" BACK")].strip()
        return GROUP_NAME_FIXES.get(root, root), "back"
    return GROUP_NAME_FIXES.get(cleaned, cleaned), "front"


def template_family(base_name: str) -> str:
    key = base_name.lower()
    if "sweatshirt" in key:
        return "sweatshirt"
    if "raglan" in key:
        return "raglan"
    if "tank" in key:
        return "tank"
    if "v-neck" in key:
        return "v-neck"
    if "long sleeve" in key:
        return "long-sleeve"
    return "t-shirt"


def collect_color_layers(group) -> List:
    result = []
    for child in group:
        key = normalize_key(child.name)
        if key in IGNORE_LAYER_KEYS or key in BASE_LAYER_KEYS:
            continue
        result.append(child)
    return result


def render_template_color(psd, group, color_layer):
    for top_layer in psd:
        set_visible_recursive(top_layer, False)

    group.visible = True
    set_visible_recursive(group, False)
    group.visible = True

    for child in group:
        if normalize_key(child.name) in BASE_LAYER_KEYS:
            set_visible_recursive(child, True)

    set_visible_recursive(color_layer, True)
    try:
        rendered = psd.composite()
    except Exception:
        gc.collect()
        return None, None
    crop_bbox = rendered.getchannel("A").getbbox()
    if crop_bbox is None:
        return None, None
    return rendered.crop(crop_bbox), crop_bbox


def main() -> None:
    if not PSD_SOURCE.exists():
        raise FileNotFoundError(f"PSD not found: {PSD_SOURCE}")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for stale in OUTPUT_DIR.glob("*.png"):
        stale.unlink()

    psd = PSDImage.open(PSD_SOURCE)
    manifest_templates: List[Dict] = []

    for group in psd:
        if not group.is_group():
            continue

        upper_name = normalize_key(group.name)
        if " FRONT" not in f" {upper_name}" and " BACK" not in f" {upper_name}":
            continue

        base_name, view = split_template_view(group.name)
        template_id = f"{slugify(base_name)}-{view}"
        template_label = f"{base_name} ({view.capitalize()})"
        family = template_family(base_name)

        color_layers = collect_color_layers(group)
        if not color_layers:
            print(f"skip {template_id}: no color layers")
            continue

        template_entry = {
            "id": template_id,
            "label": template_label,
            "family": family,
            "view": view,
            "designBox": None,
            "colors": [],
        }

        design_layer = find_design_layer(group)
        first_crop_bbox: Optional[tuple] = None
        seen_ids = set()

        for color_layer in color_layers:
            cropped, crop_bbox = render_template_color(psd, group, color_layer)
            if cropped is None or crop_bbox is None:
                print(f"skip color {template_id}::{color_layer.name}: empty render")
                continue

            meta = color_meta(color_layer.name)
            color_id = meta["id"]
            if color_id in seen_ids:
                print(f"skip color {template_id}::{color_layer.name}: duplicate id {color_id}")
                continue
            seen_ids.add(color_id)

            file_name = f"{template_id}--{color_id}.png"
            output_path = OUTPUT_DIR / file_name
            cropped.save(output_path)

            template_entry["colors"].append(
                {
                    "id": color_id,
                    "label": meta["label"],
                    "swatch": meta["swatch"],
                    "asset": file_name,
                }
            )

            if first_crop_bbox is None:
                first_crop_bbox = crop_bbox

            print(
                f"exported {template_id:<28} {color_id:<22} "
                f"size={cropped.size} crop={crop_bbox}"
            )

        if design_layer is not None and first_crop_bbox is not None:
            left, top, right, bottom = first_crop_bbox
            width = max(1, right - left)
            height = max(1, bottom - top)
            d_left, d_top, d_right, d_bottom = design_layer.bbox
            template_entry["designBox"] = {
                "xPct": round(((d_left - left) / width) * 100, 2),
                "yPct": round(((d_top - top) / height) * 100, 2),
                "wPct": round(((d_right - d_left) / width) * 100, 2),
                "hPct": round(((d_bottom - d_top) / height) * 100, 2),
            }

        if template_entry["colors"]:
            manifest_templates.append(template_entry)

    manifest_templates.sort(key=lambda item: item["label"])
    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST_PATH.write_text(json.dumps({"templates": manifest_templates}, indent=2), encoding="utf-8")
    print(f"manifest written to {MANIFEST_PATH} ({len(manifest_templates)} templates)")


if __name__ == "__main__":
    main()
