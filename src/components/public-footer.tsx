export function PublicFooter() {
  return (
    <footer id="contato" className="mt-24 border-t border-border/60 bg-secondary/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <p className="font-display text-lg font-semibold">Coastal Stays</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Curadoria de imóveis à beira-mar em todo o litoral brasileiro.
          </p>
        </div>
        <div className="text-sm">
          <p className="font-medium">Contato</p>
          <p className="mt-2 text-muted-foreground">reservas@coastalstays.com.br</p>
          <p className="text-muted-foreground">+55 11 4000-0000</p>
        </div>
        <div className="text-sm">
          <p className="font-medium">Atendimento</p>
          <p className="mt-2 text-muted-foreground">Segunda a sábado, 9h às 19h</p>
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Coastal Stays. Todos os direitos reservados.
      </div>
    </footer>
  );
}
