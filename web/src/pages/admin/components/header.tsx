
import { Link } from "react-router-dom"
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu"

import {
  userPageUrl,
  logoutPageUrl,
  adminPageUrl,
} from "@/endpoints/endpoints"

export default function NavigationMenuDemo() {
  return (
    <div className="fixed top-0 left-0 z-40 w-full border-b border-slate-200 bg-white shadow-sm">
      <div className="w-full flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">

        {/* LEFT SIDE */}
        <NavigationMenu>
          <NavigationMenuList className="flex gap-8">

            <NavigationMenuItem>
              <NavigationMenuLink asChild className="px-4 py-2 text-slate-700 font-semibold hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors duration-200">
                <Link to={userPageUrl}>User Page</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild className="px-4 py-2 text-slate-700 font-semibold hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors duration-200">
                <Link to={`${adminPageUrl}/profile`}>Profile</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

          </NavigationMenuList>
        </NavigationMenu>

        {/* RIGHT SIDE */}
        <div>
          <Link
            to={logoutPageUrl}
            className="px-6 py-2.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            Log out
          </Link>
        </div>

      </div>
    </div>
  )
}
