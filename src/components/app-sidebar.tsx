import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Home,
  CalendarDays,
  ClipboardList,
  Sparkles,
  LogOut,
  UserCog,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { checkIsAdmin } from "@/lib/users.functions";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";

type NavItem = { title: string; url: string; icon: typeof Home; exact?: boolean };
const items: NavItem[] = [
  { title: "Dashboard", url: "/app", icon: LayoutDashboard, exact: true },
  { title: "Imóveis", url: "/app/imoveis", icon: Home },
  { title: "Calendário", url: "/app/calendario", icon: CalendarDays },
  { title: "Reservas", url: "/app/reservas", icon: ClipboardList },
  { title: "Tarefas", url: "/app/tarefas", icon: Sparkles },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const check = useServerFn(checkIsAdmin);
  const adminQuery = useQuery({ queryKey: ["is-admin"], queryFn: () => check({}) });
  const navItems: NavItem[] = adminQuery.data?.isAdmin
    ? [...items, { title: "Usuários", url: "/app/usuarios", icon: UserCog }]
    : items;


  const isActive = (url: string, exact?: boolean) =>
    exact ? pathname === url : pathname === url || pathname.startsWith(url + "/");

  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link to="/app" className="flex items-center px-2 py-1" aria-label="Pindoramas">
          <BrandLogo className="h-9 w-auto" />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Painel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url, item.exact)}>
                    <Link to={item.url as "/app"}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut}>
              <LogOut />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
