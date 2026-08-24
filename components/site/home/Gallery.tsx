import Image from "next/image";
import { Camera } from "lucide-react";
import Reveal from "@/components/motion/Reveal";
import SplitLines from "@/components/motion/SplitLines";

/**
 * Free-to-use Unsplash photography standing in for real show-floor pictures.
 * Swap any entry for a licensed photo of your own whenever you have one —
 * this component has no dependency on `lib/media.ts`, so nothing else changes.
 */
const PHOTOS = [
  {
    src: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=1200&auto=format&fit=crop",
    alt: "Visitors attending a business exhibition",
  },
  {
    src: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop",
    alt: "Conference and exhibition presentation hall",
  },
  {
    src: "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop",
    alt: "People networking at an industry event",
  },
  {
    src: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop",
    alt: "Crowd visiting a large exhibition event",
  },
  {
    src: "https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=1200&auto=format&fit=crop",
    alt: "Business professionals meeting at an expo",
  },
  {
    src: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?q=80&w=1200&auto=format&fit=crop",
    alt: "Branded event space with visitors",
  },
  {
    src: "https://images.unsplash.com/photo-1698581075105-924b6c70b5d6?q=80&w=1200&auto=format&fit=crop",
    alt: "Exhibitors and visitors at a trade-show stall",
  },
  {
    src: "https://images.unsplash.com/photo-1757578097654-fdae0f7cf008?q=80&w=1200&auto=format&fit=crop",
    alt: "Visitors moving through a convention hall",
  },
] as const;

export default function Gallery() {
  return (
    <section className="band band-ice gallery">
      <div className="shell">
        <p className="eyebrow">
          <Camera size={13} strokeWidth={1.75} aria-hidden="true" />
          The show floor
        </p>
        <SplitLines as="h2" className="display-l gallery-title">
          What the hall looks like.
        </SplitLines>

        <Reveal className="gallery-grid" stagger={0.05} distance={16}>
          {PHOTOS.map((photo) => (
            <figure className="gallery-tile" key={photo.src}>
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1080px) 33vw, 25vw"
                style={{ objectFit: "cover" }}
              />
            </figure>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
