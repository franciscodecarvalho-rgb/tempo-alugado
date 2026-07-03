import logoAsset from "@/assets/pindoramas-logo.png.asset.json";

type Props = {
  className?: string;
  alt?: string;
};

export function BrandLogo({ className, alt = "Pindoramas" }: Props) {
  return <img src={logoAsset.url} alt={alt} className={className} />;
}
