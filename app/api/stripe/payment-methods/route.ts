export const dynamic = "force-dynamic"
export const runtime = "nodejs"
export const revalidate = 0

export async function GET(req: Request) {
  const url = new URL(req.url)
  // If you need query params: url.searchParams.get('foo')

  // Remove this block when your Stripe customer lookup is ready.
  return Response.json({ methods: [] }, { headers: { "cache-control": "no-store" } })

  // When ready, do something like:
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });
  // const customerId = 'cus_...'; // look up from your DB/user meta first
  // const list = await stripe.paymentMethods.list({ customer: customerId, type: 'card' });
  // return Response.json({ methods: list.data }, { headers: { 'cache-control': 'no-store' } });
}
