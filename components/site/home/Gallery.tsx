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
    src: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?q=80&w=1200&auto=format&fit=crop",
    alt: "Pharmaceutical tablets and capsules",
  },
  {
    src: "https://images.unsplash.com/photo-1748349221526-33b51820b21e?q=80&w=1200&auto=format&fit=crop",
    alt: "Technicians working in a pharmaceutical cleanroom",
  },
  {
    src: "https://images.unsplash.com/photo-1719900010796-fb804dd54954?q=80&w=1200&auto=format&fit=crop",
    alt: "Visitors walking a trade-show aisle",
  },
  {
    src: "https://images.unsplash.com/photo-1705517243962-230c07db6b23?q=80&w=1200&auto=format&fit=crop",
    alt: "Pharmaceutical tablets in a blister pack",
  },
  {
    src: "https://images.unsplash.com/photo-1586183189334-1ad3cd238e21?q=80&w=1200&auto=format&fit=crop",
    alt: "Modern convention centre building in Delhi",
  },
  {
    src: "https://images.unsplash.com/photo-1607398027609-fbd1a06fb5d4?q=80&w=1200&auto=format&fit=crop",
    alt: "Plant operator on a pharmaceutical manufacturing floor",
  },
  {
    src: "https://images.unsplash.com/photo-1698581075105-924b6c70b5d6?q=80&w=1200&auto=format&fit=crop",
    alt: "Exhibitors and visitors at an exhibition stall",
  },
  {
    src: "https://images.unsplash.com/photo-1757578097654-fdae0f7cf008?q=80&w=1200&auto=format&fit=crop",
    alt: "Tablets moving through processing machinery",
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
