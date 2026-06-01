type Props = {
  name: string;
  price: string;
  description?: string;
};

/** design-services.html pricing tile */
export function MarketingPricingCard({ name, price, description }: Props) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6">
      <div className="font-semibold">{name}</div>
      <div className="mt-2 text-2xl font-semibold tabular-nums">{price}</div>
      {description ? <p className="mt-3 text-sm text-gray-600">{description}</p> : null}
    </div>
  );
}
