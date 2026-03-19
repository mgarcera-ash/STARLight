#!/usr/bin/env python3
import argparse
import csv
import re
from pathlib import Path


def sql_quote(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def sql_text_or_null(value: str | None) -> str:
    if value is None:
        return "null"
    value = value.strip()
    return "null" if value == "" else sql_quote(value)


def sql_int_or_null(value: str | None) -> str:
    if value is None:
        return "null"
    digits = re.sub(r"[^0-9]", "", value)
    return digits if digits else "null"


def sql_array(values: list[str]) -> str:
    cleaned = [value for value in values if value]
    if not cleaned:
        return "'{}'::text[]"
    inner = ", ".join(sql_quote(value) for value in cleaned)
    return f"array[{inner}]::text[]"


def slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")


def split_notes(notes: str) -> list[str]:
    if not notes or notes.strip().lower() == "none":
        return []
    parts = []
    for line in notes.splitlines():
        line = line.strip()
        if not line:
            continue
        if line.startswith("-"):
            line = line[1:].strip()
        parts.append(line)
    return parts


def normalize_phone(phone: str) -> str | None:
    if not phone:
        return None
    phone = re.sub(r"\s*\n\s*", " / ", phone.strip())
    phone = re.sub(r"\s{2,}", " ", phone)
    return phone or None


def derive_availability_type(value: str) -> str | None:
    lower = value.lower().strip()
    if not lower:
        return None
    if "24hr" in lower or "24 hr" in lower or "24/7" in lower:
        return "twenty_four_hours"
    if "overnight" in lower:
        return "overnight"
    return "scheduled"


def derive_intake_type(notes: list[str], availability: str) -> str:
    text = " ".join(notes).lower()
    if "walk ins allowed" in text or "walk-ins allowed" in text:
        return "walk_in"
    if "officer is supposed to facilitate" in text or "dfss request" in text:
        return "referral"
    if availability.strip():
        return "call_first"
    return "call_first"


def derive_accessibility_tags(notes: list[str], elevator: str, wheelchair: str) -> list[str]:
    tags: list[str] = []
    joined = " ".join(notes).lower()
    wheelchair_yes = wheelchair.strip().lower() == "yes"
    wheelchair_no = wheelchair.strip().lower() == "no" or "not wheelchair accessible" in joined
    elevator_yes = elevator.strip().lower() == "yes" or "has elevator" in joined

    if wheelchair_yes or ("wheelchair accessible" in joined and not wheelchair_no):
        tags.append("wheelchair_accessible")
    if elevator_yes:
        tags.append("elevator")
    ground_floor_signals = [
        "main floor",
        "ground floor",
        "shelter on 1st floor",
        "shelter 1st and 2nd floor",
        "during day 1st floor",
    ]
    if any(signal in joined for signal in ground_floor_signals):
        tags.append("ground_floor")
    return sorted(set(tags))


def derive_service_tags(notes: list[str], availability: str, accessibility_tags: list[str]) -> list[str]:
    tags = ["shelter", "emergency_shelter", "single_adults", "men"]
    joined = " ".join(notes).lower()
    if "day center" in availability.lower() or "day center" in joined:
        tags.append("day_center")
    if "walk ins allowed" in joined or "walk-ins allowed" in joined:
        tags.append("walk_in")
    if "bunk beds" in joined:
        tags.append("bunk_beds")
    if "single bed" in joined or "single beds" in joined:
        tags.append("single_beds")
    if "dorm" in joined:
        tags.append("dorm_style")
    if "returning citizens" in joined:
        tags.append("returning_citizens")
    if "wheelchair_accessible" in accessibility_tags:
        tags.append("accessible")
    return sorted(set(tags))


def derive_sub_tags(accessibility_tags: list[str]) -> list[str]:
    sub_tags = ["tonight", "short-term"]
    if "wheelchair_accessible" in accessibility_tags:
        sub_tags.append("wheelchair")
    if "ground_floor" in accessibility_tags:
        sub_tags.append("ground-floor")
    return sub_tags


def derive_eligibility(notes: list[str]) -> str:
    joined = " ".join(notes)
    lowered = joined.lower()
    signals = []
    if "returning citizens only" in lowered:
        signals.append("Returning citizens only.")
    if "35 or older" in lowered:
        signals.append("Clients must be 35 or older.")
    if "dfss request" in lowered:
        signals.append("Seasonal or DFSS-request placement may apply.")
    if "must be able to care for him/herself" in lowered:
        signals.append("Clients must be able to care for themselves.")
    if not signals:
        return "Single adult men seeking shelter."
    return " ".join(signals)


def derive_description(agency: str, availability: str, beds: str, notes: list[str]) -> str:
    parts = ["Men's single-adult emergency shelter in Chicago."]
    if availability.strip():
        parts.append(f"Availability: {availability.strip()}.")
    if beds.strip():
        parts.append(f"Capacity: {beds.strip()} beds.")
    for note in notes:
        lower = note.lower()
        if any(keyword in lower for keyword in ["returning citizens", "35 or older", "acute medical conditions", "dfss request"]):
            parts.append(note.rstrip(".") + ".")
            break
    return " ".join(parts)


def derive_hours(availability: str, notes: list[str]) -> str:
    parts = []
    if availability.strip():
        parts.append(availability.strip())
    schedule_notes = [note for note in notes if re.search(r"\b\d{1,2}(:\d{2})?\s*(am|pm)\b", note, re.I)]
    parts.extend(schedule_notes)
    return " | ".join(parts)


def build_insert(row: dict[str, str], dataset: str, record_id: str) -> str:
    agency = row["Agency"].strip()
    address = row["Address"].strip()
    availability = row["Availability"].strip()
    beds = row["Beds"].strip()
    elevator = row["Elevator"].strip()
    notes = split_notes(row["Notes"])
    phone = normalize_phone(row["Phone"])
    wheelchair = row["Wheelchair Accessible"].strip()

    accessibility_tags = derive_accessibility_tags(notes, elevator, wheelchair)
    service_tags = derive_service_tags(notes, availability, accessibility_tags)
    sub_tags = derive_sub_tags(accessibility_tags)
    tips = notes

    values = {
        "title": sql_quote(agency),
        "description": sql_quote(derive_description(agency, availability, beds, notes)),
        "categories": sql_array(["Housing"]),
        "tags": sql_array(["shelter", "emergency shelter", "single adults", "men"]),
        "sub_tags": sql_array(sub_tags),
        "eligibility": sql_quote(derive_eligibility(notes)),
        "hours": sql_quote(derive_hours(availability, notes)),
        "contact_phone": sql_text_or_null(phone),
        "contact_email": "null",
        "contact_website": "null",
        "location": sql_quote(address),
        "coordinates": "null",
        "featured": "false",
        "urgency": "1",
        "status": sql_quote("approved"),
        "return_comment": "null",
        "tips": sql_array(tips),
        "call_script": sql_quote("Say: Hi, I'm looking for a men's shelter bed tonight. Do you have availability and what is the intake process?"),
        "domain": sql_quote("housing"),
        "resource_type": sql_quote("emergency_shelter"),
        "population_tags": sql_array(["men", "single_adults"]),
        "accessibility_tags": sql_array(accessibility_tags),
        "service_tags": sql_array(service_tags),
        "availability_type": sql_text_or_null(derive_availability_type(availability)),
        "beds": sql_int_or_null(beds),
        "intake_type": sql_quote(derive_intake_type(notes, availability)),
        "source_dataset": sql_quote(dataset),
        "source_record_id": sql_quote(record_id),
    }

    return """  (\n    {title},\n    {description},\n    {categories},\n    {tags},\n    {sub_tags},\n    {eligibility},\n    {hours},\n    {contact_phone},\n    {contact_email},\n    {contact_website},\n    {location},\n    {coordinates},\n    {featured},\n    {urgency},\n    {status},\n    {return_comment},\n    {tips},\n    {call_script},\n    {domain},\n    {resource_type},\n    {population_tags},\n    {accessibility_tags},\n    {service_tags},\n    {availability_type},\n    {beds},\n    {intake_type},\n    {source_dataset},\n    {source_record_id}\n  )""".format(**values)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("csv_path")
    parser.add_argument("output_path")
    parser.add_argument("--dataset", required=True)
    args = parser.parse_args()

    csv_path = Path(args.csv_path)
    output_path = Path(args.output_path)

    with csv_path.open(newline="", encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f))

    values = []
    for idx, row in enumerate(rows, start=1):
        record_id = f"{args.dataset}-{idx:03d}-{slugify(row['Agency'])}"
        values.append(build_insert(row, args.dataset, record_id))

    sql = f"""-- Generated from {csv_path.name}\n-- Dataset: {args.dataset}\n\nbegin;\n\ndelete from public.resources\nwhere source_dataset = {sql_quote(args.dataset)};\n\ninsert into public.resources (\n  title,\n  description,\n  categories,\n  tags,\n  sub_tags,\n  eligibility,\n  hours,\n  contact_phone,\n  contact_email,\n  contact_website,\n  location,\n  coordinates,\n  featured,\n  urgency,\n  status,\n  return_comment,\n  tips,\n  call_script,\n  domain,\n  resource_type,\n  population_tags,\n  accessibility_tags,\n  service_tags,\n  availability_type,\n  beds,\n  intake_type,\n  source_dataset,\n  source_record_id\n)\nvalues\n{',\n'.join(values)};\n\ncommit;\n"""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(sql)
    print(f"Wrote {len(rows)} shelter rows to {output_path}")


if __name__ == "__main__":
    main()
