import { useState } from "react";
import { useResources } from "@/context/ResourceContext";
import { Category, NewResource } from "@/types";
import { toast } from "@/hooks/use-toast";

const ALL_CATEGORIES: Category[] = [
  "Housing",
  "Food",
  "Healthcare",
  "Legal",
  "Community",
  "Internal Programs",
];

export default function SubmissionForm() {
  const { submitResource } = useResources();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState("");
  const [eligibility, setEligibility] = useState("");
  const [hours, setHours] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("");

  const toggleCategory = (cat: Category) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || categories.length === 0) {
      toast({
        title: "Missing fields",
        description: "Please fill in title, description, and select at least one category.",
        variant: "destructive",
      });
      return;
    }

    const newResource: NewResource = {
      title: title.trim(),
      description: description.trim(),
      categories,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      eligibility: eligibility.trim(),
      hours: hours.trim(),
      contact: {
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        website: website.trim() || undefined,
      },
      location: location.trim(),
      featured: false,
      urgency: 3,
    };

    submitResource(newResource);
    toast({ title: "Submitted!", description: "Your resource has been submitted for review." });

    // Reset
    setTitle("");
    setDescription("");
    setCategories([]);
    setTags("");
    setEligibility("");
    setHours("");
    setPhone("");
    setEmail("");
    setWebsite("");
    setLocation("");
  };

  const inputClass =
    "w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-foreground mb-1.5">
          Title *
        </label>
        <input
          className={inputClass}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Resource name"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-foreground mb-1.5">
          Description *
        </label>
        <textarea
          className={inputClass + " min-h-[100px] resize-y"}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the resource and what it offers"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">
          Categories *
        </label>
        <div className="flex flex-wrap gap-2">
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => toggleCategory(cat)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors",
                categories.includes(cat)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-foreground mb-1.5">
          Tags
        </label>
        <input
          className={inputClass}
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Comma-separated tags (e.g. free, walk-in, bilingual)"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-foreground mb-1.5">
          Eligibility
        </label>
        <input
          className={inputClass}
          value={eligibility}
          onChange={(e) => setEligibility(e.target.value)}
          placeholder="Who is eligible?"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-foreground mb-1.5">
          Hours
        </label>
        <input
          className={inputClass}
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          placeholder="Operating hours"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-foreground mb-1.5">
          Location
        </label>
        <input
          className={inputClass}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Address or location description"
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">Phone</label>
          <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(215) 555-0000" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">Email</label>
          <input className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@example.org" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">Website</label>
          <input className={inputClass} value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://example.org" />
        </div>
      </div>

      <button
        type="submit"
        className="w-full gradient-star rounded-xl py-3.5 text-sm font-bold text-primary-foreground shadow-md hover:opacity-90 transition-opacity"
      >
        Submit for Review
      </button>
    </form>
  );
}

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
