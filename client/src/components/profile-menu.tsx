import { Link, useNavigate } from "react-router-dom";
import { LogOut, MoveUpRight, Settings, UsersRound, MessageSquareShare, PencilRuler } from "lucide-react";
import { useAuthStore } from "@/hooks/useAuthStore";

interface MenuItem {
  label: string;
  value?: string;
  href: string;
  icon?: React.ReactNode;
  external?: boolean;
}

interface ProfileMenuProps {
  name: string;
  role: string;
  avatar: string;
  subscription?: string;
}

export default function ProfileMenu({
  name,
  role,
  avatar,
  subscription = "Free Trial",
}: Partial<ProfileMenuProps>) {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const user = useAuthStore((state) => state.user)
  const displayName = name || user?.name || user?.username || "John Doe"
  const displayRole =
  role ||
  (Array.isArray(user?.roles) && user.roles.length
    ? user.roles[0]
    : user?.role || "Cyber Threat Analyst")
  const displayAvatar =
    avatar ||
    user?.profile_picture ||
    "https://api.dicebear.com/9.x/initials/svg?seed=QariAi?svg?backgroundColor=ffd5dc"


  const menuItems: MenuItem[] = [
    {
    label: "Settings",
    href: "/settings",
    icon: <Settings className="w-4 h-4" />,
    },
    {
      label: "Friends",
      value: subscription,
      href: "/subscription",
      icon: <UsersRound className="w-4 h-4" />,
    },
    {
        label: "Gearbox",
        href: "/terms",
        icon: <PencilRuler className="w-4 h-4" />,
    },
    {
        label: "Send Feedback",
        value: subscription,
        href: "/subscription",
        icon: <MessageSquareShare className="w-4 h-4" />,
        external: true,
    },
  ];
  

  return (
    <div className="w-full max-w-sm">
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <div className="relative px-6 pt-6 pb-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative shrink-0">
              <img
                src={displayAvatar}
                alt={displayName}
                className="rounded-full w-14 h-14 ring-4 ring-white dark:ring-zinc-900 object-cover"
              />
              <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" />
            </div>

            {/* Profile info */}
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{displayName}</h2>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">{displayRole}</p>
              {user?.email === "guest@cyberwatch.local" && (
                <p className="text-xs text-muted-foreground mt-1">Signed in as Guest</p>
              )}
            </div>
          </div>

          <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-4" />

          <div className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="flex items-center justify-between p-2 
                                    hover:bg-zinc-50 dark:hover:bg-zinc-800/50 
                                    rounded-lg transition-colors duration-200"
              >
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{item.label}</span>
                </div>
                {item.external && <MoveUpRight className="w-4 h-4" />}
              </Link>
            ))}
              <button
                type="button"
                onClick={() => {
                  logout()
                  navigate("/")
                }}
              >
              <div className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Logout</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
