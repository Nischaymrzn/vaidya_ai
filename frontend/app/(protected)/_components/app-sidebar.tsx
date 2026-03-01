"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, PanelLeftOpen } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { mainNavItems, otherNavItems } from "./nav-items"
import logo from "@/public/logo.svg"

export function AppSidebar() {
  const pathname = usePathname()
  const { state, toggleSidebar } = useSidebar()
  const collapsed = state === "collapsed"
  const shouldPrefetch = (href?: string) => href !== "/dashboard"
  const isPathActive = (href?: string) =>
    href ? pathname === href || pathname.startsWith(`${href}/`) : false

  const navItemClass = cn(
    "group gap-3 rounded-lg px-3 py-4.5 text-[15px] font-medium transition [&>svg]:h-5 [&>svg]:w-5 [&>svg]:shrink-0",
    "text-muted-foreground [&>svg]:text-muted-foreground",
    "hover:bg-sidebar-accent hover:text-foreground [&:hover_svg]:text-foreground",
    "data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:[&>svg]:text-primary",
    "group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:px-0"
  )

  const collapsedMainItems = mainNavItems.flatMap((item) =>
    item.items ? item.items : [item]
  )

  return (
    <Sidebar
      collapsible="icon"
      className="sidebar-refined sticky top-0 border-r border-border bg-background/95"
    >
      <SidebarHeader className={cn("pb-3 pt-3.5", collapsed ? "px-2" : "px-3")}>
        <div
          className={cn(
            "flex w-full items-center gap-3",
            collapsed ? "flex-col gap-2" : "justify-between"
          )}
        >
          <Link
            href="/dashboard"
            prefetch={false}
            className={cn(
              "flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-sidebar-accent",
              collapsed && "flex-col px-0"
            )}
          >
            <Image
              src={logo}
              alt="Vaidya logo"
              width={30}
              height={30}
              className="shrink-0"
            />
            <div
              className={cn(
                "flex flex-col gap-0.5 transition-opacity",
                collapsed && "sr-only"
              )}
            >
              <span className="text-xl font-semibold tracking-tight text-foreground">
                Vaidya.ai
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
            className={cn(
              "group inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition hover:bg-sidebar-accent hover:text-foreground",
              collapsed && "h-8 w-8"
            )}
          >
            <PanelLeftOpen
              className={cn(
                "h-5 w-5 text-muted-foreground transition-transform duration-300 ease-out group-hover:text-foreground",
                collapsed ? "rotate-0" : "rotate-180"
              )}
            />
          </button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="mt-1 space-y-0.5 px-4">
          <SidebarGroupLabel className="px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            General
          </SidebarGroupLabel>
          <SidebarMenu className="space-y-1">
            {(collapsed ? collapsedMainItems : mainNavItems).map((item) => {
              const active = item.href ? isPathActive(item.href) : false
              const button = (
                <SidebarMenuButton
                  asChild
                  data-active={active}
                  className={navItemClass}
                >
                  {item.href ? (
                    <Link
                      href={item.href}
                      prefetch={shouldPrefetch(item.href)}
                      aria-current={active ? "page" : undefined}
                    >
                      <item.icon className="flex-none" />
                      <span className={cn("truncate", collapsed && "sr-only")}>
                        {item.label}
                      </span>
                      {item.items && !collapsed && (
                        <ChevronDown className="ml-auto h-4 w-4 text-muted-foreground transition" />
                      )}
                    </Link>
                  ) : (
                    <button type="button" className="flex w-full items-center">
                      <item.icon className="flex-none" />
                      <span className={cn("truncate", collapsed && "sr-only")}>
                        {item.label}
                      </span>
                      {item.items && !collapsed && (
                        <ChevronDown className="ml-auto h-4 w-4 text-muted-foreground transition" />
                      )}
                    </button>
                  )}
                </SidebarMenuButton>
              )
              return (
                <SidebarMenuItem key={item.href ?? item.label}>
                  {collapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>{button}</TooltipTrigger>
                      <TooltipContent side="right" className="text-xs">
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <>
                      {button}
                      {item.items && (
                        <SidebarMenuSub className="relative mt-0.5 pl-6 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-px before:rounded-full before:bg-border">
                          {item.items.map((sub) => {
                            const subActive = isPathActive(sub.href)
                            return (
                              <SidebarMenuSubItem key={sub.href}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={subActive}
                                  className="relative gap-3 rounded-lg px-4 py-4.5 text-[14.5px] font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-foreground data-[active=true]:bg-primary/10 data-[active=true]:text-primary [&>svg]:shrink-0"
                                >
                                  <Link
                                    href={sub.href}
                                    prefetch={shouldPrefetch(sub.href)}
                                    aria-current={subActive ? "page" : undefined}
                                  >
                                    <span className="truncate">{sub.label}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            )
                          })}
                        </SidebarMenuSub>
                      )}
                    </>
                  )}
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="mt-auto space-y-0.5 px-4 pb-4">
          <SidebarGroupLabel className="px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Others
          </SidebarGroupLabel>
          <SidebarMenu className="space-y-1">
            {otherNavItems.map((item) => {
              const active = pathname === item.href
              const button = (
                <SidebarMenuButton
                  asChild
                  data-active={active}
                  className={navItemClass}
                >
                  <Link href={item.href} aria-current={active ? "page" : undefined}>
                    <item.icon className="flex-none" />
                    <span className={cn("truncate", collapsed && "sr-only")}>
                      {item.label}
                    </span>
                  </Link>
                </SidebarMenuButton>
              )
              return (
                <SidebarMenuItem key={item.href}>
                  {collapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>{button}</TooltipTrigger>
                      <TooltipContent side="right" className="text-xs">
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    button
                  )}
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
