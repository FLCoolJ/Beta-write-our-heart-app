import { type NextRequest, NextResponse } from "next/server"

const USPS_API_URL = "https://secure.shippingapis.com/ShippingAPI.dll"
const USPS_USER_ID = process.env.USPS_USER_ID

export async function POST(request: NextRequest) {
  const { address } = await request.json()

  if (!USPS_USER_ID) {
    return NextResponse.json({ error: "Server configuration error for address validation." }, { status: 500 })
  }

  const xmlRequest = `
    <AddressValidateRequest USERID="${USPS_USER_ID}">
      <Revision>1</Revision>
      <Address ID="0">
        <Address1>${address.address2 || ""}</Address1>
        <Address2>${address.address1}</Address2>
        <City>${address.city}</City>
        <State>${address.state}</State>
        <Zip5>${address.zip5}</Zip5>
        <Zip4/>
      </Address>
    </AddressValidateRequest>
  `

  try {
    const response = await fetch(`${USPS_API_URL}?API=Verify&XML=${encodeURIComponent(xmlRequest)}`, {
      method: "GET",
    })

    if (!response.ok) {
      throw new Error(`USPS API responded with status: ${response.status}`)
    }

    const xmlResponse = await response.text()

    if (xmlResponse.includes("<Error>")) {
      const descriptionMatch = xmlResponse.match(/<Description>(.*?)<\/Description>/)
      const errorMessage = descriptionMatch ? descriptionMatch[1] : "Unknown error from USPS."
      return NextResponse.json({ error: `USPS Error: ${errorMessage}` }, { status: 400 })
    }

    const address1Match = xmlResponse.match(/<Address1>(.*?)<\/Address1>/)
    const address2Match = xmlResponse.match(/<Address2>(.*?)<\/Address2>/)
    const cityMatch = xmlResponse.match(/<City>(.*?)<\/City>/)
    const stateMatch = xmlResponse.match(/<State>(.*?)<\/State>/)
    const zip5Match = xmlResponse.match(/<Zip5>(.*?)<\/Zip5>/)
    const zip4Match = xmlResponse.match(/<Zip4>(.*?)<\/Zip4>/)

    const validatedAddress = {
      address1: address1Match ? address1Match[1] : "",
      address2: address2Match ? address2Match[1] : "",
      city: cityMatch ? cityMatch[1] : "",
      state: stateMatch ? stateMatch[1] : "",
      zip5: zip5Match ? zip5Match[1] : "",
      zip4: zip4Match ? zip4Match[1] : "",
    }

    return NextResponse.json({ validatedAddress })
  } catch (error) {
    return NextResponse.json({ error: "Could not connect to the address validation service." }, { status: 500 })
  }
}
