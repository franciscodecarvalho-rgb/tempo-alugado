import { BrandLogo } from "@/components/brand-logo";

export function PublicFooter() {
  return (
    <footer id="contato" className="mt-24 border-t border-border/60 bg-secondary/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-2">
        <div>
          <BrandLogo className="h-[5.25rem] w-auto" />
        </div>
        <div className="text-sm md:text-right">
          <p className="font-medium">Contato</p>
          <p className="mt-2 text-muted-foreground">francisco@pindoramas.com</p>
          <p className="mt-4 font-medium">Atendimento</p>
          <p className="mt-2 text-muted-foreground">Segunda a sábado, 9h às 19h</p>
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Pindoramas. Todos os direitos reservados.
      </div>
    </footer>
  );
}
