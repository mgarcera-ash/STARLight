import { Resource } from "@/types";
import {
  Clock,
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  Tag,
} from "lucide-react";

export default function ResourceInfo({ resource }: { resource: Resource }) {
  return (
    <div className="space-y-6">
      {/* Description */}
      <section>
        <p className="text-foreground leading-relaxed">{resource.description}</p>
      </section>

      {/* Eligibility */}
      <section className="rounded-2xl bg-muted p-4 border-l-4 border-primary">
        <div className="flex items-center gap-2 mb-2">
          <Users className="h-4 w-4 text-primary" />
          <h3 className="font-bold text-sm text-foreground">Eligibility</h3>
        </div>
        <p className="text-sm text-muted-foreground">{resource.eligibility}</p>
      </section>

      {/* Hours */}
      <section className="flex items-start gap-3">
        <div className="rounded-full bg-primary/10 p-2">
          <Clock className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-foreground">Hours</h3>
          <p className="text-sm text-muted-foreground">{resource.hours}</p>
        </div>
      </section>

      {/* Location */}
      <section className="flex items-start gap-3">
        <div className="rounded-full bg-primary/10 p-2">
          <MapPin className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-foreground">Location</h3>
          <p className="text-sm text-muted-foreground">{resource.location}</p>
        </div>
      </section>

      {/* Contact */}
      <section>
        <h3 className="font-bold text-sm text-foreground mb-3">Contact</h3>
        <div className="space-y-2">
          {resource.contact.phone && (
            <a
              href={`tel:${resource.contact.phone}`}
              className="flex items-center gap-3 rounded-xl border border-border p-3 hover:bg-muted transition-colors"
            >
              <div className="rounded-full bg-primary/10 p-2">
                <Phone className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium">{resource.contact.phone}</span>
            </a>
          )}
          {resource.contact.email && (
            <a
              href={`mailto:${resource.contact.email}`}
              className="flex items-center gap-3 rounded-xl border border-border p-3 hover:bg-muted transition-colors"
            >
              <div className="rounded-full bg-primary/10 p-2">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium">{resource.contact.email}</span>
            </a>
          )}
          {resource.contact.website && (
            <a
              href={resource.contact.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-border p-3 hover:bg-muted transition-colors"
            >
              <div className="rounded-full bg-primary/10 p-2">
                <Globe className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium">{resource.contact.website}</span>
            </a>
          )}
        </div>
      </section>

      {/* Tags */}
      <section>
        <div className="flex items-center gap-2 mb-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-bold text-sm text-foreground">Tags</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {resource.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
