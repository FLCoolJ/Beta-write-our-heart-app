import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getAdminData } from "@/lib/admin-data";

export default async function AdminDashboard() {
  const data = await getAdminData();

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{data.totalUsers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Cards Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{data.totalCardsSent}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">${data.revenue.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {data.recentActivity.map((activity, index) => (
                <li key={index} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50">
                  <div>
                    <p className="font-semibold">{activity.description}</p>
                    <p className="text-sm text-gray-500">{activity.user}</p>
                  </div>
                  <p className="text-sm text-gray-400">{activity.timestamp}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
