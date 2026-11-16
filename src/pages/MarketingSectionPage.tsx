interface MarketingSectionPageProps {
  title: string;
}

export function MarketingSectionPage({ title }: MarketingSectionPageProps) {
  return (
    <section className="marketing-section-page" aria-labelledby="section-title">
      <h1 id="section-title" className="marketing-section-page__title">
        {title}
      </h1>
      <p className="marketing-section-page__lead">
        Explore more about {title} on the SquareUp marketing site. Use Home in the
        header to return to the laptop landing page.
      </p>
    </section>
  );
}