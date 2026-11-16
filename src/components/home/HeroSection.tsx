import heroWireframe from "@/assets/home/hero-wireframe.svg";
import type { MarketingContentBundle } from "@/types/home";

interface HeroSectionProps {
  bundle: MarketingContentBundle;
  workRoute: string;
  onOurWorks: () => void;
  onContact: () => void;
  contentNotice?: string | null;
}

export function HeroSection({
  bundle,
  workRoute,
  onOurWorks,
  onContact,
  contentNotice,
}: HeroSectionProps) {
  return (
    <section className="marketing-hero" aria-labelledby="hero-headline">
      {contentNotice ? (
        <p className="marketing-hero__notice" role="status">
          {contentNotice}
        </p>
      ) : null}
      <h1 id="hero-headline" className="marketing-hero__headline">
        {bundle.headline}
      </h1>
      <div className="marketing-hero__qualifier" aria-label="Audience">
        <span className="marketing-hero__for-label">{bundle.forLabel}</span>
        <ul className="marketing-hero__tags">
          {bundle.segmentTags.map((tag, index) => {
            const isLast = index === bundle.segmentTags.length - 1;
            const isSecondLast = index === bundle.segmentTags.length - 2;

            return (
              <li key={tag}>
                <span className="marketing-hero__tag">{tag}</span>
                {!isLast ? (
                  <span className="marketing-hero__tag-sep" aria-hidden="true">
                    {isSecondLast ? ", and " : ", "}
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
      <div className="marketing-hero__actions">
        <button
          type="button"
          className="marketing-btn marketing-btn--secondary"
          onClick={onOurWorks}
          aria-label={`Our Works — navigate to ${workRoute}`}
        >
          Our Works
        </button>
        <button
          type="button"
          className="marketing-btn marketing-btn--primary"
          onClick={onContact}
        >
          Contact Us
        </button>
      </div>
      <img
        className="marketing-hero__wireframe"
        src={heroWireframe}
        alt=""
        aria-hidden
      />
    </section>
  );
}