import { FloatingChat } from "@/components/dashboard/floating-chat"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* 1. Hayaan lang mag-render ang mga sub-pages (Dashboard, Tasks, atbp.) nang walang duplicate structures */}
      {children}

      {/* 2. Dito natin ilalagay ang dynamic floating chat bubble sa pinakailalim */}
      <FloatingChat />
    </>
  )
}