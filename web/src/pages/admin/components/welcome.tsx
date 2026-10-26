import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function CardDemo() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Card className="w-full border border-slate-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
        <CardHeader className="space-y-4 py-8 px-8">
          <CardTitle className="text-4xl font-semibold text-slate-900">
            Hello Admin
          </CardTitle>
          <CardDescription className="text-lg text-slate-600 font-medium leading-relaxed">
            Welcome to your admin dashboard. Here you will find comprehensive information about all users in the system.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
