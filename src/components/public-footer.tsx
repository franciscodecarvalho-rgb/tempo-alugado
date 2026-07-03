import { BrandLogo } from "@/components/brand-logo";

export function PublicFooter() {
  return (
    <footer id="contato" className="mt-24 border-t border-border/60 bg-secondary/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <BrandLogo className="h-12 w-auto" />
          <p className="mt-3 text-sm text-muted-foreground">
            Curadoria de imóveis para temporada com hospitalidade Pindoramas.
          </p>
        </div>
        <div className="text-sm">
          <p className="font-medium">Contato</p>
          <p className="mt-2 text-muted-foreground">reservas@pindoramas.com.br</p>
          <p className="text-muted-foreground">+55 11 4000-0000</p>
        </div>
        <div className="text-sm">
          <p className="font-medium">Atendimento</p>
          <p className="mt-2 text-muted-foreground">Segunda a sábado, 9h às 19h</p>
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Pindoramas. Todos os direitos reservados.
      </div>
    </footer>
  );
}
